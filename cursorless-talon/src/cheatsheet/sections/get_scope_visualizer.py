from ..get_list import ListItemDescriptor, get_list, get_raw_list, make_readable


def get_scope_visualizer() -> list[ListItemDescriptor]:
    show_scope_visualizers = list(get_raw_list("show_scope_visualizer").keys())
    show_scope_visualizer = (
        show_scope_visualizers[0] if show_scope_visualizers else None
    )
    visualization_types = get_raw_list("visualization_type")

    items = get_list("hide_scope_visualizer", "command")

    if show_scope_visualizer:
        items.append(
            {
                "id": "show_scope_visualizer",
                "type": "command",
                "variations": [
                    {
                        "spokenForm": f"{show_scope_visualizer} <scope>",
                        "description": "Visualize <scope>",
                    },
                    *[
                        {
                            "spokenForm": f"{show_scope_visualizer} <scope> {spoken_form}",
                            "description": f"Visualize <scope> {make_readable(id).lower()} range",
                        }
                        for spoken_form, id in visualization_types.items()
                    ],
                ],
            }
        )

    items.append(
        {
            "id": "show_scope_sidebar",
            "type": "command",
            "variations": [
                {
                    "spokenForm": "bar cursorless",
                    "description": "Show cursorless sidebar",
                },
            ],
        }
    )

    return items
