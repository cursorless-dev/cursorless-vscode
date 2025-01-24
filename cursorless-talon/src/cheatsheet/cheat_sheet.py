import webbrowser
from pathlib import Path

from talon import Context, Module, actions, app

from .get_list import get_list, get_lists
from .sections.actions import get_actions
from .sections.compound_targets import get_compound_targets
from .sections.destinations import get_destinations
from .sections.get_scope_visualizer import get_scope_visualizer
from .sections.modifiers import get_modifiers
from .sections.scopes import get_scopes
from .sections.special_marks import get_special_marks
from .sections.tutorial import get_tutorial_entries

mod = Module()
ctx = Context()
ctx.matches = r"""
tag: user.cursorless
"""

instructions_url = "https://www.cursorless.org/docs/"


@mod.action_class
class Actions:
    def private_cursorless_cheat_sheet_show_html():
        """Show new cursorless html cheat sheet"""
        app.notify(
            'Please first focus an app that supports cursorless, eg say "focus code"'
        )

    def private_cursorless_cheat_sheet_update_json():
        """Update default cursorless cheatsheet json (for developer use only)"""
        app.notify(
            'Please first focus an app that supports cursorless, eg say "focus code"'
        )

    def private_cursorless_open_instructions():
        """Open web page with cursorless instructions"""
        actions.user.private_cursorless_notify_docs_opened()
        webbrowser.open(instructions_url)


@ctx.action_class("user")
class CursorlessActions:
    def private_cursorless_cheat_sheet_show_html():
        """Show cursorless html cheat sheet"""
        # On Linux browsers installed using snap can't open files in a hidden directory
        if app.platform == "linux":
            cheatsheet_out_dir = cheatsheet_dir_linux()
            cheatsheet_filename = "cursorless-cheatsheet.html"
        else:
            cheatsheet_out_dir = Path.home() / ".cursorless"
            cheatsheet_filename = "cheatsheet.html"

        cheatsheet_out_dir.mkdir(parents=True, exist_ok=True)
        cheatsheet_out_path = cheatsheet_out_dir / cheatsheet_filename
        actions.user.private_cursorless_run_rpc_command_and_wait(
            "cursorless.showCheatsheet",
            {
                "version": 0,
                "spokenFormInfo": cursorless_cheat_sheet_get_json(),
                "outputPath": str(cheatsheet_out_path),
            },
        )
        webbrowser.open(cheatsheet_out_path.as_uri())

    def private_cursorless_cheat_sheet_update_json():
        """Update default cursorless cheatsheet json (for developer use only)"""
        actions.user.private_cursorless_run_rpc_command_and_wait(
            "cursorless.internal.updateCheatsheetDefaults",
            cursorless_cheat_sheet_get_json(),
        )


def cheatsheet_dir_linux() -> Path:
    """Get cheatsheet directory for Linux"""
    try:
        # 1. Get users actual document directory
        import platformdirs  # pyright: ignore [reportMissingImports]

        return Path(platformdirs.user_documents_dir())
    except Exception:
        # 2. Look for a documents directory in user home
        user_documents_dir = Path.home() / "Documents"
        if user_documents_dir.is_dir():
            return user_documents_dir

        # 3. Fall back to user home
        return Path.home()


def cursorless_cheat_sheet_get_json():
    """Get cursorless cheat sheet json"""
    return {
        "sections": [
            {
                "name": "Actions",
                "id": "actions",
                "items": get_actions(),
            },
            {
                "name": "Destinations",
                "id": "destinations",
                "items": get_destinations(),
            },
            {
                "name": "Scopes",
                "id": "scopes",
                "items": get_scopes(),
            },
            {
                "name": "Scope visualizer",
                "id": "scopeVisualizer",
                "items": get_scope_visualizer(),
            },
            {
                "name": "Modifiers",
                "id": "modifiers",
                "items": get_modifiers(),
            },
            {
                "name": "Paired delimiters",
                "id": "pairedDelimiters",
                "items": get_lists(
                    [
                        "wrapper_only_paired_delimiter",
                        "wrapper_selectable_paired_delimiter",
                        "selectable_only_paired_delimiter",
                        "surrounding_pair_scope_type",
                    ],
                    "pairedDelimiter",
                ),
            },
            {
                "name": "Special marks",
                "id": "specialMarks",
                "items": get_special_marks(),
            },
            {
                "name": "Compound targets",
                "id": "compoundTargets",
                "items": get_compound_targets(),
            },
            {
                "name": "Colors",
                "id": "colors",
                "items": get_list("hat_color", "hatColor"),
            },
            {
                "name": "Shapes",
                "id": "shapes",
                "items": get_list("hat_shape", "hatShape"),
            },
            {
                "name": "Tutorial",
                "id": "tutorial",
                "items": get_tutorial_entries(),
            },
        ]
    }
