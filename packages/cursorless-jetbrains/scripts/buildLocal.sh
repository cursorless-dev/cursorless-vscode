#!/bin/bash

npm run compile && npm run esbuild

cp out/cursorless.js ../../../cursorless-jetbrains/src/main/resources/cursorless/
