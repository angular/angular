/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';

describe('Signal queries refactoring action', () => {
  let env: LanguageServiceTestEnv;
  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  describe('individual fields', () => {
    it('should support refactoring an `@ViewChild` property', () => {
      const files = {
        'app.ts': `
        import {ViewChild, Component} from '@angular/core';

        @Component({template: ''})
        export class AppComponent {
          @ViewChild('ref') ref!: ElementRef;
        }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('re¦f!: ElementRef');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(4);
      expect(refactorings[0].name).toBe('convert-field-to-signal-query-safe-mode');
      expect(refactorings[1].name).toBe('convert-field-to-signal-query-best-effort-mode');
      expect(refactorings[2].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[3].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');
    });

    it('should not support refactoring a non-Angular property', () => {
      const files = {
        'app.ts': `
        import {Directive} from '@angular/core';

        @Directive({})
        export class AppComponent {
          bla = true;
        }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('bl¦a');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(0);
    });

    it('should not support refactoring a signal query property', () => {
      const files = {
        'app.ts': `
        import {Directive, viewChild} from '@angular/core';

        @Directive({})
        export class AppComponent {
          bla = viewChild('ref');
        }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('bl¦a');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(0);
    });

    it('should compute edits for migration', async () => {
      const files = {
        'app.ts': `
          import {ViewChild, Component} from '@angular/core';

          @Component({template: ''})
          export class AppComponent {
            @ViewChild('ref') ref!: ElementRef;
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('re¦f!: ElementRef');

      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
      expect(refactorings.length).toBe(4);
      expect(refactorings[0].name).toBe('convert-field-to-signal-query-safe-mode');
      expect(refactorings[1].name).toBe('convert-field-to-signal-query-best-effort-mode');
      expect(refactorings[2].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[3].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');

      const edits = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );
      expect(edits?.errorMessage).toBeUndefined();
      expect(edits?.edits).toEqual([
        {
          fileName: '/test/app.ts',
          textChanges: [
            // Query declaration.
            {
              newText: `readonly ref = viewChild.required<ElementRef>('ref');`,
              span: {start: 151, length: `@ViewChild('ref') ref!: ElementRef;`.length},
            },
            // Import (since there is just a single query).
            {newText: '{Component, viewChild}', span: {start: 18, length: 22}},
          ],
        },
      ]);
    });

    it('should show an error if the query is incompatible', async () => {
      const files = {
        'app.ts': `
          import {Directive, ViewChild} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ViewChild('ref') bla: ElementRef|null = null;

            click() {
              this.bla = null;
            }
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('bl¦a: ElementRef');

      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
      expect(refactorings.length).toBe(4);
      expect(refactorings[0].name).toBe('convert-field-to-signal-query-safe-mode');
      expect(refactorings[1].name).toBe('convert-field-to-signal-query-best-effort-mode');
      expect(refactorings[2].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[3].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');

      const edits = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );
      expect(edits?.errorMessage).toContain(`Query field "bla" could not be migrated`);
      expect(edits?.errorMessage).toContain(`Your application code writes to the query.`);
      expect(edits?.errorMessage).toContain(`to forcibly convert.`);
      expect(edits?.edits).toEqual([]);
    });

    it('should show an error if query is incompatible, but cannot be ignored', async () => {
      const files = {
        'app.ts': `
          import {Directive, ContentChild} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ContentChild('ref')
            set bla(value: ElementRef) {};
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('set bl¦a(');

      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
      expect(refactorings.length).toBe(4);
      expect(refactorings[0].name).toBe('convert-field-to-signal-query-safe-mode');
      expect(refactorings[1].name).toBe('convert-field-to-signal-query-best-effort-mode');
      expect(refactorings[2].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[3].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');

      const edits = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );
      expect(edits?.errorMessage).toContain(`Query field "bla" could not be migrated`);
      expect(edits?.errorMessage).toContain(
        `Accessor queries cannot be migrated as they are too complex.`,
      );
      // This is not forcibly ignorable, so the error should not suggest this option.
      expect(edits?.errorMessage).not.toContain(`to forcibly convert.`);
      expect(edits?.edits).toEqual([]);
    });

    it('should not suggest options when inside an accessor query body', async () => {
      const files = {
        'app.ts': `
          import {Directive, ElementRef, ViewChild} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ViewChild()
            set bla(res: ElementRef) {
              // inside
            };
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('insid¦e');

      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
      expect(refactorings.length).toBe(0);
    });
  });

  it('should compute best effort edits for incompatible field', async () => {
    const files = {
      'app.ts': `
        import {ViewChild, Component} from '@angular/core';

        @Component({template: ''})
        export class AppComponent {
          @ViewChild('ref') ref?: ElementRef;

          click() {
            this.ref = undefined;
          }
        }
   `,
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('re¦f?: ElementRef');

    const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
    expect(refactorings.length).toBe(4);
    expect(refactorings[0].name).toBe('convert-field-to-signal-query-safe-mode');
    expect(refactorings[1].name).toBe('convert-field-to-signal-query-best-effort-mode');
    expect(refactorings[2].name).toBe('convert-full-class-to-signal-queries-safe-mode');
    expect(refactorings[3].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');

    const edits = await project.applyRefactoring(
      'app.ts',
      appFile.cursor,
      refactorings[1].name,
      () => {},
    );
    expect(edits?.errorMessage).toBeUndefined();
    expect(edits?.edits).toEqual([
      {
        fileName: '/test/app.ts',
        textChanges: [
          // Query declaration.
          {
            newText: `readonly ref = viewChild<ElementRef>('ref');`,
            span: {start: 143, length: `@ViewChild('ref') ref!: ElementRef;`.length},
          },
          // Import (since there is just a single query).
          {newText: '{Component, viewChild}', span: {start: 16, length: 22}},
        ],
      },
    ]);
  });

  describe('full class', () => {
    it('should support refactoring multiple query properties', () => {
      const files = {
        'app.ts': `
          import {Directive, ViewChild, ContentChild, ElementRef} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ViewChild('refA') refA!: ElementRef;
            @ContentChild('refB') refB?: ElementRef;
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');
    });

    it('should not suggest options when inside an accessor query body', async () => {
      const files = {
        'app.ts': `
          import {Directive, ViewChild, ElementRef} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ViewChild('ref')
            set bla(value: ElementRef) {
              // hello
            };
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('hell¦o');

      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
      expect(refactorings.length).toBe(0);
    });

    it('should generate edits for migrating multiple query properties', async () => {
      const files = {
        'app.ts': `
          import {Directive, ViewChild, ContentChild, ElementRef} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ViewChild('refA') refA!: ElementRef;
            @ContentChild('refB') refB?: ElementRef;
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');

      const result = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );

      expect(result).toBeDefined();
      expect(result?.errorMessage).toBe(undefined);
      expect(result?.warningMessage).toBe(undefined);
      expect(result?.edits).toEqual([
        {
          fileName: '/test/app.ts',
          textChanges: [
            // Query declarations.
            {
              newText: `readonly refA = viewChild.required<ElementRef>('refA');`,
              span: {start: 165, length: `@ViewChild('refA') refA!: ElementRef;`.length},
            },
            {
              newText: `readonly refB = contentChild<ElementRef>('refB');`,
              span: {start: 215, length: `@ContentChild('refB') refB?: ElementRef;`.length},
            },
            // Import.
            {
              newText: '{Directive, ElementRef, viewChild, contentChild}',
              span: {start: 18, length: 48},
            },
          ],
        },
      ]);
    });

    it('should generate edits for partially migrating multiple query properties', async () => {
      const files = {
        'app.ts': `
          import {Directive, ViewChild, ContentChild, ElementRef} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ViewChild('refA') refA!: ElementRef;
            @ContentChild('refB') refB?: ElementRef;

            click() {
              this.refB = undefined;
            }
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');

      const result = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );

      expect(result).toBeDefined();
      expect(result?.warningMessage).toContain('1 query could not be migrated.');
      expect(result?.warningMessage).toContain(
        'click on the skipped queries and try to migrate individually.',
      );
      expect(result?.warningMessage).toContain('action to forcibly convert.');
      expect(result?.errorMessage).toBe(undefined);
      expect(result?.edits).toEqual([
        {
          fileName: '/test/app.ts',
          textChanges: [
            // Query declarations.
            {
              newText: `readonly refA = viewChild.required<ElementRef>('refA');`,
              span: {start: 165, length: `@ViewChild('refA') refA!: ElementRef;`.length},
            },
            // Import
            {
              newText: '{Directive, ContentChild, ElementRef, viewChild}',
              span: {start: 18, length: 48},
            },
          ],
        },
      ]);
    });

    it('should error when no queries could be migrated', async () => {
      const files = {
        'app.ts': `
          import {Directive, ViewChild, ViewChildren, QueryList, ElementRef} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ViewChild('ref1') bla!: ElementRef;
            @ViewChildren('refs') bla2!: QueryList<ElementRef>;

            click() {
              this.bla = undefined;
              this.bla2.changes.subscribe();
            }
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');

      const result = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );

      expect(result).toBeDefined();
      expect(result?.errorMessage).toContain('2 queries could not be migrated.');
      expect(result?.errorMessage).toContain(
        'click on the skipped queries and try to migrate individually.',
      );
      expect(result?.errorMessage).toContain('action to forcibly convert.');
      expect(result?.warningMessage).toBe(undefined);
      expect(result?.edits).toEqual([]);
    });

    it('should not suggest force mode when all queries are incompatible and non-ignorable', async () => {
      const files = {
        'app.ts': `
          import {Directive, ViewChild} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @ViewChild('ref1') set bla(v: string) {};
            @ViewChild('ref2') set bla2(v: string) {};
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-queries-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-queries-best-effort-mode');

      const result = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );

      expect(result).toBeDefined();
      expect(result?.errorMessage).toContain('2 queries could not be migrated.');
      expect(result?.errorMessage).toContain(
        'click on the skipped queries and try to migrate individually.',
      );
      expect(result?.errorMessage).not.toContain('action to forcibly convert.');
      expect(result?.warningMessage).toBe(undefined);
      expect(result?.edits).toEqual([]);
    });
  });
});
