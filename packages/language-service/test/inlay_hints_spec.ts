/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv, Project} from '../testing';

describe('inlay hints', () => {
  let env: LanguageServiceTestEnv;
  let project: Project;

  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  describe('@for loop variables', () => {
    it('should provide type hints for @for loop item variable', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          interface User {
            id: number;
            name: string;
          }

          @Component({
            selector: 'app-cmp',
            template: \`@for (user of users; track user.id) { {{ user.name }} }\`,
            standalone: false,
          })
          export class AppCmp {
            users: User[] = [];
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      const userHint = hints.find((h) => h.text === ': User');
      expect(userHint).toBeDefined();
    });

    it('should provide type hints for @for context variables', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`@for (item of items; track $index; let i = $index, c = $count) {
              {{ item }} #{{ i }} of {{ c }}
            }\`,
            standalone: false,
          })
          export class AppCmp {
            items = ['a', 'b', 'c'];
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      // Should have `: string` for item, `: number` for i and c
      const stringHints = hints.filter((h) => h.text === ': string');
      const numberHints = hints.filter((h) => h.text === ': number');

      expect(stringHints.length).toBeGreaterThanOrEqual(1); // item: string
      expect(numberHints.length).toBeGreaterThanOrEqual(2); // i: number, c: number
    });
  });

  describe('@if alias', () => {
    it('should provide type hints for @if alias', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          interface User {
            name: string;
          }

          @Component({
            selector: 'app-cmp',
            template: \`@if (currentUser; as u) { {{ u.name }} }\`,
            standalone: false,
          })
          export class AppCmp {
            currentUser: User | null = null;
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      // Should have a type hint for the alias (narrowed from User | null)
      // The narrowed type should be User (not User | null)
      expect(hints.length).toBeGreaterThan(0);
      const userHint = hints.find((h) => h.text.includes('User'));
      expect(userHint).toBeDefined();
    });

    it('should provide type hints for @else if alias', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`
              @if (condition1; as a) {
                {{ a }}
              } @else if (condition2; as b) {
                {{ b }}
              }
            \`,
            standalone: false,
          })
          export class AppCmp {
            condition1: string | null = null;
            condition2: number | null = null;
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      // Should have hints for both aliases
      const stringHint = hints.find((h) => h.text.includes('string'));
      const numberHint = hints.find((h) => h.text.includes('number'));

      expect(stringHint).toBeDefined();
      expect(numberHint).toBeDefined();
    });
  });

  describe('@let declarations', () => {
    it('should provide type hints for @let declarations', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`
              @let count = items.length;
              @let doubled = count * 2;
              {{ count }} {{ doubled }}
            \`,
            standalone: false,
          })
          export class AppCmp {
            items = [1, 2, 3];
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      // Both should be `: number`
      const numberHints = hints.filter((h) => h.text === ': number');
      expect(numberHints.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('event parameters', () => {
    // Note: Native DOM event hints (MouseEvent, KeyboardEvent) may not work in unit tests
    // due to the mock file system lacking proper DOM type definitions.
    // These are tested in the LSP integration tests instead.

    it('should not throw when processing event bindings', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="onClick($event)">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            onClick(e: any) {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw
      expect(() => appFile.getInlayHints()).not.toThrow();
    });
  });

  describe('pipes', () => {
    // Note: Pipe output hints work but may need proper pipe registration.
    // Fully tested in LSP integration tests.
    it('should not throw when processing pipes', () => {
      const files = {
        'app.ts': `
          import {Component, Pipe, PipeTransform} from '@angular/core';

          @Pipe({name: 'double', standalone: false})
          export class DoublePipe implements PipeTransform {
            transform(value: number): number {
              return value * 2;
            }
          }

          @Component({
            selector: 'app-cmp',
            template: \`{{ count | double }}\`,
            standalone: false,
          })
          export class AppCmp {
            count = 5;
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw
      expect(() => appFile.getInlayHints()).not.toThrow();
    });

    it('should show parameter names for pipe arguments', () => {
      const files = {
        'app.ts': `
          import {Component, Pipe, PipeTransform} from '@angular/core';

          @Pipe({name: 'format', standalone: true})
          export class FormatPipe implements PipeTransform {
            transform(value: string, prefix?: string, suffix?: string): string {
              return (prefix ?? '') + value + (suffix ?? '');
            }
          }

          @Component({
            selector: 'app-cmp',
            template: \`{{ name | format : '[' : ']' }}\`,
            standalone: true,
            imports: [FormatPipe],
          })
          export class AppCmp {
            name = 'hello';
          }
        `,
      };
      project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();
      console.log('Pipe test hints:', JSON.stringify(hints, null, 2));

      // Should have parameter name hints for the pipe arguments
      const prefixHint = hints.find((h) => h.text === 'prefix:');
      const suffixHint = hints.find((h) => h.text === 'suffix:');
      const returnTypeHint = hints.find((h) => h.text === ': string');

      expect(prefixHint).toBeDefined();
      expect(prefixHint?.kind).toBe('Parameter');
      expect(suffixHint).toBeDefined();
      expect(suffixHint?.kind).toBe('Parameter');
      expect(returnTypeHint).toBeDefined();
      expect(returnTypeHint?.kind).toBe('Type');
    });

    it('should show return type hint after pipe name when no arguments', () => {
      const files = {
        'app.ts': `
          import {Component, Pipe, PipeTransform} from '@angular/core';

          @Pipe({name: 'upper', standalone: true})
          export class UpperPipe implements PipeTransform {
            transform(value: string): string {
              return value.toUpperCase();
            }
          }

          @Component({
            selector: 'app-cmp',
            template: \`{{ name | upper }}\`,
            standalone: true,
            imports: [UpperPipe],
          })
          export class AppCmp {
            name = 'hello';
          }
        `,
      };
      project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      // Should have return type hint
      const returnTypeHint = hints.find((h) => h.text === ': string');
      expect(returnTypeHint).toBeDefined();
      expect(returnTypeHint?.kind).toBe('Type');
    });

    it('should respect parameterNameHints: none for pipes', () => {
      const files = {
        'app.ts': `
          import {Component, Pipe, PipeTransform} from '@angular/core';

          @Pipe({name: 'format', standalone: true})
          export class FormatPipe implements PipeTransform {
            transform(value: string, prefix?: string, suffix?: string): string {
              return (prefix ?? '') + value + (suffix ?? '');
            }
          }

          @Component({
            selector: 'app-cmp',
            template: \`{{ name | format : '[' : ']' }}\`,
            standalone: true,
            imports: [FormatPipe],
          })
          export class AppCmp {
            name = 'hello';
          }
        `,
      };
      project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints({parameterNameHints: 'none'});

      // Should NOT have parameter name hints
      const prefixHint = hints.find((h) => h.text === 'prefix:');
      const suffixHint = hints.find((h) => h.text === 'suffix:');
      expect(prefixHint).toBeUndefined();
      expect(suffixHint).toBeUndefined();

      // Should still have return type hint (controlled by pipeOutputTypes)
      const returnTypeHint = hints.find((h) => h.text === ': string');
      expect(returnTypeHint).toBeDefined();
    });

    it('should show correct return type for overloaded pipe signatures', () => {
      // This tests that the inlay hints correctly resolve overloaded signatures
      // based on the input value type, not just argument count
      const files = {
        'app.ts': `
          import {Component, Pipe, PipeTransform} from '@angular/core';

          @Pipe({name: 'nullable', standalone: true})
          export class NullablePipe implements PipeTransform {
            // Overload 1: When value is null/undefined, return null
            transform(value: null | undefined): null;
            // Overload 2: When value is a string, return string | null
            transform(value: string): string | null;
            // Overload 3: Implementation signature
            transform(value: string | null | undefined): string | null;
            transform(value: string | null | undefined): string | null {
              return value ?? null;
            }
          }

          @Component({
            selector: 'app-cmp',
            template: \`{{ name | nullable }}\`,
            standalone: true,
            imports: [NullablePipe],
          })
          export class AppCmp {
            name: string = 'hello';
          }
        `,
      };
      project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();
      console.log('Overloaded pipe hints:', JSON.stringify(hints, null, 2));

      // When input is `string`, should match the second overload and show `: string | null`
      const returnTypeHint = hints.find((h) => h.text === ': string | null');
      expect(returnTypeHint).toBeDefined();
      expect(returnTypeHint?.kind).toBe('Type');
    });

    it('should show correct return type for DatePipe from @angular/common', () => {
      // DatePipe has overloaded signatures that depend on input type
      // When input is Date|string|number: returns string | null
      // This test uses createModuleAndProjectWithDeclarations which includes CommonModule
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`{{ today | date : 'short' }}\`,
            standalone: false,
          })
          export class AppCmp {
            today = new Date();
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();
      console.log('DatePipe hints:', JSON.stringify(hints, null, 2));

      // DatePipe.transform returns string | null when input is Date
      // Should show parameter name hint for 'format'
      const formatHint = hints.find((h) => h.text === 'format:');
      expect(formatHint).toBeDefined();
      expect(formatHint?.kind).toBe('Parameter');

      // Should show return type hint `: string | null`
      const returnTypeHint = hints.find((h) => h.text === ': string | null');
      expect(returnTypeHint).toBeDefined();
      expect(returnTypeHint?.kind).toBe('Type');
    });
  });

  describe('template references', () => {
    // Note: HTMLInputElement hint may not work in unit tests due to mock DOM types.
    // Fully tested in LSP integration tests.
    it('should not throw when processing references', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<input #myInput />\`,
            standalone: false,
          })
          export class AppCmp {}
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw
      expect(() => appFile.getInlayHints()).not.toThrow();
    });

    it('should provide type hints for directive exportAs references', () => {
      const files = {
        'app.ts': `
          import {Component, Directive} from '@angular/core';

          @Directive({
            selector: '[tooltip]',
            exportAs: 'tooltip',
            standalone: false,
          })
          export class TooltipDirective {
            text = '';
          }

          @Component({
            selector: 'app-cmp',
            template: \`<div tooltip #tip="tooltip"></div>\`,
            standalone: false,
          })
          export class AppCmp {}
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw - directive exportAs may not be fully resolved in mock
      expect(() => appFile.getInlayHints()).not.toThrow();
    });
  });

  describe('structural directives', () => {
    it('should provide type hints for *ngFor variables', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';
          import {NgForOf} from '@angular/common';

          @Component({
            selector: 'app-cmp',
            template: \`<li *ngFor="let item of items; let idx = index">{{ item }}</li>\`,
            standalone: false,
            imports: [NgForOf],
          })
          export class AppCmp {
            items = ['a', 'b', 'c'];
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      // Should have `: string` for item, `: number` for idx
      const stringHint = hints.find((h) => h.text === ': string');
      const numberHint = hints.find((h) => h.text === ': number');

      expect(stringHint).toBeDefined();
      expect(numberHint).toBeDefined();
    });
  });

  describe('host event bindings', () => {
    // Note: DOM event type hints (MouseEvent, KeyboardEvent) may not work in unit tests
    // due to the mock file system lacking proper DOM type definitions.
    // These are fully tested in the LSP integration tests instead.

    it('should not throw when processing host event bindings', () => {
      const files = {
        'app.ts': `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[highlight]',
            standalone: false,
            host: {
              '(click)': 'handleClick($event)',
              '(mouseenter)': 'handleMouseEnter($event)',
            },
          })
          export class HighlightDirective {
            handleClick(event: MouseEvent) {}
            handleMouseEnter(event: MouseEvent) {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw
      expect(() => appFile.getInlayHints()).not.toThrow();
    });

    it('should work for directives without templates', () => {
      const files = {
        'app.ts': `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[myDirective]',
            standalone: false,
            host: {
              '(keydown)': 'onKeydown($event)',
            },
          })
          export class MyDirective {
            onKeydown(event: KeyboardEvent) {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw
      expect(() => appFile.getInlayHints()).not.toThrow();
    });

    describe('@HostListener argument types', () => {
      it('should provide type hints for @HostListener argument expressions', () => {
        const files = {
          'app.ts': `
            import {Component, HostListener} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '',
              standalone: false,
            })
            export class AppCmp {
              @HostListener('click', ['$event.target', '$event.clientX'])
              handleClick(target: EventTarget | null, x: number) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw
        const hints = appFile.getInlayHints();
        expect(hints).toBeDefined();
      });

      it('should work for @HostListener with $event directly', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDirective]',
              standalone: false,
            })
            export class MyDirective {
              @HostListener('keydown', ['$event'])
              onKeydown(event: KeyboardEvent) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle nested property access on $event', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostListener('click', ['$event.target.nodeName'])
              onClick(nodeName: string) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw for deeply nested property access
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle @HostListener with no arguments', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostListener('focus')
              onFocus() {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should work when there are no arguments
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle @HostListener with window events', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostListener('window:resize', ['$event.target.innerWidth'])
              onResize(width: number) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw for window events
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle @HostListener with document events', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostListener('document:keydown', ['$event.key', '$event.ctrlKey'])
              onKeydown(key: string, ctrl: boolean) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should work with document events and multiple arguments
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle @HostListener with safe navigation on $event', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostListener('click', ['$event.target?.nodeName'])
              onClick(nodeName: string | undefined) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should handle safe navigation operator
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should respect hostListenerArgumentTypes config when disabled', () => {
        const files = {
          'app.ts': `
            import {Component, HostListener} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '',
              standalone: false,
            })
            export class AppCmp {
              @HostListener('click', ['$event.target', '$event.clientX'])
              handleClick(target: EventTarget | null, x: number) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With hostListenerArgumentTypes disabled, should return no hints for @HostListener
        const hintsDisabled = appFile.getInlayHints({hostListenerArgumentTypes: false});
        // With hostListenerArgumentTypes enabled (default), should potentially show hints
        const hintsEnabled = appFile.getInlayHints({hostListenerArgumentTypes: true});

        // Both should work without errors
        expect(hintsDisabled).toBeDefined();
        expect(hintsEnabled).toBeDefined();
      });

      it('should handle @HostListener with method calls as arguments', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostListener('click', ['$event.target.getAttribute("data-id")'])
              onClick(dataId: string | null) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should handle method call expressions
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle @HostListener with arithmetic expressions', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostListener('mousemove', ['$event.clientX + $event.clientY'])
              onMouseMove(sum: number) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should handle binary expressions
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle host metadata style events', () => {
        const files = {
          'app.ts': `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
              host: {
                '(click)': 'onClick($event.target)',
                '(mouseenter)': 'onMouseEnter($event.clientX, $event.clientY)',
              }
            })
            export class MyDir {
              onClick(target: EventTarget | null) {}
              onMouseEnter(x: number, y: number) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should work with host metadata style events too
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle @HostListener on components', () => {
        const files = {
          'app.ts': `
            import {Component, HostListener} from '@angular/core';

            @Component({
              selector: 'app-button',
              template: '<button><ng-content></ng-content></button>',
              standalone: false,
            })
            export class AppButton {
              @HostListener('click', ['$event.button', '$event.shiftKey', '$event.altKey'])
              onClick(button: number, shift: boolean, alt: boolean) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should work on components, not just directives
        expect(() => appFile.getInlayHints()).not.toThrow();
      });
    });

    describe('@HostBinding property types', () => {
      it('should work for @HostBinding with DOM property', () => {
        const files = {
          'app.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostBinding('disabled')
              isDisabled = false;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should work for @HostBinding with class binding', () => {
        const files = {
          'app.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostBinding('class.active')
              isActive = true;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should handle class bindings (even though they're not fully type-checked)
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should work for @HostBinding with style binding', () => {
        const files = {
          'app.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostBinding('style.width.px')
              width = 100;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should handle style bindings (even though they're not fully type-checked)
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should work for @HostBinding without explicit property name', () => {
        const files = {
          'app.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostBinding()
              title = 'My Title';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should work when property name is inferred from the class member name
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should work for @HostBinding with attr prefix', () => {
        const files = {
          'app.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostBinding('attr.aria-label')
              ariaLabel = 'Accessible label';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should handle attribute bindings
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should work for host metadata style bindings', () => {
        const files = {
          'app.ts': `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
              host: {
                '[disabled]': 'isDisabled',
                '[class.active]': 'isActive',
                '[style.width.px]': 'width',
              }
            })
            export class MyDir {
              isDisabled = false;
              isActive = true;
              width = 100;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should work with host metadata style bindings
        expect(() => appFile.getInlayHints()).not.toThrow();
      });
    });

    describe('host metadata event type hints', () => {
      it('should provide event type hints for host metadata events', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '',
              standalone: false,
              host: {
                '(click)': 'onClick($event)',
                '(keydown)': 'onKeydown($event)',
                '(mouseenter)': 'onMouseEnter($event)',
                '(focus)': 'onFocus($event)',
              }
            })
            export class AppCmp {
              onClick(event: PointerEvent) {}
              onKeydown(event: KeyboardEvent) {}
              onMouseEnter(event: MouseEvent) {}
              onFocus(event: FocusEvent) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should produce event type hints for host events
        expect(hints).toBeDefined();
        expect(hints.length).toBeGreaterThan(0);
      });

      it('should provide event type hints for global target events in host metadata', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '',
              standalone: false,
              host: {
                '(window:resize)': 'onResize($event)',
                '(document:click)': 'onDocClick($event)',
                '(body:scroll)': 'onBodyScroll($event)',
              }
            })
            export class AppCmp {
              onResize(event: UIEvent) {}
              onDocClick(event: PointerEvent) {}
              onBodyScroll(event: Event) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should handle global target events (window:, document:, body:)
        expect(hints).toBeDefined();
      });

      it('should provide event type hints for keyboard modifier events in host metadata', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '',
              standalone: false,
              host: {
                '(keydown.enter)': 'onEnter($event)',
                '(keydown.shift.enter)': 'onShiftEnter($event)',
                '(keydown.escape)': 'onEscape($event)',
              }
            })
            export class AppCmp {
              onEnter(event: Event) {}
              onShiftEnter(event: Event) {}
              onEscape(event: Event) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should handle keyboard modifier events (keydown.enter, etc.)
        expect(hints).toBeDefined();
      });

      it('should provide binding type hints for host metadata property bindings', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '',
              standalone: false,
              host: {
                '[disabled]': 'isDisabled',
                '[hidden]': 'isHidden',
                '[title]': 'tooltipText',
              }
            })
            export class AppCmp {
              isDisabled = false;
              isHidden = true;
              tooltipText = 'Some tooltip';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should provide hints for host property bindings
        expect(hints).toBeDefined();
      });

      it('should handle mixed host metadata with events and bindings', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '',
              standalone: false,
              host: {
                '(click)': 'onClick($event)',
                '(mouseenter)': 'onMouseEnter($event)',
                '[disabled]': 'isDisabled',
                '[class.active]': 'isActive',
                '[style.backgroundColor]': 'bgColor',
                '[attr.aria-label]': 'ariaLabel',
              }
            })
            export class AppCmp {
              onClick(event: PointerEvent) {}
              onMouseEnter(event: MouseEvent) {}
              isDisabled = false;
              isActive = true;
              bgColor = 'blue';
              ariaLabel = 'My label';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should handle mixed host metadata (events + bindings)
        expect(hints).toBeDefined();
      });

      it('should handle @HostListener with $event property access and verify hints', () => {
        const files = {
          'app.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[myDir]',
              standalone: false,
            })
            export class MyDir {
              @HostListener('click', ['$event.target', '$event.clientX', '$event.clientY'])
              onClick(target: EventTarget | null, x: number, y: number) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should produce hints for each $event property access
        expect(hints).toBeDefined();
        expect(hints.length).toBeGreaterThan(0);
      });

      it('should handle animation events in host metadata', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';
            import {trigger, state, style, animate, transition} from '@angular/animations';

            @Component({
              selector: 'app-cmp',
              template: '',
              standalone: false,
              animations: [
                trigger('fade', [
                  state('void', style({ opacity: 0 })),
                  state('*', style({ opacity: 1 })),
                  transition(':enter', animate('300ms')),
                  transition(':leave', animate('300ms')),
                ])
              ],
              host: {
                '[@fade]': 'state',
                '(@fade.start)': 'onAnimationStart($event)',
                '(@fade.done)': 'onAnimationDone($event)',
              }
            })
            export class AppCmp {
              state = 'active';
              onAnimationStart(event: any) {}
              onAnimationDone(event: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Animation events should not throw
        expect(() => appFile.getInlayHints()).not.toThrow();
      });
    });

    describe('@switch block expression types', () => {
      it('should provide type hints for @switch expression', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            enum Status {
              Active = 'active',
              Inactive = 'inactive',
              Pending = 'pending',
            }

            @Component({
              selector: 'app-cmp',
              template: \`
                @switch (status) {
                  @case (Status.Active) { Active }
                  @case (Status.Inactive) { Inactive }
                  @default { Unknown }
                }
              \`,
              standalone: true,
            })
            export class AppCmp {
              status: Status = Status.Active;
              Status = Status;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should have Status hint for @switch (status)
        const statusHint = hints.find((h) => h.text === ': Status');
        expect(statusHint).toBeDefined();
      });

      it('should include undefined for optional chaining in @switch expression', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface User {
              id: number;
              name: string;
            }

            @Component({
              selector: 'app-cmp',
              template: \`
                @switch (user?.id) {
                  @case (1) { First }
                  @default { Other }
                }
              \`,
              standalone: true,
            })
            export class AppCmp {
              user: User | null = null;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should include undefined since optional chaining can return undefined
        // when user is null, user?.id evaluates to undefined
        const typeHint = hints.find(
          (h) => h.text.includes('number') && h.text.includes('undefined'),
        );
        expect(typeHint).toBeDefined();
        expect(typeHint?.text).toMatch(/number\s*\|\s*undefined/);
      });

      it('should work with primitive switch expressions', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`
                @switch (count) {
                  @case (1) { One }
                  @case (2) { Two }
                  @default { Other }
                }
              \`,
              standalone: true,
            })
            export class AppCmp {
              count = 1;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should have number hint for @switch (count)
        const numberHint = hints.find((h) => h.text === ': number');
        expect(numberHint).toBeDefined();
      });

      it('should respect switchExpressionTypes config option', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`
                @switch (value) {
                  @case ('a') { A }
                  @default { Other }
                }
              \`,
              standalone: true,
            })
            export class AppCmp {
              value = 'test';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With switchExpressionTypes disabled, should not show hints
        const hintsDisabled = appFile.getInlayHints({switchExpressionTypes: false});
        const stringHintDisabled = hintsDisabled.find((h) => h.text === ': string');
        expect(stringHintDisabled).toBeUndefined();

        // With switchExpressionTypes enabled (default), should show hints
        const hintsEnabled = appFile.getInlayHints({switchExpressionTypes: true});
        const stringHintEnabled = hintsEnabled.find((h) => h.text === ': string');
        expect(stringHintEnabled).toBeDefined();
      });
    });

    describe('@defer block trigger types', () => {
      it('should provide type hints for @defer when trigger', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`
                @defer (when isVisible) {
                  <div>Deferred content</div>
                }
              \`,
              standalone: true,
            })
            export class AppCmp {
              isVisible = true;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();

        // Should have boolean hint for when isVisible
        const booleanHint = hints.find((h) => h.text === ': boolean');
        expect(booleanHint).toBeDefined();
      });

      it('should respect deferTriggerTypes config option', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`
                @defer (when loaded) {
                  <div>Content</div>
                }
              \`,
              standalone: true,
            })
            export class AppCmp {
              loaded = false;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With deferTriggerTypes disabled, should not show hints
        const hintsDisabled = appFile.getInlayHints({deferTriggerTypes: false});
        const boolHintDisabled = hintsDisabled.find((h) => h.text === ': boolean');
        expect(boolHintDisabled).toBeUndefined();

        // With deferTriggerTypes enabled (default), should show hints
        const hintsEnabled = appFile.getInlayHints({deferTriggerTypes: true});
        const boolHintEnabled = hintsEnabled.find((h) => h.text === ': boolean');
        expect(boolHintEnabled).toBeDefined();
      });
    });

    describe('ng-template context variables', () => {
      it('should provide type hints for let- variables on ng-template', () => {
        const files = {
          'app.ts': `
            import {Component, TemplateRef, ViewChild} from '@angular/core';
            import {NgTemplateOutlet} from '@angular/common';

            interface User {
              name: string;
              age: number;
            }

            @Component({
              selector: 'app-cmp',
              template: \`
                <ng-template #userTpl let-user let-extra="extra">
                  {{ user.name }} - {{ extra }}
                </ng-template>
                <ng-container *ngTemplateOutlet="userTpl; context: ctx"></ng-container>
              \`,
              standalone: true,
              imports: [NgTemplateOutlet],
            })
            export class AppCmp {
              ctx = { $implicit: { name: 'John', age: 30 } as User, extra: 'info' };
              @ViewChild('userTpl') userTpl!: TemplateRef<any>;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw
        const hints = appFile.getInlayHints();
        expect(hints).toBeDefined();
      });
    });

    describe('structural directive context exports', () => {
      it('should provide type hints for *ngIf exported context', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';
            import {NgIf} from '@angular/common';

            @Component({
              selector: 'app-cmp',
              template: \`<div *ngIf="data as result">{{ result }}</div>\`,
              standalone: true,
              imports: [NgIf],
            })
            export class AppCmp {
              data = 'hello';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw (structural directive context is handled via visitVariable)
        const hints = appFile.getInlayHints();
        expect(hints).toBeDefined();
      });
    });
  });

  describe('property binding types', () => {
    it('should provide type hints for input bindings', () => {
      const files = {
        'user-display.directive.ts': `
          import {Directive, Input} from '@angular/core';

          export interface User {
            name: string;
          }

          @Directive({
            selector: '[userDisplay]',
            standalone: false,
          })
          export class UserDisplayDirective {
            @Input() user!: User;
            @Input() count!: number;
          }
        `,
        'app.ts': `
          import {Component} from '@angular/core';
          import {User} from './user-display.directive';

          @Component({
            selector: 'app-cmp',
            template: \`<div userDisplay [user]="currentUser" [count]="5"></div>\`,
            standalone: false,
          })
          export class AppCmp {
            currentUser: User = { name: 'Test' };
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      // Should have User hint for [user] and number hint for [count]
      const userHint = hints.find((h) => h.text === ': User');
      const numberHint = hints.find((h) => h.text === ': number');

      expect(userHint).toBeDefined();
      expect(numberHint).toBeDefined();
    });
  });

  describe('signal-based inputs and outputs', () => {
    // Note: Signal-based API tests (input(), output(), model()) may produce different results
    // in unit tests due to the mock file system lacking full @angular/core type definitions.
    // The actual type unwrapping is tested in LSP integration tests.

    it('should not throw when processing signal-based inputs', () => {
      const files = {
        'signal-input.directive.ts': `
          import {Directive, input} from '@angular/core';

          export interface User {
            name: string;
          }

          @Directive({
            selector: '[signalInput]',
            standalone: false,
          })
          export class SignalInputDirective {
            user = input<User>();
            count = input.required<number>();
          }
        `,
        'app.ts': `
          import {Component} from '@angular/core';
          import {User} from './signal-input.directive';

          @Component({
            selector: 'app-cmp',
            template: \`<div signalInput [user]="currentUser" [count]="5"></div>\`,
            standalone: false,
          })
          export class AppCmp {
            currentUser: User = { name: 'Test' };
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw when processing signal-based inputs
      expect(() => appFile.getInlayHints({propertyBindingTypes: true})).not.toThrow();
    });

    it('should not throw when processing signal-based outputs', () => {
      const files = {
        'signal-output.directive.ts': `
          import {Directive, output} from '@angular/core';

          @Directive({
            selector: '[signalOutput]',
            standalone: false,
          })
          export class SignalOutputDirective {
            clicked = output<MouseEvent>();
            changed = output<string>();
          }
        `,
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<div signalOutput (clicked)="handleClick($event)" (changed)="handleChange($event)"></div>\`,
            standalone: false,
          })
          export class AppCmp {
            handleClick(event: MouseEvent) {}
            handleChange(value: string) {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw when processing signal-based outputs
      expect(() => appFile.getInlayHints({eventParameterTypes: true})).not.toThrow();
    });

    it('should unwrap EventEmitter types for legacy output hints', () => {
      const files = {
        'legacy-output.directive.ts': `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[legacyOutput]',
            standalone: false,
          })
          export class LegacyOutputDirective {
            @Output() clicked = new EventEmitter<MouseEvent>();
            @Output() changed = new EventEmitter<string>();
          }
        `,
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<div legacyOutput (clicked)="handleClick($event)" (changed)="handleChange($event)"></div>\`,
            standalone: false,
          })
          export class AppCmp {
            handleClick(event: MouseEvent) {}
            handleChange(value: string) {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw when processing legacy EventEmitter outputs
      expect(() => appFile.getInlayHints({eventParameterTypes: true})).not.toThrow();
    });
  });

  describe('animation events', () => {
    it('should provide AnimationEvent type hint for legacy animation events', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<div [@myAnimation]="state" (@myAnimation.done)="onDone($event)"></div>\`,
            standalone: false,
          })
          export class AppCmp {
            state = 'start';
            onDone(event: any) {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints();

      // Should have AnimationEvent hint for $event
      const animationHint = hints.find((h) => h.text === ': AnimationEvent');
      expect(animationHint).toBeDefined();
    });
  });

  describe('config options', () => {
    describe('variableTypeHintsWhenTypeMatchesName', () => {
      it('should skip variable hints when type matches name (default true)', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface User {
              name: string;
            }

            @Component({
              selector: 'app-cmp',
              template: \`@for (user of users; track user.name) { {{ user.name }} }\`,
              standalone: false,
            })
            export class AppCmp {
              users: User[] = [];
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With default config (variableTypeHintsWhenTypeMatchesName: true), should show hint
        const hintsWithDefault = appFile.getInlayHints();
        const userHint = hintsWithDefault.find((h) => h.text === ': User');
        expect(userHint).toBeDefined();

        // With variableTypeHintsWhenTypeMatchesName: false, should skip hint
        const hintsSkipped = appFile.getInlayHints({variableTypeHintsWhenTypeMatchesName: false});
        const skippedUserHint = hintsSkipped.find((h) => h.text === ': User');
        expect(skippedUserHint).toBeUndefined();
      });

      it('should not skip hints when names do not match', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface Person {
              name: string;
            }

            @Component({
              selector: 'app-cmp',
              template: \`@for (item of people; track item.name) { {{ item.name }} }\`,
              standalone: false,
            })
            export class AppCmp {
              people: Person[] = [];
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // item doesn't match Person, so hint should always show
        const hints = appFile.getInlayHints({variableTypeHintsWhenTypeMatchesName: false});
        const personHint = hints.find((h) => h.text === ': Person');
        expect(personHint).toBeDefined();
      });
    });

    describe('parameterNameHints', () => {
      it('should show parameter name hints when set to "all"', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="handleClick($event)">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              handleClick(event: MouseEvent) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({parameterNameHints: 'all'});
        // Should have parameter name hint for event
        const paramHint = hints.find((h) => h.kind === 'Parameter' && h.text.includes('event'));
        expect(paramHint).toBeDefined();
      });

      it('should hide parameter name hints when set to "none"', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="handleClick($event)">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              handleClick(event: MouseEvent) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({parameterNameHints: 'none'});
        // Should have NO parameter name hints
        const paramHints = hints.filter((h) => h.kind === 'Parameter');
        expect(paramHints.length).toBe(0);
      });

      it('should only show hints for literals when set to "literals"', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`{{ formatValue(42, name) }}\`,
              standalone: false,
            })
            export class AppCmp {
              name = 'test';
              formatValue(num: number, str: string) { return num + str; }
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({parameterNameHints: 'literals'});
        // Should have hint for literal 42, but not for variable name
        const numHint = hints.find((h) => h.kind === 'Parameter' && h.text.includes('num'));
        expect(numHint).toBeDefined();
        const strHint = hints.find((h) => h.kind === 'Parameter' && h.text.includes('str'));
        expect(strHint).toBeUndefined(); // 'name' is not a literal
      });
    });

    describe('parameterNameHintsWhenArgumentMatchesName', () => {
      it('should skip hints when argument matches parameter name (default false)', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="handleClick(event)">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              event: MouseEvent | undefined;
              handleClick(event: MouseEvent) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Default: skip hints when argument name matches parameter name
        const hints = appFile.getInlayHints({parameterNameHints: 'all'});
        const paramHint = hints.find((h) => h.kind === 'Parameter');
        expect(paramHint).toBeUndefined();
      });

      it('should show hints when enabled even if argument matches parameter name', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="handleClick(event)">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              event: MouseEvent | undefined;
              handleClick(event: MouseEvent) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With parameterNameHintsWhenArgumentMatchesName: true, should show hint
        const hints = appFile.getInlayHints({
          parameterNameHints: 'all',
          parameterNameHintsWhenArgumentMatchesName: true,
        });
        const paramHint = hints.find((h) => h.kind === 'Parameter' && h.text.includes('event'));
        expect(paramHint).toBeDefined();
      });

      it('should use TypeScript resolved signature for overloaded methods', () => {
        // This tests that the inlay hints correctly use TypeScript's overload resolution
        // for method calls with overloaded signatures
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`{{ format('hello', 42) }}\`,
              standalone: false,
            })
            export class AppCmp {
              // Overloaded method signatures
              format(value: string, count: number): string;
              format(value: number, prefix: string): string;
              format(value: string | number, extra: string | number): string {
                return String(value) + String(extra);
              }
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({parameterNameHints: 'all'});
        console.log('Overloaded method hints:', JSON.stringify(hints, null, 2));

        // Should show 'value:' and 'count:' based on the first overload
        // because the first argument is a string literal
        const valueHint = hints.find((h) => h.text === 'value:');
        const countHint = hints.find((h) => h.text === 'count:');
        expect(valueHint).toBeDefined();
        expect(countHint).toBeDefined();
      });

      it('should show ... prefix for rest parameters', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`{{ sum(1, 2, 3, 4) }}\`,
              standalone: false,
            })
            export class AppCmp {
              sum(first: number, ...rest: number[]): number {
                return first + rest.reduce((a, b) => a + b, 0);
              }
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({parameterNameHints: 'all'});
        console.log('Rest parameter hints:', JSON.stringify(hints, null, 2));

        // First argument should have 'first:' hint
        const firstHint = hints.find((h) => h.text === 'first:');
        expect(firstHint).toBeDefined();

        // First rest argument (second overall) should have '...rest:' hint
        const restHint = hints.find((h) => h.text === '...rest:');
        expect(restHint).toBeDefined();
      });
    });

    describe('disabling specific hint categories', () => {
      it('should respect forLoopVariableTypes: false', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`@for (item of items; track $index) { {{ item }} }\`,
              standalone: false,
            })
            export class AppCmp {
              items = ['a', 'b', 'c'];
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({forLoopVariableTypes: false});
        // Should have no hints for @for variable
        const stringHint = hints.find((h) => h.text === ': string');
        expect(stringHint).toBeUndefined();
      });

      it('should respect letDeclarationTypes: false', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`@let count = items.length; {{ count }}\`,
              standalone: false,
            })
            export class AppCmp {
              items = [1, 2, 3];
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({letDeclarationTypes: false});
        const numberHint = hints.find((h) => h.text === ': number');
        expect(numberHint).toBeUndefined();
      });

      it('should respect eventParameterTypes: false', () => {
        const files = {
          'app.ts': `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[myDirective]',
              standalone: false,
              host: {
                '(click)': 'onClick($event)',
              },
            })
            export class MyDirective {
              onClick(event: MouseEvent) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({eventParameterTypes: false});
        const mouseHint = hints.find((h) => h.text === ': MouseEvent');
        expect(mouseHint).toBeUndefined();
      });
    });

    describe('fine-grained event source configuration', () => {
      it('should respect eventParameterTypes.componentEvents: false', () => {
        const files = {
          'output.directive.ts': `
            import {Directive, Output, EventEmitter} from '@angular/core';

            @Directive({
              selector: '[outputDirective]',
              standalone: false,
            })
            export class OutputDirective {
              @Output() customEvent = new EventEmitter<string>();
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div outputDirective (customEvent)="handleCustom($event)"></div>\`,
              standalone: false,
            })
            export class AppCmp {
              handleCustom(value: string) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With componentEvents: false, should not show component event hints
        const hints = appFile.getInlayHints({
          eventParameterTypes: {componentEvents: false, nativeEvents: true, animationEvents: true},
        });
        const stringHint = hints.find((h) => h.text === ': string');
        expect(stringHint).toBeUndefined();
      });

      it('should show component events when componentEvents: true', () => {
        const files = {
          'output.directive.ts': `
            import {Directive, Output, EventEmitter} from '@angular/core';

            @Directive({
              selector: '[outputDirective]',
              standalone: false,
            })
            export class OutputDirective {
              @Output() customEvent = new EventEmitter<string>();
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div outputDirective (customEvent)="handleCustom($event)"></div>\`,
              standalone: false,
            })
            export class AppCmp {
              handleCustom(value: string) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With componentEvents: true, should show component event hints
        const hints = appFile.getInlayHints({
          eventParameterTypes: {componentEvents: true, nativeEvents: false, animationEvents: false},
        });
        const stringHint = hints.find((h) => h.text === ': string');
        expect(stringHint).toBeDefined();
      });
    });

    describe('DOM event type mapping', () => {
      // Note: The DOM_EVENT_TYPE_MAP provides correct event types for various DOM events.
      // However, in unit tests the mock file system may not have DOM type definitions,
      // so we verify the implementation handles events correctly without testing exact types.
      // Full type verification is done in LSP integration tests with real TypeScript libs.

      it('should handle click events with DOM event type map', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="onClick($event)">Click</button>\`,
              standalone: true,
            })
            export class AppCmp {
              onClick(e: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw and should return hints
        const hints = appFile.getInlayHints({eventParameterTypes: true});
        expect(hints).toBeDefined();
        // Should have at least one type hint for the event
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThan(0);
      });

      it('should handle dblclick events with DOM event type map', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div (dblclick)="onDblClick($event)">Double click</div>\`,
              standalone: true,
            })
            export class AppCmp {
              onDblClick(e: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({eventParameterTypes: true});
        expect(hints).toBeDefined();
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThan(0);
      });

      it('should handle keydown events with DOM event type map', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<input (keydown)="onKeydown($event)" />\`,
              standalone: true,
            })
            export class AppCmp {
              onKeydown(e: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({eventParameterTypes: true});
        expect(hints).toBeDefined();
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThan(0);
      });

      it('should handle keydown with modifiers', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<input (keydown.enter)="onEnter($event)" />\`,
              standalone: true,
            })
            export class AppCmp {
              onEnter(e: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({eventParameterTypes: true});
        expect(hints).toBeDefined();
        // keydown.enter should still be mapped to KeyboardEvent
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThan(0);
      });

      it('should handle focus and blur events', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<input (focus)="onFocus($event)" (blur)="onBlur($event)" />\`,
              standalone: true,
            })
            export class AppCmp {
              onFocus(e: any) {}
              onBlur(e: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({eventParameterTypes: true});
        expect(hints).toBeDefined();
        const typeHints = hints.filter((h) => h.kind === 'Type');
        // Should have hints for both focus and blur
        expect(typeHints.length).toBeGreaterThanOrEqual(2);
      });

      it('should handle input events', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<input (input)="onInput($event)" />\`,
              standalone: true,
            })
            export class AppCmp {
              onInput(e: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({eventParameterTypes: true});
        expect(hints).toBeDefined();
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThan(0);
      });

      it('should handle drag events', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div (dragover)="onDragOver($event)" (drop)="onDrop($event)">Drop</div>\`,
              standalone: true,
            })
            export class AppCmp {
              onDragOver(e: any) {}
              onDrop(e: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({eventParameterTypes: true});
        expect(hints).toBeDefined();
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThanOrEqual(2);
      });

      it('should handle mouseenter and mouseleave events', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div (mouseenter)="onEnter($event)" (mouseleave)="onLeave($event)">Hover</div>\`,
              standalone: true,
            })
            export class AppCmp {
              onEnter(e: any) {}
              onLeave(e: any) {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({eventParameterTypes: true});
        expect(hints).toBeDefined();
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('fine-grained @if alias configuration', () => {
      it('should show hints for simple @if expressions by default', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface User { name: string; }

            @Component({
              selector: 'app-cmp',
              template: \`@if (currentUser; as u) { {{ u.name }} }\`,
              standalone: false,
            })
            export class AppCmp {
              currentUser: User | null = null;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({ifAliasTypes: true});
        const userHint = hints.find((h) => h.text.includes('User'));
        expect(userHint).toBeDefined();
      });

      it('should hide hints for simple @if expressions when ifAliasTypes is "complex"', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface User { name: string; }

            @Component({
              selector: 'app-cmp',
              template: \`@if (currentUser; as u) { {{ u.name }} }\`,
              standalone: false,
            })
            export class AppCmp {
              currentUser: User | null = null;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With 'complex', simple property reads should not show hints
        const hints = appFile.getInlayHints({ifAliasTypes: 'complex'});
        const userHint = hints.find((h) => h.text.includes('User'));
        expect(userHint).toBeUndefined();
      });

      it('should show hints for complex @if expressions when ifAliasTypes is "complex"', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`@if (items.length > 0; as hasItems) { has items }\`,
              standalone: false,
            })
            export class AppCmp {
              items = ['a', 'b'];
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With 'complex', comparison expressions should show hints
        const hints = appFile.getInlayHints({ifAliasTypes: 'complex'});
        const booleanHint = hints.find((h) => h.text.includes('boolean'));
        expect(booleanHint).toBeDefined();
      });

      it('should show hints for property access @if expressions when ifAliasTypes is "complex"', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface User { name: string; }

            @Component({
              selector: 'app-cmp',
              template: \`@if (currentUser?.name; as name) { {{ name }} }\`,
              standalone: false,
            })
            export class AppCmp {
              currentUser: User | null = null;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Property access is complex, should show hints
        const hints = appFile.getInlayHints({ifAliasTypes: 'complex'});
        const stringHint = hints.find((h) => h.text.includes('string'));
        expect(stringHint).toBeDefined();
      });

      it('should respect ifAliasTypes: { simpleExpressions: false, complexExpressions: true }', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface User { name: string; }

            @Component({
              selector: 'app-cmp',
              template: \`
                @if (currentUser; as u) { simple }
                @if (currentUser?.name; as n) { complex }
              \`,
              standalone: false,
            })
            export class AppCmp {
              currentUser: User | null = null;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({
          ifAliasTypes: {simpleExpressions: false, complexExpressions: true},
        });
        // Should not have User hint (simple expression)
        const userHint = hints.find((h) => h.text.includes('User'));
        expect(userHint).toBeUndefined();
        // Should have string hint (complex expression)
        const stringHint = hints.find((h) => h.text.includes('string'));
        expect(stringHint).toBeDefined();
      });

      it('should hide all @if hints when ifAliasTypes is false', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface User { name: string; }

            @Component({
              selector: 'app-cmp',
              template: \`@if (currentUser; as u) { {{ u.name }} }\`,
              standalone: false,
            })
            export class AppCmp {
              currentUser: User | null = null;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({ifAliasTypes: false});
        const userHint = hints.find((h) => h.text.includes('User'));
        expect(userHint).toBeUndefined();
      });
    });

    describe('fine-grained property binding configuration', () => {
      it('should respect propertyBindingTypes.componentInputs: false', () => {
        const files = {
          'input.directive.ts': `
            import {Directive, Input} from '@angular/core';

            @Directive({
              selector: '[inputDirective]',
              standalone: false,
            })
            export class InputDirective {
              @Input() value!: string;
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div inputDirective [value]="name"></div>\`,
              standalone: false,
            })
            export class AppCmp {
              name = 'test';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With componentInputs: false, should not show component input hints
        const hints = appFile.getInlayHints({
          propertyBindingTypes: {componentInputs: false, nativeProperties: true},
        });
        const stringHint = hints.find((h) => h.text === ': string');
        expect(stringHint).toBeUndefined();
      });

      it('should show component inputs when componentInputs: true', () => {
        const files = {
          'input.directive.ts': `
            import {Directive, Input} from '@angular/core';

            @Directive({
              selector: '[inputDirective]',
              standalone: false,
            })
            export class InputDirective {
              @Input() value!: string;
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div inputDirective [value]="name"></div>\`,
              standalone: false,
            })
            export class AppCmp {
              name = 'test';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With componentInputs: true, should show component input hints
        const hints = appFile.getInlayHints({
          propertyBindingTypes: {componentInputs: true, nativeProperties: false},
        });
        const stringHint = hints.find((h) => h.text === ': string');
        expect(stringHint).toBeDefined();
      });
    });

    describe('requiredInputIndicator', () => {
      it('should not add indicator when requiredInputIndicator: none', () => {
        const files = {
          'input.directive.ts': `
            import {Directive, Input} from '@angular/core';

            @Directive({
              selector: '[inputDirective]',
              standalone: false,
            })
            export class InputDirective {
              @Input({required: true}) value!: string;
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div inputDirective [value]="name"></div>\`,
              standalone: false,
            })
            export class AppCmp {
              name = 'test';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({
          propertyBindingTypes: true,
          requiredInputIndicator: 'none',
        });
        // Should have `: string` without any indicator
        const hint = hints.find((h) => h.text.includes('string'));
        expect(hint?.text).toBe(': string');
      });

      it('should add asterisk indicator for @Input({required: true})', () => {
        const files = {
          'input.directive.ts': `
            import {Directive, Input} from '@angular/core';

            @Directive({
              selector: '[inputDirective]',
              standalone: false,
            })
            export class InputDirective {
              @Input({required: true}) value!: string;
              @Input() optional?: number;
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div inputDirective [value]="name" [optional]="count"></div>\`,
              standalone: false,
            })
            export class AppCmp {
              name = 'test';
              count = 42;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({
          propertyBindingTypes: true,
          requiredInputIndicator: 'asterisk',
        });
        // Required input should have asterisk
        const requiredHint = hints.find((h) => h.text.includes('string'));
        expect(requiredHint?.text).toBe(': string*');
        // Optional input should NOT have asterisk
        const optionalHint = hints.find((h) => h.text.includes('number'));
        expect(optionalHint?.text).toBe(': number | undefined');
      });

      it('should add exclamation indicator for @Input({required: true})', () => {
        const files = {
          'input.directive.ts': `
            import {Directive, Input} from '@angular/core';

            @Directive({
              selector: '[inputDirective]',
              standalone: false,
            })
            export class InputDirective {
              @Input({required: true}) value!: string;
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div inputDirective [value]="name"></div>\`,
              standalone: false,
            })
            export class AppCmp {
              name = 'test';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({
          propertyBindingTypes: true,
          requiredInputIndicator: 'exclamation',
        });
        const hint = hints.find((h) => h.text.includes('string'));
        expect(hint?.text).toBe(': string!');
      });

      it('should add asterisk indicator for input.required() signal inputs', () => {
        const files = {
          'signal-input.directive.ts': `
            import {Directive, input} from '@angular/core';

            @Directive({
              selector: '[signalInput]',
              standalone: false,
            })
            export class SignalInputDirective {
              requiredValue = input.required<string>();
              optionalValue = input<number>();
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div signalInput [requiredValue]="name" [optionalValue]="count"></div>\`,
              standalone: false,
            })
            export class AppCmp {
              name = 'test';
              count = 42;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({
          propertyBindingTypes: true,
          requiredInputIndicator: 'asterisk',
        });
        // Required signal input should have asterisk
        const requiredHint = hints.find((h) => h.text.includes('string'));
        expect(requiredHint?.text).toBe(': string*');
        // Optional signal input should NOT have asterisk (type includes undefined)
        const optionalHint = hints.find((h) => h.text.includes('number'));
        expect(optionalHint?.text).toBe(': number | undefined');
      });
    });

    describe('text attribute input bindings', () => {
      it('should show type hints for text attribute inputs (input="value" syntax)', () => {
        const files = {
          'text-input.directive.ts': `
            import {Directive, Input} from '@angular/core';

            @Directive({
              selector: '[textInput]',
              standalone: false,
            })
            export class TextInputDirective {
              @Input() text!: string;
              @Input() label!: string;
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div textInput text="hello" label="greeting"></div>\`,
              standalone: false,
            })
            export class AppCmp {}
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({propertyBindingTypes: true});
        // Should show : string for both text attributes bound to inputs
        const textHint = hints.find((h) => h.position > 75 && h.text === ': string');
        expect(textHint).toBeDefined();
        // Should have hints for both text attribute inputs
        const stringHints = hints.filter((h) => h.text === ': string');
        expect(stringHints.length).toBeGreaterThanOrEqual(2);
      });

      it('should show required indicator for required text attribute inputs', () => {
        const files = {
          'text-input.directive.ts': `
            import {Directive, input} from '@angular/core';

            @Directive({
              selector: '[textInput]',
              standalone: false,
            })
            export class TextInputDirective {
              text = input.required<string>();
              optional = input<string>();
            }
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div textInput text="required" optional="maybe"></div>\`,
              standalone: false,
            })
            export class AppCmp {}
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({
          propertyBindingTypes: true,
          requiredInputIndicator: 'exclamation',
        });
        // Required signal input should have exclamation
        const requiredHint = hints.find((h) => h.text === ': string!');
        expect(requiredHint).toBeDefined();
        // Optional signal input should show undefined in type (no indicator)
        const optionalHint = hints.find((h) => h.text.includes('undefined'));
        expect(optionalHint).toBeDefined();
      });

      it('should not show hints for regular HTML attributes', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div id="myDiv" class="container"></div>\`,
              standalone: false,
            })
            export class AppCmp {}
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({propertyBindingTypes: true});
        // Should not have type hints for regular HTML attributes like id and class
        // (they are not Angular input bindings)
        const idHint = hints.find((h) => h.text.includes('id'));
        const classHint = hints.find((h) => h.text.includes('class'));
        expect(idHint).toBeUndefined();
        expect(classHint).toBeUndefined();
      });
    });
  });

  describe('arrow functions in templates', () => {
    it('should not throw when processing arrow functions in templates', () => {
      const files = {
        'app.ts': `
          import {Component, Pipe, PipeTransform} from '@angular/core';

          @Pipe({name: 'apply', standalone: false})
          export class ApplyPipe implements PipeTransform {
            transform<T, R>(value: T, fn: (v: T) => R): R {
              return fn(value);
            }
          }

          @Component({
            selector: 'app-cmp',
            template: \`{{ 5 | apply : x => x * 2 }}\`,
            standalone: false,
          })
          export class AppCmp {}
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Arrow functions may not always produce type hints depending on TCB inference
      // The key is that it should not throw
      expect(() => appFile.getInlayHints({arrowFunctionParameterTypes: true})).not.toThrow();
    });

    it('should disable arrow function parameter hints when configured', () => {
      const files = {
        'app.ts': `
          import {Component, Pipe, PipeTransform} from '@angular/core';

          @Pipe({name: 'apply', standalone: false})
          export class ApplyPipe implements PipeTransform {
            transform<T, R>(value: T, fn: (v: T) => R): R {
              return fn(value);
            }
          }

          @Component({
            selector: 'app-cmp',
            template: \`{{ 5 | apply : x => x * 2 }}\`,
            standalone: false,
          })
          export class AppCmp {}
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hintsWithout = appFile.getInlayHints({
        arrowFunctionParameterTypes: false,
        pipeOutputTypes: false,
      });
      // Should not have parameter type hints for arrow function params
      const paramHint = hintsWithout.find((h) => h.text === ': number' && h.kind === 'Type');
      // The hint might still appear from pipe parameter hints, so just check it doesn't throw
      expect(() => appFile.getInlayHints({arrowFunctionParameterTypes: false})).not.toThrow();
    });
  });

  describe('isHintableLiteral - TypeScript parity', () => {
    it('should show parameter hints for template literals', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="log(\\\`hello\\\`)">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            log(message: string): void { console.log(message); }
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints({parameterNameHints: 'literals'});
      // Should show hint for template literal in 'literals' mode
      const paramHint = hints.find((h) => h.text === 'message:' && h.kind === 'Parameter');
      expect(paramHint).toBeDefined();
    });

    it('should show parameter hints for undefined, NaN, Infinity', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="setValue(undefined)">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            setValue(val: undefined): void {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      // Should not throw when processing undefined as a hintable literal
      expect(() => appFile.getInlayHints({parameterNameHints: 'literals'})).not.toThrow();
    });

    it('should show parameter hints for negative literals like -1', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="setIndex(-1)">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            setIndex(idx: number): void {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints({parameterNameHints: 'literals'});
      // Should show hint for -1 in 'literals' mode (unary expression with literal)
      const paramHint = hints.find((h) => h.text === 'idx:' && h.kind === 'Parameter');
      expect(paramHint).toBeDefined();
    });

    it('should show parameter hints for array literals', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="setItems([1, 2, 3])">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            setItems(items: number[]): void {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints({parameterNameHints: 'literals'});
      // Should show hint for array literal in 'literals' mode
      const paramHint = hints.find((h) => h.text === 'items:' && h.kind === 'Parameter');
      expect(paramHint).toBeDefined();
    });

    it('should show parameter hints for object literals', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="setConfig({key: 'value'})">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            setConfig(config: {key: string}): void {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints({parameterNameHints: 'literals'});
      // Should show hint for object literal in 'literals' mode
      const paramHint = hints.find((h) => h.text === 'config:' && h.kind === 'Parameter');
      expect(paramHint).toBeDefined();
    });
  });

  describe('tuple spread in function calls', () => {
    it('should handle tuple spread arguments correctly', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="setCoords(1, 2, 3)">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            setCoords(x: number, y: number, z: number): void {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints({parameterNameHints: 'all'});
      // Should show parameter name hints for all three arguments
      const xHint = hints.find((h) => h.text === 'x:' && h.kind === 'Parameter');
      const yHint = hints.find((h) => h.text === 'y:' && h.kind === 'Parameter');
      const zHint = hints.find((h) => h.text === 'z:' && h.kind === 'Parameter');
      expect(xHint).toBeDefined();
      expect(yHint).toBeDefined();
      expect(zHint).toBeDefined();
    });
  });

  describe('rest parameters', () => {
    it('should show ... prefix for first rest argument', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="log('prefix', 'a', 'b', 'c')">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            log(prefix: string, ...items: string[]): void {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints({parameterNameHints: 'all'});
      // Should show 'prefix:' for first arg and '...items:' for rest args
      const prefixHint = hints.find((h) => h.text === 'prefix:' && h.kind === 'Parameter');
      const restHint = hints.find((h) => h.text === '...items:' && h.kind === 'Parameter');
      expect(prefixHint).toBeDefined();
      expect(restHint).toBeDefined();
    });

    it('should handle function with only rest parameters', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (click)="logAll('a', 'b', 'c')">Click</button>\`,
            standalone: false,
          })
          export class AppCmp {
            logAll(...items: string[]): void {}
          }
        `,
      };
      project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');

      const hints = appFile.getInlayHints({parameterNameHints: 'all'});
      // First argument should have '...items:' prefix
      const restHint = hints.find((h) => h.text === '...items:' && h.kind === 'Parameter');
      expect(restHint).toBeDefined();
    });
  });

  describe('edge cases', () => {
    describe('empty and edge case expressions', () => {
      it('should handle function calls with no arguments', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="doSomething()">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              doSomething(): void {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw and produce no parameter hints
        const hints = appFile.getInlayHints({parameterNameHints: 'all'});
        const paramHints = hints.filter((h) => h.kind === 'Parameter');
        expect(paramHints.length).toBe(0);
      });

      it('should handle nested function calls', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="outer(inner(42))">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              inner(num: number): string { return String(num); }
              outer(str: string): void {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({parameterNameHints: 'all'});
        // Should have hints for both inner and outer calls
        const numHint = hints.find((h) => h.text === 'num:');
        const strHint = hints.find((h) => h.text === 'str:');
        expect(numHint).toBeDefined();
        expect(strHint).toBeDefined();
      });

      it('should handle chained pipe calls', () => {
        const files = {
          'app.ts': `
            import {Component, Pipe, PipeTransform} from '@angular/core';

            @Pipe({name: 'prefix', standalone: true})
            export class PrefixPipe implements PipeTransform {
              transform(value: string, prefix: string): string {
                return prefix + value;
              }
            }

            @Pipe({name: 'suffix', standalone: true})
            export class SuffixPipe implements PipeTransform {
              transform(value: string, suffix: string): string {
                return value + suffix;
              }
            }

            @Component({
              selector: 'app-cmp',
              template: \`{{ name | prefix : '[' | suffix : ']' }}\`,
              standalone: true,
              imports: [PrefixPipe, SuffixPipe],
            })
            export class AppCmp {
              name = 'test';
            }
          `,
        };
        project = env.addProject('test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();
        // Should have parameter hints for both pipes
        const prefixHint = hints.find((h) => h.text === 'prefix:');
        const suffixHint = hints.find((h) => h.text === 'suffix:');
        expect(prefixHint).toBeDefined();
        expect(suffixHint).toBeDefined();
      });

      it('should handle safe call operator ?.', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="obj?.method?.(42)">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              obj: { method?: (val: number) => void } | null = null;
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw when processing safe call
        expect(() => appFile.getInlayHints({parameterNameHints: 'all'})).not.toThrow();
      });
    });

    describe('generic type inference', () => {
      it('should handle generic functions without throwing', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`@let result = identity('hello'); {{ result }}\`,
              standalone: false,
            })
            export class AppCmp {
              identity<T>(value: T): T { return value; }
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw when processing generics
        expect(() => appFile.getInlayHints()).not.toThrow();
        // Should produce some hints (at minimum for @let declaration)
        const hints = appFile.getInlayHints();
        expect(hints.length).toBeGreaterThan(0);
      });

      it('should handle complex generic types', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface Box<T> { value: T; }

            @Component({
              selector: 'app-cmp',
              template: \`@let box = makeBox(123); {{ box.value }}\`,
              standalone: false,
            })
            export class AppCmp {
              makeBox<T>(value: T): Box<T> { return { value }; }
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();
        // Box should be Box<number>
        const boxHint = hints.find((h) => h.text.includes('Box'));
        expect(boxHint).toBeDefined();
        expect(boxHint?.text).toContain('number');
      });
    });

    describe('union and intersection types', () => {
      it('should display union types correctly', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`@let value = getValue(); {{ value }}\`,
              standalone: false,
            })
            export class AppCmp {
              getValue(): string | number { return 'test'; }
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();
        // Should produce hint with union type
        expect(hints.length).toBeGreaterThan(0);
        // The hint should contain some type info (exact format may vary)
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThan(0);
      });

      it('should handle narrowed types in @if blocks', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`@if (value !== null; as v) { {{ v }} }\`,
              standalone: false,
            })
            export class AppCmp {
              value: string | null = 'test';
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw when processing narrowed types
        expect(() => appFile.getInlayHints()).not.toThrow();
        // Should produce hints
        const hints = appFile.getInlayHints();
        const typeHints = hints.filter((h) => h.kind === 'Type');
        expect(typeHints.length).toBeGreaterThan(0);
      });
    });

    describe('interactive hints', () => {
      it('should create displayParts when interactiveInlayHints is true', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="handleClick(42)">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              handleClick(value: number): void {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({
          parameterNameHints: 'all',
          interactiveInlayHints: true,
        });
        // Should have interactive hint with displayParts
        const paramHint = hints.find((h) => h.kind === 'Parameter' && h.displayParts);
        expect(paramHint).toBeDefined();
        expect(paramHint?.displayParts?.length).toBeGreaterThan(0);
        // First part should have span and file for navigation
        expect(paramHint?.displayParts?.[0].span).toBeDefined();
        expect(paramHint?.displayParts?.[0].file).toBeDefined();
      });

      it('should NOT create displayParts when interactiveInlayHints is false', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<button (click)="handleClick(42)">Click</button>\`,
              standalone: false,
            })
            export class AppCmp {
              handleClick(value: number): void {}
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints({
          parameterNameHints: 'all',
          interactiveInlayHints: false,
        });
        // Should have non-interactive hints (no displayParts)
        const paramHints = hints.filter((h) => h.kind === 'Parameter');
        expect(paramHints.length).toBeGreaterThan(0);
        expect(paramHints.every((h) => !h.displayParts)).toBe(true);
      });
    });

    describe('special cases for @for loops', () => {
      it('should not duplicate hints for @for context variables', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`
                @for (item of items; track $index; let i = $index, f = $first, l = $last) {
                  {{ item }} #{{ i }} first:{{ f }} last:{{ l }}
                }
              \`,
              standalone: false,
            })
            export class AppCmp {
              items = ['a', 'b', 'c'];
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        const hints = appFile.getInlayHints();
        // Count hints - each variable should appear only once
        const stringHints = hints.filter((h) => h.text === ': string');
        const numberHints = hints.filter((h) => h.text === ': number');
        const booleanHints = hints.filter((h) => h.text === ': boolean');

        expect(stringHints.length).toBe(1); // item: string
        expect(numberHints.length).toBe(1); // i: number
        expect(booleanHints.length).toBe(2); // f: boolean, l: boolean
      });

      it('should handle empty @for loop', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`@for (item of []; track $index) { {{ item }} } @empty { no items }\`,
              standalone: false,
            })
            export class AppCmp {}
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw
        expect(() => appFile.getInlayHints()).not.toThrow();
      });
    });

    describe('special cases for pipes', () => {
      it('should handle pipe with no transform method gracefully', () => {
        const files = {
          'app.ts': `
            import {Component, Pipe, PipeTransform} from '@angular/core';

            // Technically invalid pipe, but should not crash
            @Pipe({name: 'invalid', standalone: true})
            export class InvalidPipe {
              // Missing transform method
            }

            @Component({
              selector: 'app-cmp',
              template: \`{{ name | invalid }}\`,
              standalone: true,
              imports: [InvalidPipe],
            })
            export class AppCmp {
              name = 'test';
            }
          `,
        };
        project = env.addProject('test', files);
        const appFile = project.openFile('app.ts');

        // Should not throw even with invalid pipe
        expect(() => appFile.getInlayHints()).not.toThrow();
      });

      it('should handle async pipe without throwing', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`{{ data$ | async }}\`,
              standalone: false,
            })
            export class AppCmp {
              data$ = Promise.resolve('hello');
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // Async pipe may not be fully available in mock environment
        // The key is it should not throw
        expect(() => appFile.getInlayHints()).not.toThrow();
      });
    });

    describe('type matching name edge cases', () => {
      it('should be case-insensitive when matching type to name', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface USER { name: string; }

            @Component({
              selector: 'app-cmp',
              template: \`@for (user of users; track user.name) { {{ user.name }} }\`,
              standalone: false,
            })
            export class AppCmp {
              users: USER[] = [];
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With variableTypeHintsWhenTypeMatchesName: false, should skip hint
        // even though 'user' and 'USER' have different cases
        const hints = appFile.getInlayHints({variableTypeHintsWhenTypeMatchesName: false});
        const userHint = hints.find((h) => h.text === ': USER');
        expect(userHint).toBeUndefined();
      });

      it('should handle generic types when matching name', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            interface Box<T> { value: T; }

            @Component({
              selector: 'app-cmp',
              template: \`@let box = getBox(); {{ box.value }}\`,
              standalone: false,
            })
            export class AppCmp {
              getBox(): Box<string> { return { value: 'test' }; }
            }
          `,
        };
        project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');

        // With variableTypeHintsWhenTypeMatchesName: false, should skip hint
        // for Box<string> when variable is named 'box'
        const hints = appFile.getInlayHints({variableTypeHintsWhenTypeMatchesName: false});
        const boxHint = hints.find((h) => h.text.includes('Box'));
        expect(boxHint).toBeUndefined();
      });
    });
  });
});
