
from dfa.validator import validate_dfa


def build_manual_dfa(
    alphabet,
    states,
    initial_state,
    final_states,
    transitions
):
    """
    Build a DFA using user-provided states and transitions.
    """

    # Validate the complete DFA configuration
    valid, message = validate_dfa(
        alphabet,
        states,
        initial_state,
        final_states,
        transitions
    )

    if not valid:
        return {
            "status": "error",
            "message": message
        }

    # Create a standardized configuration
    dfa_configuration = {
        "creation_mode": "manual",
        "structure": "custom",
        "alphabet": alphabet,
        "states": states,
        "initial_state": initial_state,
        "final_states": final_states,
        "transitions": transitions
    }

    return {
        "status": "success",
        "message": "Manual DFA created successfully.",
        "dfa": dfa_configuration
    }
