/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem, TestFile} from '../../file_system/testing';
import {OptimizeFor, TypeCheckingConfig} from '../api';
import {resetParseTemplateAsSourceFileForTest, setParseTemplateAsSourceFileForTest} from '../diagnostics';
import {ngForDeclaration, ngForDts, ngIfDeclaration, ngIfDts, setup, TestDeclaration} from '../testing';

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
      // The directive here is structured so that a type constructor is used, which results in each
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

    it('should retain literal types in object literals together if strictNullInputBindings is disabled',
       () => {
         const messages = diagnose(
             `<div dir [ngModelOptions]="{updateOn: 'change'}"></div>`, `
              class Dir {
                ngModelOptions: { updateOn: 'change'|'blur' };
              }

              class TestComponent {}`,
             [{
               type: 'directive',
               name: 'Dir',
               selector: '[dir]',
               inputs: {'ngModelOptions': 'ngModelOptions'},
             }],
             [], {strictNullInputBindings: false});

         expect(messages).toEqual([]);
       });

    it('should retain literal types in array literals together if strictNullInputBindings is disabled',
       () => {
         const messages = diagnose(
             `<div dir [options]="['literal']"></div>`, `
                class Dir {
                  options!: Array<'literal'>;
                }

                class TestComponent {}`,
             [{
               type: 'directive',
               name: 'Dir',
               selector: '[dir]',
               inputs: {'options': 'options'},
             }],
             [], {strictNullInputBindings: false});

         expect(messages).toEqual([]);
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

    it('should support type-narrowing for methods with type guards', () => {
      const messages = diagnose(
          `<div *ngIf="hasSuccess()">{{ success }}</div>`, `
          class TestComponent {
            hasSuccess(): this is { success: boolean };
          }`,
          [ngIfDeclaration()], [ngIfDts()]);

      expect(messages).toEqual([]);
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

      it('does not produce diagnostic for fallback value using nullish coalescing', () => {
        const messages = diagnose(`<div>{{ greet(name ?? 'Frodo') }}</div>`, `
        export class TestComponent {
          name: string | null;

          greet(name: string) {
            return 'hello ' + name;
          }
        }`);

        expect(messages).toEqual([]);
      });

      it('does not produce diagnostic for safe keyed access', () => {
        const messages =
            diagnose(`<div [class.red-text]="person.favoriteColors?.[0] === 'red'"></div>`, `
              export class TestComponent {
                person: {
                  favoriteColors?: string[];
                };
              }`);

        expect(messages).toEqual([]);
      });

      it('infers a safe keyed read as undefined', () => {
        const messages = diagnose(`<div (click)="log(person.favoriteColors?.[0])"></div>`, `
          export class TestComponent {
            person: {
              favoriteColors?: string[];
            };

            log(color: string) {
              console.log(color);
            }
          }`);

        expect(messages).toEqual([
          `TestComponent.html(1, 19): Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.`
        ]);
      });

      it('does not produce diagnostic for safe calls', () => {
        const messages =
            diagnose(`<div [class.is-hobbit]="person.getName?.() === 'Bilbo'"></div>`, `
              export class TestComponent {
                person: {
                  getName?: () => string;
                };
              }`);

        expect(messages).toEqual([]);
      });

      it('infers a safe call return value as undefined', () => {
        const messages = diagnose(`<div (click)="log(person.getName?.())"></div>`, `
          export class TestComponent {
            person: {
              getName?: () => string;
            };

            log(name: string) {
              console.log(name);
            }
          }`);

        expect(messages).toEqual([
          `TestComponent.html(1, 19): Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.`
        ]);
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

    it('works for shorthand property declarations', () => {
      const messages = diagnose(
          `<div dir [input]="{a, b: 2}"></div>`, `
        class Dir {
          input: {a: string, b: number};
        }
        class TestComponent {
          a: number;
        }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            exportAs: ['dir'],
            inputs: {input: 'input'},
          }]);

      expect(messages).toEqual(
          [`TestComponent.html(1, 20): Type 'number' is not assignable to type 'string'.`]);
    });

    it('works for shorthand property declarations referring to template variables', () => {
      const messages = diagnose(
          `
          <span #span></span>
          <div dir [input]="{span, b: 2}"></div>
        `,
          `
          class Dir {
            input: {span: string, b: number};
          }
          class TestComponent {}`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            exportAs: ['dir'],
            inputs: {input: 'input'},
          }]);

      expect(messages).toEqual(
          [`TestComponent.html(3, 30): Type 'HTMLElement' is not assignable to type 'string'.`]);
    });

    it('allows access to protected members', () => {
      const messages = diagnose(`<button (click)="doFoo()">{{ message }}</button>`, `
        class TestComponent {
          protected message = 'Hello world';
          protected doFoo(): void {}
        }`);

      expect(messages).toEqual([]);
    });

    it('disallows access to private members', () => {
      const messages = diagnose(`<button (click)="doFoo()">{{ message }}</button>`, `
        class TestComponent {
          private message = 'Hello world';
          private doFoo(): void {}
        }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 18): Property 'doFoo' is private and only accessible within class 'TestComponent'.`,
        `TestComponent.html(1, 30): Property 'message' is private and only accessible within class 'TestComponent'.`
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

  // https://github.com/angular/angular/issues/44999
  it('should not fail for components outside of rootDir', () => {
    // This test configures a component that is located outside the configured `rootDir`. Such
    // configuration requires that an inline type-check block is used as the reference emitter does
    // not allow generating imports outside `rootDir`.
    const messages =
        diagnose(`{{invalid}}`, `export class TestComponent {}`, [], [], {}, {rootDir: '/root'});

    expect(messages).toEqual(
        [`TestComponent.html(1, 3): Property 'invalid' does not exist on type 'TestComponent'.`]);
  });

  describe('host directives', () => {
    it('should produce a diagnostic for host directive input bindings', () => {
      const messages = diagnose(
          `<div dir [input]="person.name" [alias]="person.age"></div>`, `
            class Dir {
            }
            class HostDir {
              input: number;
              otherInput: string;
            }
            class TestComponent {
              person: {
                name: string;
                age: number;
              };
            }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            hostDirectives: [{
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                inputs: {input: 'input', otherInput: 'otherInput'},
                isStandalone: true,
              },
              inputs: ['input', 'otherInput: alias']
            }]
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 11): Type 'string' is not assignable to type 'number'.`,
        `TestComponent.html(1, 33): Type 'number' is not assignable to type 'string'.`
      ]);
    });

    it('should produce a diagnostic for directive outputs', () => {
      const messages = diagnose(
          `<div
            dir
            (numberAlias)="handleStringEvent($event)"
            (stringEvent)="handleNumberEvent($event)"></div>`,
          `
            import {EventEmitter} from '@angular/core';
            class HostDir {
              stringEvent = new EventEmitter<string>();
              numberEvent = new EventEmitter<number>();
            }
            class Dir {
            }
            class TestComponent {
              handleStringEvent(event: string): void {}
              handleNumberEvent(event: number): void {}
            }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            hostDirectives: [{
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                isStandalone: true,
                outputs: {stringEvent: 'stringEvent', numberEvent: 'numberEvent'},
              },
              outputs: ['stringEvent', 'numberEvent: numberAlias']
            }]
          }]);

      expect(messages).toEqual([
        `TestComponent.html(3, 46): Argument of type 'number' is not assignable to parameter of type 'string'.`,
        `TestComponent.html(4, 46): Argument of type 'string' is not assignable to parameter of type 'number'.`
      ]);
    });

    it('should produce a diagnostic for host directive inputs and outputs that have not been exposed',
       () => {
         const messages = diagnose(
             `<div dir [input]="person.name" (output)="handleStringEvent($event)"></div>`, `
            class Dir {
            }
            class HostDir {
              input: number;
              output = new EventEmitter<number>();
            }
            class TestComponent {
              person: {
                name: string;
              };
              handleStringEvent(event: string): void {}
            }`,
             [{
               type: 'directive',
               name: 'Dir',
               selector: '[dir]',
               hostDirectives: [{
                 directive: {
                   type: 'directive',
                   name: 'HostDir',
                   selector: '',
                   inputs: {input: 'input'},
                   outputs: {output: 'output'},
                   isStandalone: true,
                 },
                 // Intentionally left blank.
                 inputs: [],
                 outputs: []
               }]
             }]);

         expect(messages).toEqual([
           // These messages are expected to refer to the native
           // typings since the inputs/outputs haven't been exposed.
           `TestComponent.html(1, 60): Argument of type 'Event' is not assignable to parameter of type 'string'.`,
           `TestComponent.html(1, 10): Can't bind to 'input' since it isn't a known property of 'div'.`
         ]);
       });

    it('should infer the type of host directive references', () => {
      const messages = diagnose(
          `<div dir #hostDir="hostDir">{{ render(hostDir) }}</div>`, `
            class Dir {}
            class HostDir {
              value: number;
            }
            class TestComponent {
              render(input: string): string { return input; }
            }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            hostDirectives: [{
              directive: {
                type: 'directive',
                selector: '',
                isStandalone: true,
                name: 'HostDir',
                exportAs: ['hostDir']
              }
            }]
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 39): Argument of type 'HostDir' is not assignable to parameter of type 'string'.`,
      ]);
    });
  });

  describe('required inputs', () => {
    it('should produce a diagnostic when a single required input is missing', () => {
      const messages = diagnose(
          `<div dir></div>`, `
            class Dir {
              input: any;
            }
            class TestComponent {}
          `,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {
              input: {classPropertyName: 'input', bindingPropertyName: 'input', required: true},
            },
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 1): Required input 'input' from directive Dir must be specified.`
      ]);
    });

    it('should produce a diagnostic when a multiple required inputs are missing', () => {
      const messages = diagnose(
          `<div dir otherDir></div>`, `
            class Dir {
              input: any;
              otherInput: any;
            }
            class OtherDir {
              otherDirInput: any;
            }
            class TestComponent {}
          `,
          [
            {
              type: 'directive',
              name: 'Dir',
              selector: '[dir]',
              inputs: {
                input: {classPropertyName: 'input', bindingPropertyName: 'input', required: true},
                otherInput: {
                  classPropertyName: 'otherInput',
                  bindingPropertyName: 'otherInput',
                  required: true
                }
              }
            },
            {
              type: 'directive',
              name: 'OtherDir',
              selector: '[otherDir]',
              inputs: {
                otherDirInput: {
                  classPropertyName: 'otherDirInput',
                  bindingPropertyName: 'otherDirInput',
                  required: true
                }
              },
            }
          ]);

      expect(messages).toEqual([
        `TestComponent.html(1, 1): Required inputs 'input', 'otherInput' from directive Dir must be specified.`,
        `TestComponent.html(1, 1): Required input 'otherDirInput' from directive OtherDir must be specified.`,
      ]);
    });

    it('should report the public name of a missing required input', () => {
      const messages = diagnose(
          `<div dir></div>`, `
            class Dir {
              input: any;
            }
            class TestComponent {}
          `,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {
              input: {classPropertyName: 'input', bindingPropertyName: 'inputAlias', required: true}
            }
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 1): Required input 'inputAlias' from directive Dir must be specified.`
      ]);
    });

    it('should not produce a diagnostic if a required input is used in a binding', () => {
      const messages = diagnose(
          `<div dir [input]="foo"></div>`, `
            class Dir {
              input: any;
            }
            class TestComponent {
              foo: any;
            }
          `,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {
              input: {classPropertyName: 'input', bindingPropertyName: 'input', required: true},
            }
          }]);

      expect(messages).toEqual([]);
    });

    it('should not produce a diagnostic if a required input is used in a binding through an alias',
       () => {
         const messages = diagnose(
             `<div dir [inputAlias]="foo"></div>`, `
                class Dir {
                  input: any;
                }
                class TestComponent {
                  foo: any;
                }
              `,
             [{
               type: 'directive',
               name: 'Dir',
               selector: '[dir]',
               inputs: {
                 input: {
                   classPropertyName: 'input',
                   bindingPropertyName: 'inputAlias',
                   required: true
                 },
               },
             }]);

         expect(messages).toEqual([]);
       });

    it('should not produce a diagnostic if a required input is used in a static binding', () => {
      const messages = diagnose(
          `<div dir input="hello"></div>`, `
            class Dir {
              input: any;
            }
            class TestComponent {}
          `,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {
              input: {classPropertyName: 'input', bindingPropertyName: 'input', required: true},
            }
          }]);

      expect(messages).toEqual([]);
    });

    it('should not produce a diagnostic if a required input is used in a two-way binding', () => {
      const messages = diagnose(
          `<div dir [(input)]="foo"></div>`, `
            class Dir {
              input: any;
              inputChange: any;
            }
            class TestComponent {
              foo: any;
            }
          `,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {
              input: {classPropertyName: 'input', bindingPropertyName: 'input', required: true},
            },
            outputs: {inputChange: 'inputChange'},
          }]);

      expect(messages).toEqual([]);
    });

    it('should not produce a diagnostic for a required input that is the same the directive selector',
       () => {
         const messages = diagnose(
             `<div dir></div>`, `
                  class Dir {
                    dir: any;
                  }
                  class TestComponent {}
                `,
             [{
               type: 'directive',
               name: 'Dir',
               selector: '[dir]',
               inputs: {dir: {classPropertyName: 'dir', bindingPropertyName: 'dir', required: true}}
             }]);

         expect(messages).toEqual([]);
       });

    it('should produce a diagnostic when a required input from a host directive is missing', () => {
      const messages = diagnose(
          `<div dir></div>`, `
              class Dir {}
              class HostDir {
                input: any;
              }
              class TestComponent {}`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            hostDirectives: [{
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                inputs: {
                  input: {
                    classPropertyName: 'input',
                    bindingPropertyName: 'hostAlias',
                    required: true
                  },
                },
                isStandalone: true,
              },
              inputs: ['hostAlias: customAlias']
            }]
          }]);

      expect(messages).toEqual([
        `TestComponent.html(1, 1): Required input 'customAlias' from directive HostDir must be specified.`
      ]);
    });

    it('should not report missing required inputs for an attribute binding with the same name',
       () => {
         const messages = diagnose(
             `<div [attr.maxlength]="123"></div>`, `
                class MaxLengthValidator {
                  maxlength: string;
                }
                class TestComponent {}
              `,
             [{
               type: 'directive',
               name: 'MaxLengthValidator',
               selector: '[maxlength]',
               inputs: {
                 maxlength: {
                   classPropertyName: 'maxlength',
                   bindingPropertyName: 'maxlength',
                   required: true
                 },
               },
             }]);

         expect(messages).toEqual([]);
       });
  });

  // https://github.com/angular/angular/issues/43970
  describe('template parse failures', () => {
    afterEach(resetParseTemplateAsSourceFileForTest);

    it('baseline test without parse failure', () => {
      const messages = diagnose(`<div (click)="test(name)"></div>`, `
      export class TestComponent {
        name: string | undefined;
        test(n: string): void {}
      }`);

      expect(messages).toEqual([
        `TestComponent.html(1, 20): Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.`
      ]);
    });

    it('should handle TypeScript parse failures gracefully', () => {
      setParseTemplateAsSourceFileForTest(() => {
        throw new Error('Simulated parse failure');
      });

      const messages = diagnose(`<div (click)="test(name)"></div>`, `
      export class TestComponent {
        name: string | undefined;
        test(n: string): void {}
      }`);

      expect(messages.length).toBe(1);
      expect(messages[0])
          .toContain(
              `main.ts(2, 20): Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
  Failed to report an error in 'TestComponent.html' at 1:20
    Error: Simulated parse failure`);
    });

    it('should handle non-Error failures gracefully', () => {
      setParseTemplateAsSourceFileForTest(() => {
        throw 'Simulated parse failure';
      });

      const messages = diagnose(`<div (click)="test(name)"></div>`, `
      export class TestComponent {
        name: string | undefined;
        test(n: string): void {}
      }`);

      expect(messages.length).toBe(1);
      expect(messages[0])
          .toContain(
              `main.ts(2, 20): Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
  Failed to report an error in 'TestComponent.html' at 1:20
    Simulated parse failure`);
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
    const text = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
    const fileName = diag.file!.fileName;
    const {line, character} = ts.getLineAndCharacterOfPosition(diag.file!, diag.start!);
    return `${fileName}(${line + 1}, ${character + 1}): ${text}`;
  });
}
