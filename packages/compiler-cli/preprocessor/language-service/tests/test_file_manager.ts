/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';
import * as fs from 'node:fs/promises';

export class TestFileManager {
  private files: string[] = [];
  private virtualFiles: Record<string, string> = {};
  private cursorOffset?: number;
  private currentVersion = 0;

  constructor(private workspacePath: string) {}

  getWorkspacePath(): string {
    return this.workspacePath;
  }

  createFilePath(name: string): string {
    const filePath = path.join(this.workspacePath, name);
    this.files.push(filePath);
    return filePath;
  }

  async editFile(
    filePath: string,
    content: string,
    type: 'virtual' | 'physical' = 'physical',
  ): Promise<{text: string; cursorOffset?: number}> {
    const {cursorOffset, text} = extractCursorInfo(content);
    if (cursorOffset !== undefined) {
      this.cursorOffset = cursorOffset;
    }

    if (type === 'physical') {
      await fs.mkdir(path.dirname(filePath), {recursive: true});
      await fs.writeFile(filePath, text);
    } else {
      this.virtualFiles[this.normalize(filePath)] = text;
    }
    return {text, cursorOffset};
  }

  private normalize(filePath: string): string {
    const clean = filePath.replace(/\\/g, '/');
    const isWindowsOrMac = process.platform === 'win32' || process.platform === 'darwin';
    return isWindowsOrMac ? clean.toLowerCase() : clean;
  }

  async getFileContent(filePath: string): Promise<string> {
    const norm = this.normalize(filePath);
    if (this.virtualFiles[norm] !== undefined) {
      return this.virtualFiles[norm];
    }
    return fs.readFile(filePath, 'utf-8');
  }

  getCursorOffset(): number | undefined {
    return this.cursorOffset;
  }

  setCursorOffset(offset: number | undefined) {
    this.cursorOffset = offset;
  }

  closeFile(filePath: string): void {
    delete this.virtualFiles[this.normalize(filePath)];
  }

  async cleanup() {
    for (const f of this.files) {
      await fs.rm(f, {force: true});
    }
    this.files = [];
    this.virtualFiles = {};
    this.cursorOffset = undefined;
  }

  getFiles(): string[] {
    return this.files;
  }

  getVirtualFiles(): Record<string, string> {
    return this.virtualFiles;
  }

  incrementVersion(): number {
    return ++this.currentVersion;
  }

  getCurrentVersion(): number {
    return this.currentVersion;
  }
}

export function extractCursorInfo(content: string): {cursorOffset?: number; text: string} {
  const cursorIndex = content.indexOf('¦');
  if (cursorIndex === -1) {
    return {text: content};
  }
  if (content.indexOf('¦', cursorIndex + 1) !== -1) {
    throw new Error(`Expected to find at most one cursor symbol '¦'`);
  }
  const text = content.substring(0, cursorIndex) + content.substring(cursorIndex + 1);
  return {cursorOffset: cursorIndex, text};
}
