from ..get_list import ListItemDescriptor, get_lists, get_spoken_form_from_list


def get_scopes() -> list[ListItemDescriptor]:
    glyph_spoken_form = get_spoken_form_from_list("glyph_scope_type", "glyph")

    items = get_lists(
        ["scope_type"],
        "scopeType",
        {
            "argumentOrParameter": "Argument",
            "boundedNonWhitespaceSequence": "Non-whitespace sequence bounded by surrounding pair delimeters",
            "boundedParagraph": "Paragraph bounded by surrounding pair delimeters",
        },
    )

    if glyph_spoken_form:
        items.append(
            {
                "id": "glyph",
                "type": "scopeType",
                "variations": [
                    {
                        "spokenForm": f"{glyph_spoken_form} <character>",
                        "description": "Instance of single character <character>",
                    },
                ],
            }
        )

    return items
