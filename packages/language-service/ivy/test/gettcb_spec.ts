/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {extractCursorInfo} from './env';
import {createModuleWithDeclarations} from './test_utils';

describe('get typecheck block', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should find the typecheck block for an inline template', () => {
    const {text, cursor} = extractCursorInfo(`
      import {Component} from '@angular/core';

      @Component({
        template: '<div>{{ my¦Prop }}</div>',
      })
      export class AppCmp {
        myProp!: string;
      }`);
    const appFi = absoluteFrom('/app.ts');
    const env = createModuleWithDeclarations([{name: appFi, contents: text}]);

    env.expectNoSourceDiagnostics();
    const result = env.ngLS.getTcb(appFi, cursor);
    if (result === undefined) {
      fail('Expected a valid TCB response');
      return;
    }
    const {content, selections} = result;
    expect(selections.length).toBe(1);
    const {start, length} = selections[0];
    expect(content.substring(start, start + length)).toContain('myProp');
  });

  it('should find the typecheck block for an external template', () => {
    const {text, cursor} = extractCursorInfo(`<div>{{ my¦Prop }}</div>`);
    const templateFi = absoluteFrom('/app.html');
    const env = createModuleWithDeclarations(
        [{
          name: absoluteFrom('/app.ts'),
          contents: `
            import {Component} from '@angular/core';

            @Component({
              templateUrl: './app.html',
            })
            export class AppCmp {
              myProp!: string;
            }`,
        }],
        [{name: templateFi, contents: text}]);

    env.expectNoSourceDiagnostics();
    const result = env.ngLS.getTcb(templateFi, cursor);
    if (result === undefined) {
      fail('Expected a valid TCB response');
      return;
    }
    const {content, selections} = result;
    expect(selections.length).toBe(1);
    const {start, length} = selections[0];
    expect(content.substring(start, start + length)).toContain('myProp');
  });

  it('should not find typecheck blocks outside a template', () => {
    const {text, cursor} = extractCursorInfo(`
      import {Component} from '@angular/core';

      @Component({
        template: '<div>{{ myProp }}</div>',
      })
      export class AppCmp {
        my¦Prop!: string;
      }`);
    const appFi = absoluteFrom('/app.ts');
    const env = createModuleWithDeclarations([{name: appFi, contents: text}]);

    env.expectNoSourceDiagnostics();
    const result = env.ngLS.getTcb(appFi, cursor);
    expect(result).toBeUndefined();
  });
});
