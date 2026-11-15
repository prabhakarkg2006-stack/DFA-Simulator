
from flask import Flask, jsonify, request
from flask_cors import CORS

from dfa.validator import validate_alphabet, validate_dfa
from dfa.simulator import simulate_dfa
from dfa.generator import generate_dfa
from dfa.manual_builder import build_manual_dfa

from dfa.database import (
    initialize_database,
    save_dfa,
    get_saved_dfas,
    get_saved_dfa,
    delete_saved_dfa,
    save_simulation,
    get_simulation_history,
    delete_simulation_history
)


app = Flask(__name__)
CORS(app)

# Create SQLite tables when the backend starts.
initialize_database()


DFA_STRUCTURES = [
    {
        "id": "ends_with",
        "name": "Strings Ending With Pattern",
        "description": "Accept strings ending with a selected pattern."
    },
    {
        "id": "starts_with",
        "name": "Strings Starting With Pattern",
        "description": "Accept strings starting with a selected pattern."
    },
    {
        "id": "contains",
        "name": "Contains Pattern",
        "description": "Accept strings containing a selected pattern."
    },
    {
        "id": "even_ones",
        "name": "Even Number of Ones",
        "description": "Accept strings containing an even number of 1s."
    },
    {
        "id": "exact_match",
        "name": "Exact Pattern Matching",
        "description": "Accept only the selected exact pattern."
    },
    {
        "id": "custom",
        "name": "Custom DFA",
        "description": "Create states and transitions manually."
    }
]


@app.route("/")
def home():
    return jsonify({
        "message": "DFA Simulator Backend is running"
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "message": "Backend connection successful"
    })


@app.route("/api/structures", methods=["GET"])
def get_structures():
    return jsonify({
        "status": "success",
        "structures": DFA_STRUCTURES
    })


@app.route("/api/alphabet/validate", methods=["POST"])
def check_alphabet():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "A valid JSON object is required."
        }), 400

    valid, result = validate_alphabet(data.get("alphabet"))

    if not valid:
        return jsonify({
            "status": "error",
            "message": result
        }), 400

    return jsonify({
        "status": "success",
        "message": "Alphabet is valid.",
        "alphabet": result
    })


@app.route("/api/dfa/validate", methods=["POST"])
def check_dfa():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "A valid JSON object is required."
        }), 400

    valid, message = validate_dfa(
        data.get("alphabet"),
        data.get("states"),
        data.get("initial_state"),
        data.get("final_states"),
        data.get("transitions")
    )

    if not valid:
        return jsonify({
            "status": "error",
            "message": message
        }), 400

    return jsonify({
        "status": "success",
        "message": message
    })


@app.route("/api/dfa/generate", methods=["POST"])
def create_automatic_dfa():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "A valid JSON object is required."
        }), 400

    result = generate_dfa(
        alphabet=data.get("alphabet"),
        structure=data.get("structure"),
        pattern=data.get("pattern")
    )

    if result["status"] == "error":
        return jsonify(result), 400

    return jsonify(result)


@app.route("/api/dfa/manual", methods=["POST"])
def create_manual_dfa():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "A valid JSON object is required."
        }), 400

    result = build_manual_dfa(
        alphabet=data.get("alphabet"),
        states=data.get("states"),
        initial_state=data.get("initial_state"),
        final_states=data.get("final_states"),
        transitions=data.get("transitions")
    )

    if result["status"] == "error":
        return jsonify(result), 400

    return jsonify(result)


@app.route("/api/dfa/simulate", methods=["POST"])
def run_simulation():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "A valid JSON object is required."
        }), 400

    result = simulate_dfa(
        data.get("alphabet"),
        data.get("states"),
        data.get("initial_state"),
        data.get("final_states"),
        data.get("transitions"),
        data.get("input_string")
    )

    # Record valid-input simulation results, including rejected strings.
    input_string = data.get("input_string")

    if isinstance(input_string, str) and result.get("status") == "success":
        dfa_id = data.get("dfa_id")

        # Only associate the history with a DFA that still exists.
        if not isinstance(dfa_id, int):
            dfa_id = None
        elif get_saved_dfa(dfa_id) is None:
            dfa_id = None

        save_simulation(
            dfa_id=dfa_id,
            dfa_name=data.get("dfa_name", "DFA Simulation"),
            input_string=input_string,
            result=result.get("result", "Unknown"),
            final_state=result.get("final_state_reached"),
            total_symbols=result.get("total_symbols", 0)
        )

    if result["status"] == "error":
        return jsonify(result), 400

    return jsonify(result)


@app.route("/api/dfa/save", methods=["POST"])
def save_dfa_configuration():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "A valid JSON object is required."
        }), 400

    dfa = data.get("dfa")
    name = data.get("name", "My DFA")

    if not isinstance(dfa, dict):
        return jsonify({
            "status": "error",
            "message": "DFA configuration is required."
        }), 400

    if not isinstance(name, str) or not name.strip():
        return jsonify({
            "status": "error",
            "message": "Enter a valid DFA name."
        }), 400

    valid, message = validate_dfa(
        dfa.get("alphabet"),
        dfa.get("states"),
        dfa.get("initial_state"),
        dfa.get("final_states"),
        dfa.get("transitions")
    )

    if not valid:
        return jsonify({
            "status": "error",
            "message": message
        }), 400

    dfa_id = save_dfa(name.strip(), dfa)

    return jsonify({
        "status": "success",
        "message": "DFA saved successfully.",
        "id": dfa_id,
        "name": name.strip()
    })


@app.route("/api/dfa/saved", methods=["GET"])
def list_saved_dfas():
    return jsonify({
        "status": "success",
        "saved_dfas": get_saved_dfas()
    })


@app.route("/api/dfa/saved/<int:dfa_id>", methods=["GET"])
def load_saved_dfa(dfa_id):
    saved = get_saved_dfa(dfa_id)

    if saved is None:
        return jsonify({
            "status": "error",
            "message": "Saved DFA was not found."
        }), 404

    return jsonify({
        "status": "success",
        "saved_dfa": saved
    })


@app.route("/api/dfa/saved/<int:dfa_id>", methods=["DELETE"])
def remove_saved_dfa(dfa_id):
    deleted = delete_saved_dfa(dfa_id)

    if not deleted:
        return jsonify({
            "status": "error",
            "message": "Saved DFA was not found."
        }), 404

    return jsonify({
        "status": "success",
        "message": "Saved DFA deleted successfully."
    })


@app.route("/api/history", methods=["GET"])
def list_simulation_history():
    return jsonify({
        "status": "success",
        "history": get_simulation_history()
    })


@app.route("/api/history", methods=["DELETE"])
def clear_simulation_history():
    delete_simulation_history()

    return jsonify({
        "status": "success",
        "message": "Simulation history cleared."
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "status": "error",
        "message": "API endpoint not found."
    }), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "status": "error",
        "message": "Internal server error."
    }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
