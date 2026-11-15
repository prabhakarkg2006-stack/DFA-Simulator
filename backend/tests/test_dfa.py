
import unittest

from app import app

from dfa.simulator import simulate_dfa
from dfa.generator import generate_dfa
from dfa.manual_builder import build_manual_dfa

from dfa.database import delete_simulation_history


class DFASimulatorTests(unittest.TestCase):

    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_backend_health(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json()["status"],
            "success"
        )

    def test_automatic_dfa_generation(self):
        result = generate_dfa(
            alphabet=["0", "1"],
            structure="ends_with",
            pattern="01"
        )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["dfa"]["final_states"], ["q2"])

    def test_manual_dfa_creation(self):
        result = build_manual_dfa(
            alphabet=["0", "1"],
            states=["q0", "q1"],
            initial_state="q0",
            final_states=["q1"],
            transitions={
                "q0": {"0": "q0", "1": "q1"},
                "q1": {"0": "q0", "1": "q1"}
            }
        )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["dfa"]["structure"], "custom")

    def test_accepted_input(self):
        result = simulate_dfa(
            ["0", "1"],
            ["q0", "q1"],
            "q0",
            ["q1"],
            {
                "q0": {"0": "q0", "1": "q1"},
                "q1": {"0": "q0", "1": "q1"}
            },
            "1"
        )

        self.assertEqual(result["status"], "success")
        self.assertTrue(result["accepted"])

    def test_rejected_input(self):
        result = simulate_dfa(
            ["0", "1"],
            ["q0", "q1"],
            "q0",
            ["q1"],
            {
                "q0": {"0": "q0", "1": "q1"},
                "q1": {"0": "q0", "1": "q1"}
            },
            "0"
        )

        self.assertEqual(result["status"], "success")
        self.assertFalse(result["accepted"])

    def test_invalid_input_symbol(self):
        result = simulate_dfa(
            ["0", "1"],
            ["q0", "q1"],
            "q0",
            ["q1"],
            {
                "q0": {"0": "q0", "1": "q1"},
                "q1": {"0": "q0", "1": "q1"}
            },
            "2"
        )

        self.assertEqual(result["status"], "error")

    def test_invalid_manual_dfa(self):
        result = build_manual_dfa(
            alphabet=["0", "1"],
            states=["q0", "q1"],
            initial_state="q0",
            final_states=["q1"],
            transitions={
                "q0": {"0": "q0"},
                "q1": {"0": "q0", "1": "q1"}
            }
        )

        self.assertEqual(result["status"], "error")

    def test_save_load_delete_dfa(self):
        dfa = {
            "creation_mode": "manual",
            "structure": "custom",
            "alphabet": ["0", "1"],
            "states": ["q0", "q1"],
            "initial_state": "q0",
            "final_states": ["q1"],
            "transitions": {
                "q0": {"0": "q0", "1": "q1"},
                "q1": {"0": "q0", "1": "q1"}
            }
        }

        save_response = self.client.post(
            "/api/dfa/save",
            json={
                "name": "Test DFA",
                "dfa": dfa
            }
        )

        self.assertEqual(save_response.status_code, 200)

        dfa_id = save_response.get_json()["id"]

        load_response = self.client.get(
            f"/api/dfa/saved/{dfa_id}"
        )

        self.assertEqual(load_response.status_code, 200)

        delete_response = self.client.delete(
            f"/api/dfa/saved/{dfa_id}"
        )

        self.assertEqual(delete_response.status_code, 200)

    def test_simulation_history(self):
        delete_simulation_history()

        response = self.client.post(
            "/api/dfa/simulate",
            json={
                "alphabet": ["0", "1"],
                "states": ["q0", "q1"],
                "initial_state": "q0",
                "final_states": ["q1"],
                "transitions": {
                    "q0": {"0": "q0", "1": "q1"},
                    "q1": {"0": "q0", "1": "q1"}
                },
                "input_string": "1",
                "dfa_name": "History Test DFA"
            }
        )

        self.assertEqual(response.status_code, 200)

        history_response = self.client.get("/api/history")

        self.assertEqual(history_response.status_code, 200)

        history = history_response.get_json()["history"]

        self.assertGreaterEqual(len(history), 1)
        self.assertEqual(history[0]["result"], "Accepted")

        delete_simulation_history()


if __name__ == "__main__":
    unittest.main()
