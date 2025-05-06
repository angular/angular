/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {basename, dirname, extname} from 'path';
import type {DirectoryNode, FileNode, FileSystemTree} from '@webcontainer/api';
import {FileAndContent, FileAndContentRecord} from '../../interfaces/index';

/**
 * Create a WebContainer's FileSystemTree from a list of files and its contents
 */
export function getFileSystemTree(files: string[], filesContents: FileAndContentRecord) {
  const fileSystemTree: FileSystemTree = {};

  for (let filepath of files) {
    const dir = dirname(filepath);
    const filename = basename(filepath);

    if (dir === '.') {
      const fileNode: FileNode = {file: {contents: filesContents[filepath]}};

      fileSystemTree[filename] = fileNode;
    } else {
      const dirParts = dir.split('/');

      buildFileSystemTree(fileSystemTree, dirParts, filename, filesContents[filepath]);
    }
  }

  return fileSystemTree;
}

/**
 * Builds a WebContainer's file system tree object recursively, mutating the
 * `fileSystemTree` parameter.
 *
 * @see https://webcontainers.io/api#filesystemtree
 */
function buildFileSystemTree(
  fileSystemTree: FileSystemTree,
  fileDirectories: string[],
  filename: FileAndContent['path'],
  fileContents: FileAndContent['content'],
): void {
  if (fileDirectories.length === 1) {
    const directory = fileDirectories[0];

    const fileNode: FileNode = {file: {contents: fileContents}};

    fileSystemTree[directory] = {
      ...fileSystemTree[directory],

      directory: {
        ...(fileSystemTree[directory]
          ? (fileSystemTree[directory] as DirectoryNode).directory
          : undefined),

        [filename]: fileNode,
      },
    };

    return;
  }

  const nextDirectory = fileDirectories.shift();
  if (!nextDirectory) return;

  if (!fileSystemTree[nextDirectory]) {
    fileSystemTree[nextDirectory] = {directory: {}};
  }

  buildFileSystemTree(
    (fileSystemTree[nextDirectory] as DirectoryNode).directory,
    fileDirectories,
    filename,
    fileContents,
  );
}

export function shouldUseFileInWebContainer(filename: string) {
  return ['.md', '.png', '.jpg'].includes(extname(filename)) === false;
}
