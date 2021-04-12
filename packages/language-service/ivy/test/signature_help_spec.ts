/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {getText} from '@angular/language-service/ivy/testing/src/util';

import {LanguageServiceTestEnv, OpenBuffer} from '../testing';

describe('signature help', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should handle an empty argument list', () => {
    const main = setup(`
      import {Component} from '@angular/core';

      @Component({
        template: '{{ foo() }}',
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `);
    main.moveCursorToText('foo(¦)');

    const items = main.getSignatureHelpItems()!;
    expect(items).toBeDefined();
    expect(items.applicableSpan.start).toEqual(main.cursor);
    expect(items.applicableSpan.length).toEqual(0);
    expect(items.argumentCount).toEqual(0);
    expect(items.argumentIndex).toEqual(0);
    expect(items.items.length).toEqual(1);
  });

  it('should handle a single argument', () => {
    const main = setup(`
      import {Component} from '@angular/core';

      @Component({
        template: '{{ foo("test") }}',
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `);
    main.moveCursorToText('foo("test"¦)');

    const items = main.getSignatureHelpItems()!;
    expect(items).toBeDefined();
    expect(getText(main.contents, items.applicableSpan)).toEqual('"test"');
    expect(items.argumentCount).toEqual(1);
    expect(items.argumentIndex).toEqual(0);
    expect(items.items.length).toEqual(1);
  });

  it('should handle a position within the first of two arguments', () => {
    const main = setup(`
      import {Component} from '@angular/core';

      @Component({
        template: '{{ foo("test", 3) }}',
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `);
    main.moveCursorToText('foo("te¦st", 3)');

    const items = main.getSignatureHelpItems()!;
    expect(items).toBeDefined();
    expect(getText(main.contents, items.applicableSpan)).toEqual('"test", 3');
    expect(items.argumentCount).toEqual(2);
    expect(items.argumentIndex).toEqual(0);
    expect(items.items.length).toEqual(1);
  });

  it('should handle a position within the second of two arguments', () => {
    const main = setup(`
      import {Component} from '@angular/core';

      @Component({
        template: '{{ foo("test", 1 + 2) }}',
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `);
    main.moveCursorToText('foo("test", 1 +¦ 2)');

    const items = main.getSignatureHelpItems()!;
    expect(items).toBeDefined();
    expect(getText(main.contents, items.applicableSpan)).toEqual('"test", 1 + 2');
    expect(items.argumentCount).toEqual(2);
    expect(items.argumentIndex).toEqual(1);
    expect(items.items.length).toEqual(1);
  });

  it('should handle a position within a new, EmptyExpr argument', () => {
    const main = setup(`
      import {Component} from '@angular/core';

      @Component({
        template: '{{ foo("test", ) }}',
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `);
    main.moveCursorToText('foo("test", ¦)');

    const items = main.getSignatureHelpItems()!;
    expect(items).toBeDefined();
    expect(getText(main.contents, items.applicableSpan)).toEqual('"test", ');
    expect(items.argumentCount).toEqual(2);
    expect(items.argumentIndex).toEqual(1);
    expect(items.items.length).toEqual(1);
  });
});

function setup(mainTs: string): OpenBuffer {
  const env = LanguageServiceTestEnv.setup();
  const project = env.addProject('test', {
    'main.ts': mainTs,
  });
  return project.openFile('main.ts');
}
