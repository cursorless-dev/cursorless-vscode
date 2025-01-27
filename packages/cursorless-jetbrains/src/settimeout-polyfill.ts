const global = globalThis as any;

global.setTimeout = (callback: () => void, _delay: number) => {
  callback();
};
