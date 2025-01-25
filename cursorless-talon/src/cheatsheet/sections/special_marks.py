from ..get_list import ListItemDescriptor, get_lists, get_raw_list, make_dict_readable


def get_special_marks() -> list[ListItemDescriptor]:
    line_direction_marks = make_dict_readable(
        "mark",
        {
            f"{key} <number>": value
            for key, value in get_raw_list("line_direction").items()
        },
        {
            "lineNumberRelativeUp": "Line number up from cursor",
            "lineNumberRelativeDown": "Line number down from cursor",
        },
    )

    return [
        *get_lists(["simple_mark", "unknown_symbol"], "mark"),
        *line_direction_marks,
    ]
