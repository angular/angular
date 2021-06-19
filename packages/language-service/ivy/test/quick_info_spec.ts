/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import * as ts from 'typescript/lib/tsserverlibrary';
import {LanguageServiceTestEnv, Project} from '../testing';

function quickInfoSkeleton(): {[fileName: string]: string} {
  return {
    'app.ts': `
        import {Component, Directive, EventEmitter, Input, NgModule, Output, Pipe, PipeTransform} from '@angular/core';
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
        })
        export class TestComponent {
          @Input('tcName') name!: string;
          @Output('test') testEvent!: EventEmitter<string>;
        } /*EndTestComponent*/

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
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
          birthday!: Date;
          anyValue!: any;
          myClick(event: any) {}
          setTitle(newTitle: string) {}
          trackByFn!: any;
          name!: any;
        }

        @Directive({
          selector: '[string-model]',
          exportAs: 'stringModel',
        })
        export class StringModel {
          @Input() model!: string;
          @Output() modelChange!: EventEmitter<string>;
        }

        @Directive({selector: 'button[custom-button][compound]'})
        export class CompoundCustomButtonDirective {
          @Input() config?: {color?: string};
        }

        @NgModule({
          declarations: [
            AppCmp,
            CompoundCustomButtonDirective,
            StringModel,
            TestComponent,
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
          expectedDisplayString: '(element) button: HTMLButtonElement'
        });
      });

      it('should work for directives which match native element tags', () => {
        expectQuickInfo({
          templateOverride: `<butt¦on compound custom-button></button>`,
          expectedSpanText: '<button compound custom-button></button>',
          expectedDisplayString: '(directive) AppModule.CompoundCustomButtonDirective'
        });
      });
    });

    describe('templates', () => {
      it('should return undefined for ng-templates', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<ng-templ¦ate></ng-template>`,
          expectedSpanText: '<ng-template></ng-template>',
          expectedDisplayString: '(template) ng-template'
        });
        expect(toText(documentation))
            .toContain('The `<ng-template>` is an Angular element for rendering HTML.');
      });
    });

    describe('directives', () => {
      it('should work for directives', () => {
        expectQuickInfo({
          templateOverride: `<div string-model¦></div>`,
          expectedSpanText: 'string-model',
          expectedDisplayString: '(directive) AppModule.StringModel'
        });
      });

      it('should work for components', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<t¦est-comp></test-comp>`,
          expectedSpanText: '<test-comp></test-comp>',
          expectedDisplayString: '(component) AppModule.TestComponent'
        });
        expect(toText(documentation)).toBe('This Component provides the `test-comp` selector.');
      });

      it('should work for components with bound attributes', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<t¦est-comp [attr.id]="'1' + '2'" [attr.name]="'myName'"></test-comp>`,
          expectedSpanText: `<test-comp [attr.id]="'1' + '2'" [attr.name]="'myName'"></test-comp>`,
          expectedDisplayString: '(component) AppModule.TestComponent'
        });
        expect(toText(documentation)).toBe('This Component provides the `test-comp` selector.');
      });

      it('should work for structural directives', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<div *¦ngFor="let item of heroes"></div>`,
          expectedSpanText: 'ngFor',
          expectedDisplayString: '(directive) NgForOf<Hero, Hero[]>'
        });
        expect(toText(documentation)).toContain('A fake version of the NgFor directive.');
      });

      it('should work for directives with compound selectors, some of which are bindings', () => {
        expectQuickInfo({
          templateOverride:
              `<ng-template ngF¦or let-hero [ngForOf]="heroes">{{hero}}</ng-template>`,
          expectedSpanText: 'ngFor',
          expectedDisplayString: '(directive) NgForOf<Hero, Hero[]>'
        });
      });

      it('should work for data-let- syntax', () => {
        expectQuickInfo({
          templateOverride:
              `<ng-template ngFor data-let-he¦ro [ngForOf]="heroes">{{hero}}</ng-template>`,
          expectedSpanText: 'hero',
          expectedDisplayString: '(variable) hero: Hero'
        });
      });
    });

    describe('bindings', () => {
      describe('inputs', () => {
        it('should work for input providers', () => {
          expectQuickInfo({
            templateOverride: `<test-comp [tcN¦ame]="name"></test-comp>`,
            expectedSpanText: 'tcName',
            expectedDisplayString: '(property) TestComponent.name: string'
          });
        });

        it('should work for bind- syntax', () => {
          expectQuickInfo({
            templateOverride: `<test-comp bind-tcN¦ame="name"></test-comp>`,
            expectedSpanText: 'tcName',
            expectedDisplayString: '(property) TestComponent.name: string'
          });
          expectQuickInfo({
            templateOverride: `<test-comp data-bind-tcN¦ame="name"></test-comp>`,
            expectedSpanText: 'tcName',
            expectedDisplayString: '(property) TestComponent.name: string'
          });
        });

        it('should work for structural directive inputs ngForTrackBy', () => {
          expectQuickInfo({
            templateOverride: `<div *ngFor="let item of heroes; tr¦ackBy: trackByFn;"></div>`,
            expectedSpanText: 'trackBy',
            expectedDisplayString:
                '(property) NgForOf<Hero, Hero[]>.ngForTrackBy: TrackByFunction<Hero>'
          });
        });

        it('should work for structural directive inputs ngForOf', () => {
          expectQuickInfo({
            templateOverride: `<div *ngFor="let item o¦f heroes; trackBy: trackByFn;"></div>`,
            expectedSpanText: 'of',
            expectedDisplayString:
                '(property) NgForOf<Hero, Hero[]>.ngForOf: (Hero[] & NgIterable<Hero>) | null | undefined'
          });
        });

        it('should work for two-way binding providers', () => {
          expectQuickInfo({
            templateOverride: `<test-comp string-model [(mo¦del)]="title"></test-comp>`,
            expectedSpanText: 'model',
            expectedDisplayString: '(property) StringModel.model: string'
          });
        });
      });

      describe('outputs', () => {
        it('should work for event providers', () => {
          expectQuickInfo({
            templateOverride: `<test-comp (te¦st)="myClick($event)"></test-comp>`,
            expectedSpanText: 'test',
            expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>'
          });
        });

        it('should work for on- syntax binding', () => {
          expectQuickInfo({
            templateOverride: `<test-comp on-te¦st="myClick($event)"></test-comp>`,
            expectedSpanText: 'test',
            expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>'
          });
          expectQuickInfo({
            templateOverride: `<test-comp data-on-te¦st="myClick($event)"></test-comp>`,
            expectedSpanText: 'test',
            expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>'
          });
        });

        it('should work for $event from EventEmitter', () => {
          expectQuickInfo({
            templateOverride: `<div string-model (modelChange)="myClick($e¦vent)"></div>`,
            expectedSpanText: '$event',
            expectedDisplayString: '(parameter) $event: string'
          });
        });

        it('should work for $event from native element', () => {
          expectQuickInfo({
            templateOverride: `<div (click)="myClick($e¦vent)"></div>`,
            expectedSpanText: '$event',
            expectedDisplayString: '(parameter) $event: MouseEvent'
          });
        });
      });
    });

    describe('references', () => {
      it('should work for element reference declarations', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<div #¦chart></div>`,
          expectedSpanText: 'chart',
          expectedDisplayString: '(reference) chart: HTMLDivElement'
        });
        expect(toText(documentation))
            .toEqual(
                'Provides special properties (beyond the regular HTMLElement ' +
                'interface it also has available to it by inheritance) for manipulating <div> elements.');
      });

      it('should work for directive references', () => {
        expectQuickInfo({
          templateOverride: `<div string-model #dir¦Ref="stringModel"></div>`,
          expectedSpanText: 'dirRef',
          expectedDisplayString: '(reference) dirRef: StringModel'
        });
      });

      it('should work for ref- syntax', () => {
        expectQuickInfo({
          templateOverride: `<div ref-ch¦art></div>`,
          expectedSpanText: 'chart',
          expectedDisplayString: '(reference) chart: HTMLDivElement'
        });
        expectQuickInfo({
          templateOverride: `<div data-ref-ch¦art></div>`,
          expectedSpanText: 'chart',
          expectedDisplayString: '(reference) chart: HTMLDivElement'
        });
      });

      it('should work for $event from native element', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="myClick($e¦vent)"></div>`,
          expectedSpanText: '$event',
          expectedDisplayString: '(parameter) $event: MouseEvent'
        });
      });

      it('should work for click output from native element', () => {
        expectQuickInfo({
          templateOverride: `<div (cl¦ick)="myClick($event)"></div>`,
          expectedSpanText: 'click',
          expectedDisplayString:
              '(event) HTMLDivElement.addEventListener<"click">(type: "click", ' +
              'listener: (this: HTMLDivElement, ev: MouseEvent) => any, ' +
              'options?: boolean | AddEventListenerOptions | undefined): void (+1 overload)'
        });
      });
    });

    describe('variables', () => {
      it('should work for array members', () => {
        const {documentation} = expectQuickInfo({
          templateOverride: `<div *ngFor="let hero of heroes">{{her¦o}}</div>`,
          expectedSpanText: 'hero',
          expectedDisplayString: '(variable) hero: Hero'
        });
        expect(toText(documentation)).toEqual('The most heroic being.');
      });

      it('should work for ReadonlyArray members (#36191)', () => {
        expectQuickInfo({
          templateOverride: `<div *ngFor="let hero of readonlyHeroes">{{her¦o}}</div>`,
          expectedSpanText: 'hero',
          expectedDisplayString: '(variable) hero: Readonly<Hero>'
        });
      });

      it('should work for const array members (#36191)', () => {
        expectQuickInfo({
          templateOverride: `<div *ngFor="let name of constNames">{{na¦me}}</div>`,
          expectedSpanText: 'name',
          expectedDisplayString: '(variable) name: { readonly name: "name"; }'
        });
      });

      it('should work for safe keyed reads', () => {
        expectQuickInfo({
          templateOverride: `<div>{{constNames?.[0¦]}}</div>`,
          expectedSpanText: '0',
          expectedDisplayString: '(property) 0: {\n    readonly name: "name";\n}'
        });

        expectQuickInfo({
          templateOverride: `<div>{{constNames?.[0]?.na¦me}}</div>`,
          expectedSpanText: 'constNames?.[0]?.name',
          expectedDisplayString: '(property) name: "name"'
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
              '(pipe) DatePipe.transform(value: string | number | Date, format?: string | undefined, timezone?: ' +
              'string | undefined, locale?: string | undefined): string | null (+2 overloads)'
        });
      });
    });

    describe('expressions', () => {
      it('should find members in a text interpolation', () => {
        expectQuickInfo({
          templateOverride: `<div>{{ tit¦le }}</div>`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string'
        });
      });

      it('should work for accessed property reads', () => {
        expectQuickInfo({
          templateOverride: `<div>{{title.len¦gth}}</div>`,
          expectedSpanText: 'length',
          expectedDisplayString: '(property) String.length: number'
        });
      });

      it('should find members in an attribute interpolation', () => {
        expectQuickInfo({
          templateOverride: `<div string-model model="{{tit¦le}}"></div>`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string'
        });
      });

      it('should find members of input binding', () => {
        expectQuickInfo({
          templateOverride: `<test-comp [tcName]="ti¦tle"></test-comp>`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string'
        });
      });

      it('should find input binding on text attribute', () => {
        expectQuickInfo({
          templateOverride: `<test-comp tcN¦ame="title"></test-comp>`,
          expectedSpanText: 'tcName',
          expectedDisplayString: '(property) TestComponent.name: string'
        });
      });

      it('should find members of event binding', () => {
        expectQuickInfo({
          templateOverride: `<test-comp (test)="ti¦tle=$event"></test-comp>`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string'
        });
      });

      it('should work for method calls', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="setT¦itle('title')"></div>`,
          expectedSpanText: 'setTitle',
          expectedDisplayString: '(method) AppCmp.setTitle(newTitle: string): void'
        });
      });

      it('should work for accessed properties in writes', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="hero.i¦d = 2"></div>`,
          expectedSpanText: 'id',
          expectedDisplayString: '(property) Hero.id: number'
        });
      });

      it('should work for method call arguments', () => {
        expectQuickInfo({
          templateOverride: `<div (click)="setTitle(hero.nam¦e)"></div>`,
          expectedSpanText: 'name',
          expectedDisplayString: '(property) Hero.name: string'
        });
      });

      it('should find members of two-way binding', () => {
        expectQuickInfo({
          templateOverride: `<input string-model [(model)]="ti¦tle" />`,
          expectedSpanText: 'title',
          expectedDisplayString: '(property) AppCmp.title: string'
        });
      });

      it('should find members in a structural directive', () => {
        expectQuickInfo({
          templateOverride: `<div *ngIf="anyV¦alue"></div>`,
          expectedSpanText: 'anyValue',
          expectedDisplayString: '(property) AppCmp.anyValue: any'
        });
      });

      it('should work for members in structural directives', () => {
        expectQuickInfo({
          templateOverride: `<div *ngFor="let item of her¦oes; trackBy: trackByFn;"></div>`,
          expectedSpanText: 'heroes',
          expectedDisplayString: '(property) AppCmp.heroes: Hero[]'
        });
      });

      it('should work for the $any() cast function', () => {
        expectQuickInfo({
          templateOverride: `<div>{{$an¦y(title)}}</div>`,
          expectedSpanText: '$any',
          expectedDisplayString: '(method) $any: any'
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
    });

    it('should work for object literal with shorthand property declarations', () => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
      project = env.addProject(
          'test', {
            'app.ts': `
            import {Component, NgModule} from '@angular/core';
            import {CommonModule} from '@angular/common';

            @Component({
              selector: 'some-cmp',
              templateUrl: './app.html',
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
          {strictTemplates: true});
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
  });

  describe('generics', () => {
    beforeEach(() => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
    });

    it('should get quick info for the generic input of a directive that normally requires inlining',
       () => {
         // When compiling normally, we would have to inline the type constructor of `GenericDir`
         // because its generic type parameter references `PrivateInterface`, which is not exported.
         project = env.addProject('test', {
           'app.ts': `
          import {Directive, Component, Input, NgModule} from '@angular/core';

          interface PrivateInterface {}

          @Directive({
            selector: '[dir]'
          })export class GenericDir <T extends PrivateInterface>{
            @Input('input') input: T = null!;
          }

          @Component({
            selector: 'some-cmp',
            templateUrl: './app.html'
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
           expectedDisplayString: '(property) GenericDir<any>.input: any'
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
        expectedDisplayString: '(property) TestComponent.name: string'
      });
    });

    it('can still get quick info when strictOutputEventTypes is false', () => {
      project = env.addProject('test', quickInfoSkeleton(), {strictOutputEventTypes: false});
      expectQuickInfo({
        templateOverride: `<test-comp (te¦st)="myClick($event)"></test-comp>`,
        expectedSpanText: 'test',
        expectedDisplayString: '(event) TestComponent.testEvent: EventEmitter<string>'
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
            '(pipe) DatePipe.transform(value: string | number | Date, format?: string | undefined, timezone?: ' +
            'string | undefined, locale?: string | undefined): string | null (+2 overloads)'
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
      expect(diagnostics[0].messageText)
          .toEqual(`Could not find stylesheet file './does_not_exist'.`);

      const template = project.openFile('app.html');
      template.moveCursorToText('{{myVa¦lue}}');
      const quickInfo = template.getQuickInfoAtPosition();
      expect(toText(quickInfo!.displayParts)).toEqual('(property) SomeCmp.myValue: string');
    });
  });

  function expectQuickInfo(
      {templateOverride, expectedSpanText, expectedDisplayString}:
          {templateOverride: string, expectedSpanText: string, expectedDisplayString: string}):
      ts.QuickInfo {
    const text = templateOverride.replace('¦', '');
    const template = project.openFile('app.html');
    template.contents = text;
    env.expectNoSourceDiagnostics();

    template.moveCursorToText(templateOverride);
    const quickInfo = template.getQuickInfoAtPosition();
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo!;
    expect(text.substring(textSpan.start, textSpan.start + textSpan.length))
        .toEqual(expectedSpanText);
    expect(toText(displayParts)).toEqual(expectedDisplayString);
    return quickInfo!;
  }
});

function toText(displayParts?: ts.SymbolDisplayPart[]): string {
  return (displayParts || []).map(p => p.text).join('');
}
