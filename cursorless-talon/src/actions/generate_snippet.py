import glob
from pathlib import Path

from talon import Context, Module, actions, settings

from ..targets.target_types import CursorlessExplicitTarget

mod = Module()

ctx = Context()
ctx.matches = r"""
tag: user.cursorless_use_community_snippets
"""


@mod.action_class
class Actions:
    def private_cursorless_migrate_snippets():
        """Migrate snippets from Cursorless to community format"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "cursorless.migrateSnippets",
            str(get_directory_path()),
        )

    def private_cursorless_generate_snippet_action(target: CursorlessExplicitTarget):  # pyright: ignore [reportGeneralTypeIssues]
        """Generate a snippet from the given target"""
        actions.user.private_cursorless_command_no_wait(
            {
                "name": "generateSnippet",
                "target": target,
            }
        )


@ctx.action_class("user")
class UserActions:
    def private_cursorless_generate_snippet_action(target: CursorlessExplicitTarget):  # pyright: ignore [reportGeneralTypeIssues]
        actions.user.private_cursorless_command_no_wait(
            {
                "name": "generateSnippet",
                "target": target,
                "directory": str(get_directory_path()),
            }
        )


def get_directory_path() -> Path:
    settings_dir = get_setting_dir()
    if settings_dir is not None:
        return settings_dir
    return get_community_snippets_dir()


def get_setting_dir() -> Path | None:
    try:
        setting_dir = settings.get("user.snippets_dir")
        if not setting_dir:
            return None

        dir = Path(str(setting_dir))

        if not dir.is_absolute():
            user_dir = Path(actions.path.talon_user())
            dir = user_dir / dir

        return dir.resolve()
    except Exception:
        return None


def get_community_snippets_dir() -> Path:
    files = glob.iglob(
        f"{actions.path.talon_user()}/**/snippets/snippets/*.snippet",
        recursive=True,
    )
    for file in files:
        return Path(file).parent
    raise ValueError("Could not find community snippets directory")
