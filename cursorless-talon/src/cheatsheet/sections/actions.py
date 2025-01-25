from ...actions.actions import ACTION_LIST_NAMES
from ..get_list import ListItemDescriptor, get_raw_list, make_dict_readable


def get_actions() -> list[ListItemDescriptor]:
    all_actions = {}
    for name in ACTION_LIST_NAMES:
        all_actions.update(get_raw_list(name))

    multiple_target_action_names = [
        "replaceWithTarget",
        "moveToTarget",
        "swapTargets",
        "applyFormatter",
        "callAsFunction",
        "wrapWithPairedDelimiter",
        "rewrap",
        "pasteFromClipboard",
    ]
    simple_actions = {
        f"{key} <target>": value
        for key, value in all_actions.items()
        if value not in multiple_target_action_names
    }
    complex_actions = {
        value: key
        for key, value in all_actions.items()
        if value in multiple_target_action_names
    }

    swap_connectives = list(get_raw_list("swap_connective").keys())
    swap_connective = swap_connectives[0] if swap_connectives else None

    items = make_dict_readable(
        "action",
        simple_actions,
        {
            "editNewLineAfter": "Edit new line/scope after",
            "editNewLineBefore": "Edit new line/scope before",
        },
    )

    if "replaceWithTarget" in complex_actions:
        items.append(
            {
                "id": "replaceWithTarget",
                "type": "action",
                "variations": [
                    {
                        "spokenForm": f"{complex_actions['replaceWithTarget']} <target> <destination>",
                        "description": "Copy <target> to <destination>",
                    },
                    {
                        "spokenForm": f"{complex_actions['replaceWithTarget']} <target>",
                        "description": "Insert copy of <target> at cursor",
                    },
                ],
            }
        )

    if "pasteFromClipboard" in complex_actions:
        items.append(
            {
                "id": "pasteFromClipboard",
                "type": "action",
                "variations": [
                    {
                        "spokenForm": f"{complex_actions['pasteFromClipboard']} <destination>",
                        "description": "Paste from clipboard at <destination>",
                    }
                ],
            }
        )

    if "moveToTarget" in complex_actions:
        items.append(
            {
                "id": "moveToTarget",
                "type": "action",
                "variations": [
                    {
                        "spokenForm": f"{complex_actions['moveToTarget']} <target> <destination>",
                        "description": "Move <target> to <destination>",
                    },
                    {
                        "spokenForm": f"{complex_actions['moveToTarget']} <target>",
                        "description": "Move <target> to cursor position",
                    },
                ],
            }
        )

    if "swapTargets" in complex_actions and swap_connective:
        items.append(
            {
                "id": "swapTargets",
                "type": "action",
                "variations": [
                    {
                        "spokenForm": f"{complex_actions['swapTargets']} <target 1> {swap_connective} <target 2>",
                        "description": "Swap <target 1> with <target 2>",
                    },
                    {
                        "spokenForm": f"{complex_actions['swapTargets']} {swap_connective} <target>",
                        "description": "Swap selection with <target>",
                    },
                ],
            }
        )

    if "applyFormatter" in complex_actions:
        items.append(
            {
                "id": "applyFormatter",
                "type": "action",
                "variations": [
                    {
                        "spokenForm": f"{complex_actions.get('applyFormatter')} <formatter> at <target>",
                        "description": "Reformat <target> as <formatter>",
                    }
                ],
            }
        )

    if "callAsFunction" in complex_actions:
        items.append(
            {
                "id": "callAsFunction",
                "type": "action",
                "variations": [
                    {
                        "spokenForm": f"{complex_actions['callAsFunction']} <target>",
                        "description": "Call <target> on selection",
                    },
                    {
                        "spokenForm": f"{complex_actions['callAsFunction']} <target 1> on <target 2>",
                        "description": "Call <target 1> on <target 2>",
                    },
                ],
            }
        )

    if "wrapWithPairedDelimiter" in complex_actions:
        items.append(
            {
                "id": "wrapWithPairedDelimiter",
                "type": "action",
                "variations": [
                    {
                        "spokenForm": f"<pair> {complex_actions['wrapWithPairedDelimiter']} <target>",
                        "description": "Wrap <target> with <pair>",
                    }
                ],
            }
        )

    if "rewrap" in complex_actions:
        items.append(
            {
                "id": "rewrap",
                "type": "action",
                "variations": [
                    {
                        "spokenForm": f"<pair> {complex_actions['rewrap']} <target>",
                        "description": "Rewrap <target> with <pair>",
                    }
                ],
            }
        )

    return items
