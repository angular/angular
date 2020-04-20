/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {close, openSync, readFileSync, writeSync} from 'fs';
import {Stream} from 'stream';

import {ReleaseConfig} from './config';

// Load conventional-changelog via require as it is untyped.
const changelog = require('conventional-changelog');

/**
 * Generate the new Changelog entry and prepend it to the CHANGELOG.md file for the
 * provided project config.
 */
export async function generateNextChangelogEntry(config: ReleaseConfig) {
  /** The file path of the changelog file. */
  const changelogPath = config.changelog.changelogPath;
  /** The newly generated changelog entry, to be prepended.  */
  const changelogEntry = await streamToString(changelog(
      {preset: 'angular'},
      config.changelog.context,
      config.changelog.gitCommitOptions,
      config.changelog.parserOptions,
      config.changelog.writerOptions,
      ));

  prependToFile(changelogPath, changelogEntry);
}


/** Convert stream object to a string. */
function streamToString(stream: Stream): Promise<string> {
  /** The chunks of the script to be concatenated together into a string. */
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    // Add each data chunk into the chunks array.
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    // Any error from the steam is considered a failure, and the promise is rejected.
    stream.on('error', reject);
    // As the stream is completed, resolve the promise with the contencated chunks as a string.
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

/** Prepend string to a file. */
function prependToFile(file: string, text: string) {
  /** The content of the file being appended to as a Buffer. */
  const existingFileData = readFileSync(file);
  /** The file descriptor of the file being appended to. */
  const openFile = openSync(file, 'w+');
  /** The provided text to be appended as a Buffer. */
  const bufferFromText = Buffer.from(text);

  // Write the provided text to the beginning of the file
  writeSync(openFile, bufferFromText, 0, bufferFromText.length, 0);
  // Write the rest of the content from the file before prepending after the provided text.
  writeSync(openFile, existingFileData, 0, existingFileData.length, bufferFromText.length);
  // Close the file, as writing is complete.
  close(openFile, err => console.error(err));
}
