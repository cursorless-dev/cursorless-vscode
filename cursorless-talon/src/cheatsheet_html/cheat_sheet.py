import tempfile
import webbrowser
from pathlib import Path

from talon import Module, actions

from .get_list import get_list, get_lists
from .sections.actions import get_actions
from .sections.compound_targets import get_compound_targets
from .sections.scopes import get_scopes

mod = Module()

cheatsheet_out_dir = Path(tempfile.mkdtemp())
instructions_url = "https://www.cursorless.org/docs/"


@mod.action_class
class Actions:
    def cursorless_cheat_sheet_show_html():
        """Show new cursorless html cheat sheet"""
        cheatsheet_out_path = cheatsheet_out_dir / "cheatsheet.html"
        actions.user.vscode_with_plugin_and_wait(
            "cursorless.showCheatsheet",
            actions.user.cursorless_cheat_sheet_get_json(),
            str(cheatsheet_out_path),
        )
        webbrowser.open(cheatsheet_out_path.as_uri())

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
                    "name": "Scopes",
                    "id": "scopes",
                    "items": get_scopes(),
                },
                {
                    "name": "Paired delimiters",
                    "id": "paired-delimiters",
                    "items": get_lists(
                        [
                            "wrapper_only_paired_delimiter",
                            "wrapper_selectable_paired_delimiter",
                            "selectable_only_paired_delimiter",
                        ]
                    ),
                },
                {
                    "name": "Special marks",
                    "id": "special-marks",
                    "items": get_list("special_mark"),
                },
                {
                    "name": "Positions",
                    "id": "positions",
                    "items": get_list("position"),
                },
                {
                    "name": "Compound targets",
                    "id": "compound-targets",
                    "items": get_compound_targets(),
                },
                {
                    "name": "Colors",
                    "id": "colors",
                    "items": get_list("hat_color"),
                },
                {
                    "name": "Shapes",
                    "id": "shapes",
                    "items": get_list("hat_shape"),
                },
            ]
        }

    def cursorless_open_instructions():
        """Open web page with cursorless instructions"""
        webbrowser.open(instructions_url)
