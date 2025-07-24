/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('initializer-based input() API', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true, _checkTwoWayBoundEvents: true});
    });

    it('should handle a basic, primitive valued input', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input('test');
        }
      `,
      );
      env.driveMain();
      const js = env.getContents('test.js');
      expect(js).toContain('inputs: { data: [1, "data"] }');
    });

    it('should fail if @Input is applied on signal input member', () => {
      env.write(
        'test.ts',
        `
        import {Directive, Input, input} from '@angular/core';

        @Directive()
        export class TestDir {
          @Input() data = input('test');
        }
      `,
      );
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: `Using @Input with a signal input is not allowed.`,
        }),
      ]);
    });

    it('should fail if signal input is also declared in `inputs` decorator field.', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        @Directive({
          inputs: ['data'],
        })
        export class TestDir {
          data = input('test');
        }
      `,
      );
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: 'Input "data" is also declared as non-signal in @Directive.',
        }),
      ]);
    });

    it('should fail if signal input declares a non-statically analyzable alias', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        const ALIAS = 'bla';

        @Directive({
          inputs: ['data'],
        })
        export class TestDir {
          data = input('test', {alias: ALIAS});
        }
      `,
      );
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: 'Alias needs to be a string that is statically analyzable.',
        }),
      ]);
    });

    it('should fail if signal input declares a non-statically analyzable options', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        const OPTIONS = {};

        @Directive({
          inputs: ['data'],
        })
        export class TestDir {
          data = input('test', OPTIONS);
        }
      `,
      );
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: 'Argument needs to be an object literal that is statically analyzable.',
        }),
      ]);
    });

    it('should fail if signal input is declared on static member', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          static data = input('test');
        }
      `,
      );
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: 'Input "data" is incorrectly declared as static member of "TestDir".',
        }),
      ]);
    });

    it('should handle an alias configured, primitive valued input', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input('test', {
            alias: 'publicName',
          });
        }
      `,
      );
      env.driveMain();
      const js = env.getContents('test.js');
      expect(js).toContain('inputs: { data: [1, "publicName", "data"] }');
    });

    it('should error if a required input declares an initial value', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input.required({
            initialValue: 'bla',
          });
        }
      `,
      );
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics[0].messageText).toEqual(
        jasmine.objectContaining({
          messageText: 'No overload matches this call.',
        }),
      );
    });

    it('should handle a transform and required input', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input.required({
            transform: (v: string|number) => 'works',
          });
        }
      `,
      );
      env.driveMain();
      expect(env.getContents('test.js')).toContain(`inputs: { data: [1, "data"] }`);
      expect(env.getContents('test.d.ts')).toContain('"required": true; "isSignal": true;');
      expect(env.getContents('test.d.ts'))
        .withContext(
          'Expected no coercion member as input signal captures the write type of the transform',
        )
        .not.toContain('ngAcceptInputType');
    });

    it('should handle a non-primitive initial value', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input(/default pattern/);
        }
      `,
      );
      env.driveMain();
      expect(env.getContents('test.js')).toContain(`inputs: { data: [1, "data"] }`);
    });

    it('should report mixed two-way binding with a signal input', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive, input, Output, EventEmitter} from '@angular/core';

        @Directive({standalone: true, selector: '[dir]'})
        export class TestDir {
          value = input('hello');
          @Output() valueChange = new EventEmitter<string>();
        }

        @Component({
          standalone: true,
          template: \`<div dir [(value)]="value"></div>\`,
          imports: [TestDir],
        })
        export class TestComp {
          value = 1;
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
      expect(diags[1].messageText).toBe(`Type 'string' is not assignable to type 'number'.`);
    });

    describe('type checking', () => {
      it('should work', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, input} from '@angular/core';

          @Directive({
            selector: '[directiveName]',
            standalone: true,
          })
          export class TestDir {
            data = input(1);
          }

          @Component({
            standalone: true,
            template: \`<div directiveName [data]="false"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
          }
        `,
        );

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText).toBe(
          `Type 'boolean' is not assignable to type 'number'.`,
        );
      });

      it('should work with transforms', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, input} from '@angular/core';

          @Directive({
            selector: '[directiveName]',
            standalone: true,
          })
          export class TestDir {
            data = input.required({
              transform: (v: string|number) => 'works',
            });
          }

          @Component({
            standalone: true,
            template: \`<div directiveName [data]="false"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
          }
        `,
        );

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText).toBe(
          `Type 'boolean' is not assignable to type 'string | number'.`,
        );
      });

      it('should report unset required inputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, input} from '@angular/core';

          @Directive({
            selector: '[directiveName]',
            standalone: true,
          })
          export class TestDir {
            data = input.required<boolean>();
          }

          @Component({
            standalone: true,
            template: \`<div directiveName></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
          }
        `,
        );

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText).toBe(
          `Required input 'data' from directive TestDir must be specified.`,
        );
      });
    });

    describe('diagnostics', () => {
      it('should error when declared using an ES private field', () => {
        env.write(
          'test.ts',
          `
          import {Directive, input} from '@angular/core';

          @Directive({
            selector: '[directiveName]',
            standalone: true,
          })
          export class TestDir {
            #data = input.required<boolean>();
          }
        `,
        );

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics).toEqual([
          jasmine.objectContaining<ts.Diagnostic>({
            messageText: jasmine.objectContaining<ts.DiagnosticMessageChain>({
              messageText: `Cannot use "input" on a class member that is declared as ES private.`,
            }),
          }),
        ]);
      });

      it('should error when declared using a `private` field', () => {
        env.write(
          'test.ts',
          `
          import {Directive, input} from '@angular/core';

          @Directive({
            selector: '[directiveName]',
            standalone: true,
          })
          export class TestDir {
            private data = input.required<boolean>();
          }
        `,
        );

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics).toEqual([
          jasmine.objectContaining<ts.Diagnostic>({
            messageText: jasmine.objectContaining<ts.DiagnosticMessageChain>({
              messageText: `Cannot use "input" on a class member that is declared as private.`,
            }),
          }),
        ]);
      });

      it('should allow declaring using a `protected` field', () => {
        env.write(
          'test.ts',
          `
          import {Directive, input} from '@angular/core';

          @Directive({
            selector: '[directiveName]',
            standalone: true,
          })
          export class TestDir {
            protected data = input.required<boolean>();
          }
        `,
        );

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(0);
      });
    });

    it('should resolve input inside an `as` expression', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input, Signal} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input('test') as Signal<string>;
        }
      `,
      );
      env.driveMain();
      const js = env.getContents('test.js');
      expect(js).toContain('inputs: { data: [1, "data"] }');
    });

    it('should resolve input inside a parenthesized expression', () => {
      env.write(
        'test.ts',
        `
        import {Directive, input, Signal} from '@angular/core';

        @Directive()
        export class TestDir {
          data = ((input('test')));
        }
      `,
      );
      env.driveMain();
      const js = env.getContents('test.js');
      expect(js).toContain('inputs: { data: [1, "data"] }');
    });
  });
});
