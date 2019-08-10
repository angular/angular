/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';

import {ResourceHandler} from '../../../src/inlining/resource_processing/resource_handler';
import {ResourceProcessor} from '../../../src/inlining/resource_processing/resource_processor';

describe('ResourceProcessor', () => {
  describe('processResources()', () => {

    beforeEach(() => {
      spyOn(fs, 'readFileSync')
          .and.returnValues(Buffer.from('resource file 1'), Buffer.from('resource file 2'));
    });

    it('should call fs.readFileSync to load the resource file contents', () => {
      const processor = new ResourceProcessor([new MockResourceHandler()]);
      processor.processResources(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);
      expect(fs.readFileSync).toHaveBeenCalledWith('/dist/file1.js');
      expect(fs.readFileSync).toHaveBeenCalledWith('/dist/images/img.gif');
    });

    it('should `canHandle()` and `handle()` for each file', () => {
      const handler = new MockResourceHandler(true);
      const processor = new ResourceProcessor([handler]);
      processor.processResources(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);

      expect(handler.log).toEqual([
        'canHandle(file1.js, resource file 1)',
        'handle(/dist, file1.js, resource file 1)',
        'canHandle(images/img.gif, resource file 2)',
        'handle(/dist, images/img.gif, resource file 2)',
      ]);
    });

    it('should stop at the first handler that can handle each file', () => {
      const handler1 = new MockResourceHandler(false);
      const handler2 = new MockResourceHandler(true);
      const handler3 = new MockResourceHandler(true);
      const processor = new ResourceProcessor([handler1, handler2, handler3]);
      processor.processResources(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);

      expect(handler1.log).toEqual([
        'canHandle(file1.js, resource file 1)',
        'canHandle(images/img.gif, resource file 2)',
      ]);
      expect(handler2.log).toEqual([
        'canHandle(file1.js, resource file 1)',
        'handle(/dist, file1.js, resource file 1)',
        'canHandle(images/img.gif, resource file 2)',
        'handle(/dist, images/img.gif, resource file 2)',
      ]);
    });

    it('should error if none of the handlers can handle the file', () => {
      const handler = new MockResourceHandler(false);
      const processor = new ResourceProcessor([handler]);
      expect(
          () => processor.processResources(
              ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []))
          .toThrowError('Unable to handle resource file: /dist/file1.js');
    });
  });
});

class MockResourceHandler implements ResourceHandler {
  log: string[] = [];
  constructor(private _canHandle: boolean = true) {}

  canHandle(relativePath: string, contents: Buffer) {
    this.log.push(`canHandle(${relativePath}, ${contents.toString('utf8')})`);
    return this._canHandle;
  }

  handle(rootPath: string, relativePath: string, contents: Buffer) {
    this.log.push(`handle(${rootPath}, ${relativePath}, ${contents})`);
  }
}

function mockOutputPathFn(locale: string, relativePath: string) {
  return `translations/${locale}/${relativePath}`;
}
