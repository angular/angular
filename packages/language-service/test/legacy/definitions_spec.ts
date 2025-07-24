/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LanguageService} from '../../src/language_service';

import {APP_COMPONENT, MockService, setup} from './mock_host';
import {humanizeDefinitionInfo} from './test_utils';

describe('definitions', () => {
  let service: MockService;
  let ngLS: LanguageService;

  beforeAll(() => {
    const {project, service: _service, tsLS} = setup();
    service = _service;
    ngLS = new LanguageService(project, tsLS, {});
  });

  beforeEach(() => {
    service.reset();
  });

  describe('elements', () => {
    it('should work for native elements', () => {
      const defs = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<butt¦on></button>`,
        expectedSpanText: `<button></button>`,
      });
      expect(defs.length).toEqual(2);
      expect(defs[0].fileName).toContain('lib.dom.d.ts');
      expect(defs[0].contextSpan).toContain('interface HTMLButtonElement extends HTMLElement');
      expect(defs[1].contextSpan).toContain('declare var HTMLButtonElement');
    });
  });

  describe('templates', () => {
    it('should return no definitions for ng-templates', () => {
      const {position} = service.overwriteInlineTemplate(
        APP_COMPONENT,
        `<ng-templ¦ate></ng-template>`,
      );
      const definitionAndBoundSpan = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);
      expect(definitionAndBoundSpan).toBeUndefined();
    });
  });

  describe('directives', () => {
    it('should work for directives', () => {
      const defs = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div string-model¦></div>`,
        expectedSpanText: 'string-model',
      });
      expect(defs.length).toEqual(1);
      expect(defs[0].contextSpan).toContain('@Directive');
      expect(defs[0].contextSpan).toContain('export class StringModel');
    });

    it('should work for components', () => {
      const templateOverride = `
          <t¦est-comp>
            <div>some stuff in the middle</div>
          </test-comp>`;
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride,
        expectedSpanText: templateOverride.replace('¦', '').trim(),
      });
      expect(definitions.length).toEqual(1);

      expect(definitions.length).toEqual(1);
      expect(definitions[0].textSpan).toEqual('TestComponent');
      expect(definitions[0].contextSpan).toContain('@Component');
    });

    it('should work for structural directives', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div *¦ngFor="let item of heroes"></div>`,
        expectedSpanText: 'ngFor',
      });
      expect(definitions.length).toEqual(1);
      expect(definitions[0].fileName).toContain('ng_for_of.d.ts');
      expect(definitions[0].textSpan).toEqual('NgForOf');
      expect(definitions[0].contextSpan).toContain(
        'export declare class NgForOf<T, U extends NgIterable<T> = NgIterable<T>> implements DoCheck',
      );
    });

    it('should return binding for structural directive where key maps to a binding', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div *ng¦If="anyValue"></div>`,
        expectedSpanText: 'ngIf',
      });
      // Because the input is also part of the selector, the directive is also returned.
      expect(definitions!.length).toEqual(2);
      const [inputDef, directiveDef] = definitions;

      expect(inputDef.textSpan).toEqual('ngIf');
      expect(inputDef.contextSpan).toEqual('set ngIf(condition: T);');
      expect(directiveDef.textSpan).toEqual('NgIf');
      expect(directiveDef.contextSpan).toContain('export declare class NgIf');
    });

    it('should work for directives with compound selectors', () => {
      let defs = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<button com¦pound custom-button></button>`,
        expectedSpanText: 'compound',
      });
      expect(defs.length).toEqual(1);
      expect(defs[0].contextSpan).toContain('export class CompoundCustomButtonDirective');
      defs = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<button compound cu¦stom-button></button>`,
        expectedSpanText: 'custom-button',
      });
      expect(defs.length).toEqual(1);
      expect(defs[0].contextSpan).toContain('export class CompoundCustomButtonDirective');
    });
  });

  describe('bindings', () => {
    describe('inputs', () => {
      it('should work for input providers', () => {
        const definitions = getDefinitionsAndAssertBoundSpan({
          templateOverride: `<test-comp [tcN¦ame]="name"></test-comp>`,
          expectedSpanText: 'tcName',
        });
        expect(definitions!.length).toEqual(1);

        const [def] = definitions;
        expect(def.textSpan).toEqual('name');
        expect(def.contextSpan).toEqual(`@Input('tcName') name = 'test';`);
      });

      it('should work for text inputs', () => {
        const definitions = getDefinitionsAndAssertBoundSpan({
          templateOverride: `<test-comp tcN¦ame="name"></test-comp>`,
          expectedSpanText: 'tcName',
        });
        expect(definitions!.length).toEqual(1);

        const [def] = definitions;
        expect(def.textSpan).toEqual('name');
        expect(def.contextSpan).toEqual(`@Input('tcName') name = 'test';`);
      });

      it('should work for structural directive inputs ngForTrackBy', () => {
        const definitions = getDefinitionsAndAssertBoundSpan({
          templateOverride: `<div *ngFor="let item of heroes; tr¦ackBy: test;"></div>`,
          expectedSpanText: 'trackBy',
        });
        expect(definitions!.length).toEqual(2);

        const [setterDef, getterDef] = definitions;
        expect(setterDef.fileName).toContain('ng_for_of.d.ts');
        expect(setterDef.textSpan).toEqual('ngForTrackBy');
        expect(setterDef.contextSpan).toEqual('set ngForTrackBy(fn: TrackByFunction<T>);');
        expect(getterDef.textSpan).toEqual('ngForTrackBy');
        expect(getterDef.contextSpan).toEqual('get ngForTrackBy(): TrackByFunction<T>;');
      });

      it('should work for structural directive inputs ngForOf', () => {
        const definitions = getDefinitionsAndAssertBoundSpan({
          templateOverride: `<div *ngFor="let item o¦f heroes"></div>`,
          expectedSpanText: 'of',
        });
        // Because the input is also part of the selector ([ngFor][ngForOf]), the directive is also
        // returned.
        expect(definitions!.length).toEqual(2);
        const [inputDef, directiveDef] = definitions;

        expect(inputDef.textSpan).toEqual('ngForOf');
        expect(inputDef.contextSpan).toEqual(
          'set ngForOf(ngForOf: (U & NgIterable<T>) | undefined | null);',
        );
        expect(directiveDef.textSpan).toEqual('NgForOf');
        expect(directiveDef.contextSpan).toContain('export declare class NgForOf');
      });

      it('should work for two-way binding providers', () => {
        const definitions = getDefinitionsAndAssertBoundSpan({
          templateOverride: `<test-comp string-model [(mo¦del)]="title"></test-comp>`,
          expectedSpanText: 'model',
        });
        expect(definitions!.length).toEqual(2);

        const [inputDef, outputDef] = definitions;
        expect(inputDef.textSpan).toEqual('model');
        expect(inputDef.contextSpan).toEqual(`@Input() model: string = 'model';`);
        expect(outputDef.textSpan).toEqual('modelChange');
        expect(outputDef.contextSpan).toEqual(
          `@Output() modelChange: EventEmitter<string> = new EventEmitter();`,
        );
      });
    });

    describe('outputs', () => {
      it('should work for event providers', () => {
        const definitions = getDefinitionsAndAssertBoundSpan({
          templateOverride: `<test-comp (te¦st)="myClick($event)"></test-comp>`,
          expectedSpanText: 'test',
        });
        expect(definitions!.length).toEqual(1);

        const [def] = definitions;
        expect(def.textSpan).toEqual('testEvent');
        expect(def.contextSpan).toEqual("@Output('test') testEvent = new EventEmitter();");
      });

      it('should return nothing for $event from EventEmitter', () => {
        const {position} = service.overwriteInlineTemplate(
          APP_COMPONENT,
          `<div string-model (modelChange)="myClick($e¦vent)"></div>`,
        );
        const definitionAndBoundSpan = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);
        expect(definitionAndBoundSpan).toBeUndefined();
      });

      it('should return the directive when the event is part of the selector', () => {
        const definitions = getDefinitionsAndAssertBoundSpan({
          templateOverride: `<div (eventSelect¦or)="title = ''"></div>`,
          expectedSpanText: `eventSelector`,
        });
        expect(definitions!.length).toEqual(2);

        const [inputDef, directiveDef] = definitions;
        expect(inputDef.textSpan).toEqual('eventSelector');
        expect(inputDef.contextSpan).toEqual('@Output() eventSelector = new EventEmitter<void>();');
        expect(directiveDef.textSpan).toEqual('EventSelectorDirective');
        expect(directiveDef.contextSpan).toContain('export class EventSelectorDirective');
      });

      it('should work for $event from native element', () => {
        const definitions = getDefinitionsAndAssertBoundSpan({
          templateOverride: `<div (cl¦ick)="myClick($event)"></div>`,
          expectedSpanText: 'click',
        });
        expect(definitions!.length).toEqual(1);
        expect(definitions[0].textSpan).toEqual('addEventListener');
        expect(definitions[0].contextSpan).toContain(
          'addEventListener<K extends keyof HTMLElementEventMap>',
        );
        expect(definitions[0].fileName).toContain('lib.dom.d.ts');
      });
    });
  });

  describe('references', () => {
    it('should work for element reference declarations', () => {
      const {position} = service.overwriteInlineTemplate(
        APP_COMPONENT,
        `<div #cha¦rt></div>{{chart}}`,
      );
      const definitionAndBoundSpan = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);
      // We're already at the definition, so nothing is returned
      expect(definitionAndBoundSpan).toBeUndefined();
    });

    it('should work for element reference uses', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div #chart></div>{{char¦t}}`,
        expectedSpanText: 'chart',
      });
      expect(definitions!.length).toEqual(1);

      const [varDef] = definitions;
      expect(varDef.textSpan).toEqual('chart');
    });
  });

  describe('variables', () => {
    it('should work for array members', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div *ngFor="let hero of heroes">{{her¦o}}</div>`,
        expectedSpanText: 'hero',
      });
      expect(definitions!.length).toEqual(2);

      const [templateDeclarationDef, contextDef] = definitions;
      expect(templateDeclarationDef.textSpan).toEqual('hero');
      // `$implicit` is from the `NgForOfContext`:
      // https://github.com/angular/angular/blob/89c5255b8ca59eed27ede9e1fad69857ab0c6f4f/packages/common/src/directives/ng_for_of.ts#L15
      expect(contextDef.textSpan).toEqual('$implicit');
      expect(contextDef.contextSpan).toContain('$implicit: T;');
    });
  });

  describe('@let declarations', () => {
    it('should work for a @let declaration', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `@let value = 42; {{val¦ue}}`,
        expectedSpanText: 'value',
      });

      expect(definitions.length).toBe(1);
      const [def] = definitions;
      expect(def.textSpan).toBe('@let value = 42');
    });
  });

  describe('pipes', () => {
    it('should work for pipes', () => {
      const templateOverride = `<p>The hero's birthday is {{birthday | da¦te: "MM/dd/yy"}}</p>`;
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride,
        expectedSpanText: 'date',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('transform');
      expect(def.contextSpan).toContain('transform(value: Date | string | number, ');
    });
  });

  describe('expressions', () => {
    it('should find members in a text interpolation', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div>{{ tit¦le }}</div>`,
        expectedSpanText: 'title',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('title');
      expect(def.contextSpan).toEqual(`title = 'Tour of Heroes';`);
    });

    it('should work for accessed property reads', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div>{{title.len¦gth}}</div>`,
        expectedSpanText: 'length',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('length');
      expect(def.contextSpan).toEqual('readonly length: number;');
    });

    it('should find members in an attribute interpolation', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div string-model model="{{tit¦le}}"></div>`,
        expectedSpanText: 'title',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('title');
      expect(def.contextSpan).toEqual(`title = 'Tour of Heroes';`);
    });

    it('should find members of input binding', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<test-comp [tcName]="ti¦tle"></test-comp>`,
        expectedSpanText: 'title',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('title');
      expect(def.contextSpan).toEqual(`title = 'Tour of Heroes';`);
    });

    it('should find members of event binding', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<test-comp (test)="ti¦tle=$event"></test-comp>`,
        expectedSpanText: 'title',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('title');
      expect(def.contextSpan).toEqual(`title = 'Tour of Heroes';`);
    });

    it('should work for method calls', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div (click)="setT¦itle('title')"></div>`,
        expectedSpanText: 'setTitle',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('setTitle');
      expect(def.contextSpan).toContain('setTitle(newTitle: string)');
    });

    it('should work for accessed properties in writes', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div (click)="hero.i¦d = 2"></div>`,
        expectedSpanText: 'id',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('id');
      expect(def.contextSpan).toEqual('id: number;');
    });

    it('should work for method call arguments', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div (click)="setTitle(hero.nam¦e)"></div>`,
        expectedSpanText: 'name',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('name');
      expect(def.contextSpan).toEqual('name: string;');
    });

    it('should find members of two-way binding', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<input [(ngModel)]="ti¦tle" />`,
        expectedSpanText: 'title',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('title');
      expect(def.contextSpan).toEqual(`title = 'Tour of Heroes';`);
    });

    it('should find members in a structural directive', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div *ngIf="anyV¦alue"></div>`,
        expectedSpanText: 'anyValue',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('anyValue');
      expect(def.contextSpan).toEqual('anyValue: any;');
    });

    it('should work for variables in structural directives', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div *ngFor="let item of heroes as her¦oes2; trackBy: test;"></div>`,
        expectedSpanText: 'heroes2',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('ngForOf');
      expect(def.contextSpan).toEqual('ngForOf: U;');
    });

    it('should work for uses of members in structural directives', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div *ngFor="let item of heroes as heroes2">{{her¦oes2}}</div>`,
        expectedSpanText: 'heroes2',
      });
      expect(definitions!.length).toEqual(2);

      const [def, contextDef] = definitions;
      expect(def.textSpan).toEqual('heroes2');
      expect(def.contextSpan).toEqual('of heroes as heroes2');
      expect(contextDef.textSpan).toEqual('ngForOf');
      expect(contextDef.contextSpan).toEqual('ngForOf: U;');
    });

    it('should work for members in structural directives', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div *ngFor="let item of her¦oes; trackBy: test;"></div>`,
        expectedSpanText: 'heroes',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('heroes');
      expect(def.contextSpan).toEqual('heroes: Hero[] = [this.hero];');
    });

    it('should return nothing for the $any() cast function', () => {
      const {position} = service.overwriteInlineTemplate(
        APP_COMPONENT,
        `<div>{{$an¦y(title)}}</div>`,
      );
      const definitionAndBoundSpan = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);
      expect(definitionAndBoundSpan).toBeUndefined();
    });

    it('should work for object literals with shorthand declarations in an action', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `<div (click)="setHero({na¦me, id: 1})"></div>`,
        expectedSpanText: 'name',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('name');
      expect(def.fileName).toContain('/app/app.component.ts');
      expect(def.contextSpan).toContain(`name = 'Frodo';`);
    });

    it('should work for object literals with shorthand declarations in a data binding', () => {
      const definitions = getDefinitionsAndAssertBoundSpan({
        templateOverride: `{{ {na¦me} }}`,
        expectedSpanText: 'name',
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('name');
      expect(def.fileName).toContain('/app/app.component.ts');
      expect(def.contextSpan).toContain(`name = 'Frodo';`);
    });
  });

  describe('external resources', () => {
    it('should be able to find a template from a url', () => {
      const {position, text} = service.overwrite(
        APP_COMPONENT,
        `
        import {Component} from '@angular/core';
	      @Component({
	        templateUrl: './tes¦t.ng',
	      })
	      export class AppComponent {}`,
      );
      const result = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);

      expect(result).toBeDefined();
      const {textSpan, definitions} = result!;

      expect(text.substring(textSpan.start, textSpan.start + textSpan.length)).toEqual('./test.ng');

      expect(definitions).toBeDefined();
      expect(definitions!.length).toBe(1);
      const [def] = definitions!;
      expect(def.fileName).toContain('/app/test.ng');
      expect(def.textSpan).toEqual({start: 0, length: 0});
    });

    it('should be able to find a stylesheet from a url', () => {
      const {position, text} = service.overwrite(
        APP_COMPONENT,
        `
        import {Component} from '@angular/core';
	      @Component({
	        template: 'empty',
	        styleUrls: ['./te¦st.css']
	      })
	      export class AppComponent {}`,
      );
      const result = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);

      expect(result).toBeDefined();
      const {textSpan, definitions} = result!;

      expect(text.substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
        './test.css',
      );

      expect(definitions).toBeDefined();
      expect(definitions!.length).toBe(1);
      const [def] = definitions!;
      expect(def.fileName).toContain('/app/test.css');
      expect(def.textSpan).toEqual({start: 0, length: 0});
    });

    it('should be able to find a stylesheet from a style url', () => {
      const {position, text} = service.overwrite(
        APP_COMPONENT,
        `
        import {Component} from '@angular/core';
	      @Component({
	        template: 'empty',
	        styleUrl: './te¦st.css'
	      })
	      export class AppComponent {}`,
      );
      const result = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);

      expect(result).toBeDefined();
      const {textSpan, definitions} = result!;

      expect(text.substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
        './test.css',
      );

      expect(definitions).toBeDefined();
      expect(definitions!.length).toBe(1);
      const [def] = definitions!;
      expect(def.fileName).toContain('/app/test.css');
      expect(def.textSpan).toEqual({start: 0, length: 0});
    });

    xit('should be able to find a resource url with malformed component meta', () => {
      const {position, text} = service.overwrite(
        APP_COMPONENT,
        `
        import {Component} from '@angular/core';
	      @Component({
	        invalidProperty: '',
	        styleUrls: ['./te¦st.css']
	      })
	      export class AppComponent {}`,
      );
      const result = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);

      expect(result).toBeDefined();
      const {textSpan, definitions} = result!;

      expect(text.substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
        './test.css',
      );
      expect(definitions).toBeDefined();
      expect(definitions![0].fileName).toContain('/app/test.css');
    });
  });

  function getDefinitionsAndAssertBoundSpan({
    templateOverride,
    expectedSpanText,
  }: {
    templateOverride: string;
    expectedSpanText: string;
  }): Array<{textSpan: string; contextSpan: string | undefined; fileName: string}> {
    const {position, text} = service.overwriteInlineTemplate(APP_COMPONENT, templateOverride);
    const definitionAndBoundSpan = ngLS.getDefinitionAndBoundSpan(APP_COMPONENT, position);
    expect(definitionAndBoundSpan).toBeTruthy();
    const {textSpan, definitions} = definitionAndBoundSpan!;
    expect(text.substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      expectedSpanText,
    );
    expect(definitions).toBeTruthy();
    return definitions!.map((d) => humanizeDefinitionInfo(d, service));
  }
});
