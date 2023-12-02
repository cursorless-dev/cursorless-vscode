from talon import Context, actions, app

from ..targets.target_types import CursorlessTarget

ctx = Context()

ctx.matches = r"""
app: vscode
"""

ctx.tags = ["user.cursorless"]


@ctx.action_class("user")
class Actions:
    def private_cursorless_find(target: CursorlessTarget):
        """Find text of target in editor"""
        search_text = actions.user.cursorless_get_text(target)
        if len(search_text) > 200:
            search_text = search_text[:200]
            app.notify("Search text is longer than 200 characters; truncating")
        actions.user.private_cursorless_run_rpc_command_no_wait("actions.find")
        actions.sleep("50ms")
        actions.insert(search_text)

    def private_cursorless_show_settings_in_ide():
        """Show Cursorless-specific settings in ide"""
        actions.user.private_cursorless_run_rpc_command_no_wait(
            "workbench.action.openSettings", "@ext:pokey.cursorless "
        )
        actions.sleep("250ms")
        actions.key("right")

    def private_cursorless_show_sidebar():
        """Show Cursorless sidebar"""
        actions.user.private_cursorless_run_rpc_command_and_wait(
            "workbench.view.extension.cursorless"
        )
