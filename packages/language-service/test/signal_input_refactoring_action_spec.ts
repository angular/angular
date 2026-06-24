/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';

describe('Signal input refactoring action', () => {
  let env: LanguageServiceTestEnv;
  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  describe('individual fields', () => {
    it('should support refactoring an `@Input` property', () => {
      const files = {
        'app.ts': `
        import {Directive, Input} from '@angular/core';

        @Directive({})
        export class AppComponent {
          @Input() bla = true;
        }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('bl¦a');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(4);
      expect(refactorings[0].name).toBe('convert-field-to-signal-input-safe-mode');
      expect(refactorings[1].name).toBe('convert-field-to-signal-input-best-effort-mode');
      expect(refactorings[2].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[3].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');
    });

    it('should not support refactoring a non-Angular property', () => {
      const files = {
        'app.ts': `
        import {Directive, Input} from '@angular/core';

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

    it('should not support refactoring a signal input property', () => {
      const files = {
        'app.ts': `
        import {Directive, input} from '@angular/core';

        @Directive({})
        export class AppComponent {
          bla = input(true);
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
        import {Directive, Input} from '@angular/core';

        @Directive({})
        export class AppComponent {
          @Input() bla = true;
        }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('bl¦a');

      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
      expect(refactorings.length).toBe(4);
      expect(refactorings[0].name).toBe('convert-field-to-signal-input-safe-mode');
      expect(refactorings[1].name).toBe('convert-field-to-signal-input-best-effort-mode');
      expect(refactorings[2].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[3].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');

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
            // Input declaration.
            {
              newText: 'readonly bla = input(true);',
              span: {start: 127, length: '@Input() bla = true;'.length},
            },
            // Import (since there is just a single input).
            {newText: '{Directive, input}', span: {start: 16, length: 18}},
          ],
        },
      ]);
    });

    it('should show an error if the input is incompatible', async () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input() bla = true;

            click() {
              this.bla = false;
            }
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('bl¦a = true');

      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
      expect(refactorings.length).toBe(4);
      expect(refactorings[0].name).toBe('convert-field-to-signal-input-safe-mode');
      expect(refactorings[1].name).toBe('convert-field-to-signal-input-best-effort-mode');
      expect(refactorings[2].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[3].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');

      const edits = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );
      expect(edits?.errorMessage).toContain(`Input field "bla" could not be migrated`);
      expect(edits?.errorMessage).toContain(`to forcibly convert.`);
      expect(edits?.edits).toEqual([]);
    });

    it('should show an error if the input is incompatible, but cannot be ignored', async () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input()
            get bla(): string {
              return '';
            };
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('get bl¦a()');

      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);
      expect(refactorings.length).toBe(4);
      expect(refactorings[0].name).toBe('convert-field-to-signal-input-safe-mode');
      expect(refactorings[1].name).toBe('convert-field-to-signal-input-best-effort-mode');
      expect(refactorings[2].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[3].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');

      const edits = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );
      expect(edits?.errorMessage).toContain(`Input field "bla" could not be migrated`);
      // This is not forcibly ignorable, so the error should not suggest this option.
      expect(edits?.errorMessage).not.toContain(`to forcibly convert.`);
      expect(edits?.edits).toEqual([]);
    });

    it('should not suggest options when inside an accessor input body', async () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input()
            get bla(): string {
              return 'hello';
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
  });

  describe('full class', () => {
    it('should support refactoring multiple `@Input` properties', () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input() bla = true;
            @Input() bla2 = true;
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');
    });

    it('should not suggest options when inside an accessor input body', async () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input()
            get bla(): string {
              return 'hello';
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

    it('should generate edits for migrating multiple `@Input` properties', async () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input() bla = true;
            @Input() bla2 = true;
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');

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
            // Input declarations.
            {
              newText: 'readonly bla = input(true);',
              span: {start: 135, length: '@Input() bla = true;'.length},
            },
            {
              newText: 'readonly bla2 = input(true);',
              span: {start: 168, length: '@Input() bla2 = true;'.length},
            },
            // Import (since there is just a single input).
            {newText: '{Directive, input}', span: {start: 18, length: 18}},
          ],
        },
      ]);
    });

    it('should generate edits for partially migrating multiple `@Input` properties', async () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input() bla = true;
            @Input() bla2 = true;

            click() {
              this.bla2 = false;
            }
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');

      const result = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );

      expect(result).toBeDefined();
      expect(result?.warningMessage).toContain('1 input could not be migrated.');
      expect(result?.warningMessage).toContain(
        'click on the skipped inputs and try to migrate individually.',
      );
      expect(result?.warningMessage).toContain('action to forcibly convert.');
      expect(result?.errorMessage).toBe(undefined);
      expect(result?.edits).toEqual([
        {
          fileName: '/test/app.ts',
          textChanges: [
            // Input declarations.
            {
              newText: 'readonly bla = input(true);',
              span: {start: 135, length: '@Input() bla = true;'.length},
            },
            // Import (since there is just a single input).
            {newText: '{Directive, Input, input}', span: {start: 18, length: 18}},
          ],
        },
      ]);
    });

    it('should error when no inputs could be migrated', async () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input() bla = true;
            @Input() bla2 = true;

            click() {
              this.bla = false;
              this.bla2 = false;
            }
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');

      const result = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );

      expect(result).toBeDefined();
      expect(result?.errorMessage).toContain('2 inputs could not be migrated.');
      expect(result?.errorMessage).toContain(
        'click on the skipped inputs and try to migrate individually.',
      );
      expect(result?.errorMessage).toContain('action to forcibly convert.');
      expect(result?.warningMessage).toBe(undefined);
      expect(result?.edits).toEqual([]);
    });

    it('should not suggest force mode when all inputs are incompatible and non-ignorable', async () => {
      const files = {
        'app.ts': `
          import {Directive, Input} from '@angular/core';

          @Directive({})
          export class AppComponent {
            @Input() set bla(v: string) {};
            @Input() set bla2(v: string) {};
          }
     `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('App¦Component');
      const refactorings = project.getRefactoringsAtPosition('app.ts', appFile.cursor);

      expect(refactorings.length).toBe(2);
      expect(refactorings[0].name).toBe('convert-full-class-to-signal-inputs-safe-mode');
      expect(refactorings[1].name).toBe('convert-full-class-to-signal-inputs-best-effort-mode');

      const result = await project.applyRefactoring(
        'app.ts',
        appFile.cursor,
        refactorings[0].name,
        () => {},
      );

      expect(result).toBeDefined();
      expect(result?.errorMessage).toContain('2 inputs could not be migrated.');
      expect(result?.errorMessage).toContain(
        'click on the skipped inputs and try to migrate individually.',
      );
      expect(result?.errorMessage).not.toContain('action to forcibly convert.');
      expect(result?.warningMessage).toBe(undefined);
      expect(result?.edits).toEqual([]);
    });
  });
});
