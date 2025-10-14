import {InvalidFileSystem} from './invalid_file_system';
import {normalizeSeparators} from './util';
let fs = new InvalidFileSystem();
export function getFileSystem() {
  return fs;
}
export function setFileSystem(fileSystem) {
  fs = fileSystem;
}
/**
 * Convert the path `path` to an `AbsoluteFsPath`, throwing an error if it's not an absolute path.
 */
export function absoluteFrom(path) {
  if (!fs.isRooted(path)) {
    throw new Error(`Internal Error: absoluteFrom(${path}): path is not absolute`);
  }
  return fs.resolve(path);
}
const ABSOLUTE_PATH = Symbol('AbsolutePath');
/**
 * Extract an `AbsoluteFsPath` from a `ts.SourceFile`-like object.
 */
export function absoluteFromSourceFile(sf) {
  const sfWithPatch = sf;
  if (sfWithPatch[ABSOLUTE_PATH] === undefined) {
    sfWithPatch[ABSOLUTE_PATH] = fs.resolve(sfWithPatch.fileName);
  }
  // Non-null assertion needed since TS doesn't narrow the type of fields that use a symbol as a key
  // apparently.
  return sfWithPatch[ABSOLUTE_PATH];
}
/**
 * Convert the path `path` to a `PathSegment`, throwing an error if it's not a relative path.
 */
export function relativeFrom(path) {
  const normalized = normalizeSeparators(path);
  if (fs.isRooted(normalized)) {
    throw new Error(`Internal Error: relativeFrom(${path}): path is not relative`);
  }
  return normalized;
}
/**
 * Static access to `dirname`.
 */
export function dirname(file) {
  return fs.dirname(file);
}
/**
 * Static access to `join`.
 */
export function join(basePath, ...paths) {
  return fs.join(basePath, ...paths);
}
/**
 * Static access to `resolve`s.
 */
export function resolve(basePath, ...paths) {
  return fs.resolve(basePath, ...paths);
}
/** Returns true when the path provided is the root path. */
export function isRoot(path) {
  return fs.isRoot(path);
}
/**
 * Static access to `isRooted`.
 */
export function isRooted(path) {
  return fs.isRooted(path);
}
/**
 * Static access to `relative`.
 */
export function relative(from, to) {
  return fs.relative(from, to);
}
/**
 * Static access to `basename`.
 */
export function basename(filePath, extension) {
  return fs.basename(filePath, extension);
}
/**
 * Returns true if the given path is locally relative.
 *
 * This is used to work out if the given path is relative (i.e. not absolute) but also is not
 * escaping the current directory.
 */
export function isLocalRelativePath(relativePath) {
  return !isRooted(relativePath) && !relativePath.startsWith('..');
}
/**
 * Converts a path to a form suitable for use as a relative module import specifier.
 *
 * In other words it adds the `./` to the path if it is locally relative.
 */
export function toRelativeImport(relativePath) {
  return isLocalRelativePath(relativePath) ? `./${relativePath}` : relativePath;
}
//# sourceMappingURL=helpers.js.map
