export function pathJoin(...segments: string[]): string {
  return segments.join(pathSep());
}

function pathSep() {
  if (/^win/i.test(process.platform)) {
    return "\\";
  } else {
    return "/";
  }
}
