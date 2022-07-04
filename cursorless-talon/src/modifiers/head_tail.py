from talon import Module

from .modifiers import head_tail_swallowed_modifiers

head_tail_modifiers = {
    "head": "extendThroughStartOf",
    "tail": "extendThroughEndOf",
}

mod = Module()

mod.list(
    "cursorless_head_tail_modifier",
    desc="Cursorless head and tail modifiers",
)


@mod.capture(rule="|".join(head_tail_swallowed_modifiers))
def cursorless_head_tail_swallowed_modifier(m) -> str:
    """Cursorless modifier that is swallowed by the head/tail modifier, excluding interior, which requires special treatment"""
    return m[0]


@mod.capture(
    rule=(
        "{user.cursorless_head_tail_modifier} "
        "[<user.cursorless_interior_modifier>] "
        "[<user.cursorless_head_tail_swallowed_modifier>]"
    )
)
def cursorless_head_tail_modifier(m) -> dict[str, str]:
    """Cursorless head and tail modifier"""
    modifiers = []

    try:
        modifiers.append(m.cursorless_interior_modifier)
    except AttributeError:
        pass

    try:
        modifiers.append(m.cursorless_head_tail_swallowed_modifier)
    except AttributeError:
        pass

    result = {
        "type": m.cursorless_head_tail_modifier,
    }

    if modifiers:
        result["modifiers"] = modifiers

    return result
