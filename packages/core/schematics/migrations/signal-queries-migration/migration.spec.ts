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
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {diffText} from '../../utils/tsurge/testing/diff';

interface TestCase {
  id: string;
  before: string;
  after: string;
  focus?: boolean;
}

const declarationTestCases: TestCase[] = [
  // View Child
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
  // Content Child
  {
    id: 'contentChild with string locator and nullable',
    before: `@ContentChild('myBtn') button: MyButton|undefined = undefined;`,
    after: `readonly button = contentChild<MyButton>('myBtn');`,
  },
  {
    id: 'contentChild with class type locator and nullable',
    before: `@ContentChild(MyButton) button: MyButton|undefined = undefined;`,
    after: `readonly button = contentChild(MyButton);`,
  },
  {
    id: 'contentChild with class type locator and nullable via question-mark shorthand',
    before: `@ContentChild(MyButton) button?: MyButton;`,
    after: `readonly button = contentChild(MyButton);`,
  },
  {
    id: 'contentChild with class type locator and exclamation mark to simulate required',
    before: `@ContentChild(MyButton) button!: MyButton;`,
    after: `readonly button = contentChild.required(MyButton);`,
  },
  {
    id: 'contentChild with string locator and read option, nullable shorthand',
    before: `@ContentChild('myBtn', {read: ElementRef}) buttonEl?: ElementRef;`,
    after: `readonly buttonEl = contentChild('myBtn', { read: ElementRef });`,
  },
  {
    id: 'contentChild with string locator and read option, required',
    before: `@ContentChild('myBtn', {read: ElementRef}) buttonEl!: ElementRef;`,
    after: `readonly buttonEl = contentChild.required('myBtn', { read: ElementRef });`,
  },
  {
    id: 'contentChild with string locator and read option, required',
    before: `@ContentChild('myBtn', {read: ElementRef}) buttonEl!: ElementRef;`,
    after: `readonly buttonEl = contentChild.required('myBtn', { read: ElementRef });`,
  },
  {
    id: 'contentChild with descendants option',
    before: `@ContentChild('myBtn', {descendants: false}) buttonEl!: ElementRef;`,
    after: `readonly buttonEl = contentChild.required<ElementRef>('myBtn', { descendants: false });`,
  },
  // ViewChildren
  {
    id: 'viewChildren with string locator and nullable',
    before: `@ViewChildren('myBtn') button?: QueryList<ElementRef>;`,
    after: `readonly button = viewChildren<ElementRef>('myBtn');`,
  },
  {
    id: 'viewChildren with class type locator and nullable',
    before: `@ViewChildren(MyButton) button?: QueryList<MyButton>;`,
    after: `readonly button = viewChildren(MyButton);`,
  },
  {
    id: 'viewChildren with class type locator and exclamation mark',
    before: `@ViewChildren(MyButton) button!: QueryList<MyButton>;`,
    after: `readonly button = viewChildren(MyButton);`,
  },
  {
    id: 'viewChild with string locator and read option, nullable shorthand',
    before: `@ViewChildren('myBtn', {read: ElementRef}) buttonEl?: QueryList<ElementRef>;`,
    after: `readonly buttonEl = viewChildren('myBtn', { read: ElementRef });`,
  },
  {
    id: 'viewChildren with string locator and read option, required',
    before: `@ViewChildren('myBtn', {read: ElementRef}) buttonEl!: QueryList<ElementRef>;`,
    after: `readonly buttonEl = viewChildren('myBtn', { read: ElementRef });`,
  },
  {
    id: 'viewChildren with query list as initializer value',
    before: `@ViewChildren('myBtn') buttonEl = new QueryList<ElementRef>()`,
    after: `readonly buttonEl = viewChildren<ElementRef>('myBtn');`,
  },
  {
    id: 'viewChildren with query list as initializer value, and descendants option',
    before: `@ViewChildren('myBtn', {descendants: false}) buttonEl = new QueryList<ElementRef>()`,
    after: `readonly buttonEl = viewChildren<ElementRef>('myBtn', { descendants: false });`,
  },
  {
    id: 'viewChildren with query list as initializer value, and descendants option but same as default',
    before: `@ViewChildren('myBtn', {descendants: true}) buttonEl = new QueryList<ElementRef>()`,
    after: `readonly buttonEl = viewChildren<ElementRef>('myBtn');`,
  },
  // ContentChildren
  {
    id: 'contentChildren with string locator and nullable',
    before: `@ContentChildren('myBtn') button?: QueryList<ElementRef>;`,
    after: `readonly button = contentChildren<ElementRef>('myBtn');`,
  },
  {
    id: 'contentChildren with class type locator and nullable',
    before: `@ContentChildren(MyButton) button?: QueryList<MyButton>;`,
    after: `readonly button = contentChildren(MyButton);`,
  },
  {
    id: 'contentChildren with class type locator and exclamation mark',
    before: `@ContentChildren(MyButton) button!: QueryList<MyButton>;`,
    after: `readonly button = contentChildren(MyButton);`,
  },
  {
    id: 'contentChildren with string locator and read option, nullable shorthand',
    before: `@ContentChildren('myBtn', {read: ElementRef}) buttonEl?: QueryList<ElementRef>;`,
    after: `readonly buttonEl = contentChildren('myBtn', { read: ElementRef });`,
  },
  {
    id: 'contentChildren with string locator and read option, required',
    before: `@ContentChildren('myBtn', {read: ElementRef}) buttonEl!: QueryList<ElementRef>;`,
    after: `readonly buttonEl = contentChildren('myBtn', { read: ElementRef });`,
  },
  {
    id: 'contentChildren with query list as initializer value',
    before: `@ContentChildren('myBtn') buttonEl = new QueryList<ElementRef>()`,
    after: `readonly buttonEl = contentChildren<ElementRef>('myBtn');`,
  },
  {
    id: 'contentChildren with query list as initializer value, and descendants option',
    before: `@ContentChildren('myBtn', {descendants: true}) buttonEl = new QueryList<ElementRef>()`,
    after: `readonly buttonEl = contentChildren<ElementRef>('myBtn', { descendants: true });`,
  },
  {
    id: 'contentChildren with query list as initializer value, and descendants option but same as default',
    before: `@ContentChildren('myBtn', {descendants: false}) buttonEl = new QueryList<ElementRef>()`,
    after: `readonly buttonEl = contentChildren<ElementRef>('myBtn');`,
  },
];

describe('signal queries migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('declaration test cases', () => {
    for (const c of declarationTestCases) {
      (c.focus ? fit : it)(c.id, async () => {
        const fs = await runTsurgeMigration(new SignalQueriesMigration(), [
          {
            name: absoluteFrom('/app.component.ts'),
            isProgramRootFile: true,
            contents: populateDeclarationTestCaseComponent(c.before),
          },
        ]);

        let actual = fs.readFile(absoluteFrom('/app.component.ts'));
        let expected = populateDeclarationTestCaseComponent(c.after);

        // Cut off the string before the class declaration.
        // The import diff is irrelevant here for now.
        actual = actual.substring(actual.indexOf('@Directive'));
        expected = expected.substring(expected.indexOf('@Directive'));

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

  it('should update imports when migrating', async () => {
    const fs = await runTsurgeMigration(new SignalQueriesMigration(), [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {ViewChild, ElementRef, Directive} from '@angular/core';

          @Directive()
          class MyComp {
            @ViewChild('labelRef') label?: ElementRef;
          }
        `,
      },
    ]);

    const actual = fs.readFile(absoluteFrom('/app.component.ts'));
    expect(actual).toContain(`import { ElementRef, Directive, viewChild } from '@angular/core';`);
    expect(actual).toContain(`label = viewChild<ElementRef>('labelRef')`);
  });

  it('should not remove imports when partially migrating', async () => {
    const fs = await runTsurgeMigration(new SignalQueriesMigration(), [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {ViewChild, ElementRef, Directive} from '@angular/core';

          @Directive()
          class MyComp {
            @ViewChild('labelRef') label?: ElementRef;
            @ViewChild('labelRef2') label2?: ElementRef;

            click() {
              this.label2 = undefined;
            }
          }
        `,
      },
    ]);

    const actual = fs.readFile(absoluteFrom('/app.component.ts'));
    expect(actual).toContain(
      `import { ViewChild, ElementRef, Directive, viewChild } from '@angular/core';`,
    );
    expect(actual).toContain(`label = viewChild<ElementRef>('labelRef')`);
    expect(actual).toContain(`@ViewChild('labelRef2') label2?: ElementRef;`);
  });
});

function populateDeclarationTestCaseComponent(declaration: string): string {
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
