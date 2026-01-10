/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {filePathToUri, MruTracker, uriToFilePath} from '../utils';

describe('filePathToUri', () => {
  it('should return URI with File scheme', () => {
    const uri = filePathToUri('/project/main.ts');
    expect(uri).toMatch(/^file/);
  });

  it('should handle network path', () => {
    const uri = filePathToUri('//project/main.ts');
    expect(uri).toBe('file://project/main.ts');
  });

  if (process.platform === 'win32') {
    it('should handle windows path', () => {
      const uri = filePathToUri('C:\\project\\main.ts');
      expect(uri).toBe('file:///c%3A/project/main.ts');
    });
  }
});

describe('uriToFilePath', () => {
  if (process.platform === 'win32') {
    it('should return valid fsPath for windows', () => {
      const filePath = uriToFilePath('file:///c%3A/project/main.ts');
      expect(filePath).toBe('c:\\project\\main.ts');
    });

    it('should return valid fsPath for network file uri', () => {
      const filePath = uriToFilePath('file://project/main.ts');
      expect(filePath).toBe('\\\\project\\main.ts');
    });
  }

  if (process.platform !== 'win32') {
    it('should return valid fsPath for unix', () => {
      const filePath = uriToFilePath('file:///project/main.ts');
      expect(filePath).toBe('/project/main.ts');
    });

    it('should return valid fsPath for network file uri', () => {
      const filePath = uriToFilePath('file://project/main.ts');
      expect(filePath).toBe('//project/main.ts');
    });
  }
});

describe('MruTracker', () => {
  it('should track new items', () => {
    const tracker = new MruTracker();
    tracker.update('a');
    expect(tracker.getAll()).toEqual(['a']);
  });

  it('should delete existing items', () => {
    const tracker = new MruTracker();
    tracker.update('a');
    tracker.delete('a');
    expect(tracker.getAll()).toEqual([]);
  });

  it('should allow deletion of item that does not exist', () => {
    const tracker = new MruTracker();
    tracker.delete('a');
    expect(tracker.getAll()).toEqual([]);
  });

  it('should return items in most recently used order', () => {
    const tracker = new MruTracker();
    tracker.update('a');
    tracker.update('b');
    expect(tracker.getAll()).toEqual(['b', 'a']);
  });

  it('should update existing item', () => {
    const tracker = new MruTracker();
    tracker.update('a');
    tracker.update('b');
    tracker.update('a');
    expect(tracker.getAll()).toEqual(['a', 'b']);
  });
});
