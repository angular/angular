/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';
import ts from 'typescript';

const testFiles = loadStandardTestFiles();

function getDiagnosticSourceCode(diag: ts.Diagnostic): string {
  return diag.file!.text.slice(diag.start!, diag.start! + diag.length!);
}

runInEachFileSystem(() => {
  describe('type checking of host bindings', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({
        // Necessary for testing host bindings.
        typeCheckHostBindings: true,

        // Not required for host bindings, but they allow us to
        // exercise more parts of the type checker.
        strictTemplates: true,
        strictAttributeTypes: true,
        strictDomEventTypes: true,
        strictOutputEventTypes: true,
      });
    });

    it('should check the value of an attribute host binding', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            host: {'[attr.id]': 'exists + doesNotExist'},
          })
          export class Comp {
            exists = 'exists';
          }
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'doesNotExist' does not exist on type 'Comp'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExist');
    });

    it('should check the value of a style host binding', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            host: {'[style.color]': 'exists + doesNotExist'},
          })
          export class Comp {
            exists = 'exists';
          }
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'doesNotExist' does not exist on type 'Comp'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExist');
    });

    it('should check the value of a class host binding', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            host: {'[class.foo]': 'exists + doesNotExist'},
          })
          export class Comp {
            exists = 'exists';
          }
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'doesNotExist' does not exist on type 'Comp'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExist');
    });

    it('should check the value of an animation host binding', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            host: {'[@someAnimation]': 'exists + doesNotExist'},
          })
          export class Comp {
            exists = 'exists';
          }
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'doesNotExist' does not exist on type 'Comp'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExist');
    });

    it('should check the value of a property host binding', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            host: {'[id]': 'exists + doesNotExist'},
          })
          export class Comp {
            exists = 'exists';
          }
        `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'doesNotExist' does not exist on type 'Comp'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExist');
    });

    it('should validate host bidings against the schema', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          host: {'[foo]': '123'},
        })
        export class Comp {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Can't bind to 'foo' since it isn't a known property of 'ng-component'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('[foo]');
    });

    it('should infer the element name from the selector', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          selector: 'input[foo]',
          host: {'[foo]': '123'},
        })
        export class Comp {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Can't bind to 'foo' since it isn't a known property of 'input'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('[foo]');
    });

    it('should report if one tag name supports a property, but another one does not', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          selector: 'input[foo], div[foo]',
          host: {'[value]': '123'},
        })
        export class Comp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Can't bind to 'value' since it isn't a known property of 'div'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('[value]');
    });

    it('should check host event listeners', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          selector: 'button[foo]',
          host: {'(click)': 'handleEvent($event)'},
        })
        export class Comp {
          handleEvent(event: KeyboardEvent) {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toBe(
        `Argument of type 'MouseEvent' is not assignable to parameter of type 'KeyboardEvent'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('$event');
    });

    it('should check host event listeners with a target', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          selector: 'button[foo]',
          host: {'(document:click)': 'handleEvent($event)'},
        })
        export class Comp {
          handleEvent(event: KeyboardEvent) {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toBe(
        `Argument of type 'MouseEvent' is not assignable to parameter of type 'KeyboardEvent'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('$event');
    });

    it('should check @HostListener with a target', () => {
      env.write(
        'test.ts',
        `
        import {Component, HostListener} from '@angular/core';

        @Component({
          template: '',
          selector: 'button[foo]',
        })
        export class Comp {
          @HostListener('document:click', ['$event']) handleEvent(event: KeyboardEvent) {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toBe(
        `Argument of type 'MouseEvent' is not assignable to parameter of type 'KeyboardEvent'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('$event');
    });

    it('should check host animation event listeners', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          selector: 'button[foo]',
          host: {'(@someAnimation.done)': 'handleEvent()'},
        })
        export class Comp {
          handleEvent(event: Event) {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Expected 1 arguments, but got 0.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('handleEvent');
    });

    it('should not leak @let from the template into the host bindings', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            host: {'[attr.id]': 'foo + bar'},
            template: \`
              @let bar = 'bar';
              {{foo + bar}}
            \`,
          })
          export class Comp {
            foo = 'foo';
          }
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'bar' does not exist on type 'Comp'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('bar');
    });

    it('should not leak local reference from the template into the host bindings', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            host: {'[attr.id]': 'foo + bar.id'},
            template: \`
              <div #bar></div>
              {{foo + bar.id}}
            \`,
          })
          export class Comp {
            foo = 'foo';
          }
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'bar' does not exist on type 'Comp'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('bar');
    });

    it('should be able to report diagnostics both from a static inline template and host bindings', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            template: '<div>{{doesNotExistTemplate}}</div>',
            host: {'[attr.id]': 'doesNotExistHost'},
          })
          export class Comp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toBe(
        `Property 'doesNotExistTemplate' does not exist on type 'Comp'.`,
      );
      expect(diags[1].messageText).toBe(
        `Property 'doesNotExistHost' does not exist on type 'Comp'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExistTemplate');
      expect(getDiagnosticSourceCode(diags[1])).toBe('doesNotExistHost');
    });

    it('should be able to report diagnostics both from an external template and host bindings', () => {
      env.write('template.html', '<div>{{doesNotExistTemplate}}</div>');

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            templateUrl: './template.html',
            host: {'[attr.id]': 'doesNotExistHost'},
          })
          export class Comp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toBe(
        `Property 'doesNotExistTemplate' does not exist on type 'Comp'.`,
      );
      expect(diags[1].messageText).toBe(
        `Property 'doesNotExistHost' does not exist on type 'Comp'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExistTemplate');
      expect(getDiagnosticSourceCode(diags[1])).toBe('doesNotExistHost');
    });

    it('should be able to report diagnostics both from a dynamic template and host bindings', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          const templateRemainder = 'ExistTemplate}}</div>';

          @Component({
            template: '<div>{{doesNot' + templateRemainder,
            host: {'[attr.id]': 'doesNotExistHost'},
          })
          export class Comp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toBe(
        `Property 'doesNotExistTemplate' does not exist on type 'Comp'.`,
      );
      expect(diags[1].messageText).toBe(
        `Property 'doesNotExistHost' does not exist on type 'Comp'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExistTemplate');
      expect(getDiagnosticSourceCode(diags[1])).toBe('doesNotExistHost');
    });

    it('should check @HostBinding decorator with no arguments', () => {
      env.write(
        'test.ts',
        `
          import {Component, HostBinding} from '@angular/core';

          @Component({template: ''})
          export class Comp {
            @HostBinding() foo = 'foo';
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Can't bind to 'foo' since it isn't a known property of 'ng-component'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('foo');
    });

    it('should check @HostBinding decorator with a string argument', () => {
      env.write(
        'test.ts',
        `
          import {Component, HostBinding} from '@angular/core';

          @Component({template: ''})
          export class Comp {
            @HostBinding('foo') id = 'foo';
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Can't bind to 'foo' since it isn't a known property of 'ng-component'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('foo');
    });

    it('should check @HostListener decorator that does not pass enough arguments', () => {
      env.write(
        'test.ts',
        `
          import {Component, HostListener} from '@angular/core';

          @Component({template: ''})
          export class Comp {
            @HostListener('click') handleClick(event: MouseEvent) {};
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Expected 1 arguments, but got 0.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('handleClick');
    });

    it('should check @HostListener decorator that passes too many arguments', () => {
      env.write(
        'test.ts',
        `
          import {Component, HostListener} from '@angular/core';

          @Component({template: ''})
          export class Comp {
            @HostListener('click', ['$event']) handleClick() {};
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Expected 0 arguments, but got 1.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('$event');
    });

    it('should infer the type of @HostListener parameters', () => {
      env.write(
        'test.ts',
        `
          import {Component, HostListener} from '@angular/core';

          @Component({template: ''})
          export class Comp {
            @HostListener('click', ['$event']) handleClick(value: string) {};
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'MouseEvent' is not assignable to parameter of type 'string'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('$event');
    });

    it('should ignore @HostListener parameters that are not static', () => {
      env.write(
        'test.ts',
        `
          import {Component, HostListener} from '@angular/core';

          const two = 'null';

          @Component({template: ''})
          export class Comp {
            @HostListener('click', ['1', two, '3']) handleClick(value: string) {};
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe('Expected 1 arguments, but got 3.');
      expect(getDiagnosticSourceCode(diags[0])).toBe('two');
    });

    it('should report host decorators on private members', () => {
      env.write(
        'test.ts',
        `
          import {Component, HostBinding, HostListener} from '@angular/core';

          @Component({template: ''})
          export class Comp {
            @HostBinding() private id = '123';
            @HostListener('click') private handleClick() {};
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toBe(
        `Property 'id' is private and only accessible within class 'Comp'.`,
      );
      expect(diags[1].messageText).toBe(
        `Property 'handleClick' is private and only accessible within class 'Comp'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('id');
      expect(getDiagnosticSourceCode(diags[1])).toBe('handleClick');
    });

    it('should report diagnostic on the entire initializer of property binding if node contains escaped string', () => {
      env.write(
        'test.ts',
        `
          import {Directive} from '@angular/core';

          @Directive({
            host: {
              '[attr.id]': 'prefix + \\'123\\' + doesNotExist'
            },
          })
          export class Dir {
            prefix = 'prefix';
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'doesNotExist' does not exist on type 'Dir'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe(`'prefix + \\'123\\' + doesNotExist'`);
    });

    it('should report diagnostic on the entire initializer of event binding if node contains escaped string', () => {
      env.write(
        'test.ts',
        `
          import {Directive} from '@angular/core';

          @Directive({
            host: {
              '(click)': 'handleClick(\\'foo\\')'
            },
          })
          export class Dir {
            handleClick(value: number) {}
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe(`'handleClick(\\'foo\\')'`);
    });

    it('should preserve diagnostic location of nodes that occur before escaped string', () => {
      env.write(
        'test.ts',
        `
          import {Directive} from '@angular/core';

          @Directive({
            host: {
              '[attr.id]': 'getIdFromString(123) + \\'foo\\''
            },
          })
          export class Dir {
            getIdFromString(value: string) {
              return value;
            }
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'number' is not assignable to parameter of type 'string'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('123');
    });

    it('should not check non-static host bindings', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          const BINDINGS = {'[attr.id]': 'doesNotExist'};

          @Component({
            template: '',
            host: {
              ...BINDINGS,
            }
          })
          export class Comp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should check host bindings on a directive', () => {
      env.write(
        'dir.ts',
        `
        import {Directive, HostBinding, HostListener} from '@angular/core';

        @Directive({
          selector: 'button[dir]',
          host: {
            '[attr.id]': 'exists + literalBindingDoesNotExist',
            '(click)': 'literalListenerDoesNotExist($event)',
          }
        })
        export class SomeDir {
          exists = 'exists';

          @HostBinding('foo') doesNotExistDecorator = 123;

          @HostListener('mousedown')
          directiveDecoratorHostListener(event: Event) {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(4);
      expect(diags[0].messageText).toBe(
        `Property 'literalBindingDoesNotExist' does not exist on type 'SomeDir'.`,
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe('literalBindingDoesNotExist');
      expect(diags[1].messageText).toBe(
        `Property 'literalListenerDoesNotExist' does not exist on type 'SomeDir'.`,
      );
      expect(getDiagnosticSourceCode(diags[1])).toBe('literalListenerDoesNotExist');
      expect(diags[2].messageText).toBe(`Expected 1 arguments, but got 0.`);
      expect(getDiagnosticSourceCode(diags[2])).toBe('directiveDecoratorHostListener');
      expect(diags[3].messageText).toBe(
        `Can't bind to 'foo' since it isn't a known property of 'button'.`,
      );
      expect(getDiagnosticSourceCode(diags[3])).toBe('foo');
    });

    it('should not check host bindings if the compiler flag is disabled', () => {
      env.tsconfig({typeCheckHostBindings: false});
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            host: {'[attr.id]': 'exists + doesNotExist'},
          })
          export class Comp {
            exists = 'exists';
          }
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should check component listening to own output', () => {
      env.write(
        'test.ts',
        `
          import {Component, Output, EventEmitter} from '@angular/core';

          @Component({
            template: '',
            host: {'(customEvent)': 'expectsNumber($event)'},
          })
          export class Comp {
            @Output() customEvent = new EventEmitter<string>();

            expectsNumber(value: number) {}
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check component listening to output from host directive', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive()
          export class HostDir {
            @Output() customEvent = new EventEmitter<string>();
          }

          @Component({
            template: '',
            host: {'(alias)': 'expectsNumber($event)'},
            hostDirectives: [{directive: HostDir, outputs: ['customEvent: alias']}]
          })
          export class Comp {
            expectsNumber(value: number) {}
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check component listening to own output and from host directive', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive()
          export class HostDir {
            @Output() customEvent = new EventEmitter<string>();
          }

          @Component({
            template: '',
            host: {'(customEvent)': 'expectsNumber($event)'},
            hostDirectives: [{directive: HostDir, outputs: ['customEvent']}]
          })
          export class Comp {
            @Output() customEvent = new EventEmitter<boolean>();

            expectsNumber(value: number) {}
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
      expect(diags[1].messageText).toBe(
        `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check directive listening to own output', () => {
      env.write(
        'test.ts',
        `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            host: {'(customEvent)': 'expectsNumber($event)'},
          })
          export class Dir {
            @Output() customEvent = new EventEmitter<string>();

            expectsNumber(value: number) {}
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check directive listening to output from host directive', () => {
      env.write(
        'test.ts',
        `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive()
          export class HostDir {
            @Output() customEvent = new EventEmitter<string>();
          }

          @Directive({
            host: {'(alias)': 'expectsNumber($event)'},
            hostDirectives: [{directive: HostDir, outputs: ['customEvent: alias']}]
          })
          export class Dir {
            expectsNumber(value: number) {}
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check directive listening to own output and from host directive', () => {
      env.write(
        'test.ts',
        `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive()
          export class HostDir {
            @Output() customEvent = new EventEmitter<string>();
          }

          @Directive({
            host: {'(customEvent)': 'expectsNumber($event)'},
            hostDirectives: [{directive: HostDir, outputs: ['customEvent']}]
          })
          export class Dir {
            @Output() customEvent = new EventEmitter<boolean>();

            expectsNumber(value: number) {}
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
      expect(diags[1].messageText).toBe(
        `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check generic component', () => {
      env.write(
        'test.ts',
        `
          import { Component, output } from '@angular/core';

          @Component({
            host: {
              '(customEvent)': 'doesNotExist()',
            },
            template: ''
          })
          export class App<T> {
            customEvent = output<T>();
          }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'doesNotExist' does not exist on type 'App<T>'.`);
      expect(getDiagnosticSourceCode(diags[0])).toBe('doesNotExist');
    });
  });
});
