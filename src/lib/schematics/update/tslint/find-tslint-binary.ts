import {resolve} from 'path';
import {existsSync} from 'fs';

// This import lacks of type definitions.
const resolveBinSync = require('resolve-bin').sync;

/** Finds the path to the TSLint CLI binary. */
export function findTslintBinaryPath() {
  const defaultPath = resolve(__dirname, '..', 'node_modules', 'tslint', 'bin', 'tslint');

  if (existsSync(defaultPath)) {
    return defaultPath;
  } else {
    return resolveBinSync('tslint', 'tslint');
  }
}
