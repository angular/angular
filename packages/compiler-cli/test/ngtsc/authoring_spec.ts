/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('input()', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true});
    });

    it('should handle a basic, primitive valued input', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input('test');
        }
      `);
      env.driveMain();
      const js = env.getContents('test.js');
      expect(js).toContain('inputs: { data: [i0.ɵɵInputFlags.SignalBased, "data"] }');
    });

    it('should fail if @Input is applied on signal input member', () => {
      env.write('test.ts', `
        import {Directive, Input, input} from '@angular/core';

        @Directive()
        export class TestDir {
          @Input() data = input('test');
        }
      `);
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([jasmine.objectContaining({
        messageText: `Using @Input with a signal input is not allowed.`,
      })]);
    });

    it('should fail if signal input is also declared in `inputs` decorator field.', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        @Directive({
          inputs: ['data'],
        })
        export class TestDir {
          data = input('test');
        }
      `);
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: 'Input "data" is also declared as non-signal in @Directive.',
        }),
      ]);
    });

    it('should fail if signal input declares a non-statically analyzable alias', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        const ALIAS = 'bla';

        @Directive({
          inputs: ['data'],
        })
        export class TestDir {
          data = input('test', {alias: ALIAS});
        }
      `);
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: 'Alias needs to be a string that is statically analyzable.',
        }),
      ]);
    });

    it('should fail if signal input declares a non-statically analyzable options', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        const OPTIONS = {};

        @Directive({
          inputs: ['data'],
        })
        export class TestDir {
          data = input('test', OPTIONS);
        }
      `);
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: 'Argument needs to be an object literal that is statically analyzable.',
        }),
      ]);
    });

    it('should fail if signal input is declared on static member', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          static data = input('test');
        }
      `);
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: 'Input "data" is incorrectly declared as static member of "TestDir".',
        }),
      ]);
    });

    it('should handle an alias configured, primitive valued input', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input('test', {
            alias: 'publicName',
          });
        }
      `);
      env.driveMain();
      const js = env.getContents('test.js');
      expect(js).toContain('inputs: { data: [i0.ɵɵInputFlags.SignalBased, "publicName", "data"] }');
    });

    it('should error if a required input declares an initial value', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input.required({
            initialValue: 'bla',
          });
        }
      `);
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics[0].messageText).toEqual(jasmine.objectContaining({
        messageText: 'No overload matches this call.',
      }));
    });


    it('should handle a transform and required input', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input.required({
            transform: (v: string|number) => 'works',
          });
        }
      `);
      env.driveMain();
      expect(env.getContents('test.js'))
          .toContain(`inputs: { data: [i0.ɵɵInputFlags.SignalBased, "data"] }`);
      expect(env.getContents('test.d.ts')).toContain('"required": true; "isSignal": true;');
      expect(env.getContents('test.d.ts'))
          .withContext(
              'Expected no coercion member as input signal captures the write type of the transform')
          .not.toContain('ngAcceptInputType');
    });


    it('should handle a non-primitive initial value', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input(/default pattern/);
        }
      `);
      env.driveMain();
      expect(env.getContents('test.js'))
          .toContain(`inputs: { data: [i0.ɵɵInputFlags.SignalBased, "data"] }`);
    });

    // TODO(crisbeto): we may not want to support this combination. Will discuss with the team.
    it('should report mixed two-way binding with a signal input', () => {
      env.write('test.ts', `
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
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
    });

    describe('type checking', () => {
      it('should work', () => {
        env.write('test.ts', `
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
        `);

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText)
            .toBe(`Type 'boolean' is not assignable to type 'number'.`);
      });

      it('should work with transforms', () => {
        env.write('test.ts', `
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
        `);

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText)
            .toBe(`Type 'boolean' is not assignable to type 'string | number'.`);
      });

      it('should report unset required inputs', () => {
        env.write('test.ts', `
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
        `);

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText)
            .toBe(`Required input 'data' from directive TestDir must be specified.`);
      });
    });
  });

  describe('model()', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true});
    });

    it('should declare an input/output pair for a field initialized to a model()', () => {
      env.write('test.ts', `
        import {Directive, model} from '@angular/core';

        @Directive()
        export class TestDir {
          value = model(1);
        }
      `);
      env.driveMain();

      const js = env.getContents('test.js');
      const dts = env.getContents('test.d.ts');

      expect(js).toContain('inputs: { value: [i0.ɵɵInputFlags.SignalBased, "value"] }');
      expect(js).toContain('outputs: { value: "valueChange" }');
      expect(dts).toContain(
          'static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, ' +
          '{ "value": { "alias": "value"; "required": false; "isSignal": true; }; }, ' +
          '{ "value": "valueChange"; }, never, never, false, never>;');
    });

    it('should declare an input/output pair for a field initialized to an aliased model()', () => {
      env.write('test.ts', `
        import {Directive, model} from '@angular/core';

        @Directive()
        export class TestDir {
          value = model(1, {alias: 'alias'});
        }
      `);
      env.driveMain();

      const js = env.getContents('test.js');
      const dts = env.getContents('test.d.ts');

      expect(js).toContain('inputs: { value: [i0.ɵɵInputFlags.SignalBased, "alias", "value"] }');
      expect(js).toContain('outputs: { value: "aliasChange" }');
      expect(dts).toContain(
          'static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, ' +
          '{ "value": { "alias": "alias"; "required": false; "isSignal": true; }; }, ' +
          '{ "value": "aliasChange"; }, never, never, false, never>;');
    });

    it('should declare an input/output pair for a field initialized to a required model()', () => {
      env.write('test.ts', `
        import {Directive, model} from '@angular/core';

        @Directive()
        export class TestDir {
          value = model.required<string>();
        }
      `);
      env.driveMain();

      const js = env.getContents('test.js');
      const dts = env.getContents('test.d.ts');

      expect(js).toContain('inputs: { value: [i0.ɵɵInputFlags.SignalBased, "value"] }');
      expect(js).toContain('outputs: { value: "valueChange" }');
      expect(dts).toContain(
          'static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, ' +
          '{ "value": { "alias": "value"; "required": true; "isSignal": true; }; }, ' +
          '{ "value": "valueChange"; }, never, never, false, never>;');
    });

    it('should report a diagnostic if a model field is decorated with @Input', () => {
      env.write('test.ts', `
        import {Directive, Input, model} from '@angular/core';

        @Directive()
        export class TestDir {
          @Input() value = model('test');
        }
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe('Using @Input with a model input is not allowed.');
    });

    it('should report a diagnostic if a model field is decorated with @Output', () => {
      env.write('test.ts', `
        import {Directive, Output, model} from '@angular/core';

        @Directive()
        export class TestDir {
          @Output() value = model('test');
        }
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe('Using @Output with a model input is not allowed.');
    });

    it('should report a diagnostic if a model input is also declared in the `inputs` field', () => {
      env.write('test.ts', `
        import {Directive, model} from '@angular/core';

        @Directive({
          inputs: ['value'],
        })
        export class TestDir {
          value = model('test');
        }
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText)
          .toBe('Input "value" is also declared as non-signal in @Directive.');
    });

    it('should produce a diagnostic if the alias of a model cannot be analyzed', () => {
      env.write('test.ts', `
        import {Directive, model} from '@angular/core';

        const ALIAS = 'bla';

        @Directive()
        export class TestDir {
          value = model('test', {alias: ALIAS});
        }
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText)
          .toBe('Alias needs to be a string that is statically analyzable.');
    });

    it('should report a diagnostic if the options of a model signal cannot be analyzed', () => {
      env.write('test.ts', `
        import {Directive, model} from '@angular/core';

        const OPTIONS = {};

        @Directive()
        export class TestDir {
          value = model('test', OPTIONS);
        }
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText)
          .toBe('Argument needs to be an object literal that is statically analyzable.');
    });

    it('should report a diagnostic if a model input is declared on a static member', () => {
      env.write('test.ts', `
        import {Directive, model} from '@angular/core';

        @Directive()
        export class TestDir {
          static value = model('test');
        }
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText)
          .toBe('Input "value" is incorrectly declared as static member of "TestDir".');
    });

    it('should a diagnostic if a required model input declares an initial value', () => {
      env.write('test.ts', `
        import {Directive, model} from '@angular/core';

        @Directive()
        export class TestDir {
          value = model.required({
            initialValue: 'bla',
          });
        }
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText)
          .toBe(
              `Object literal may only specify known properties, ` +
              `and 'initialValue' does not exist in type 'ModelOptions'.`);
    });

    it('should report if a signal getter is invoked in a two-way binding', () => {
      env.write('test.ts', `
        import {Component, Directive, model, signal} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class TestDir {
          value = model(1);
        }

        @Component({
          standalone: true,
          template: \`<div dir [(value)]="value()"></div>\`,
          imports: [TestDir],
        })
        export class TestComp {
          value = signal(0);
        }
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe('Unsupported expression in a two-way binding');
    });

    describe('type checking', () => {
      it('should check a primitive value bound to a model input', () => {
        env.write('test.ts', `
          import {Component, Directive, model} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {
            value = model(1);
          }

          @Component({
            standalone: true,
            template: \`<div dir [(value)]="value"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            value = false;
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
      });

      it('should check a signal value bound to a model input via a two-way binding', () => {
        env.write('test.ts', `
          import {Component, Directive, model, signal} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {
            value = model(1);
          }

          @Component({
            standalone: true,
            template: \`<div dir [(value)]="value"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            value = signal(false);
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
      });

      it('should check two-way binding of a signal to a decorator-based input/output pair', () => {
        env.write('test.ts', `
          import {Component, Directive, Input, Output, signal, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {
            @Input() value = 0;
            @Output() valueChange = new EventEmitter<number>();
          }

          @Component({
            standalone: true,
            template: \`<div dir [(value)]="value"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            value = signal(false);
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
      });

      it('should not allow a non-writable signal to be assigned to a model', () => {
        env.write('test.ts', `
          import {Component, Directive, model, input} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {
            value = model(1);
          }

          @Component({
            standalone: true,
            template: \`<div dir [(value)]="value"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            value = input(0);
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toBe(`Type 'InputSignal<number>' is not assignable to type 'number'.`);
      });

      it('should allow a model signal to be bound to another model signal', () => {
        env.write('test.ts', `
          import {Component, Directive, model} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {
            value = model(1);
          }

          @Component({
            standalone: true,
            template: \`<div dir [(value)]="value"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            value = model(0);
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should check the event declared by a model input', () => {
        env.write('test.ts', `
          import {Component, Directive, model} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {
            value = model(1);
          }

          @Component({
            standalone: true,
            template: \`<div dir (valueChange)="acceptsString($event)"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            acceptsString(value: string) {}
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toBe(`Argument of type 'number' is not assignable to parameter of type 'string'.`);
      });

      it('should report unset required model inputs', () => {
        env.write('test.ts', `
          import {Component, Directive, model} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {
            value = model.required<number>();
          }

          @Component({
            standalone: true,
            template: \`<div dir></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
          }
        `);

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText)
            .toBe(`Required input 'value' from directive TestDir must be specified.`);
      });

      it('should check generic two-way model binding with a primitive value', () => {
        env.write('test.ts', `
          import {Component, Directive, model} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir<T extends {id: string}> {
            value = model.required<T>();
          }

          @Component({
            standalone: true,
            template: \`<div dir [(value)]="value"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            value = {id: 1};
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toBe(`Type '{ id: number; }' is not assignable to type '{ id: string; }'.`);
      });

      it('should check generic two-way model binding with a signal value', () => {
        env.write('test.ts', `
          import {Component, Directive, model, signal} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir<T extends {id: string}> {
            value = model.required<T>();
          }

          @Component({
            standalone: true,
            template: \`<div dir [(value)]="value"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            value = signal({id: 1});
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Type '{ id: number; }' is not assignable to type '{ id: string; }'.`);
      });

      it('should report unwrapped signals assigned to a model in a one-way binding', () => {
        env.write('test.ts', `
          import {Component, Directive, model, signal} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {
            value = model(0);
          }

          @Component({
            standalone: true,
            template: \`<div dir [value]="value"></div>\`,
            imports: [TestDir],
          })
          export class TestComp {
            value = signal(1);
          }
        `);

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText)
            .toBe(`Type 'WritableSignal<number>' is not assignable to type 'number'.`);
      });
    });

    it('should allow two-way binding to a generic model input', () => {
      env.write('test.ts', `
        import {Component, Directive, model, signal} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class TestDir<T> {
          value = model.required<T>();
        }

        @Component({
          standalone: true,
          template: \`<div dir [(value)]="value"></div>\`,
          imports: [TestDir],
        })
        export class TestComp {
          value = signal(1);
        }
      `);

      const diags = env.driveDiagnostics();
      expect(diags).toEqual([]);
    });
  });
});
