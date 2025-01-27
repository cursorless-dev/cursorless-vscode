const global = globalThis as any;

// process.env is used by `immer`
if (global.process == null) {
  global.process = {
    env: {},
  };
}

// Allows us to use `console.*` with quickjs
// if (typeof print !== "undefined") {
//   global.console = {
//     log: print,
//     error: print,
//     warn: print,
//     debug: print,
//   };
// }

// In quickjs `setTimeout` is not available.
// FIXME: Remove dependency on `setTimeout` in the future.
// https://github.com/cursorless-dev/cursorless/issues/2596
global.setTimeout = (callback: () => void, _delay: number) => {
  callback();
};
