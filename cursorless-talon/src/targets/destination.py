from typing import Union

from talon import Module

from .target_types import ListDestination, PrimitiveDestination

mod = Module()

mod.list(
    "cursorless_insertion_mode_before_after",
    desc="Cursorless insertion mode before/after",
)
mod.list("cursorless_insertion_mode_to", desc="Cursorless insertion mode to")


@mod.capture(
    rule="{user.cursorless_insertion_mode_before_after} | {user.cursorless_insertion_mode_to}",
)
def cursorless_insertion_mode(m) -> str:
    try:
        return m.cursorless_insertion_mode_before_after
    except AttributeError:
        return "to"


@mod.capture(
    rule=(
        "<user.cursorless_insertion_mode> <user.cursorless_target> "
        "({user.cursorless_list_connective} <user.cursorless_insertion_mode> <user.cursorless_target>)*"
    )
)
def cursorless_destination(m) -> Union[ListDestination, PrimitiveDestination]:
    destinations = [
        PrimitiveDestination(insertion_mode, target)
        for insertion_mode, target in zip(
            m.cursorless_insertion_mode_list, m.cursorless_target_list
        )
    ]

    if len(destinations) == 1:
        return destinations[0]

    return ListDestination(destinations)
