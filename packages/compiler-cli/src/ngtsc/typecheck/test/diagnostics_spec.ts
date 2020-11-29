/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem, TestFile} from '../../file_system/testing';
import {OptimizeFor, TypeCheckingConfig} from '../api';

import {ngForDeclaration, ngForDts, setup, TestDeclaration} from './test_utils';

runInEachFileSystem(() => {
  describe('template diagnostics', () => {
    it('works for directive bindings', () => {
      const messages = diagnose(
          `<div dir [input]="person.name"></div>`, `
        class Dir {
          input: number;
        }
        class TestComponent {
          person: {
            name: string;
          };
        }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            exportAs: ['dir'],
            inputs: {input: 'input'},
          }]);

      expect(messages).toEqual(
          [`TestComponent.html(1, 11): Type 'string' is not assignable to type 'number'.`]);
    });

    it('infers type of template variables', () => {
      const messages = diagnose(
          `<div *ngFor="let person of persons; let idx=index">{{ render(idx) }}</div>`, `
        class TestComponent {
          persons: {}[];

          render(input: string): string { return input; }
        }`,
          [ngForDeclaration()], [ngForDts()]);

      expect(messages).toEqual([
        `TestComponent.html(1, 62): Argument of type 'number' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers any type when generic type inference fails', () => {
      const messages = diagnose(
          `<div *ngFor="let person of persons;">{{ render(person.namme) }}</div>`, `
        class TestComponent {
          persons: any;

          render(input: string): string { return input; }
        }`,
          [ngForDeclaration()], [ngForDts()]);

      expect(messages).toEqual([]);
    });

    it('infers type of element references', () => {
      const messages = diagnose(
          `<div dir #el>{{ render(el) }}</div>`, `
        class Dir {
          value: number;
        }
        class TestComponent {
          render(input: string): string { return input; }
        }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            exportAs: ['dir'],
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 24): Argument of type 'HTMLDivElement' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers type of directive references', () => {
      const messages = diagnose(
          `<div dir #dir="dir">{{ render(dir) }}</div>`, `
        class Dir {
          value: number;
        }
        class TestComponent {
          render(input: string): string { return input; }
        }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            exportAs: ['dir'],
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 31): Argument of type 'Dir' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers TemplateRef<any> for ng-template references', () => {
      const messages = diagnose(`<ng-template #tmpl>{{ render(tmpl) }}</ng-template>`, `
      class TestComponent {
        render(input: string): string { return input; }
      }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 30): Argument of type 'TemplateRef<any>' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers type of template context', () => {
      const messages = diagnose(
          `<div *ngFor="let person of persons">{{ person.namme }}</div>`, `
        class TestComponent {
          persons: {
            name: string;
          }[];
        }`,
          [ngForDeclaration()], [ngForDts()]);

      expect(messages).toEqual([
        `TestComponent.html(1, 47): Property 'namme' does not exist on type '{ name: string; }'. Did you mean 'name'?`,
      ]);
    });

    it('interprets interpolation as strings', () => {
      const messages = diagnose(`<blockquote title="{{ person }}"></blockquote>`, `
      class TestComponent {
        person: {};
      }`);

      expect(messages).toEqual([]);
    });

    it('checks bindings to regular element', () => {
      const messages = diagnose(`<img [srcc]="src" [height]="heihgt">`, `
      class TestComponent {
        src: string;
        height: number;
      }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 29): Property 'heihgt' does not exist on type 'TestComponent'. Did you mean 'height'?`,
        `TestComponent.html(1, 6): Can't bind to 'srcc' since it isn't a known property of 'img'.`,
      ]);
    });

    it('checks text attributes that are consumed by bindings with literal string types', () => {
      const messages = diagnose(
          `<div dir mode="drak"></div><div dir mode="light"></div>`, `
        class Dir {
          mode: 'dark'|'light';
        }
        class TestComponent {}`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {'mode': 'mode'},
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 10): Type '"drak"' is not assignable to type '"dark" | "light"'.`,
      ]);
    });

    it('checks expressions in ICUs', () => {
      const messages = diagnose(
          `<span i18n>{switch, plural, other { {{interpolation}}
            {nestedSwitch, plural, other { {{nestedInterpolation}} }}
          }}</span>`,
          `class TestComponent {}`);

      expect(messages.sort()).toEqual([
        `TestComponent.html(1, 13): Property 'switch' does not exist on type 'TestComponent'.`,
        `TestComponent.html(1, 39): Property 'interpolation' does not exist on type 'TestComponent'.`,
        `TestComponent.html(2, 14): Property 'nestedSwitch' does not exist on type 'TestComponent'.`,
        `TestComponent.html(2, 46): Property 'nestedInterpolation' does not exist on type 'TestComponent'.`,
      ]);
    });

    it('produces diagnostics for pipes', () => {
      const messages = diagnose(
          `<div>{{ person.name | pipe:person.age:1 }}</div>`, `
        class Pipe {
          transform(value: string, a: string, b: string): string { return a + b; }
        }
        class TestComponent {
          person: {
            name: string;
            age: number;
          };
        }`,
          [{type: 'pipe', name: 'Pipe', pipeName: 'pipe'}]);

      expect(messages).toEqual([
        `TestComponent.html(1, 28): Argument of type 'number' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('does not repeat diagnostics for missing pipes in directive inputs', () => {
      // The directive here is structured so that a type constructor is used, which resuts in each
      // input binding being processed twice. This results in the 'uppercase' pipe being resolved
      // twice, and since it doesn't exist this operation will fail. The test is here to verify that
      // failing to resolve the pipe twice only produces a single diagnostic (no duplicates).
      const messages = diagnose(
          '<div *dir="let x of name | uppercase"></div>', `
            class Dir<T> {
              dirOf: T;
            }

            class TestComponent {
              name: string;
            }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {'dirOf': 'dirOf'},
            isGeneric: true,
          }]);

      expect(messages.length).toBe(1);
      expect(messages[0]).toContain(`No pipe found with name 'uppercase'.`);
    });

    it('does not repeat diagnostics for errors within LHS of safe-navigation operator', () => {
      const messages = diagnose(`{{ personn?.name }} {{ personn?.getName() }}`, `
         class TestComponent {
           person: {
             name: string;
             getName: () => string;
           } | null;
         }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 4): Property 'personn' does not exist on type 'TestComponent'. Did you mean 'person'?`,
        `TestComponent.html(1, 24): Property 'personn' does not exist on type 'TestComponent'. Did you mean 'person'?`,
      ]);
    });

    it('does not repeat diagnostics for errors used in template guard expressions', () => {
      const messages = diagnose(
          `<div *guard="personn.name"></div>`, `
          class GuardDir {
            static ngTemplateGuard_guard: 'binding';
          }

          class TestComponent {
            person: {
              name: string;
            };
          }`,
          [{
            type: 'directive',
            name: 'GuardDir',
            selector: '[guard]',
            inputs: {'guard': 'guard'},
            ngTemplateGuards: [{inputName: 'guard', type: 'binding'}],
            undeclaredInputFields: ['guard'],
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 14): Property 'personn' does not exist on type 'TestComponent'. Did you mean 'person'?`,
      ]);
    });

    it('does not produce diagnostics for user code', () => {
      const messages = diagnose(`{{ person.name }}`, `
      class TestComponent {
        person: {
          name: string;
        };
        render(input: string): number { return input; } // <-- type error here should not be reported
      }`);

      expect(messages).toEqual([]);
    });

    it('should treat unary operators as literal types', () => {
      const messages = diagnose(`{{ test(-1) + test(+1) + test(-2) }}`, `
      class TestComponent {
        test(value: -1 | 1): number { return value; }
      }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 31): Argument of type '-2' is not assignable to parameter of type '1 | -1'.`,
      ]);
    });

    describe('outputs', () => {
      it('should produce a diagnostic for directive outputs', () => {
        const messages = diagnose(
            `<div dir (event)="handleEvent($event)"></div>`, `
          import {EventEmitter} from '@angular/core';
          class Dir {
            out = new EventEmitter<number>();
          }
          class TestComponent {
            handleEvent(event: string): void {}
          }`,
            [{type: 'directive', name: 'Dir', selector: '[dir]', outputs: {'out': 'event'}}]);

        expect(messages).toEqual([
          `TestComponent.html(1, 31): Argument of type 'number' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should produce a diagnostic for animation events', () => {
        const messages = diagnose(`<div dir (@animation.done)="handleEvent($event)"></div>`, `
          class TestComponent {
            handleEvent(event: string): void {}
          }`);

        expect(messages).toEqual([
          `TestComponent.html(1, 41): Argument of type 'AnimationEvent' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should produce a diagnostic for element outputs', () => {
        const messages = diagnose(`<div (click)="handleEvent($event)"></div>`, `
          import {EventEmitter} from '@angular/core';
          class TestComponent {
            handleEvent(event: string): void {}
          }`);

        expect(messages).toEqual([
          `TestComponent.html(1, 27): Argument of type 'MouseEvent' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should not produce a diagnostic when $event implicitly has an any type', () => {
        const messages = diagnose(
            `<div dir (event)="handleEvent($event)"></div>`, `
          class Dir {
            out: any;
          }
          class TestComponent {
            handleEvent(event: string): void {}
          }`,
            [{type: 'directive', name: 'Dir', selector: '[dir]', outputs: {'out': 'event'}}]);

        expect(messages).toEqual([]);
      });

      // https://github.com/angular/angular/issues/33528
      it('should not produce a diagnostic for implicit any return types', () => {
        const messages = diagnose(
            `<div (click)="state = null"></div>`, `
          class TestComponent {
            state: any;
          }`,
            // Disable strict DOM event checking and strict null checks, to infer an any return type
            // that would be implicit if the handler function would not have an explicit return
            // type.
            [], [], {checkTypeOfDomEvents: false}, {strictNullChecks: false});

        expect(messages).toEqual([]);
      });
    });

    describe('strict null checks', () => {
      it('produces diagnostic for unchecked property access', () => {
        const messages =
            diagnose(`<div [class.has-street]="person.address.street.length > 0"></div>`, `
        export class TestComponent {
          person: {
            address?: {
              street: string;
            };
          };
        }`);

        expect(messages).toEqual([`TestComponent.html(1, 41): Object is possibly 'undefined'.`]);
      });

      it('does not produce diagnostic for checked property access', () => {
        const messages = diagnose(
            `<div [class.has-street]="person.address && person.address.street.length > 0"></div>`, `
        export class TestComponent {
          person: {
            address?: {
              street: string;
            };
          };
        }`);

        expect(messages).toEqual([]);
      });
    });

    it('computes line and column offsets', () => {
      const messages = diagnose(
          `
<div>
  <img [src]="srcc"
       [height]="heihgt">
</div>
`,
          `
class TestComponent {
  src: string;
  height: number;
}`);

      expect(messages).toEqual([
        `TestComponent.html(3, 15): Property 'srcc' does not exist on type 'TestComponent'. Did you mean 'src'?`,
        `TestComponent.html(4, 18): Property 'heihgt' does not exist on type 'TestComponent'. Did you mean 'height'?`,
      ]);
    });
  });

  describe('method call spans', () => {
    it('reports invalid method name on method name span', () => {
      const messages = diagnose(`{{ person.getNName() }}`, `
        export class TestComponent {
          person: {
            getName(): string;
          };
        }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 11): Property 'getNName' does not exist on type '{ getName(): string; }'. Did you mean 'getName'?`
      ]);
    });

    it('reports invalid method call signature on parameter span', () => {
      const messages = diagnose(`{{ person.getName('abcd') }}`, `
        export class TestComponent {
          person: {
            getName(): string;
          };
        }`);

      expect(messages).toEqual([`TestComponent.html(1, 19): Expected 0 arguments, but got 1.`]);
    });
  });

  describe('safe method call spans', () => {
    it('reports invalid method name on method name span', () => {
      const messages = diagnose(`{{ person?.getNName() }}`, `
        export class TestComponent {
          person?: {
            getName(): string;
          };
        }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 12): Property 'getNName' does not exist on type '{ getName(): string; }'. Did you mean 'getName'?`
      ]);
    });

    it('reports invalid method call signature on parameter span', () => {
      const messages = diagnose(`{{ person?.getName('abcd') }}`, `
        export class TestComponent {
          person?: {
            getName(): string;
          };
        }`);

      expect(messages).toEqual([`TestComponent.html(1, 20): Expected 0 arguments, but got 1.`]);
    });
  });

  describe('property write spans', () => {
    it('reports invalid receiver property access on property access name span', () => {
      const messages = diagnose(`<div (click)="person.nname = 'jacky'"></div>`, `
        export class TestComponent {
          person: {
            name: string;
          };
        }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 22): Property 'nname' does not exist on type '{ name: string; }'. Did you mean 'name'?`
      ]);
    });

    it('reports unassignable value on property write span', () => {
      const messages = diagnose(`<div (click)="person.name = 2"></div>`, `
        export class TestComponent {
          person: {
            name: string;
          };
        }`);

      expect(messages).toEqual(
          [`TestComponent.html(1, 15): Type 'number' is not assignable to type 'string'.`]);
    });
  });
});

function diagnose(
    template: string, source: string, declarations?: TestDeclaration[],
    additionalSources: TestFile[] = [], config?: Partial<TypeCheckingConfig>,
    options?: ts.CompilerOptions): string[] {
  const sfPath = absoluteFrom('/main.ts');
  const {program, templateTypeChecker} = setup(
      [
        {
          fileName: sfPath,
          templates: {
            'TestComponent': template,
          },
          source,
          declarations,
        },
        ...additionalSources.map(testFile => ({
                                   fileName: testFile.name,
                                   source: testFile.contents,
                                   templates: {},
                                 })),
      ],
      {config, options});
  const sf = getSourceFileOrError(program, sfPath);
  const diagnostics = templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
  return diagnostics.map(diag => {
    const text =
        typeof diag.messageText === 'string' ? diag.messageText : diag.messageText.messageText;
    const fileName = diag.file!.fileName;
    const {line, character} = ts.getLineAndCharacterOfPosition(diag.file!, diag.start!);
    return `${fileName}(${line + 1}, ${character + 1}): ${text}`;
  });
}
