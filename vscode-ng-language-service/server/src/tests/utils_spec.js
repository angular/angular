'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, '__esModule', {value: true});
const utils_1 = require('../utils');
describe('filePathToUri', () => {
  it('should return URI with File scheme', () => {
    const uri = (0, utils_1.filePathToUri)('/project/main.ts');
    expect(uri).toMatch(/^file/);
  });
  it('should handle network path', () => {
    const uri = (0, utils_1.filePathToUri)('//project/main.ts');
    expect(uri).toBe('file://project/main.ts');
  });
  if (process.platform === 'win32') {
    it('should handle windows path', () => {
      const uri = (0, utils_1.filePathToUri)('C:\\project\\main.ts');
      expect(uri).toBe('file:///c%3A/project/main.ts');
    });
  }
});
describe('uriToFilePath', () => {
  if (process.platform === 'win32') {
    it('should return valid fsPath for windows', () => {
      const filePath = (0, utils_1.uriToFilePath)('file:///c%3A/project/main.ts');
      expect(filePath).toBe('c:\\project\\main.ts');
    });
    it('should return valid fsPath for network file uri', () => {
      const filePath = (0, utils_1.uriToFilePath)('file://project/main.ts');
      expect(filePath).toBe('\\\\project\\main.ts');
    });
  }
  if (process.platform !== 'win32') {
    it('should return valid fsPath for unix', () => {
      const filePath = (0, utils_1.uriToFilePath)('file:///project/main.ts');
      expect(filePath).toBe('/project/main.ts');
    });
    it('should return valid fsPath for network file uri', () => {
      const filePath = (0, utils_1.uriToFilePath)('file://project/main.ts');
      expect(filePath).toBe('//project/main.ts');
    });
  }
});
describe('MruTracker', () => {
  it('should track new items', () => {
    const tracker = new utils_1.MruTracker();
    tracker.update('a');
    expect(tracker.getAll()).toEqual(['a']);
  });
  it('should delete existing items', () => {
    const tracker = new utils_1.MruTracker();
    tracker.update('a');
    tracker.delete('a');
    expect(tracker.getAll()).toEqual([]);
  });
  it('should allow deletion of item that does not exist', () => {
    const tracker = new utils_1.MruTracker();
    tracker.delete('a');
    expect(tracker.getAll()).toEqual([]);
  });
  it('should return items in most recently used order', () => {
    const tracker = new utils_1.MruTracker();
    tracker.update('a');
    tracker.update('b');
    expect(tracker.getAll()).toEqual(['b', 'a']);
  });
  it('should update existing item', () => {
    const tracker = new utils_1.MruTracker();
    tracker.update('a');
    tracker.update('b');
    tracker.update('a');
    expect(tracker.getAll()).toEqual(['a', 'b']);
  });
});
//# sourceMappingURL=utils_spec.js.map
