/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {glob} from 'tinyglobby';
import {FileAndContentRecord, TutorialConfig} from '../../interfaces/index';
import {dirname, join} from 'path';
import {existsSync, readFileSync} from 'fs';

// See https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files for details
// on identifying file types with initial bytes.
/** Initial bytes of the buffer(aka magic numbers) to see if it's a JPG file. */
const jpgSignature = [0xff, 0xd8, 0xff];
/** Initial bytes of the buffer(aka magic numbers) to see if it's a GIF file. */
const gifSignature = [0x47, 0x49, 0x46];
/** Initial bytes of the buffer(aka magic numbers) to see if it's a PNG file. */
const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** List of initial bytes to check for matching files. */
const SIGNATURES = [jpgSignature, gifSignature, pngSignature];

/**
 * Get the contents for the provided file, returning a string or Buffer as appropriate.
 */
export function getFileContents<T extends string | Uint8Array>(path: string): T;
export function getFileContents(path: string): string | Uint8Array {
  const fileBuffer = readFileSync(path);

  if (checkBufferMatchForSignatures(fileBuffer)) {
    return fileBuffer;
  }

  return fileBuffer.toString();
}

/**
 * Determine if the initial bytes of a buffer matches the expected bytes.
 */
function checkBufferMatchForSignatures(buffer: Uint8Array): boolean {
  for (const initialByes of SIGNATURES) {
    for (const [index, byte] of initialByes.entries()) {
      if (buffer[index] !== byte) return false;
    }
  }

  return true;
}

/**
 * Add all files found in the provided directory into the provided object of file and contents.
 * This overwrite already existing files in the object when encountered.
 */
export async function addDirectoryToFilesRecord(
  files: FileAndContentRecord,
  dir: string,
): Promise<void> {
  const exampleFilePaths = await glob('**/*', {
    cwd: dir,
    onlyFiles: true,
  });

  for (let path of exampleFilePaths) {
    files[path] = await getFileContents(join(dir, path));
  }
}

/**
 * Collect all of the config.json files in the provided directory and subdirectories.
 */
export async function findAllConfigs(dir: string): Promise<Record<string, TutorialConfig>> {
  const configs: Record<string, TutorialConfig> = {};

  const paths = await glob('**/config.json', {
    cwd: dir,
    onlyFiles: true,
  });

  for (const path of paths) {
    const content = await getFileContents<string>(join(dir, path));
    configs[dirname(path)] = JSON.parse(content) as TutorialConfig;
  }

  return configs;
}

/**
 * Collect a single of the config.json file at the provided directory.
 */
export async function findConfig(dir: string): Promise<TutorialConfig> {
  const configPath = join(dir, 'config.json');

  if (!existsSync(configPath)) {
    throw Error(`Unable config.json file found at: ${dir}`);
  }

  const content = await getFileContents<string>(configPath);
  return JSON.parse(content) as TutorialConfig;
}
