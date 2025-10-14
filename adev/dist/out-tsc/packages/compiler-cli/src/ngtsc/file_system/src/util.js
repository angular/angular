const TS_DTS_JS_EXTENSION = /(?:\.d)?\.ts$|\.js$/;
/**
 * Convert Windows-style separators to POSIX separators.
 */
export function normalizeSeparators(path) {
  // TODO: normalize path only for OS that need it.
  return path.replace(/\\/g, '/');
}
/**
 * Remove a .ts, .d.ts, or .js extension from a file name.
 */
export function stripExtension(path) {
  return path.replace(TS_DTS_JS_EXTENSION, '');
}
export function getSourceFileOrError(program, fileName) {
  const sf = program.getSourceFile(fileName);
  if (sf === undefined) {
    throw new Error(
      `Program does not contain "${fileName}" - available files are ${program
        .getSourceFiles()
        .map((sf) => sf.fileName)
        .join(', ')}`,
    );
  }
  return sf;
}
//# sourceMappingURL=util.js.map
