mode: command
mode: user.cursorless_spoken_form_test
tag: user.cursorless
-

# These snippets are defined in community

{user.cursorless_insert_snippet_action} {user.snippet} <user.cursorless_destination>:
    user.private_cursorless_insert_community_snippet(snippet, cursorless_destination)

{user.snippet_wrapper} {user.cursorless_wrap_action} <user.cursorless_target>:
    user.private_cursorless_wrap_with_community_snippet(snippet_wrapper, cursorless_target)
