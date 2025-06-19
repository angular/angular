/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli';
import ts from 'typescript';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv, Project} from '../testing';

function quickInfoSkeleton(): {[fileName: string]: string} {
  return {
    'app.ts': `
        import {Component, Directive, EventEmitter, Input, NgModule, Output, Pipe, PipeTransform, model, signal} from '@angular/core';
        import {CommonModule} from '@angular/common';

        export interface Address {
          streetName: string;
        }

        /** The most heroic being. */
        export interface Hero {
          id: number;
          name: string;
          address?: Address;
        }

        /**
         * This Component provides the \`test-comp\` selector.
         */
        /*BeginTestComponent*/ @Component({
          selector: 'test-comp',
          template: '<div>Testing: {{name}}</div>',
          standalone: false,
        })
        export class TestComponent {
          @Input('tcName') name!: string;
          @Output('test') testEvent!: EventEmitter<string>;
        } /*EndTestComponent*/

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          hero!: Hero;
          heroes!: Hero[];
          readonlyHeroes!: ReadonlyArray<Readonly<Hero>>;
          /**
           * This is the title of the \`AppCmp\` Component.
           */
          title!: string;
          constNames!: [{readonly name: 'name'}];
          constNamesOptional?: [{readonly name: 'name'}];
          birthday!: Date;
          anyValue!: any;
          myClick(event: any) {}
          setTitle(newTitle: string) {}
          trackByFn!: any;
          name!: any;
          signalValue: string|undefined;
          someObject = {
            someProp: 'prop',
            someSignal: signal<number>(0),
            someMethod: (): number => 1,
            nested: {
              helloWorld: () => {
                return {
                  nestedMethod: () => 1
                }
              }
            }
          };
          someTag = (...args: any[]) => '';
        }

        @Directive({
          selector: '[string-model]',
          exportAs: 'stringModel',
          standalone: false,
        })
        export class StringModel {
          @Input() model!: string;
          @Output() modelChange!: EventEmitter<string>;
        }

        @Directive({
          selector: '[signal-model]',
          exportAs: 'signalModel',
          standalone: false,
        })
        export class SignalModel {
          signalModel = model<string>();
        }

        @Directive({
          selector: 'button[custom-button][compound]',
          standalone: false,
        })
        export class CompoundCustomButtonDirective {
          @Input() config?: {color?: string};
        }

        /**
         * Don't use me
         *
         * @deprecated use the new thing
         */
        @Directive({
          selector: '[deprecated]',
          standalone: false,
        })
        export class DeprecatedDirective {}

        @NgModule({
          declarations: [
            AppCmp,
            CompoundCustomButtonDirective,
            StringModel,
            TestComponent,
            SignalModel,
            DeprecatedDirective
          ],
          imports: [
            CommonModule,
          ],
        })
        export class AppModule {}
      `,
    'app.html': `Will be overridden`,
  };
}

describe('quick info', () => {
  let env: LanguageServiceTestEnv;
  let project: Project;

  describe('strict templates (happy path)', () => {
    beforeEach(() => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
      project = env.addProject('test', quickInfoSkeleton());
    });

    describe('elements', () => {
      it('should work for native elements', () => {
        expectQuickInfo({
          templateOverride: `<butt¦on></button>`,
          expectedSpanText: '<button></button>',
          expectedDisplayString: '(element) button: HTMLButtonElement',
        });
      });

      it('should work for directives which match native element tags', () => {
        expectQuickInfo({
          templateOverride: `<butt¦on compound custom-button></button>`,
          expectedSpanText: '<button compound custom-button></button>',
          expectedDisplayString: '(directive) AppModule.CompoundCustomButtonDirective',
        });
      });
    });

    describe('templates', () => {
      it('should return undefined for ng-templates', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<ng-templ¦ate></ng-template>`,
          expectedSpanText: '<ng-template></ng-template>',
          expectedDisplayString: '(template) ng-template',
        });
        expect(toText(documentation)).toContain(
          'The `<ng-template>` is an Angular element for rendering HTML.',
        );
      });
    });

    describe('directives', () => {
      it('should work for directives', () => {
        expectQuickInfo({
          templateOverride: `<div string-model¦></div>`,
          expectedSpanText: 'string-model',
          expectedDisplayString: '(directive) AppModule.StringModel',
        });
      });

      it('should work for components', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<t¦est-comp></test-comp>`,
          expectedSpanText: '<test-comp></test-comp>',
          expectedDisplayString: '(component) AppModule.TestComponent',
        });
        expect(toText(documentation)).toBe('This Component provides the `test-comp` selector.');
      });

      it('should work for components with bound attributes', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<t¦est-comp [attr.id]="'1' + '2'" [attr.name]="'myName'"></test-comp>`,
          expectedSpanText: `<test-comp [attr.id]="'1' + '2'" [attr.name]="'myName'"></test-comp>`,
          expectedDisplayString: '(component) AppModule.TestComponent',
        });
        expect(toText(documentation)).toBe('This Component provides the `test-comp` selector.');
      });

      it('should work for structural directives', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<div *¦ngFor="let item of heroes"></div>`,
          expectedSpanText: 'ngFor',
          expectedDisplayString: '(directive) NgForOf<Hero, Hero[]>',
        });
        expect(toText(documentation)).toContain('A fake version of the NgFor directive.');
      });

      it('should work for directives with compound selectors, some of which are bindings', () => {
        expectQuickInfo({
          templateOverride: `<ng-template ngF¦or let-hero [ngForOf]="heroes">{{hero}}</ng-template>`,
          expectedSpanText: 'ngFor',
          expectedDisplayString: '(directive) NgForOf<Hero, Hero[]>',
        });
      });

      it('should work for data-let- syntax', () => {
        expectQuickInfo({
          templateOverride: `<ng-template ngFor data-let-he¦ro [ngForOf]="heroes">{{hero}}</ng-template>`,
          expectedSpanText: 'hero',
          expectedDisplayString: '(variable) hero: Hero',
        });
      });

      it('should get tags', () => {
        const templateOverride = '<div depr¦ecated></div>';
        const text = templateOverride.replace('¦', '');
        const template = project.openFile('app.html');
        template.contents = text;
        env.expectNoSourceDiagnostics();

        template.moveCursorToText(templateOverride);
        const quickInfo = template.getQuickInfoAtPosition();
        const tags = quickInfo!.tags!;
        expect(tags[0].name).toBe('deprecated');
        expect(toText(tags[0].text)).toBe('use the new thing');
      });
    });

    describe('bindings', () => {
      describe('inputs', () => {
        it('should work for input providers', () => {
          expectQuickInfo({
            templateOverride: `<test-comp [tcN¦ame]="name"></test-comp>`,
            expectedSpanText: 'tcName',
            expectedDisplayString: '(property) TestComponent.name: string',
          });
        });

        it('should work for bind- syntax', () => {
          expectQuickInfo({
            templateOverride: `<test-comp bind-tcN¦ame="name"></test-comp>`,
            expectedSpanText: 'tcName',
            expectedDisplayString: '(property) TestComponent.name: string',
          });
          expectQuickInfo({
            templateOverride: `<test-comp data-bind-tcN¦ame="name"></test-comp>`,
            expectedSpanText: 'tcName',
            expectedDisplayString: '(property) TestComponent.name: string',
          });
        });

        it('should work for structural directive inputs ngForTrackBy', () => {
          expectQuickInfo({
            templateOverride: `<div *ngFor="let item of heroes; tr¦ackBy: trackByFn;"></div>`,
            expectedSpanText: 'trackBy',
            expectedDisplayString:
              '(property) NgForOf<Hero, Hero[]>.ngForTrackBy: TrackByFunction<Hero>',
          });
        });

        it('should work for structural directive inputs ngForOf', () => {
          expectQuickInfo({
            templateOverride: `<div *ngFor="let item o¦f heroes; trackBy: trackByFn;"></div>`,
            expectedSpanText: 'of',
            expectedDisplayString:
              '(property) NgForOf<Hero, Hero[]>.ngForOf: (Hero[] & NgIterable<Hero>) | null | undefined',
          });
        });

        it('should work for two-way binding providers', () => {
          expectQuickInfo({
            templateOverride: `<test-comp string-model [(mo¦del)]="title"></test-comp>`,
            expectedSpanText: 'model',
            expectedDisplayString: '(property) StringModel.model: string',
          });
        });

        it('should work for signal-based two-way binding providers', () => {
          expectQuickInfo({
            templateOverride: `<test-comp signal-model [(signa¦lModel)]="signalValue"></test-comp>`,
            expectedSpanText: 'signalModel',
            expectedDisplayString:
              '(property) SignalModel.signalModel: ModelSignal<string | undefined>',
          });
        });
      });

      describe('outputs', () => {
        it('should work for event providers', () => {
          expectQuickInfo({
            templateOverride: `<test-comp (te¦st)="myClick($event)"></test-comp>`,
            expectedSpanText: 'test',
            expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>',
          });
        });

        it('should work for on- syntax binding', () => {
          expectQuickInfo({
            templateOverride: `<test-comp on-te¦st="myClick($event)"></test-comp>`,
            expectedSpanText: 'test',
            expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>',
          });
          expectQuickInfo({
            templateOverride: `<test-comp data-on-te¦st="myClick($event)"></test-comp>`,
            expectedSpanText: 'test',
            expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>',
          });
        });

        it('should work for $event from EventEmitter', () => {
          expectQuickInfo({
            templateOverride: `<div string-model (modelChange)="myClick($e¦vent)"></div>`,
            expectedSpanText: '$event',
            expectedDisplayString: '(parameter) $event: string',
          });
        });

        it('should work for $event from native element', () => {
          expectQuickInfo({
            templateOverride: `<div (click)="myClick($e¦vent)"></div>`,
            expectedSpanText: '$event',
            expectedDisplayString: '(parameter) $event: MouseEvent',
          });
        });
      });
    });

    describe('references', () => {
      it('should work for element reference declarations', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<div #¦chart></div>`,
          expectedSpanText: 'chart',
          expectedDisplayString: '(reference) chart: HTMLDivElement',
        });
        expect(toText(documentation)).toEqual(
          'Provides special properties (beyond the regular HTMLElement ' +
            'interface it also has available to it by inheritance) for manipulating <div> elements.\n\n' +
            '[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDivElement)',
        );
      });

      it('should work for directive references', () => {
        expectQuickInfo({
          templateOverride: `<div string-model #dir¦Ref="stringModel"></div>`,
          expectedSpanText: 'dirRef',
          expectedDisplayString: '(reference) dirRef: StringModel',
        });
      });

      it('should work for ref- syntax', () => {
        expectQuickInfo({
          templateOverride: `<div ref-ch¦art></div>`,
          expectedSpanText: 'chart',
          expectedDisplayString: '(reference) chart: HTMLDivElement',
        });
        expectQuickInfo({
          templateOverride: `<div data-ref-ch¦art></div>`,
          expectedSpanText: 'chart',
          expectedDisplayString: '(reference) chart: HTMLDivElement',
        });
      });

      it('should work for click output from native element', () => {
        expectQuickInfo({
          templateOverride: `<div (cl¦ick)="myClick($event)"></div>`,
          expectedSpanText: 'click',
          expectedDisplayString:
            '(event) HTMLDivElement.addEventListener<"click">(type: "click", listener: ' +
            '(this: HTMLDivElement, ev: MouseEvent) => any, options?: boolean | ' +
            'AddEventListenerOptions): void (+1 overload)',
        });
      });
    });

    describe('variables', () => {
      it('should work for array members', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<div *ngFor="let hero of heroes">{{her¦o}}</div>`,
          expectedSpanText: 'hero',
          expectedDisplayString: '(variable) hero: Hero',
        });
        expect(toText(documentation)).toEqual('The most heroic being.');
      });

      it('should work for ReadonlyArray members (#36191)', () => {
        expectQuickInfo({
          templateOverride: `<div *ngFor="let hero of readonlyHeroes">{{her¦o}}</div>`,
          expectedSpanText: 'hero',
          expectedDisplayString: '(variable) hero: Readonly<Hero>',
        });
      });

      it('should work for const array members (#36191)', () => {
        expectQuickInfo({
          templateOverride: `<div *ngFor="let name of constNames">{{na¦me}}</div>`,
          expectedSpanText: 'name',
          expectedDisplayString: '(variable) name: { readonly name: "name"; }',
        });
      });

      it('should work for safe keyed reads', () => {
        expectQuickInfo({
          templateOverride: `<div>{{constNamesOptional?.[0¦]}}</div>`,
          expectedSpanText: '0',
          expectedDisplayString: '(property) 0: {\n    readonly name: "name";\n}',
        });

        expectQuickInfo({
          templateOverride: `<div>{{constNamesOptional?.[0]?.na¦me}}</div>`,
          expectedSpanText: 'constNamesOptional?.[0]?.name',
          expectedDisplayString: '(property) name: "name"',
        });
      });

      it('should work for template literal interpolations', () => {
        expectQuickInfo({
          templateOverride: `<div *ngFor="let name of constNames">{{\`Hello \${na¦me}\`}}</div>`,
          expectedSpanText: 'name',
          expectedDisplayString: '(variable) name: { readonly name: "name"; }',
        });
      });

      it('should work for tagged template literals', () => {
        expectQuickInfo({
          templateOverride: `<div *ngFor="let name of constNames">{{someTag\`Hello \${na¦me}\`}}</div>`,
          expectedSpanText: 'name',
          expectedDisplayString: '(variable) name: { readonly name: "name"; }',
        });
      });
    });

    describe('pipes', () => {
      it('should work for pipes', () => {
        const templateOverride = `<p>The hero's birthday is {{birthday | da¦te: "MM/dd/yy"}}</p>`;
        expectQuickInfo({
          templateOverride,
          expectedSpanText: 'date',
          expectedDisplayString:
            '(pipe) DatePipe.transform(value: Date | string | number, format?: string, ' +
            'timezone?: string, locale?: string): string | null (+2 overloads)',
        });
      });
    });

    describe('expressions', () => {
      it('should find members in a text interpolation', () => {
        expectQuickInfo({
          templateOverride: `<div>{{ tit¦le }}</div>`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string',
        });
      });

      it('should work for accessed property reads', () => {
        expectQuickInfo({
          templateOverride: `<div>{{title.len¦gth}}</div>`,
          expectedSpanText: 'length',
          expectedDisplayString: '(property) String.length: number',
        });
      });

      it('should work for accessed function calls', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="someObject.some¦Method()"></div>`,
          expectedSpanText: 'someMethod',
          expectedDisplayString: '(property) someMethod: () => number',
        });
      });

      it('should work for accessed very nested function calls', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="someObject.nested.helloWor¦ld().nestedMethod()"></div>`,
          expectedSpanText: 'helloWorld',
          expectedDisplayString:
            '(property) helloWorld: () => {\n    nestedMethod: () => number;\n}',
        });
      });

      it('should find members in an attribute interpolation', () => {
        expectQuickInfo({
          templateOverride: `<div string-model model="{{tit¦le}}"></div>`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string',
        });
      });

      it('should find members of input binding', () => {
        expectQuickInfo({
          templateOverride: `<test-comp [tcName]="ti¦tle"></test-comp>`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string',
        });
      });

      it('should find input binding on text attribute', () => {
        expectQuickInfo({
          templateOverride: `<test-comp tcN¦ame="title"></test-comp>`,
          expectedSpanText: 'tcName',
          expectedDisplayString: '(property) TestComponent.name: string',
        });
      });

      it('should find members of event binding', () => {
        expectQuickInfo({
          templateOverride: `<test-comp (test)="ti¦tle=$event"></test-comp>`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string',
        });
      });

      it('should work for method calls', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="setT¦itle('title')"></div>`,
          expectedSpanText: 'setTitle',
          expectedDisplayString: '(method) AppCmp.setTitle(newTitle: string): void',
        });
      });

      it('should work for safe method calls', () => {
        const files = {
          'app.ts': `import {Component} from '@angular/core';
            @Component({template: '<div (click)="something?.myFunc()"></div>'})
            export class AppCmp {
              something!: {
                /** Documentation for myFunc. */
                myFunc(): void
              };
            }`,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test_project', files);
        const appFile = project.openFile('app.ts');
        appFile.moveCursorToText('something?.myF¦unc()');
        const info = appFile.getQuickInfoAtPosition()!;
        expect(toText(info.displayParts)).toEqual('(method) myFunc(): void');
        expect(toText(info.documentation)).toEqual('Documentation for myFunc.');
      });

      it('should work for safe signal calls', () => {
        const files = {
          'app.ts': `import {Component, Signal} from '@angular/core';
            @Component({template: '<div [id]="something?.value()"></div>'})
            export class AppCmp {
              something!: {
                /** Documentation for value. */
                value: Signal<number>;
              };
            }`,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test_project', files);
        const appFile = project.openFile('app.ts');
        appFile.moveCursorToText('something?.va¦lue()');
        const info = appFile.getQuickInfoAtPosition()!;
        expect(toText(info.displayParts)).toEqual('(property) value: Signal<number>');
        expect(toText(info.documentation)).toEqual('Documentation for value.');
      });

      it('should work for signal calls', () => {
        const files = {
          'app.ts': `import {Component, signal} from '@angular/core';
            @Component({template: '<div [id]="something.value()"></div>'})
            export class AppCmp {
              something = {
                /** Documentation for value. */
                value: signal(0)
              };
            }`,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test_project', files);
        const appFile = project.openFile('app.ts');
        appFile.moveCursorToText('something.va¦lue()');
        const info = appFile.getQuickInfoAtPosition()!;
        expect(toText(info.displayParts)).toEqual('(property) value: WritableSignal\n() => number');
        expect(toText(info.documentation)).toEqual('Documentation for value.');
      });

      it('should work for accessed properties in writes', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="hero.i¦d = 2"></div>`,
          expectedSpanText: 'id',
          expectedDisplayString: '(property) Hero.id: number',
        });
      });

      it('should work for method call arguments', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="setTitle(hero.nam¦e)"></div>`,
          expectedSpanText: 'name',
          expectedDisplayString: '(property) Hero.name: string',
        });
      });

      it('should find members of two-way binding', () => {
        expectQuickInfo({
          templateOverride: `<input string-model [(model)]="ti¦tle" />`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string',
        });
      });

      it('should find members in a structural directive', () => {
        expectQuickInfo({
          templateOverride: `<div *ngIf="anyV¦alue"></div>`,
          expectedSpanText: 'anyValue',
          expectedDisplayString: '(property) AppCmp.anyValue: any',
        });
      });

      it('should work for members in structural directives', () => {
        expectQuickInfo({
          templateOverride: `<div *ngFor="let item of her¦oes; trackBy: trackByFn;"></div>`,
          expectedSpanText: 'heroes',
          expectedDisplayString: '(property) AppCmp.heroes: Hero[]',
        });
      });

      it('should work for the $any() cast function', () => {
        expectQuickInfo({
          templateOverride: `<div>{{$an¦y(title)}}</div>`,
          expectedSpanText: '$any',
          expectedDisplayString: '(method) $any: any',
        });
      });

      it('should work with void operator', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="void myC¦lick($event)"></div>`,
          expectedSpanText: 'myClick',
          expectedDisplayString: '(method) AppCmp.myClick(event: any): void',
        });
        expectQuickInfo({
          templateOverride: `<div (click)="void myClick($e¦vent)"></div>`,
          expectedSpanText: '$event',
          expectedDisplayString: '(parameter) $event: MouseEvent',
        });
      });

      it('should work for tagged template literal tag', () => {
        expectQuickInfo({
          templateOverride: `<div>{{ some¦Tag\`text\` }}</div>`,
          expectedSpanText: 'someTag',
          expectedDisplayString: '(property) AppCmp.someTag: (...args: any[]) => string',
        });
      });

      it('should work for with the in operator', () => {
        expectQuickInfo({
          templateOverride: `<div>{{'key' in her¦oes}}</div>`,
          expectedSpanText: 'heroes',
          expectedDisplayString: '(property) AppCmp.heroes: Hero[]',
        });
      });

      it('should provide documentation', () => {
        const template = project.openFile('app.html');
        template.contents = `<div>{{title}}</div>`;
        template.moveCursorToText('{{¦title}}');
        const quickInfo = template.getQuickInfoAtPosition();
        const documentation = toText(quickInfo!.documentation);
        expect(documentation).toBe('This is the title of the `AppCmp` Component.');
      });

      it('should work with parenthesized exponentiation expression', () => {
        expectQuickInfo({
          templateOverride: `{{ (-¦anyValue) ** 2 }}`,
          expectedSpanText: 'anyValue',
          expectedDisplayString: '(property) AppCmp.anyValue: any',
        });
      });
    });

    describe('blocks', () => {
      describe('defer & friends', () => {
        it('defer', () => {
          expectQuickInfo({
            templateOverride: `@de¦fer { } @placeholder { <input /> }`,
            expectedSpanText: '@defer ',
            expectedDisplayString: '(block) @defer',
          });
        });

        it('defer with condition', () => {
          expectQuickInfo({
            templateOverride: `@de¦fer (on immediate) { } @placeholder { <input /> }`,
            expectedSpanText: '@defer ',
            expectedDisplayString: '(block) @defer',
          });
        });

        it('placeholder', () => {
          expectQuickInfo({
            templateOverride: `@defer { } @pla¦ceholder { <input /> }`,
            expectedSpanText: '@placeholder ',
            expectedDisplayString: '(block) @placeholder',
          });
        });

        it('loading', () => {
          expectQuickInfo({
            templateOverride: `@defer { } @loadin¦g { <input /> }`,
            expectedSpanText: '@loading ',
            expectedDisplayString: '(block) @loading',
          });
        });

        it('error', () => {
          expectQuickInfo({
            templateOverride: `@defer { } @erro¦r { <input /> }`,
            expectedSpanText: '@error ',
            expectedDisplayString: '(block) @error',
          });
        });

        describe('triggers', () => {
          it('viewport', () => {
            expectQuickInfo({
              templateOverride: `@defer (on vie¦wport(x)) { } <div #x></div>`,
              expectedSpanText: 'viewport',
              expectedDisplayString: '(trigger) viewport',
            });
          });

          it('immediate', () => {
            expectQuickInfo({
              templateOverride: `@defer (on imme¦diate) {}`,
              expectedSpanText: 'immediate',
              expectedDisplayString: '(trigger) immediate',
            });
          });

          it('idle', () => {
            expectQuickInfo({
              templateOverride: `@defer (on i¦dle) { } `,
              expectedSpanText: 'idle',
              expectedDisplayString: '(trigger) idle',
            });
          });

          it('hover', () => {
            expectQuickInfo({
              templateOverride: `@defer (on hov¦er(x)) { } <div #x></div> `,
              expectedSpanText: 'hover',
              expectedDisplayString: '(trigger) hover',
            });
          });

          it('timer', () => {
            expectQuickInfo({
              templateOverride: `@defer (on tim¦er(100)) { } `,
              expectedSpanText: 'timer',
              expectedDisplayString: '(trigger) timer',
            });
          });

          it('interaction', () => {
            expectQuickInfo({
              templateOverride: `@defer (on interactio¦n(x)) { } <div #x></div>`,
              expectedSpanText: 'interaction',
              expectedDisplayString: '(trigger) interaction',
            });
          });

          it('when', () => {
            expectQuickInfo({
              templateOverride: `@defer (whe¦n title) { } <div #x></div>`,
              expectedSpanText: 'when',
              expectedDisplayString: '(keyword) when',
            });
          });

          it('prefetch (when)', () => {
            expectQuickInfo({
              templateOverride: `@defer (prefet¦ch when title) { }`,
              expectedSpanText: 'prefetch',
              expectedDisplayString: '(keyword) prefetch',
            });
          });

          it('hydrate (when)', () => {
            expectQuickInfo({
              templateOverride: `@defer (hydra¦te when title) { }`,
              expectedSpanText: 'hydrate',
              expectedDisplayString: '(keyword) hydrate',
            });
          });

          it('on', () => {
            expectQuickInfo({
              templateOverride: `@defer (o¦n immediate) { } `,
              expectedSpanText: 'on',
              expectedDisplayString: '(keyword) on',
            });
          });

          it('prefetch (on)', () => {
            expectQuickInfo({
              templateOverride: `@defer (prefet¦ch on immediate) { }`,
              expectedSpanText: 'prefetch',
              expectedDisplayString: '(keyword) prefetch',
            });
          });

          it('hydrate (on)', () => {
            expectQuickInfo({
              templateOverride: `@defer (hydra¦te on immediate) { }`,
              expectedSpanText: 'hydrate',
              expectedDisplayString: '(keyword) hydrate',
            });
          });
        });
      });

      it('empty', () => {
        expectQuickInfo({
          templateOverride: `@for (name of constNames; track $index) {} @em¦pty {}`,
          expectedSpanText: '@empty ',
          expectedDisplayString: '(block) @empty',
        });
      });

      it('track keyword', () => {
        expectQuickInfo({
          templateOverride: `@for (name of constNames; tr¦ack $index) {}`,
          expectedSpanText: 'track',
          expectedDisplayString: '(keyword) track',
        });
      });

      it('implicit variable assignment', () => {
        expectQuickInfo({
          templateOverride: `@for (name of constNames; track $index; let od¦d = $odd) {}`,
          expectedSpanText: 'odd',
          expectedDisplayString: '(variable) odd: boolean',
        });
      });

      it('implicit variable assignment in comma separated list', () => {
        expectQuickInfo({
          templateOverride: `@for (name of constNames; track index; let odd = $odd,  ind¦ex  =   $index) {}`,
          expectedSpanText: 'index',
          expectedDisplayString: '(variable) index: number',
        });
      });

      it('if block alias variable', () => {
        expectQuickInfo({
          templateOverride: `@if (constNames; as al¦iasName) {}`,
          expectedSpanText: 'aliasName',
          expectedDisplayString: '(variable) aliasName: [{ readonly name: "name"; }]',
        });
      });

      it('if block alias variable', () => {
        expectQuickInfo({
          templateOverride: `@if (someObject.some¦Signal(); as aliasName) {}`,
          expectedSpanText: 'someSignal',
          expectedDisplayString: '(property) someSignal: WritableSignal\n() => number',
        });
      });
    });

    describe('let declarations', () => {
      it('should get quick info for a let declaration', () => {
        expectQuickInfo({
          templateOverride: `@let na¦me = 'Frodo'; {{name}}`,
          expectedSpanText: `@let name = 'Frodo'`,
          expectedDisplayString: `(let) name: "Frodo"`,
        });
      });
    });

    it('should work for object literal with shorthand property declarations', () => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
      project = env.addProject(
        'test',
        {
          'app.ts': `
            import {Component, NgModule} from '@angular/core';
            import {CommonModule} from '@angular/common';

            @Component({
              selector: 'some-cmp',
              templateUrl: './app.html',
              standalone: false,
            })
            export class SomeCmp {
              val1 = 'one';
              val2 = 2;

              doSomething(obj: {val1: string, val2: number}) {}
            }

            @NgModule({
              declarations: [SomeCmp],
              imports: [CommonModule],
            })
            export class AppModule{
            }
          `,
          'app.html': `{{doSomething({val1, val2})}}`,
        },
        {strictTemplates: true},
      );
      env.expectNoSourceDiagnostics();
      project.expectNoSourceDiagnostics();

      const template = project.openFile('app.html');
      template.moveCursorToText('val¦1');
      const quickInfo = template.getQuickInfoAtPosition();
      expect(toText(quickInfo!.displayParts)).toEqual('(property) SomeCmp.val1: string');
      template.moveCursorToText('val¦2');
      const quickInfo2 = template.getQuickInfoAtPosition();
      expect(toText(quickInfo2!.displayParts)).toEqual('(property) SomeCmp.val2: number');
    });

    describe('host bindings', () => {
      function expectHostBindingsQuickInfo({
        source,
        moveTo,
        expectedDisplayString,
        expectedSpanText,
      }: {
        source: string;
        moveTo: string;
        expectedDisplayString: string;
        expectedSpanText: string;
      }) {
        const project = env.addProject(
          'host-bindings',
          {'host-bindings.ts': source},
          {
            typeCheckHostBindings: true,
          },
        );
        const appFile = project.openFile('host-bindings.ts');

        appFile.moveCursorToText(moveTo);
        const quickInfo = appFile.getQuickInfoAtPosition();
        expect(quickInfo).toBeTruthy();
        const {textSpan, displayParts} = quickInfo!;
        expect(source.substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
          expectedSpanText,
        );
        expect(toText(displayParts)).toEqual(expectedDisplayString);
      }

      it('should handle host property binding', () => {
        const source = `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            selector: 'app-cmp',
            host: {'[title]': 'myTitle'}
          })
          export class AppCmp {
            myTitle = 'hello';
          }
        `;

        expectHostBindingsQuickInfo({
          source,
          moveTo: `'[title]': 'myT¦itle'`,
          expectedSpanText: 'myTitle',
          expectedDisplayString: '(property) AppCmp.myTitle: string',
        });
      });

      it('should handle host listener', () => {
        const source = `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            selector: 'app-cmp',
            host: {
              '(click)': 'handleClick($event)'
            }
          })
          export class AppCmp {
            handleClick(event: MouseEvent) {}
          }
        `;

        expectHostBindingsQuickInfo({
          source,
          moveTo: `'(click)': 'handleC¦lick($event)'`,
          expectedSpanText: 'handleClick',
          expectedDisplayString: '(method) AppCmp.handleClick(event: MouseEvent): void',
        });
      });

      it('should handle host listener parameter', () => {
        const source = `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            selector: 'app-cmp',
            host: {
              '(click)': 'handleClick($event)'
            }
          })
          export class AppCmp {
            handleClick(event: MouseEvent) {}
          }
        `;

        expectHostBindingsQuickInfo({
          source,
          moveTo: `'(click)': 'handleClick($ev¦ent)'`,
          expectedSpanText: '$event',
          expectedDisplayString: '(parameter) $event: MouseEvent',
        });
      });

      it('should handle host binding on a directive', () => {
        const source = `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[my-dir]',
            host: {'[title]': 'myTitle'}
          })
          export class MyDir {
            myTitle = 'hello';
          }
        `;

        expectHostBindingsQuickInfo({
          source,
          moveTo: `'[title]': 'myT¦itle'`,
          expectedSpanText: 'myTitle',
          expectedDisplayString: '(property) MyDir.myTitle: string',
        });
      });
    });
  });

  describe('generics', () => {
    beforeEach(() => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
    });

    it('should get quick info for the generic input of a directive that normally requires inlining', () => {
      // When compiling normally, we would have to inline the type constructor of `GenericDir`
      // because its generic type parameter references `PrivateInterface`, which is not exported.
      project = env.addProject('test', {
        'app.ts': `
          import {Directive, Component, Input, NgModule} from '@angular/core';

          interface PrivateInterface {}

          @Directive({
            selector: '[dir]',
            standalone: false,
          })export class GenericDir <T extends PrivateInterface>{
            @Input('input') input: T = null!;
          }

          @Component({
            selector: 'some-cmp',
            templateUrl: './app.html',
            standalone: false,
          })export class SomeCmp{}

          @NgModule({
            declarations: [GenericDir, SomeCmp],
          })export class AppModule{}
        `,
        'app.html': ``,
      });

      expectQuickInfo({
        templateOverride: `<div dir [inp¦ut]='{value: 42}'></div>`,
        expectedSpanText: 'input',
        expectedDisplayString: '(property) GenericDir<any>.input: any',
      });
    });
  });

  describe('non-strict compiler options', () => {
    beforeEach(() => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
    });

    it('should find input binding on text attribute when strictAttributeTypes is false', () => {
      project = env.addProject('test', quickInfoSkeleton(), {strictAttributeTypes: false});
      expectQuickInfo({
        templateOverride: `<test-comp tcN¦ame="title"></test-comp>`,
        expectedSpanText: 'tcName',
        expectedDisplayString: '(property) TestComponent.name: string',
      });
    });

    it('can still get quick info when strictOutputEventTypes is false', () => {
      project = env.addProject('test', quickInfoSkeleton(), {strictOutputEventTypes: false});
      expectQuickInfo({
        templateOverride: `<test-comp (te¦st)="myClick($event)"></test-comp>`,
        expectedSpanText: 'test',
        expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>',
      });
    });

    it('should work for pipes even if checkTypeOfPipes is false', () => {
      // checkTypeOfPipes is set to false when strict templates is false
      project = env.addProject('test', quickInfoSkeleton(), {strictTemplates: false});
      const templateOverride = `<p>The hero's birthday is {{birthday | da¦te: "MM/dd/yy"}}</p>`;
      expectQuickInfo({
        templateOverride,
        expectedSpanText: 'date',
        expectedDisplayString:
          '(pipe) DatePipe.transform(value: Date | string | number, format?: string, ' +
          'timezone?: string, locale?: string): string | null (+2 overloads)',
      });
    });

    it('should still get quick info if there is an invalid css resource', () => {
      project = env.addProject('test', {
        'app.ts': `
         import {Component, NgModule} from '@angular/core';

         @Component({
           selector: 'some-cmp',
           templateUrl: './app.html',
           styleUrls: ['./does_not_exist'],
           standalone: false,
         })
         export class SomeCmp {
           myValue!: string;
         }

         @NgModule({
           declarations: [SomeCmp],
         })
         export class AppModule{
         }
       `,
        'app.html': `{{myValue}}`,
      });
      const diagnostics = project.getDiagnosticsForFile('app.ts');
      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0].messageText).toEqual(
        `Could not find stylesheet file './does_not_exist'.`,
      );

      const template = project.openFile('app.html');
      template.moveCursorToText('{{myVa¦lue}}');
      const quickInfo = template.getQuickInfoAtPosition();
      expect(toText(quickInfo!.displayParts)).toEqual('(property) SomeCmp.myValue: string');
    });
  });

  describe('selectorless', () => {
    beforeEach(() => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
      project = env.addProject(
        'test',
        {
          'app.ts': `
            import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

            @Component({template: ''})
            export class TestComponent {
              @Input() name!: string;
              @Output() testEvent = new EventEmitter<string>();
            }

            @Directive()
            export class TestDirective {
              @Input() value!: number;
              @Output() dirEvent = new EventEmitter<number>();
            }

            @Component({templateUrl: './app.html'})
            export class AppCmp {
              stringValue = 'hello';
              numberValue = 123;
              handleEvent() {}
            }
          `,
          'app.html': 'Will be overridden',
        },
        {_enableSelectorless: true},
      );
    });

    it('should work for selectorless components', () => {
      expectQuickInfo({
        templateOverride: '<TestComp¦onent/>',
        expectedSpanText: '<TestComponent/>',
        expectedDisplayString: '(component) TestComponent',
      });
    });

    it('should work for selectorless directives', () => {
      expectQuickInfo({
        templateOverride: '<div @Test¦Directive></div>',
        expectedSpanText: '@TestDirective',
        expectedDisplayString: '(directive) TestDirective',
      });
    });

    it('should work for selectorless component input', () => {
      expectQuickInfo({
        templateOverride: '<TestComponent [na¦me]="stringValue"/>',
        expectedSpanText: 'name',
        expectedDisplayString: '(property) TestComponent.name: string',
      });
    });

    it('should work for selectorless component output', () => {
      expectQuickInfo({
        templateOverride: '<TestComponent (testEv¦ent)="handleEvent()"/>',
        expectedSpanText: 'testEvent',
        expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>',
      });
    });

    it('should work for selectorless directive input', () => {
      expectQuickInfo({
        templateOverride: '<div @TestDirective([val¦ue]="numberValue")></div>',
        expectedSpanText: 'value',
        expectedDisplayString: '(property) TestDirective.value: number',
      });
    });

    it('should work for selectorless directive output', () => {
      expectQuickInfo({
        templateOverride: '<div @TestDirective((dirEv¦ent)="handleEvent()")></div>',
        expectedSpanText: 'dirEvent',
        expectedDisplayString: '(event) TestDirective.dirEvent: EventEmitter<number>',
      });
    });

    it('should work for selectorless component references', () => {
      expectQuickInfo({
        templateOverride: '<TestComponent #r¦ef/>',
        expectedSpanText: 'ref',
        expectedDisplayString: '(reference) ref: TestComponent',
      });
    });

    it('should work for selectorless directive references', () => {
      expectQuickInfo({
        templateOverride: '<div @TestDirective(#r¦ef)></div>',
        expectedSpanText: 'ref',
        expectedDisplayString: '(reference) ref: TestDirective',
      });
    });
  });

  function expectQuickInfo({
    templateOverride,
    expectedSpanText,
    expectedDisplayString,
  }: {
    templateOverride: string;
    expectedSpanText: string;
    expectedDisplayString: string;
  }): ts.QuickInfo {
    const text = templateOverride.replace('¦', '');
    const template = project.openFile('app.html');
    template.contents = text;
    env.expectNoSourceDiagnostics();

    template.moveCursorToText(templateOverride);
    const quickInfo = template.getQuickInfoAtPosition();
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo!;
    expect(text.substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      expectedSpanText,
    );
    expect(toText(displayParts)).toEqual(expectedDisplayString);
    return quickInfo!;
  }
});

function toText(displayParts?: ts.SymbolDisplayPart[]): string {
  return (displayParts || []).map((p) => p.text).join('');
}
