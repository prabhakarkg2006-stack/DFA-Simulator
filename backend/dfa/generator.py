
from dfa.validator import validate_dfa


def validate_pattern(alphabet, pattern):
    """Check that the pattern uses only alphabet symbols."""

    if not isinstance(pattern, str) or not pattern:
        return False, "Pattern must be a non-empty string."

    invalid_symbols = [symbol for symbol in pattern if symbol not in alphabet]

    if invalid_symbols:
        return False, (
            "Pattern contains symbols outside the alphabet: "
            + ", ".join(sorted(set(invalid_symbols)))
        )

    return True, "Pattern is valid."


def make_states(count):
    """Create state names q0, q1, q2, etc."""

    return [f"q{i}" for i in range(count)]


def generate_prefix_transitions(alphabet, pattern):
    """
    Build transitions using the longest prefix of the pattern
    that is also a suffix of the input processed so far.
    """

    length = len(pattern)
    states = make_states(length + 1)
    transitions = {}

    for state_index in range(length + 1):
        state = states[state_index]
        transitions[state] = {}

        for symbol in alphabet:
            candidate = pattern[:state_index] + symbol

            next_index = min(length, len(candidate))

            while next_index > 0:
                if candidate.endswith(pattern[:next_index]):
                    break
                next_index -= 1

            transitions[state][symbol] = states[next_index]

    return states, transitions


def generate_ends_with(alphabet, pattern):
    """Generate a DFA that accepts strings ending with a pattern."""

    states, transitions = generate_prefix_transitions(
        alphabet, pattern
    )

    return {
        "structure": "ends_with",
        "alphabet": alphabet,
        "states": states,
        "initial_state": "q0",
        "final_states": [f"q{len(pattern)}"],
        "transitions": transitions,
        "pattern": pattern
    }


def generate_starts_with(alphabet, pattern):
    """Generate a DFA that accepts strings starting with a pattern."""

    length = len(pattern)
    states = make_states(length + 1) + ["q_dead"]
    transitions = {}

    for index in range(length + 1):
        state = f"q{index}"
        transitions[state] = {}

        for symbol in alphabet:
            if index == length:
                transitions[state][symbol] = state
            elif symbol == pattern[index]:
                transitions[state][symbol] = f"q{index + 1}"
            else:
                transitions[state][symbol] = "q_dead"

    transitions["q_dead"] = {
        symbol: "q_dead" for symbol in alphabet
    }

    return {
        "structure": "starts_with",
        "alphabet": alphabet,
        "states": states,
        "initial_state": "q0",
        "final_states": [f"q{length}"],
        "transitions": transitions,
        "pattern": pattern
    }


def generate_contains(alphabet, pattern):
    """Generate a DFA that accepts strings containing a pattern."""

    states, transitions = generate_prefix_transitions(
        alphabet, pattern
    )

    accepting_state = f"q{len(pattern)}"

    # Once the pattern is found, remain in the accepting state.
    transitions[accepting_state] = {
        symbol: accepting_state for symbol in alphabet
    }

    return {
        "structure": "contains",
        "alphabet": alphabet,
        "states": states,
        "initial_state": "q0",
        "final_states": [accepting_state],
        "transitions": transitions,
        "pattern": pattern
    }


def generate_even_ones(alphabet):
    """Generate a DFA accepting strings with an even number of 1s."""

    states = ["q0", "q1"]

    transitions = {
        "q0": {},
        "q1": {}
    }

    for symbol in alphabet:
        if symbol == "1":
            transitions["q0"][symbol] = "q1"
            transitions["q1"][symbol] = "q0"
        else:
            transitions["q0"][symbol] = "q0"
            transitions["q1"][symbol] = "q1"

    return {
        "structure": "even_ones",
        "alphabet": alphabet,
        "states": states,
        "initial_state": "q0",
        "final_states": ["q0"],
        "transitions": transitions,
        "pattern": "1"
    }


def generate_exact_match(alphabet, pattern):
    """Generate a DFA accepting only the exact pattern."""

    length = len(pattern)
    states = make_states(length + 1) + ["q_dead"]
    transitions = {}

    for index in range(length + 1):
        state = f"q{index}"
        transitions[state] = {}

        for symbol in alphabet:
            if index < length and symbol == pattern[index]:
                transitions[state][symbol] = f"q{index + 1}"
            else:
                transitions[state][symbol] = "q_dead"

    transitions["q_dead"] = {
        symbol: "q_dead" for symbol in alphabet
    }

    return {
        "structure": "exact_match",
        "alphabet": alphabet,
        "states": states,
        "initial_state": "q0",
        "final_states": [f"q{length}"],
        "transitions": transitions,
        "pattern": pattern
    }


def generate_dfa(alphabet, structure, pattern=None):
    """Generate and validate a DFA for the selected structure."""

    from dfa.validator import validate_alphabet

    valid, result = validate_alphabet(alphabet)

    if not valid:
        return {
            "status": "error",
            "message": result
        }

    alphabet = result

    if structure == "even_ones":
        if "1" not in alphabet:
            return {
                "status": "error",
                "message": "Even number of ones requires '1' in the alphabet."
            }

        dfa = generate_even_ones(alphabet)

    else:
        valid, message = validate_pattern(alphabet, pattern)

        if not valid:
            return {
                "status": "error",
                "message": message
            }

        if structure == "ends_with":
            dfa = generate_ends_with(alphabet, pattern)

        elif structure == "starts_with":
            dfa = generate_starts_with(alphabet, pattern)

        elif structure == "contains":
            dfa = generate_contains(alphabet, pattern)

        elif structure == "exact_match":
            dfa = generate_exact_match(alphabet, pattern)

        else:
            return {
                "status": "error",
                "message": "Unsupported DFA structure."
            }

    # Validate the generated DFA before returning it.
    valid, message = validate_dfa(
        dfa["alphabet"],
        dfa["states"],
        dfa["initial_state"],
        dfa["final_states"],
        dfa["transitions"]
    )

    if not valid:
        return {
            "status": "error",
            "message": "Generated DFA validation failed: " + message
        }

    return {
        "status": "success",
        "message": "DFA generated successfully.",
        "dfa": dfa
    }
