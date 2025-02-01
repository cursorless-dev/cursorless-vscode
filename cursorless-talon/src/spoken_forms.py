import json
from pathlib import Path
from typing import Callable, Concatenate, ParamSpec, TypeVar

from talon import app, cron, fs, registry

from .actions.actions import ACTION_LIST_NAMES
from .csv_overrides import (
    SPOKEN_FORM_HEADER,
    ListToSpokenForms,
    SpokenFormEntry,
    init_csv_and_watch_changes,
)
from .get_grapheme_spoken_form_entries import (
    get_grapheme_spoken_form_entries,
    get_graphemes_talon_list,
    grapheme_capture_name,
)
from .marks.decorated_mark import init_hats
from .spoken_forms_output import SpokenFormsOutput
from .spoken_scope_forms import init_scope_spoken_forms

JSON_FILE = Path(__file__).parent / "spoken_forms.json"
disposables: list[Callable] = []


P = ParamSpec("P")
R = TypeVar("R")


def auto_construct_defaults(
    spoken_forms: dict[str, ListToSpokenForms],
    handle_new_values: Callable[[str, list[SpokenFormEntry]], None],
    f: Callable[
        Concatenate[str, ListToSpokenForms, Callable[[list[SpokenFormEntry]], None], P],
        R,
    ],
):
    """
    Decorator that automatically constructs the default values for the
    `default_values` parameter of `f` based on the spoken forms in
    `spoken_forms`, by extracting the value at the key given by the csv
    filename.

    Note that we only ever pass `init_csv_and_watch_changes` as `f`. The
    reason we have this decorator is so that we can destructure the kwargs
    of `init_csv_and_watch_changes` to remove the `default_values` parameter.

    Args:
        spoken_forms (dict[str, ListToSpokenForms]): The spoken forms
        handle_new_values (Callable[[ListToSpokenForms], None]): A callback to be called when the lists are updated
        f (Callable[Concatenate[str, ListToSpokenForms, P], R]): Will always be `init_csv_and_watch_changes`
    """

    def ret(filename: str, *args: P.args, **kwargs: P.kwargs) -> R:
        default_values = spoken_forms[filename]
        return f(
            filename,
            default_values,
            lambda new_values: handle_new_values(filename, new_values),
            *args,
            **kwargs,
        )

    return ret


# Maps from Talon list name to the type of the value in that list, e.g.
# `pairedDelimiter` or `simpleScopeTypeType`
# FIXME: This is a hack until we generate spoken_forms.json from Typescript side
# At that point we can just include its type as part of that file
LIST_TO_TYPE_MAP = {
    "wrapper_selectable_paired_delimiter": "pairedDelimiter",
    "selectable_only_paired_delimiter": "pairedDelimiter",
    "wrapper_only_paired_delimiter": "pairedDelimiter",
    "surrounding_pair_scope_type": "pairedDelimiter",
    "scope_type": "simpleScopeTypeType",
    "glyph_scope_type": "complexScopeTypeType",
    "custom_regex_scope_type": "customRegex",
    **{
        action_list_name: "action"
        for action_list_name in ACTION_LIST_NAMES
        if action_list_name != "custom_action"
    },
    "custom_action": "customAction",
}


def update():
    global disposables

    for disposable in disposables:
        disposable()

    with open(JSON_FILE, encoding="utf-8") as file:
        spoken_forms = json.load(file)

    initialized = False

    # Maps from csv name to list of SpokenFormEntry
    custom_spoken_forms: dict[str, list[SpokenFormEntry]] = {}
    spoken_forms_output = SpokenFormsOutput()
    spoken_forms_output.init()
    graphemes_talon_list = get_graphemes_talon_list()

    def update_spoken_forms_output():
        spoken_forms_output.write(
            [
                *[
                    {
                        "type": LIST_TO_TYPE_MAP[entry.list_name],
                        "id": entry.id,
                        "spokenForms": entry.spoken_forms,
                    }
                    for spoken_form_list in custom_spoken_forms.values()
                    for entry in spoken_form_list
                    if entry.list_name in LIST_TO_TYPE_MAP
                ],
                *get_grapheme_spoken_form_entries(graphemes_talon_list),
            ]
        )

    def handle_new_values(csv_name: str, values: list[SpokenFormEntry]):
        custom_spoken_forms[csv_name] = values
        if initialized:
            # On first run, we just do one update at the end, so we suppress
            # writing until we get there
            init_scope_spoken_forms(graphemes_talon_list)
            update_spoken_forms_output()

    handle_csv = auto_construct_defaults(
        spoken_forms, handle_new_values, init_csv_and_watch_changes
    )

    disposables = [
        handle_csv("actions.csv"),
        handle_csv("target_connectives.csv"),
        handle_csv("modifiers.csv"),
        handle_csv("positions.csv"),
        handle_csv(
            "paired_delimiters.csv",
            pluralize_lists=[
                "selectable_only_paired_delimiter",
                "wrapper_selectable_paired_delimiter",
            ],
        ),
        handle_csv("special_marks.csv"),
        handle_csv("scope_visualizer.csv"),
        handle_csv("experimental/experimental_actions.csv"),
        handle_csv(
            "modifier_scope_types.csv",
            pluralize_lists=[
                "scope_type",
                "glyph_scope_type",
                "surrounding_pair_scope_type",
            ],
            extra_allowed_values=[
                "private.fieldAccess",
                "private.switchStatementSubject",
                "textFragment",
                "disqualifyDelimiter",
                "pairDelimiter",
                "interior",
            ],
            default_list_name="scope_type",
        ),
        # DEPRECATED @ 2025-02-01
        handle_csv(
            "experimental/wrapper_snippets.csv",
            allow_unknown_values=True,
            default_list_name="wrapper_snippet",
        ),
        handle_csv(
            "experimental/insertion_snippets.csv",
            allow_unknown_values=True,
            default_list_name="insertion_snippet_no_phrase",
        ),
        handle_csv(
            "experimental/insertion_snippets_single_phrase.csv",
            allow_unknown_values=True,
            default_list_name="insertion_snippet_single_phrase",
        ),
        handle_csv("experimental/miscellaneous.csv"),
        # ---
        handle_csv(
            "experimental/actions_custom.csv",
            headers=[SPOKEN_FORM_HEADER, "VSCode command"],
            allow_unknown_values=True,
            default_list_name="custom_action",
        ),
        handle_csv(
            "experimental/regex_scope_types.csv",
            headers=[SPOKEN_FORM_HEADER, "Regex"],
            allow_unknown_values=True,
            default_list_name="custom_regex_scope_type",
            pluralize_lists=["custom_regex_scope_type"],
        ),
        init_hats(
            spoken_forms["hat_styles.csv"]["hat_color"],
            spoken_forms["hat_styles.csv"]["hat_shape"],
        ),
    ]

    init_scope_spoken_forms(graphemes_talon_list)
    update_spoken_forms_output()
    initialized = True


def on_watch(path, flags):
    if JSON_FILE.match(path):
        update()


update_captures_cron = None


def update_captures_debounced(updated_captures: set[str]):
    if grapheme_capture_name not in updated_captures:
        return

    global update_captures_cron
    cron.cancel(update_captures_cron)
    update_captures_cron = cron.after("100ms", update_captures)


def update_captures():
    global update_captures_cron
    update_captures_cron = None

    update()


def on_ready():
    update()

    registry.register("update_captures", update_captures_debounced)

    fs.watch(str(JSON_FILE.parent), on_watch)


app.register("ready", on_ready)
