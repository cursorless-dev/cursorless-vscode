from ..get_list import ListItemDescriptor


def get_tutorial_entries() -> list[ListItemDescriptor]:
    return [
        {
            "id": "start_tutorial",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "cursorless tutorial",
                    "description": "Start the introductory Cursorless tutorial",
                },
            ],
        },
        {
            "id": "tutorial_next",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "tutorial next",
                    "description": "Advance to next step in tutorial",
                },
            ],
        },
        {
            "id": "tutorial_previous",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "tutorial previous",
                    "description": "Go back to previous step in tutorial",
                },
            ],
        },
        {
            "id": "tutorial_restart",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "tutorial restart",
                    "description": "Restart the tutorial",
                },
            ],
        },
        {
            "id": "tutorial_resume",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "tutorial resume",
                    "description": "Resume the tutorial",
                },
            ],
        },
        {
            "id": "tutorial_list",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "tutorial list",
                    "description": "List all available tutorials",
                },
            ],
        },
        {
            "id": "tutorial_close",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "tutorial close",
                    "description": "Close the tutorial",
                },
            ],
        },
        {
            "id": "tutorial_start_by_number",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "tutorial <number>",
                    "description": "Start a specific tutorial by number",
                },
            ],
        },
    ]
