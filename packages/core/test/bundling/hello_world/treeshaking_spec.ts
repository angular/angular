/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

const UTF8 = {
  encoding: 'utf-8'
};
const PACKAGE = 'angular/packages/core/test/bundling/hello_world';

import * as domino from 'domino';

describe('treeshaking with uglify', () => {
  let content: string;
  beforeAll(() => {
    content = fs.readFileSync(
        path.join(process.env['TEST_SRCDIR'], PACKAGE, 'bundle.min_debug.js'), UTF8);
  });

  it('should drop unused TypeScript helpers',
     () => { expect(content).not.toContain('__asyncGenerator'); });

  it('should not contain rxjs from commonjs distro', () => {
    expect(content).not.toContain('commonjsGlobal');
    expect(content).not.toContain('createCommonjsModule');
  });

  it('should not contain zone.js', () => { expect(content).not.toContain('scheduleMicroTask'); });

  describe('functional test in domino', () => {
    let document: Document;

    beforeEach(() => {
      const window = domino.createWindow('', 'http://localhost');
      (global as any).document = document = window.document;
      // Trick to avoid Event patching from
      // https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
      // It fails with Domino with TypeError: Cannot assign to read only property
      // 'stopImmediatePropagation' of object '#<Event>'
      (global as any).Event = null;

      document.body.innerHTML = '<hello-world></hello-world>';
    });

    afterEach(() => {
      (global as any).document = undefined;
      (global as any).Element = undefined;
    });


    it('should render hello world when not minified', () => {
      require(path.join(PACKAGE, 'bundle.js'));
      expect(document.body.textContent).toEqual('Hello World!');
    });

    it('should render hello world when debug minified', () => {
      require(path.join(PACKAGE, 'bundle.min_debug.js'));
      expect(document.body.textContent).toEqual('Hello World!');
    });

    it('should render hello world when fully minified', () => {
      require(path.join(PACKAGE, 'bundle.min.js'));
      expect(document.body.textContent).toEqual('Hello World!');
    });
  });
});