/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '@angular/compiler-cli';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {SignalQueriesMigration} from './migration';
import {initMockFileSystem} from '../../../../compiler-cli/src/ngtsc/file_system/testing';
import {diffText} from '../../utils/tsurge/testing/diff';

interface TestCase {
  id: string;
  before: string;
  after: string;
  focus?: boolean;
}

const testCases: TestCase[] = [
  {
    id: 'viewChild with string locator and nullable',
    before: `@ViewChild('myBtn') button: MyButton|undefined = undefined;`,
    after: `readonly button = viewChild<MyButton>('myBtn');`,
  },
  {
    id: 'viewChild with class type locator and nullable',
    before: `@ViewChild(MyButton) button: MyButton|undefined = undefined;`,
    after: `readonly button = viewChild(MyButton);`,
  },
  {
    id: 'viewChild with class type locator and nullable via question-mark shorthand',
    before: `@ViewChild(MyButton) button?: MyButton;`,
    after: `readonly button = viewChild(MyButton);`,
  },
  {
    id: 'viewChild with class type locator and exclamation mark to simulate required',
    before: `@ViewChild(MyButton) button!: MyButton;`,
    after: `readonly button = viewChild.required(MyButton);`,
  },
  {
    id: 'viewChild with string locator and read option, nullable shorthand',
    before: `@ViewChild('myBtn', {read: ElementRef}) buttonEl?: ElementRef;`,
    after: `readonly buttonEl = viewChild('myBtn', { read: ElementRef });`,
  },
  {
    id: 'viewChild with string locator and read option, required',
    before: `@ViewChild('myBtn', {read: ElementRef}) buttonEl!: ElementRef;`,
    after: `readonly buttonEl = viewChild.required('myBtn', { read: ElementRef });`,
  },
];

describe('signal queries migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('test cases', () => {
    for (const c of testCases) {
      (c.focus ? fit : it)(c.id, async () => {
        const fs = await runTsurgeMigration(new SignalQueriesMigration(), [
          {
            name: absoluteFrom('/app.component.ts'),
            isProgramRootFile: true,
            contents: populateTestCaseComponent(c.before),
          },
        ]);

        const actual = fs.readFile(absoluteFrom('/app.component.ts'));
        const expected = populateTestCaseComponent(c.after);

        if (actual !== expected) {
          expect(diffText(expected, actual)).toBe('');
        }
      });
    }
  });

  it('should not migrate if there is a write to a query', async () => {
    const fs = await runTsurgeMigration(new SignalQueriesMigration(), [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {ViewChild, ElementRef, Directive} from '@angular/core';

          @Directive()
          class MyComp {
            @ViewChild('labelRef') label?: ElementRef;

            click() {
              this.label = undefined;
            }
          }
        `,
      },
    ]);

    const actual = fs.readFile(absoluteFrom('/app.component.ts'));
    expect(actual).not.toContain(`viewChild`);
    expect(actual).toContain(`@ViewChild('labelRef') label?: ElementRef;`);
  });
});

function populateTestCaseComponent(declaration: string): string {
  return `
    import {
      ViewChild,
      ViewChildren,
      ContentChild,
      ContentChildren,
      Directive
    } from '@angular/core';

    @Directive()
    export class TestDir {
      ${declaration}
    }
  `;
}
