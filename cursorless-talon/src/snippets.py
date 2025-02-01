from typing import Optional, Union

from talon import Context, Module, actions

from .snippet_types import (
    CommunityInsertionSnippet,
    CommunityWrapperSnippet,
    CustomInsertionSnippet,
    CustomWrapperSnippet,
    InsertSnippetAction,
    ListInsertionSnippet,
    ListWrapperSnippet,
    ScopeType,
    WrapperSnippetAction,
)
from .targets.target_types import (
    CursorlessDestination,
    CursorlessTarget,
    ImplicitDestination,
)

mod = Module()
ctx = Context()

mod.list("cursorless_insert_snippet_action", desc="Cursorless insert snippet action")


def insert_snippet(
    snippet: CustomInsertionSnippet | ListInsertionSnippet,
    destination: CursorlessDestination,
):
    actions.user.private_cursorless_command_and_wait(
        InsertSnippetAction(snippet, destination),
    )


def wrap_with_snippet(
    snippet: CustomWrapperSnippet | ListWrapperSnippet,
    target: CursorlessTarget,
):
    actions.user.private_cursorless_command_and_wait(
        WrapperSnippetAction(snippet, target),
    )


def insert_community_snippet(
    name: str,
    substitutions: dict[str, str] | None,
    destination: CursorlessDestination,
):
    snippets: list[CommunityInsertionSnippet] = get_insertion_snippets(name)
    snippet = ListInsertionSnippet(
        substitutions,
        [
            CustomInsertionSnippet(
                s.body,
                to_scope_types(s.scopes),
                # languages will be missing if the user has an older version of community
                s.languages if hasattr(s, "languages") else None,
                None,  # substitutions
            )
            for s in snippets
        ],
    )
    insert_snippet(snippet, destination)


def insert_community_wrapper_snippet(name: str, target: CursorlessTarget):
    snippets: list[CommunityWrapperSnippet] = get_wrapper_snippets(name)
    snippet = ListWrapperSnippet(
        [
            CustomWrapperSnippet(
                s.body,
                s.variable_name,
                ScopeType(s.scope) if s.scope else None,
                s.languages if hasattr(s, "languages") else None,
            )
            for s in snippets
        ],
    )
    wrap_with_snippet(snippet, target)


@ctx.action_class("user")
class UserActions:
    def insert_snippet_by_name(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        substitutions: dict[str, str] = None,
    ):
        insert_community_snippet(
            name,
            substitutions,
            ImplicitDestination(),
        )


@mod.action_class
class Actions:
    def cursorless_insert_snippet(
        body: str,  # pyright: ignore [reportGeneralTypeIssues]
        destination: CursorlessDestination = ImplicitDestination(),
        scope_type: Optional[Union[str, list[str]]] = None,
    ):
        """Cursorless: Insert custom snippet <body>"""
        snippet = CustomInsertionSnippet(
            body,
            to_scope_types(scope_type),
            None,  # languages
            None,  # substitutions
        )
        insert_snippet(snippet, destination)

    def cursorless_wrap_with_snippet(
        body: str,  # pyright: ignore [reportGeneralTypeIssues]
        target: CursorlessTarget,
        variable_name: Optional[str] = None,
        scope: Optional[str] = None,
    ):
        """Cursorless: Wrap target with custom snippet <body>"""
        snippet = CustomWrapperSnippet(
            body,
            variable_name,
            ScopeType(scope) if scope else None,
            None,  # languages
        )
        wrap_with_snippet(snippet, target)

    def private_cursorless_insert_community_snippet(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        destination: CursorlessDestination,
    ):
        """Cursorless: Insert community snippet <name>"""
        insert_community_snippet(
            name,
            None,  # substitutions
            destination,
        )

    def private_cursorless_wrap_with_community_snippet(
        name: str,  # pyright: ignore [reportGeneralTypeIssues]
        target: CursorlessTarget,
    ):
        """Cursorless: Wrap target with community snippet <name>"""
        insert_community_wrapper_snippet(name, target)


def to_scope_types(scope_types: str | list[str] | None) -> list[ScopeType] | None:
    if isinstance(scope_types, str):
        return [ScopeType(scope_types)]
    elif scope_types is not None:
        return [ScopeType(st) for st in scope_types]
        return None


def get_insertion_snippets(name: str) -> list[CommunityInsertionSnippet]:
    try:
        return actions.user.get_insertion_snippets(name)
    except Exception as ex:
        if isinstance(ex, KeyError):
            snippet = actions.user.get_insertion_snippet(name)
            return [snippet]
        raise


def get_wrapper_snippets(name: str) -> list[CommunityWrapperSnippet]:
    try:
        return actions.user.get_wrapper_snippets(name)
    except Exception as ex:
        if isinstance(ex, KeyError):
            snippet = actions.user.get_wrapper_snippet(name)
            return [snippet]
        raise
