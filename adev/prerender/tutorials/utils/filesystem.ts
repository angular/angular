/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {basename, dirname} from 'path';
import {mkdir, readFile, writeFile} from 'fs/promises';
import {GlobOptionsWithFileTypesFalse, glob} from 'glob';
import JSZip from 'jszip';

import type {FileAndContent, FileAndContentRecord, PackageJson} from '../tutorials-types';

const fileContentsCache = new Map<string, string | Buffer>();

export async function getFileContents(path: string): Promise<string | Buffer> {
  if (fileContentsCache.get(path)) {
    return fileContentsCache.get(path)!;
  }

  const fileBuffer = await readFile(path);

  if (isBufferImage(fileBuffer)) {
    fileContentsCache.set(path, fileBuffer);
    return fileBuffer;
  }

  fileContentsCache.set(path, fileBuffer.toString());
  return fileBuffer.toString();
}

export async function getFilesContents(files: string[]): Promise<FileAndContent[]> {
  const filesContents: FileAndContent[] = [];

  await Promise.all(
    files.map((path) =>
      getFileContents(path).then((fileContents) => {
        filesContents.push({path, content: fileContents});
      }),
    ),
  );

  return filesContents;
}

export async function createDirectoryAndWriteFile(path: string, fileContents: string | Buffer) {
  await mkdir(dirname(path), {recursive: true}).catch(() => {
    // ignore error if directory already exists
  });

  await writeFile(path, fileContents);
}

export function filesAndContentsToRecord(filesAndContents: FileAndContent[]): FileAndContentRecord {
  return Object.fromEntries(filesAndContents.map(({path, content}) => [path, content]));
}

export function recordToFilesAndContents(filesRecord: FileAndContentRecord): FileAndContent[] {
  return Object.entries(filesRecord).map(([path, content]) => ({path, content}));
}

export async function getZipBuffer(files: FileAndContent[]): Promise<Buffer> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content, {binary: true});
  }

  return await zip.generateAsync({type: 'nodebuffer'});
}

export async function globWithCwdPath(
  pattern: string | string[],
  optionsWithCwd: Omit<GlobOptionsWithFileTypesFalse, 'cwd'> & {cwd: string},
) {
  const files = await glob(pattern, optionsWithCwd);

  return getFilesWithCwdPath(optionsWithCwd.cwd, files).sort();
}

export function getFilesWithCwdPath(cwdPath: string, files: string[]) {
  return files.map((file) => file.substring(file.indexOf(cwdPath)));
}

function isBufferImage(buffer: Buffer) {
  return isBufferPng(buffer) || isBufferJpg(buffer) || isBufferGif(buffer);
}

/**
 * Check initial bytes of the buffer(aka magic numbers) to see if it's a PNG file.
 *
 * See https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files
 */
function isBufferPng(buffer: Buffer) {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  return bufferMatchInitialBytes(buffer, pngSignature);
}

/**
 * Check initial bytes of the buffer(aka magic numbers) to see if it's a JPG file.
 *
 * See https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files
 */
function isBufferJpg(buffer: Buffer) {
  const jpgSignature = [0xff, 0xd8, 0xff];

  return bufferMatchInitialBytes(buffer, jpgSignature);
}

/**
 * Check initial bytes of the buffer(aka magic numbers) to see if it's a GIF file.
 *
 * See https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files
 */
function isBufferGif(buffer: Buffer) {
  const gifSignature = [0x47, 0x49, 0x46];

  return bufferMatchInitialBytes(buffer, gifSignature);
}

/**
 * Check if the initial bytes of a buffer matches the expected bytes.
 */
function bufferMatchInitialBytes(buffer: Buffer, expectedInitialBytes: number[]) {
  for (const [index, byte] of expectedInitialBytes.entries()) {
    if (buffer[index] !== byte) return false;
  }

  return true;
}

export function getPackageJsonFromFiles(filesAndContents: FileAndContent[]): PackageJson {
  const packageJson = filesAndContents.find(({path}) => basename(path) === 'package.json');

  if (!packageJson)
    throw new Error(`Could not find ${dirname(filesAndContents[0].path)}/package.json`);

  let parsedPackageJsonContent: PackageJson;

  try {
    parsedPackageJsonContent = JSON.parse(packageJson.content as string);
  } catch (e) {
    throw new Error(`Could not JSON.parse ${dirname(filesAndContents[0].path)}/package.json`);
  }

  return parsedPackageJsonContent;
}
