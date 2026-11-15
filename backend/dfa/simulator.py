
def simulate_dfa(alphabet, states, initial_state,
                 final_states, transitions, input_string):
    """
    Simulate a Deterministic Finite Automaton.
    Returns acceptance result and step-by-step execution history.
    """

    from dfa.validator import validate_dfa

    # Validate the DFA configuration first
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

    if not isinstance(input_string, str):
        return {
            "status": "error",
            "message": "Input string must be text."
        }

    current_state = initial_state
    history = []

    # Record the starting state
    history.append({
        "step": 0,
        "symbol": None,
        "current_state": current_state,
        "next_state": current_state,
        "description": "Initial state"
    })

    # Read the input one symbol at a time
    for position, symbol in enumerate(input_string):

        # Check whether the symbol belongs to the alphabet
        if symbol not in alphabet:
            return {
                "status": "error",
                "message": f"Invalid symbol '{symbol}' at position {position + 1}.",
                "position": position + 1,
                "history": history
            }

        previous_state = current_state

        # Apply DFA transition
        current_state = transitions[current_state][symbol]

        history.append({
            "step": position + 1,
            "symbol": symbol,
            "current_state": previous_state,
            "next_state": current_state,
            "description": (
                f"Read '{symbol}': "
                f"{previous_state} -> {current_state}"
            )
        })

    # Check whether the final state is accepting
    accepted = current_state in final_states

    return {
        "status": "success",
        "result": "Accepted" if accepted else "Rejected",
        "accepted": accepted,
        "input_string": input_string,
        "initial_state": initial_state,
        "final_state_reached": current_state,
        "is_final_state": accepted,
        "total_symbols": len(input_string),
        "history": history,
        "message": (
            "Input string accepted by DFA."
            if accepted
            else "Input string rejected by DFA."
        )
    }
