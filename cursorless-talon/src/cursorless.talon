mode: command
mode: user.cursorless_spoken_form_test
tag: user.cursorless
-

<user.cursorless_action_or_ide_command> <user.cursorless_target>:
    user.private_cursorless_action_or_ide_command(cursorless_action_or_ide_command, cursorless_target)

{user.cursorless_bring_move_action} <user.cursorless_bring_move_targets>:
    user.private_cursorless_bring_move(cursorless_bring_move_action, cursorless_bring_move_targets)

{user.cursorless_swap_action} <user.cursorless_swap_targets>:
    user.private_cursorless_swap(cursorless_swap_targets)

{user.cursorless_paste_action} <user.cursorless_destination>:
    user.private_cursorless_paste(cursorless_destination)

{user.cursorless_reformat_action} <user.formatters> at <user.cursorless_target>:
    user.cursorless_reformat(cursorless_target, formatters)

{user.cursorless_call_action} <user.cursorless_target> on <user.cursorless_target>:
    user.private_cursorless_call(cursorless_target_1, cursorless_target_2)

<user.cursorless_wrapper_paired_delimiter> {user.cursorless_wrap_action} <user.cursorless_target>:
    user.private_cursorless_wrap_with_paired_delimiter(cursorless_wrap_action, cursorless_target, cursorless_wrapper_paired_delimiter)

{user.cursorless_show_scope_visualizer} <user.cursorless_scope_type> [{user.cursorless_visualization_type}]:
    user.private_cursorless_show_scope_visualizer(cursorless_scope_type, cursorless_visualization_type or "content")
{user.cursorless_hide_scope_visualizer}:
    user.private_cursorless_hide_scope_visualizer()

{user.cursorless_homophone} settings:
    user.private_cursorless_show_settings_in_ide()

bar {user.cursorless_homophone}:
    user.private_cursorless_show_sidebar()

{user.cursorless_homophone} stats:
    user.private_cursorless_show_command_statistics()

{user.cursorless_homophone} tutorial:
    user.private_cursorless_start_tutorial()
tutorial next: user.private_cursorless_tutorial_next()
tutorial (previous | last): user.private_cursorless_tutorial_previous()
tutorial restart: user.private_cursorless_tutorial_restart()
tutorial resume: user.private_cursorless_tutorial_resume()
tutorial (list | close): user.private_cursorless_tutorial_list()
tutorial <number_small>:
    user.private_cursorless_tutorial_start_by_number(number_small)

{user.cursorless_homophone} migrate snippets:
    user.private_cursorless_migrate_snippets()

# TODO:
migrate:    user.private_cursorless_migrate_snippets()
