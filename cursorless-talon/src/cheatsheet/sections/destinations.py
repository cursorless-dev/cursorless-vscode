from ..get_list import ListItemDescriptor, get_raw_list


def get_destinations() -> list[ListItemDescriptor]:
    insertion_modes = {
        **{p: "to" for p in get_raw_list("insertion_mode_to")},
        **get_raw_list("insertion_mode_before_after"),
    }

    descriptions = {
        "to": "Replace <target>",
        "before": "Insert before <target>",
        "after": "Insert after <target>",
    }

    return [
        {
            "id": f"destination_{id}",
            "type": "destination",
            "variations": [
                {
                    "spokenForm": f"{spoken_form} <target>",
                    "description": descriptions[id],
                }
            ],
        }
        for spoken_form, id in insertion_modes.items()
    ]
