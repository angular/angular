/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '../../../../compiler-cli/src/ngtsc/file_system/testing';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {absoluteFrom} from '@angular/compiler-cli';
import {OutputMigration} from './output-migration';

describe('outputs', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('outputs migration', () => {
    describe('EventEmitter declarations without problematic access patterns', () => {
      it('should migrate declaration with a primitive type hint', () => {
        verifyDeclaration({
          before: '@Output() readonly someChange = new EventEmitter<string>();',
          after: 'readonly someChange = output<string>();',
        });
      });

      it('should migrate declaration with complex type hint', () => {
        verifyDeclaration({
          before: '@Output() readonly someChange = new EventEmitter<string | number>();',
          after: 'readonly someChange = output<string | number>();',
        });
      });

      it('should migrate declaration without type hint', () => {
        verifyDeclaration({
          before: '@Output() readonly someChange = new EventEmitter();',
          after: 'readonly someChange = output();',
        });
      });

      it('should take alias into account', () => {
        verifyDeclaration({
          before: `@Output({alias: 'otherChange'}) readonly someChange = new EventEmitter();`,
          after: `readonly someChange = output({ alias: 'otherChange' });`,
        });
      });

      it('should support alias as statically analyzable reference', () => {
        verify({
          before: `
            import {Directive, Output, EventEmitter} from '@angular/core';

            const aliasParam = { alias: 'otherChange' } as const;
      
            @Directive()
            export class TestDir {
              @Output(aliasParam) someChange = new EventEmitter();
            }
          `,
          after: `
            import { Directive, output } from '@angular/core';

            const aliasParam = { alias: 'otherChange' } as const;
      
            @Directive()
            export class TestDir {
              readonly someChange = output(aliasParam);
            }
          `,
        });
      });

      it('should add readonly modifier', () => {
        verifyDeclaration({
          before: '@Output() someChange = new EventEmitter();',
          after: 'readonly someChange = output();',
        });
      });

      it('should respect visibility modifiers', () => {
        verifyDeclaration({
          before: `@Output() protected someChange = new EventEmitter();`,
          after: `protected readonly someChange = output();`,
        });
      });

      it('should migrate multiple outputs', () => {
        // TODO: whitespace are messing up test verification
        verifyDeclaration({
          before: `@Output() someChange1 = new EventEmitter();
        @Output() someChange2 = new EventEmitter();`,
          after: `readonly someChange1 = output();
        readonly someChange2 = output();`,
        });
      });

      it('should migrate only EventEmitter outputs when multiple outputs exist', () => {
        // TODO: whitespace are messing up test verification
        verifyDeclaration({
          before: `@Output() someChange1 = new EventEmitter();
        @Output() someChange2 = new Subject();`,
          after: `readonly someChange1 = output();
        @Output() someChange2 = new Subject();`,
        });
      });
    });

    describe('.next migration', () => {
      it('should migrate .next usages that should have been .emit', () => {
        verify({
          before: `
            import {Directive, Output, EventEmitter} from '@angular/core';

            @Directive()
            export class TestDir {
              @Output() someChange = new EventEmitter<string>();

              onClick() {
                this.someChange.next('clicked');
              }
            }
          `,
          after: `
            import { Directive, output } from '@angular/core';

            @Directive()
            export class TestDir {
              readonly someChange = output<string>();

              onClick() {
                this.someChange.emit('clicked');
              }
            }
          `,
        });
      });

      it('should _not_ migrate .next usages when problematic output usage is detected', () => {
        verifyNoChange(
          `
            import {Directive, Output, EventEmitter} from '@angular/core';

            @Directive()
            export class TestDir {
              @Output() someChange = new EventEmitter<string>();

              onClick() {
                this.someChange.next('clicked');
              }

              ngOnDestroy() {
                this.someChange.complete();
              }
            }
          `,
        );
      });
    });

    describe('declarations _with_ problematic access patterns', () => {
      it('should _not_ migrate outputs that are used with .pipe', () => {
        verifyNoChange(`
            import {Directive, Output, EventEmitter} from '@angular/core';

            @Directive()
            export class TestDir {
              @Output() someChange = new EventEmitter();

              someMethod() {
                this.someChange.pipe();
              }
            }
          `);
      });

      it('should _not_ migrate outputs that are used with .complete', () => {
        verifyNoChange(`
            import {Directive, Output, EventEmitter, OnDestroy} from '@angular/core';

            @Directive()
            export class TestDir implements OnDestroy {
              @Output() someChange = new EventEmitter<string>();

              ngOnDestroy() {
                this.someChange.complete();
              }
            }
          `);
      });
    });
  });

  describe('declarations other than EventEmitter', () => {
    it('should _not_ migrate outputs that are initialized with sth else than EventEmitter', () => {
      verify({
        before: populateDeclarationTestCase('@Output() protected someChange = new Subject();'),
        after: populateDeclarationTestCase('@Output() protected someChange = new Subject();'),
      });
    });
  });
});

async function verifyDeclaration(testCase: {before: string; after: string}) {
  verify({
    before: populateDeclarationTestCase(testCase.before),
    after: populateExpectedResult(testCase.after),
  });
}

async function verifyNoChange(beforeAndAfter: string) {
  verify({before: beforeAndAfter, after: beforeAndAfter});
}

async function verify(testCase: {before: string; after: string}) {
  const fs = await runTsurgeMigration(new OutputMigration(), [
    {
      name: absoluteFrom('/app.component.ts'),
      isProgramRootFile: true,
      contents: testCase.before,
    },
  ]);

  let actual = fs.readFile(absoluteFrom('/app.component.ts'));

  expect(actual).toBe(testCase.after);
}

function populateDeclarationTestCase(declaration: string): string {
  return `
      import {
        Directive,
        Output,
        EventEmitter,
        Subject
      } from '@angular/core';
  
      @Directive()
      export class TestDir {
        ${declaration}
      }
    `;
}

function populateExpectedResult(declaration: string): string {
  return `
      import { Directive, Subject, output } from '@angular/core';
  
      @Directive()
      export class TestDir {
        ${declaration}
      }
    `;
}
