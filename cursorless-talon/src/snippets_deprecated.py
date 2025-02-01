from typing import Any

from talon import Module, app, registry

mod = Module()

# DEPRECATED @ 2025-02-01

tags = [
    "cursorless_experimental_snippets",
    "cursorless_use_community_snippets",
]

lists = [
    "cursorless_insertion_snippet_no_phrase",
    "cursorless_insertion_snippet_single_phrase",
    "cursorless_phrase_terminator",
]

for tag in tags:
    mod.tag(tag, desc="DEPRECATED")

for list in lists:
    mod.list(list, desc="DEPRECATED")


@mod.action_class
class Actions:
    def cursorless_insert_snippet_by_name(name: str):  # pyright: ignore [reportGeneralTypeIssues]
        """[DEPRECATED] Cursorless: Insert named snippet <name>"""
        raise NotImplementedError(
            "Cursorless snippets are deprecated. Please use community snippets."
        )

    def cursorless_wrap_with_snippet_by_name(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        variable_name: str,
        target: Any,
    ):
        """[DEPRECATED] Cursorless: Wrap target with a named snippet <name>"""
        raise NotImplementedError(
            "Cursorless snippets are deprecated. Please use community snippets."
        )


def on_ready():
    for tag in tags:
        name = f"user.{tag}"
        if name in registry.tags:
            print(f"WARNING tag: '{name}' is deprecated and should not be used anymore")


app.register("ready", on_ready)
