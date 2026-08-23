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
  describe('hostless components', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should throw an error if a hostless component has @HostBinding', () => {
      env.write(
        'test.ts',
        `
        import {Component, HostBinding} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {
          @HostBinding('class.active') isActive = true;
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have host bindings');
    });

    it('should throw an error if a hostless component has @HostListener', () => {
      env.write(
        'test.ts',
        `
        import {Component, HostListener} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {
          @HostListener('click')
          onClick() {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have host bindings');
    });

    it('should throw an error if a hostless component has a host: {} block', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
          host: {
            'class': 'my-class'
          }
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have host bindings');
    });
    it('should throw an error if a hostless component uses ShadowDom encapsulation', () => {
      env.write(
        'test.ts',
        `
        import {Component, ViewEncapsulation} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
          encapsulation: ViewEncapsulation.ShadowDom
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Hostless components cannot use Shadow DOM encapsulation',
      );
    });

    it('should throw an error if a hostless component has animations', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
          animations: [
            // Dummy animation to trigger the compiler check
            { type: 0 } as any
          ]
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have animations');
    });

    it('should throw an error if a hostless component has :host in its styles', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
          styles: [' :host { display: block; } ']
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have :host styles');
    });

    it('should throw an error if a hostless component has :host-context in its styles', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
          styles: [' :host-context(.dark) { display: block; } ']
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have :host styles');
    });

    it('should not throw an error if a hostless component has normal styles without :host', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
          styles: [' div { color: red; } ']
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should throw an error if a hostless component has a class or style binding on its usage', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: '<test-cmp [class.active]="true" [style.color]="\\'red\\'"></test-cmp>',
          imports: [TestCmp],
        })
        export class App {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toContain('Hostless components cannot have DOM bindings');
      expect(diags[1].messageText).toContain('Hostless components cannot have DOM bindings');
    });

    it('should throw an error if style or class attributes are used', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: '<test-cmp class="active" style="color: red;"></test-cmp>',
          imports: [TestCmp],
        })
        export class App {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toContain('Hostless components cannot have DOM bindings');
      expect(diags[1].messageText).toContain('Hostless components cannot have DOM bindings');
    });

    it('should allow ngSkipHydration on the hostless component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: '<test-cmp ngSkipHydration></test-cmp>',
          imports: [TestCmp],
        })
        export class App {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should allow binding on directive inputs applied to hostless element', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[my-dir]',
          standalone: true,
        })
        export class MyDir {
          @Input() myInput: string = '';
        }

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: \`
            <test-cmp my-dir [myInput]="'test'"/>
            <test-cmp my-dir myInput="test"/>
          \`,
          imports: [TestCmp, MyDir],
        })
        export class App {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should reject attributes that are only substrings of directive selectors', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[my-box]',
          standalone: true,
        })
        export class MyBoxDir {}

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: \`
            <test-cmp box my-box></test-cmp>
          \`,
          imports: [TestCmp, MyBoxDir],
        })
        export class App {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have DOM bindings');
    });

    it('should allow compound and multiple attribute selectors on hostless components', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[dirA][dirB]',
          standalone: true,
        })
        export class MultiAttrDir {}

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: \`
            <test-cmp dirA dirB></test-cmp>
          \`,
          imports: [TestCmp, MultiAttrDir],
        })
        export class App {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should emit IsHostless in .d.ts declaration', () => {
      env.write(
        'test.ts',
        `
        import {Component, signal} from '@angular/core';

        @Component({
          selector: 'hostless-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class HostlessCmp {}

        @Component({
          selector: 'hostless-signal-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class HostlessSignalCmp {
          mySignal = signal(0);
        }

        @Component({
          selector: 'regular-cmp',
          template: '<div></div>',
        })
        export class RegularCmp {}
      `,
      );

      env.driveMain();
      const dtsCode = env.getContents('test.d.ts');
      expect(dtsCode).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostlessCmp, "hostless-cmp", never, {}, {}, never, never, true, never, false, true>;',
      );
      expect(dtsCode).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<RegularCmp, "regular-cmp", never, {}, {}, never, never, true, never>;',
      );
    });

    it('should support host directives with aliased inputs and outputs on hostless components', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class MyDir {
          @Input() dirIn = '';
          @Output() dirOut = new EventEmitter<string>();
        }

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
          hostDirectives: [
            {
              directive: MyDir,
              inputs: ['dirIn: customIn'],
              outputs: ['dirOut: customOut'],
            },
          ],
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: \`
            <test-cmp [customIn]="'hello'" (customOut)="onOut($event)"></test-cmp>
          \`,
          imports: [TestCmp],
        })
        export class App {
          onOut(event: string) {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should support signal inputs, required inputs, outputs, and models on hostless components', () => {
      env.write(
        'test.ts',
        `
        import {Component, input, model, output, signal} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {
          sigIn = input<string>('default');
          reqIn = input.required<number>();
          sigModel = model<boolean>(false);
          sigOut = output<string>();
        }

        @Component({
          selector: 'app',
          template: \`
            <test-cmp [sigIn]="'hello'" [reqIn]="123" [(sigModel)]="flag" (sigOut)="onOut($event)"></test-cmp>
          \`,
          imports: [TestCmp],
        })
        export class App {
          flag = signal(true);
          onOut(val: string) {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should emit hostless in partial declaration under local compilation mode', () => {
      env.tsconfig({
        compilationMode: 'experimental-local',
      });

      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'hostless-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class HostlessCmp {}
      `,
      );

      env.driveMain();
      const jsCode = env.getContents('test.js');
      expect(jsCode).toContain('hostless: true');
    });

    it('should throw an error if an event listener is bound without a matching directive output', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: '<test-cmp (click)="onClick()"></test-cmp>',
          imports: [TestCmp],
        })
        export class App {
          onClick() {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have DOM bindings');
    });

    it('should allow event listener if matching a directive output on hostless component', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive, EventEmitter, Output} from '@angular/core';

        @Directive({
          selector: '[my-emitter]',
          standalone: true,
        })
        export class MyEmitterDir {
          @Output() myCustomEvent = new EventEmitter<void>();
        }

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: '<test-cmp my-emitter (myCustomEvent)="onCustom()"></test-cmp>',
          imports: [TestCmp, MyEmitterDir],
        })
        export class App {
          onCustom() {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should throw an error if an unknown property is bound to hostless component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: '<test-cmp [tabIndex]="0"></test-cmp>',
          imports: [TestCmp],
        })
        export class App {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('Hostless components cannot have DOM bindings');
    });

    it('should allow class-based directive selectors on hostless components', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '.my-class-dir',
          standalone: true,
        })
        export class MyClassDir {}

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
          hostless: true,
        })
        export class TestCmp {}

        @Component({
          selector: 'app',
          template: '<test-cmp class="my-class-dir"></test-cmp>',
          imports: [TestCmp, MyClassDir],
        })
        export class App {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });
  });
});
