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
  describe('ngtsc host directives compilation', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true});
    });

    function extractMessage(diag: ts.Diagnostic) {
      return typeof diag.messageText === 'string' ? diag.messageText : diag.messageText.messageText;
    }

    it('should generate a basic hostDirectives definition', () => {
      env.write(
        'test.ts',
        `
        import {Directive, Component} from '@angular/core';

        @Directive({
          selector: '[dir-a]',
          standalone: true
        })
        export class DirectiveA {}

        @Directive({
          selector: '[dir-b]',
          standalone: true
        })
        export class DirectiveB {}

        @Component({
          selector: 'my-comp',
          template: '',
          hostDirectives: [DirectiveA, DirectiveB],
          standalone: false,
        })
        export class MyComp {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain('ɵɵdefineDirective({ type: DirectiveA');
      expect(jsContents).toContain('ɵɵdefineDirective({ type: DirectiveB');
      expect(jsContents).toContain(
        'features: [i0.ɵɵHostDirectivesFeature([DirectiveA, DirectiveB])]',
      );
      expect(dtsContents).toContain(
        'ɵɵComponentDeclaration<MyComp, "my-comp", never, {}, {}, never, never, false, ' +
          '[{ directive: typeof DirectiveA; inputs: {}; outputs: {}; }, ' +
          '{ directive: typeof DirectiveB; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should generate a hostDirectives definition that has inputs and outputs', () => {
      env.write(
        'test.ts',
        `
        import {Directive, Component, Input, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir-a]',
          standalone: true
        })
        export class HostDir {
          @Input() value: number;
          @Input() color: string;
          @Output() opened = new EventEmitter();
          @Output() closed = new EventEmitter();
        }

        @Component({
          selector: 'my-comp',
          template: '',
          hostDirectives: [{
            directive: HostDir,
            inputs: ['value', 'color: colorAlias'],
            outputs: ['opened', 'closed: closedAlias'],
          }],
          standalone: false,
        })
        export class MyComp {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain('ɵɵdefineDirective({ type: HostDir');
      expect(jsContents).toContain(
        'features: [i0.ɵɵHostDirectivesFeature([{ directive: HostDir, ' +
          'inputs: ["value", "value", "color", "colorAlias"], ' +
          'outputs: ["opened", "opened", "closed", "closedAlias"] }])]',
      );
      expect(dtsContents).toContain(
        'ɵɵComponentDeclaration<MyComp, "my-comp", never, {}, ' +
          '{}, never, never, false, [{ directive: typeof HostDir; ' +
          'inputs: { "value": "value"; "color": "colorAlias"; }; ' +
          'outputs: { "opened": "opened"; "closed": "closedAlias"; }; }]>;',
      );
    });

    it('should generate a hostDirectives definition that has aliased inputs and outputs', () => {
      env.write(
        'test.ts',
        `
        import {Directive, Component, Input, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir-a]',
          standalone: true
        })
        export class HostDir {
          @Input('valueAlias') value: number;
          @Input('colorAlias') color: string;
          @Output('openedAlias') opened = new EventEmitter();
          @Output('closedAlias') closed = new EventEmitter();
        }

        @Component({
          selector: 'my-comp',
          template: '',
          hostDirectives: [{
            directive: HostDir,
            inputs: ['valueAlias', 'colorAlias: customColorAlias'],
            outputs: ['openedAlias', 'closedAlias: customClosedAlias'],
          }],
          standalone: false,
        })
        export class MyComp {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain('ɵɵdefineDirective({ type: HostDir');
      expect(jsContents).toContain(
        'features: [i0.ɵɵHostDirectivesFeature([{ directive: HostDir, ' +
          'inputs: ["valueAlias", "valueAlias", "colorAlias", "customColorAlias"], ' +
          'outputs: ["openedAlias", "openedAlias", "closedAlias", "customClosedAlias"] }])]',
      );
      expect(dtsContents).toContain(
        'ɵɵComponentDeclaration<MyComp, "my-comp", never, {}, ' +
          '{}, never, never, false, [{ directive: typeof HostDir; ' +
          'inputs: { "valueAlias": "valueAlias"; "colorAlias": "customColorAlias"; }; ' +
          'outputs: { "openedAlias": "openedAlias"; "closedAlias": "customClosedAlias"; }; }]>;',
      );
    });

    it('should generate hostDirectives definitions for a chain of host directives', () => {
      env.write(
        'test.ts',
        `
        import {Directive, Component} from '@angular/core';

        @Directive({standalone: true})
        export class DirectiveA {
        }

        @Directive({
          standalone: true,
          hostDirectives: [DirectiveA],
        })
        export class DirectiveB {
        }

        @Directive({
          standalone: true,
          hostDirectives: [DirectiveB],
        })
        export class DirectiveC {
        }

        @Component({
          selector: 'my-comp',
          template: '',
          hostDirectives: [DirectiveC],
          standalone: false,
        })
        export class MyComp {
        }
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain('ɵɵdefineDirective({ type: DirectiveA });');
      expect(jsContents).toContain(
        'ɵɵdefineDirective({ type: DirectiveB, ' +
          'features: [i0.ɵɵHostDirectivesFeature([DirectiveA])] });',
      );
      expect(jsContents).toContain(
        'ɵɵdefineDirective({ type: DirectiveC, ' +
          'features: [i0.ɵɵHostDirectivesFeature([DirectiveB])] });',
      );
      expect(jsContents).toContain(
        'ɵɵdefineComponent({ type: MyComp, selectors: [["my-comp"]], standalone: false,' +
          ' features: [i0.ɵɵHostDirectivesFeature([DirectiveC])]',
      );

      expect(dtsContents).toContain(
        'ɵɵDirectiveDeclaration<DirectiveA, never, never, {}, ' + '{}, never, never, true, never>;',
      );
      expect(dtsContents).toContain(
        'ɵɵDirectiveDeclaration<DirectiveB, never, never, {}, ' +
          '{}, never, never, true, [{ directive: typeof DirectiveA; ' +
          'inputs: {}; outputs: {}; }]>;',
      );
      expect(dtsContents).toContain(
        'ɵɵDirectiveDeclaration<DirectiveC, never, never, {}, ' +
          '{}, never, never, true, [{ directive: typeof DirectiveB; ' +
          'inputs: {}; outputs: {}; }]>;',
      );
      expect(dtsContents).toContain(
        'ɵɵComponentDeclaration<MyComp, "my-comp", never, {}, ' +
          '{}, never, never, false, [{ directive: typeof DirectiveC; ' +
          'inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should generate a hostDirectives definition with forward references', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive, forwardRef, Input} from '@angular/core';

        @Component({
          selector: 'my-component',
          template: '',
          hostDirectives: [forwardRef(() => DirectiveB)],
          standalone: false,
        })
        export class MyComponent {
        }

        @Directive({
          standalone: true,
          hostDirectives: [{directive: forwardRef(() => DirectiveA), inputs: ['value']}],
        })
        export class DirectiveB {
        }

        @Directive({})
        export class DirectiveA {
          @Input() value: any;
        }
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain(
        'features: [i0.ɵɵHostDirectivesFeature(function () { return [DirectiveB]; })]',
      );
      expect(jsContents).toContain(
        'features: [i0.ɵɵHostDirectivesFeature(function () { return [{ directive: DirectiveA, inputs: ["value", "value"] }]; })]',
      );
      expect(jsContents).toContain(
        'ɵɵdefineDirective({ type: DirectiveA, ' + 'inputs: { value: "value" } });',
      );

      expect(dtsContents).toContain(
        'ɵɵComponentDeclaration<MyComponent, "my-component", ' +
          'never, {}, {}, never, never, false, [{ directive: typeof DirectiveB; ' +
          'inputs: {}; outputs: {}; }]>;',
      );

      expect(dtsContents).toContain(
        'ɵɵDirectiveDeclaration<DirectiveB, never, never, {}, ' +
          '{}, never, never, true, [{ directive: typeof DirectiveA; ' +
          'inputs: { "value": "value"; }; outputs: {}; }]>;',
      );

      expect(dtsContents).toContain(
        'ɵɵDirectiveDeclaration<DirectiveA, never, never, ' +
          '{ "value": { "alias": "value"; "required": false; }; }, {}, never, never, true, never>;',
      );
    });

    it('should generate a definition if the host directives are imported from other files', () => {
      env.write(
        'dir-a.ts',
        `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[dir-a]',
          standalone: true
        })
        export class DirectiveA {}
      `,
      );

      env.write(
        'dir-b.ts',
        `
        import {Directive, Input, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir-b]',
          standalone: true
        })
        export class DirectiveB {
          @Input() input: any;
          @Output() output = new EventEmitter<any>();
        }
      `,
      );

      env.write(
        'test.ts',
        `
        import {Component, forwardRef} from '@angular/core';
        import {DirectiveA} from './dir-a';
        import {DirectiveB} from './dir-b';

        @Component({
          selector: 'my-comp',
          template: '',
          hostDirectives: [
            forwardRef(() => DirectiveA),
            {
              directive: forwardRef(() => DirectiveB),
              inputs: ['input: inputAlias'],
              outputs: ['output: outputAlias']
            }
          ],
          standalone: false,
        })
        export class MyComp {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain(`import { DirectiveA } from './dir-a'`);
      expect(jsContents).toContain(`import { DirectiveB } from './dir-b'`);
      expect(jsContents).toContain(
        'features: [i0.ɵɵHostDirectivesFeature(function () { ' +
          'return [i1.DirectiveA, { directive: i2.DirectiveB, inputs: ["input", "inputAlias"], ' +
          'outputs: ["output", "outputAlias"] }]; })]',
      );

      expect(dtsContents).toContain('import * as i1 from "./dir-a";');
      expect(dtsContents).toContain('import * as i2 from "./dir-b";');
      expect(dtsContents).toContain(
        'ɵɵComponentDeclaration<MyComp, "my-comp", never, {}, ' +
          '{}, never, never, false, [{ directive: typeof i1.DirectiveA; ' +
          'inputs: {}; outputs: {}; }, { directive: typeof i2.DirectiveB; ' +
          'inputs: { "input": "inputAlias"; }; outputs: { "output": "outputAlias"; }; }]>;',
      );
    });

    it('should generate a hostDirectives definition referring to external directives', () => {
      env.write(
        'node_modules/external/index.d.ts',
        `
        import {ɵɵDirectiveDeclaration} from '@angular/core';

        export declare class ExternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never,
            {input: "input"}, {output: "output"}, never, never, true, never>;
        }
      `,
      );

      env.write(
        'test.ts',
        `
        import {Component, Directive, NgModule} from '@angular/core';
        import {ExternalDir} from 'external';

        @Component({
          template: '',
          hostDirectives: [{directive: ExternalDir, inputs: ['input: inputAlias'], outputs: ['output: outputAlias']}],
          standalone: false,
        })
        export class MyComp {}
      `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain(`import * as i1 from "external";`);
      expect(jsContents).toContain(
        'features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.ExternalDir, ' +
          'inputs: ["input", "inputAlias"], outputs: ["output", "outputAlias"] }])]',
      );

      expect(dtsContents).toContain('import * as i1 from "external";');
      expect(dtsContents).toContain(
        'ɵɵComponentDeclaration<MyComp, "ng-component", never, {}, ' +
          '{}, never, never, false, [{ directive: typeof i1.ExternalDir; ' +
          'inputs: { "input": "inputAlias"; }; outputs: { "output": "outputAlias"; }; }]>;',
      );
    });

    it('should reference host directives by their external name', () => {
      env.write(
        'node_modules/external/index.d.ts',
        `
        import {InternalDir} from './internal';
        export {InternalDir as ExternalDir} from './internal';
      `,
      );

      env.write(
        'node_modules/external/internal.d.ts',
        `
        export declare class InternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, {}, {}, never, true, never>;
        }
      `,
      );

      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {ExternalDir} from 'external';

        @Component({
          template: '',
          hostDirectives: [ExternalDir],
          standalone: false,
        })
        export class MyComp {}
      `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain(`import * as i1 from "external";`);
      expect(jsContents).toContain('features: [i0.ɵɵHostDirectivesFeature([i1.ExternalDir])]');

      expect(dtsContents).toContain('import * as i1 from "external";');
      expect(dtsContents).toContain(
        'ɵɵComponentDeclaration<MyComp, "ng-component", never, {}, {}, ' +
          'never, never, false, [{ directive: typeof i1.ExternalDir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should produce a template diagnostic if a required input from a host directive is missing', () => {
      env.write(
        'test.ts',
        `
            import {Directive, Component, Input} from '@angular/core';

            @Directive({standalone: true})
            export class HostDir {
              @Input({alias: 'inputAlias', required: true})
              input: any;
            }

            @Directive({
              selector: '[dir]',
              hostDirectives: [{directive: HostDir, inputs: ['inputAlias: customAlias']}],
              standalone: true
            })
            export class Dir {}

            @Component({
              template: '<div dir></div>',
              standalone: true,
              imports: [Dir]
            })
            class App {}
          `,
      );

      const messages = env.driveDiagnostics().map(extractMessage);

      expect(messages).toEqual([
        `Required input 'customAlias' from directive HostDir must be specified.`,
      ]);
    });

    it('should not produce a template diagnostic if a required input from a host directive is bound', () => {
      env.write(
        'test.ts',
        `
            import {Directive, Component, Input} from '@angular/core';

            @Directive({standalone: true})
            export class HostDir {
              @Input({alias: 'inputAlias', required: true})
              input: any;
            }

            @Directive({
              selector: '[dir]',
              hostDirectives: [{directive: HostDir, inputs: ['inputAlias: customAlias']}],
              standalone: true
            })
            export class Dir {}

            @Component({
              template: '<div dir [customAlias]="value"></div>',
              standalone: true,
              imports: [Dir]
            })
            class App {
              value = 123;
            }
          `,
      );

      const messages = env.driveDiagnostics().map(extractMessage);
      expect(messages).toEqual([]);
    });

    describe('validations', () => {
      it('should produce a diagnostic if a host directive is not standalone', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component, NgModule} from '@angular/core';

          @Directive({
            standalone: false
          })
          export class HostDir {}

          @Directive({
            hostDirectives: [HostDir],
            standalone: false,
          })
          export class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual(['Host directive HostDir must be standalone']);
      });

      it('should produce a diagnostic if a host directive is not a directive', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Pipe, Component, NgModule} from '@angular/core';

          @Pipe({name: 'hostDir'})
          export class HostDir {}

          @Directive({
            hostDirectives: [HostDir],
          })
          export class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([
          'HostDir must be a standalone directive to be used as a host directive',
        ]);
      });

      it('should produce a diagnostic if a host directive is a component', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component, NgModule} from '@angular/core';

          @Component({
            template: '',
            standalone: true,
          })
          export class HostComp {}

          @Directive({
            hostDirectives: [HostComp],
          })
          export class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual(['Host directive HostComp cannot be a component']);
      });

      it('should produce a diagnostic if hostDirectives is not an array', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            // @ts-ignore
            hostDirectives: {}
          })
          export class MyComp {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toContain('hostDirectives must be an array');
      });

      it('should produce a diagnostic if a host directive is not a reference', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          const hostA = {} as any;

          @Component({
            template: '',
            hostDirectives: [hostA]
          })
          export class MyComp {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual(['Host directive must be a reference']);
      });

      it('should produce a diagnostic if a host directive is not a reference to a class', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          function hostA() {}

          @Component({
            template: '',
            // @ts-ignore
            hostDirectives: [hostA]
          })
          export class MyComp {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual(['Host directive reference must be a class']);
      });

      it('should only produce a diagnostic once in a chain of directives', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component, NgModule} from '@angular/core';

          @Directive({
            selector: '[dir-b]',
            standalone: false,
          })
          export class HostDirB {}

          @Directive({
            selector: '[dir-a]',
            standalone: true,
            hostDirectives: [HostDirB]
          })
          export class HostDirA {}

          @Component({
            selector: '[dir]',
            template: '',
            hostDirectives: [HostDirA],
            standalone: false,
          })
          export class Host {}
        `,
        );

        // What we're checking here is that the diagnostics aren't produced recursively. If that
        // were the case, the same diagnostic would show up more than once in the diagnostics since
        // `HostDirB` is in the chain of both `Host` and `HostDirA`.
        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual(['Host directive HostDirB must be standalone']);
      });

      it('should produce a diagnostic if a host directive output does not exist', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({standalone: true})
          class HostDir {
            @Output() foo = new EventEmitter();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: HostDir,
              outputs: ['doesNotExist'],
            }],
            standalone: false,
          })
          class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([
          'Directive HostDir does not have an output with a public name of doesNotExist.',
        ]);
      });

      it('should produce a diagnostic if a host directive output alias does not exist', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({standalone: true})
          class HostDir {
            @Output('alias') foo = new EventEmitter();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: HostDir,
              outputs: ['foo'],
            }],
            standalone: false,
          })
          class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([
          'Directive HostDir does not have an output with a public name of foo.',
        ]);
      });

      it('should produce a diagnostic if a host directive input does not exist', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Input} from '@angular/core';

          @Directive({standalone: true})
          class HostDir {
            @Input() foo: any;
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: HostDir,
              inputs: ['doesNotExist'],
            }],
            standalone: false,
          })
          class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([
          'Directive HostDir does not have an input with a public name of doesNotExist.',
        ]);
      });

      it('should produce a diagnostic if a host directive input alias does not exist', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Input} from '@angular/core';

          @Directive({standalone: true})
          class HostDir {
            @Input('alias') foo: any;
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{directive: HostDir, inputs: ['foo']}],
            standalone: false,
          })
          class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([
          'Directive HostDir does not have an input with a public name of foo.',
        ]);
      });

      it('should produce a diagnostic if a host directive tries to alias to an existing input', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Input} from '@angular/core';

          @Directive({selector: '[host-dir]', standalone: true})
          class HostDir {
            @Input('colorAlias') color?: string;
            @Input() buttonColor?: string;
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}],
            standalone: false,
          })
          class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([
          'Cannot alias input colorAlias of host directive HostDir to buttonColor, because it ' +
            'already has a different input with the same public name.',
        ]);
      });

      it('should produce a diagnostic if a host directive tries to alias to an existing input alias', () => {
        env.write(
          'test.ts',
          `
            import {Directive, Input} from '@angular/core';

            @Directive({selector: '[host-dir]', standalone: true})
            class HostDir {
              @Input('colorAlias') color?: string;
              @Input('buttonColorAlias') buttonColor?: string;
            }

            @Directive({
              selector: '[dir]',
              hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColorAlias']}]
            })
            class Dir {}
          `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([
          'Cannot alias input colorAlias of host directive HostDir to buttonColorAlias, ' +
            'because it already has a different input with the same public name.',
        ]);
      });

      it('should not produce a diagnostic if a host directive input aliases to the same name', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Input} from '@angular/core';

          @Directive({selector: '[host-dir]', standalone: true})
          class HostDir {
            @Input('color') color?: string;
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}]
          })
          class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([]);
      });

      it('should produce a diagnostic if a host directive tries to alias to an existing output alias', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({selector: '[host-dir]', standalone: true})
          class HostDir {
            @Output('clickedAlias') clicked = new EventEmitter();
            @Output('tappedAlias') tapped = new EventEmitter();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{directive: HostDir, outputs: ['clickedAlias: tappedAlias']}]
          })
          class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([
          'Cannot alias output clickedAlias of host directive HostDir ' +
            'to tappedAlias, because it already has a different output with the same public name.',
        ]);
      });

      it('should not produce a diagnostic if a host directive output aliases to the same name', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({selector: '[host-dir]', standalone: true})
          class HostDir {
            @Output('clicked') clicked = new EventEmitter();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{directive: HostDir, outputs: ['clicked: wasClicked']}]
          })
          class Dir {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);
        expect(messages).toEqual([]);
      });

      it('should produce a diagnostic if a required input is not exposed on the host', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component, Input} from '@angular/core';

          @Directive({
            selector: '[dir-a]',
            standalone: true
          })
          export class HostDir {
            @Input({required: true}) input: any;
          }

          @Component({
            selector: 'my-comp',
            template: '',
            hostDirectives: [HostDir]
          })
          export class MyComp {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);

        expect(messages).toEqual([
          `Required input 'input' from host directive HostDir must be exposed.`,
        ]);
      });

      it('should use the public name when producing diagnostics about missing required inputs', () => {
        env.write(
          'test.ts',
          `
              import {Directive, Component, Input} from '@angular/core';

              @Directive({
                selector: '[dir-a]',
                standalone: true
              })
              export class HostDir {
                @Input({required: true, alias: 'inputAlias'}) input: any;
              }

              @Component({
                selector: 'my-comp',
                template: '',
                hostDirectives: [HostDir]
              })
              export class MyComp {}
            `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);

        expect(messages).toEqual([
          `Required input 'inputAlias' from host directive HostDir must be exposed.`,
        ]);
      });

      it('should not produce required input diagnostic when exposed through alias', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component, Input} from '@angular/core';

          @Directive({
            selector: '[dir-a]',
            standalone: true
          })
          export class HostDir {
            @Input({required: true, alias: 'inputAlias'}) input: any;
          }

          @Component({
            selector: 'my-comp',
            template: '',
            hostDirectives: [{directive: HostDir, inputs: ['inputAlias']}]
          })
          export class MyComp {}
        `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);

        expect(messages).toEqual([]);
      });

      it('should not produce required input diagnostic when exposed through alias to another alias', () => {
        env.write(
          'test.ts',
          `
              import {Directive, Component, Input} from '@angular/core';

              @Directive({
                selector: '[dir-a]',
                standalone: true
              })
              export class HostDir {
                @Input({required: true, alias: 'inputAlias'}) input: any;
              }

              @Component({
                selector: 'my-comp',
                template: '',
                hostDirectives: [{directive: HostDir, inputs: ['inputAlias: customAlias']}]
              })
              export class MyComp {}
            `,
        );

        const messages = env.driveDiagnostics().map(extractMessage);

        expect(messages).toEqual([]);
      });

      it('should not produce a diagnostic when exposing an aliased binding', () => {
        env.write(
          'test.ts',
          `
          import {Directive, EventEmitter} from '@angular/core';

          @Directive({
            outputs: ['opened: triggerOpened'],
            selector: '[trigger]',
            standalone: true,
          })
          export class Trigger {
            opened = new EventEmitter();
          }

          @Directive({
            standalone: true,
            selector: '[host]',
            hostDirectives: [{directive: Trigger, outputs: ['triggerOpened']}]
          })
          export class Host {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not produce a diagnostic when exposing an inherited aliased binding', () => {
        env.write(
          'test.ts',
          `
          import {Directive, EventEmitter} from '@angular/core';

          @Directive({standalone: true})
          export abstract class Base {
            opened = new EventEmitter();
          }

          @Directive({
            outputs: ['opened: triggerOpened'],
            selector: '[trigger]',
            standalone: true,
          })
          export class Trigger extends Base {}

          @Directive({
            standalone: true,
            selector: '[host]',
            hostDirectives: [{directive: Trigger, outputs: ['triggerOpened: hostOpened']}]
          })
          export class Host {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
    });
  });
});
