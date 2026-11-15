
def validate_alphabet(alphabet):
    """Validate a user-defined alphabet."""

    if not isinstance(alphabet, list) or not alphabet:
        return False, "Alphabet must contain at least one symbol."

    if any(
        not isinstance(symbol, str) or len(symbol.strip()) != 1
        for symbol in alphabet
    ):
        return False, "Each alphabet symbol must be one character."

    cleaned = [symbol.strip() for symbol in alphabet]

    if len(cleaned) != len(set(cleaned)):
        return False, "Duplicate alphabet symbols are not allowed."

    return True, cleaned


def validate_dfa(
    alphabet,
    states,
    initial_state,
    final_states,
    transitions
):
    """Validate a complete deterministic finite automaton."""

    valid, result = validate_alphabet(alphabet)

    if not valid:
        return False, result

    alphabet = result

    if not isinstance(states, list) or not states:
        return False, "At least one state is required."

    if any(
        not isinstance(state, str) or not state.strip()
        for state in states
    ):
        return False, "State names must be non-empty strings."

    states = [state.strip() for state in states]

    if len(states) != len(set(states)):
        return False, "Duplicate states are not allowed."

    if not isinstance(initial_state, str):
        return False, "Initial state must be a valid state name."

    if initial_state not in states:
        return False, "Initial state must exist in the state list."

    if not isinstance(final_states, list):
        return False, "Final states must be provided as a list."

    if any(not isinstance(state, str) for state in final_states):
        return False, "Final state names must be strings."

    if len(final_states) != len(set(final_states)):
        return False, "Duplicate final states are not allowed."

    if any(state not in states for state in final_states):
        return False, "Every final state must exist in the state list."

    if not isinstance(transitions, dict):
        return False, "Transitions must be provided as an object."

    if set(transitions.keys()) != set(states):
        return False, "Every state must have a transition definition."

    for state in states:

        state_transitions = transitions[state]

        if not isinstance(state_transitions, dict):
            return False, f"Invalid transitions for {state}."

        if set(state_transitions.keys()) != set(alphabet):
            return False, (
                f"Every alphabet symbol needs exactly one "
                f"transition from {state}."
            )

        for symbol, destination in state_transitions.items():

            if not isinstance(destination, str):
                return False, f"Invalid destination from {state}."

            if destination not in states:
                return False, (
                    f"Invalid destination state: {destination}."
                )

    return True, "DFA configuration is valid."
