/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '../../../../compiler-cli/src/ngtsc/file_system/testing';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {diffText} from '../../utils/tsurge/testing/diff';
import {absoluteFrom} from '@angular/compiler-cli';
import {OutputMigration} from './output-migration';

describe('outputs', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('outputs migration', () => {
    describe('EventEmitter declarations without problematic access patterns', () => {
      it('should migrate declaration with a primitive type hint', async () => {
        await verifyDeclaration({
          before: '@Output() readonly someChange = new EventEmitter<string>();',
          after: 'readonly someChange = output<string>();',
        });
      });

      it('should migrate declaration with complex type hint', async () => {
        await verifyDeclaration({
          before: '@Output() readonly someChange = new EventEmitter<string | number>();',
          after: 'readonly someChange = output<string | number>();',
        });
      });

      it('should migrate declaration without type hint', async () => {
        await verifyDeclaration({
          before: '@Output() readonly someChange = new EventEmitter();',
          after: 'readonly someChange = output();',
        });
      });

      it('should take alias into account', async () => {
        await verifyDeclaration({
          before: `@Output({alias: 'otherChange'}) readonly someChange = new EventEmitter();`,
          after: `readonly someChange = output({ alias: 'otherChange' });`,
        });
      });

      it('should support alias as statically analyzable reference', async () => {
        await verify({
          before: `
            import {Directive, Output, EventEmitter} from '@angular/core';

            const aliasParam = { alias: 'otherChange' } as const;

            @Directive()
            export class TestDir {
              @Output(aliasParam) someChange = new EventEmitter();
            }
          `,
          after: `
            import {Directive, output} from '@angular/core';

            const aliasParam = { alias: 'otherChange' } as const;

            @Directive()
            export class TestDir {
              readonly someChange = output(aliasParam);
            }
          `,
        });
      });

      it('should add readonly modifier', async () => {
        await verifyDeclaration({
          before: '@Output() someChange = new EventEmitter();',
          after: 'readonly someChange = output();',
        });
      });

      it('should respect visibility modifiers', async () => {
        await verifyDeclaration({
          before: `@Output() protected someChange = new EventEmitter();`,
          after: `protected readonly someChange = output();`,
        });
      });

      it('should preserve single line JSdoc comments when migrating outputs', async () => {
        await verify({
          before: `
            import {Directive, Output, EventEmitter} from '@angular/core';

            @Directive()
            export class TestDir {
              /** Whenever there is change, emits an event. */
              @Output() someChange = new EventEmitter();
            }
          `,
          after: `
            import {Directive, output} from '@angular/core';

            @Directive()
            export class TestDir {
              /** Whenever there is change, emits an event. */
              readonly someChange = output();
            }
          `,
        });
      });

      it('should preserve multiline JSdoc comments when migrating outputs', async () => {
        await verify({
          before: `
              import {Directive, Output, EventEmitter} from '@angular/core';
  
              @Directive()
              export class TestDir {
                /** 
                 * Whenever there is change, emits an event. 
                 */
                @Output() someChange = new EventEmitter();
              }
            `,
          after: `
              import {Directive, output} from '@angular/core';
  
              @Directive()
              export class TestDir {
                /** 
                 * Whenever there is change, emits an event. 
                 */
                readonly someChange = output();
              }
            `,
        });
      });

      it('should preserve multiline comments when migrating outputs', async () => {
        await verify({
          before: `
              import {Directive, Output, EventEmitter} from '@angular/core';
  
              @Directive()
              export class TestDir {
                /* Whenever there is change,emits an event. */
                @Output() someChange = new EventEmitter();
              }
            `,
          after: `
              import {Directive, output} from '@angular/core';
  
              @Directive()
              export class TestDir {
                /* Whenever there is change,emits an event. */
                readonly someChange = output();
              }
            `,
        });
      });

      it('should migrate multiple outputs', async () => {
        await verifyDeclaration({
          before:
            '@Output() someChange1 = new EventEmitter();\n@Output() someChange2 = new EventEmitter();',
          after: `readonly someChange1 = output();\nreadonly someChange2 = output();`,
        });
      });

      it('should migrate only EventEmitter outputs when multiple outputs exist', async () => {
        await verify({
          before: `
              import {Directive, Output, EventEmitter, Subject} from '@angular/core';
  
              @Directive()
              export class TestDir {
                @Output() someChange1 = new EventEmitter();
                @Output() someChange2 = new Subject();
              }
            `,
          after: `
              import {Directive, Subject, output} from '@angular/core';
  
              @Directive()
              export class TestDir {
                readonly someChange1 = output();
                @Output() someChange2 = new Subject();
              }
            `,
        });
      });
    });

    describe('.next migration', () => {
      it('should migrate .next usages that should have been .emit', async () => {
        await verify({
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
            import {Directive, output} from '@angular/core';

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

      it('should _not_ migrate .next usages when problematic output usage is detected', async () => {
        await verifyNoChange(
          `
            import {Directive, Output, EventEmitter} from '@angular/core';

            @Directive()
            export class TestDir {
              @Output() someChange = new EventEmitter<string>();

              onClick() {
                this.someChange.next('clicked');
              }

              someMethod() {
                this.someChange.pipe();
              }
            }
          `,
        );
      });
    });

    describe('.complete migration', () => {
      it('should remove .complete usage for migrated outputs', async () => {
        await verify({
          before: `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive()
          export class TestDir {
            @Output() someChange = new EventEmitter<string>();

            ngOnDestroy() {
              this.someChange.complete();
            }
          }
        `,
          after: `
          import {Directive, output} from '@angular/core';

          @Directive()
          export class TestDir {
            readonly someChange = output<string>();

            ngOnDestroy() {
            }
          }
        `,
        });
      });

      it('should remove .complete usage with comments', async () => {
        await verify({
          before: `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive()
          export class TestDir {
            @Output() someChange = new EventEmitter<string>();

            ngOnDestroy() {
              // maybe complete before the destroy?
              this.someChange.complete();
            }
          }
        `,
          after: `
          import {Directive, output} from '@angular/core';

          @Directive()
          export class TestDir {
            readonly someChange = output<string>();

            ngOnDestroy() {
            }
          }
        `,
        });
      });

      it('should _not_ migrate .complete usage outside of expression statements', async () => {
        await verifyNoChange(
          `
            import {Directive, Output, EventEmitter} from '@angular/core';

            @Directive()
            export class TestDir {
              @Output() someChange = new EventEmitter<string>();

              ngOnDestroy() {
                // play it safe and skip replacement for any .complete usage that are not
                // trivial expression statements
                (this.someChange.complete());
              }
            }
          `,
        );
      });
    });

    describe('.pipe migration', () => {
      describe('in test files', () => {
        it('should convert to observable in a test file importing jasmine', async () => {
          await verify({
            before: `
                import {Directive, Output, EventEmitter} from '@angular/core';
                import {map} from 'rxjs';
                import 'jasmine';
    
                @Directive()
                export class TestDir {
                  @Output() someChange = new EventEmitter<number>();
                  someChange$ = this.someChange.pipe(map((c) => c + 1)).pipe(map((d) => d - 1));
                }
              `,
            after: `
                import { outputToObservable } from "@angular/core/rxjs-interop";

                import {Directive, output} from '@angular/core';
                import {map} from 'rxjs';
                import 'jasmine';
    
                @Directive()
                export class TestDir {
                  readonly someChange = output<number>();
                  someChange$ = outputToObservable(this.someChange).pipe(map((c) => c + 1)).pipe(map((d) => d - 1));
                }
              `,
          });
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

        it('should _not_ migrate outputs that are used with .pipe outside of a component class', () => {
          verifyNoChange(`
              import {Directive, Output, EventEmitter} from '@angular/core';
  
              @Directive()
              export class TestDir {
                @Output() someChange = new EventEmitter();
              }
  
              let instance: TestDir;
  
              instance.someChange.pipe();
            `);
        });
      });
    });
  });

  describe('declarations other than EventEmitter', () => {
    it('should _not_ migrate outputs that are initialized with sth else than EventEmitter', async () => {
      await verify({
        before: populateDeclarationTestCase('@Output() protected someChange = new Subject();'),
        after: populateDeclarationTestCase('@Output() protected someChange = new Subject();'),
      });
    });
  });
});

async function verifyDeclaration(testCase: {before: string; after: string}) {
  await verify({
    before: populateDeclarationTestCase(testCase.before),
    after: populateExpectedResult(testCase.after),
  });
}

async function verifyNoChange(beforeAndAfter: string) {
  await verify({before: beforeAndAfter, after: beforeAndAfter});
}

async function verify(testCase: {before: string; after: string}) {
  const fs = await runTsurgeMigration(new OutputMigration(), [
    {
      name: absoluteFrom('/app.component.ts'),
      isProgramRootFile: true,
      contents: testCase.before,
    },
  ]);

  const actual = fs.readFile(absoluteFrom('/app.component.ts')).trim();
  const expected = testCase.after.trim();

  expect(actual).withContext(diffText(expected, actual)).toEqual(expected);
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
import {
  Directive,
  Subject,
  output
} from '@angular/core';

@Directive()
export class TestDir {
  ${declaration}
}
`;
}
