from itertools import chain
from typing import TypedDict

from ..get_list import ListItemDescriptor, Variation, get_raw_list, make_dict_readable

MODIFIER_LIST_NAMES = [
    "simple_modifier",
    "interior_modifier",
    "head_tail_modifier",
    "every_scope_modifier",
    "ancestor_scope_modifier",
    "first_modifier",
    "last_modifier",
    "previous_next_modifier",
    "forward_backward_modifier",
    "position",
]


class Entry(TypedDict):
    spokenForm: str
    description: str


def get_modifiers() -> list[ListItemDescriptor]:
    all_modifiers = {}
    for name in MODIFIER_LIST_NAMES:
        all_modifiers.update(get_raw_list(name))

    complex_modifier_ids = [
        "extendThroughStartOf",
        "extendThroughEndOf",
        "every",
        "ancestor",
        "first",
        "last",
        "previous",
        "next",
        "backward",
        "forward",
    ]
    simple_modifiers = {
        key: value
        for key, value in all_modifiers.items()
        if value not in complex_modifier_ids
    }
    complex_modifiers = {
        value: key
        for key, value in all_modifiers.items()
        if value in complex_modifier_ids
    }

    items = make_dict_readable(
        "modifier",
        simple_modifiers,
        {
            "excludeInterior": "Bounding paired delimiters",
            "toRawSelection": "No inference",
            "leading": "Leading delimiter range",
            "trailing": "Trailing delimiter range",
            "start": "Empty position at start of target",
            "end": "Empty position at end of target",
        },
    )

    if "extendThroughStartOf" in complex_modifiers:
        items.append(
            {
                "id": "extendThroughStartOf",
                "type": "modifier",
                "variations": [
                    {
                        "spokenForm": complex_modifiers["extendThroughStartOf"],
                        "description": "Extend through start of line/pair",
                    },
                    {
                        "spokenForm": f"{complex_modifiers['extendThroughStartOf']} <modifier>",
                        "description": "Extend through start of <modifier>",
                    },
                ],
            }
        )

    if "extendThroughEndOf" in complex_modifiers:
        items.append(
            {
                "id": "extendThroughEndOf",
                "type": "modifier",
                "variations": [
                    {
                        "spokenForm": complex_modifiers["extendThroughEndOf"],
                        "description": "Extend through end of line/pair",
                    },
                    {
                        "spokenForm": f"{complex_modifiers['extendThroughEndOf']} <modifier>",
                        "description": "Extend through end of <modifier>",
                    },
                ],
            }
        )

    items.append(
        {
            "id": "containingScope",
            "type": "modifier",
            "variations": [
                {
                    "spokenForm": "<scope>",
                    "description": "Containing instance of <scope>",
                },
            ],
        }
    )

    if "every" in complex_modifiers:
        items.append(
            {
                "id": "every",
                "type": "modifier",
                "variations": [
                    {
                        "spokenForm": f"{complex_modifiers['every']} <scope>",
                        "description": "Every instance of <scope>",
                    },
                ],
            }
        )

    if "ancestor" in complex_modifiers:
        items.append(
            {
                "id": "ancestor",
                "type": "modifier",
                "variations": [
                    {
                        "spokenForm": f"{complex_modifiers['ancestor']} <scope>",
                        "description": "Grandparent containing instance of <scope>",
                    },
                ],
            }
        )

    items.append(get_relative_scope(complex_modifiers))
    items.append(get_ordinal_scope(complex_modifiers))

    return items


def get_relative_scope(complex_modifiers: dict[str, str]) -> ListItemDescriptor:
    variations: list[Variation] = []

    if "previous" in complex_modifiers:
        variations.append(
            {
                "spokenForm": f"{complex_modifiers['previous']} <scope>",
                "description": "Previous instance of <scope>",
            }
        )

    if "next" in complex_modifiers:
        variations.append(
            {
                "spokenForm": f"{complex_modifiers['next']} <scope>",
                "description": "Next instance of <scope>",
            }
        )

    if "previous" in complex_modifiers:
        variations.append(
            {
                "spokenForm": f"<ordinal> {complex_modifiers['previous']} <scope>",
                "description": "<ordinal> instance of <scope> before target",
            }
        )

    if "next" in complex_modifiers:
        variations.append(
            {
                "spokenForm": f"<ordinal> {complex_modifiers['next']} <scope>",
                "description": "<ordinal> instance of <scope> after target",
            }
        )

    if "backward" in complex_modifiers:
        variations.append(
            {
                "spokenForm": f"<scope> {complex_modifiers['backward']}",
                "description": "single instance of <scope> including target, going backwards",
            }
        )

    if "forward" in complex_modifiers:
        variations.append(
            {
                "spokenForm": f"<scope> {complex_modifiers['forward']}",
                "description": "single instance of <scope> including target, going forwards",
            }
        )

    if "every" in complex_modifiers:
        entries: list[Entry] = []

        if "backward" in complex_modifiers:
            entries.append(
                {
                    "spokenForm": f"<number> <scope>s {complex_modifiers['backward']}",
                    "description": "<number> instances of <scope> including target, going backwards",
                }
            )

        entries.append(
            {
                "spokenForm": "<number> <scope>s",
                "description": "<number> instances of <scope> including target, going forwards",
            }
        )

        if "previous" in complex_modifiers:
            entries.append(
                {
                    "spokenForm": f"{complex_modifiers['previous']} <number> <scope>s",
                    "description": "previous <number> instances of <scope>",
                }
            )

        if "next" in complex_modifiers:
            entries.append(
                {
                    "spokenForm": f"{complex_modifiers['next']} <number> <scope>s",
                    "description": "next <number> instances of <scope>",
                }
            )

        variations.extend(generateOptionalEvery(complex_modifiers["every"], *entries))

    return {
        "id": "relativeScope",
        "type": "modifier",
        "variations": variations,
    }


def get_ordinal_scope(complex_modifiers: dict[str, str]) -> ListItemDescriptor:
    variations: list[Variation] = [
        {
            "spokenForm": "<ordinal> <scope>",
            "description": "<ordinal> instance of <scope> in iteration scope",
        }
    ]

    if "last" in complex_modifiers:
        variations.append(
            {
                "spokenForm": f"<ordinal> {complex_modifiers['last']} <scope>",
                "description": "<ordinal>-to-last instance of <scope> in iteration scope",
            }
        )

    if "every" in complex_modifiers:
        entries: list[Entry] = []

        if "first" in complex_modifiers:
            entries.append(
                {
                    "spokenForm": f"{complex_modifiers['first']} <number> <scope>s",
                    "description": "first <number> instances of <scope> in iteration scope",
                }
            )

        if "last" in complex_modifiers:
            entries.append(
                {
                    "spokenForm": f"{complex_modifiers['last']} <number> <scope>s",
                    "description": "last <number> instances of <scope> in iteration scope",
                }
            )

        variations.extend(generateOptionalEvery(complex_modifiers["every"], *entries))

    return {
        "id": "ordinalScope",
        "type": "modifier",
        "variations": variations,
    }


def generateOptionalEvery(every: str, *entries: Entry) -> list[Entry]:
    return list(
        chain.from_iterable(
            [
                {
                    "spokenForm": entry["spokenForm"],
                    "description": f"{entry['description']}, as contiguous range",
                },
                {
                    "spokenForm": f"{every} {entry['spokenForm']}",
                    "description": f"{entry['description']}, as individual targets",
                },
            ]
            for entry in entries
        )
    )
