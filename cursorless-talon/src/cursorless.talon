app: vscode
-

<user.cursorless_action_or_ide_command> <user.cursorless_target>:
    user.cursorless_action_or_ide_command(cursorless_action_or_ide_command, cursorless_target)

{user.cursorless_positional_action} <user.cursorless_positional_target>:
    user.cursorless_single_target_command(cursorless_positional_action, cursorless_positional_target)

{user.cursorless_swap_action} <user.cursorless_swap_targets>:
    user.cursorless_multiple_target_command(cursorless_swap_action, cursorless_swap_targets)

{user.cursorless_move_bring_action} <user.cursorless_move_bring_targets>:
    user.cursorless_multiple_target_command(cursorless_move_bring_action, cursorless_move_bring_targets)

{user.cursorless_reformat_action} <user.formatters> at <user.cursorless_target>:
    user.cursorless_reformat(cursorless_target, formatters)

<user.cursorless_wrapper> {user.cursorless_wrap_action} <user.cursorless_target>:
    user.cursorless_wrap(cursorless_wrap_action, cursorless_target, cursorless_wrapper)

{user.cursorless_homophone} settings:
    user.run_rpc_command("workbench.action.openGlobalSettings")
    sleep(250ms)
    insert("cursorless")
