from dataclasses import dataclass

from .targets.target_types import CursorlessDestination, CursorlessTarget


@dataclass
class ScopeType:
    type: str


# Insertion snippets


@dataclass
class CustomInsertionSnippet:
    type = "custom"
    body: str
    scopeTypes: list[ScopeType] | None
    languages: list[str] | None
    substitutions: dict[str, str] | None


@dataclass
class ListInsertionSnippet:
    type = "list"
    substitutions: dict[str, str] | None
    snippets: list[CustomInsertionSnippet]


@dataclass
class InsertSnippetAction:
    name = "insertSnippet"
    snippetDescription: CustomInsertionSnippet | ListInsertionSnippet
    destination: CursorlessDestination


# Wrapper snippets


@dataclass
class CustomWrapperSnippet:
    type = "custom"
    body: str
    variableName: str | None
    scopeType: ScopeType | None
    languages: list[str] | None


@dataclass
class ListWrapperSnippet:
    type = "list"
    snippets: list[CustomWrapperSnippet]


@dataclass
class WrapperSnippetAction:
    name = "wrapWithSnippet"
    snippetDescription: CustomWrapperSnippet | ListWrapperSnippet
    target: CursorlessTarget


# Community types


@dataclass
class CommunityInsertionSnippet:
    body: str
    languages: list[str] | None = None
    scopes: list[str] | None = None


@dataclass
class CommunityWrapperSnippet:
    body: str
    variable_name: str
    languages: list[str] | None
    scope: str | None
