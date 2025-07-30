/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LanguageService} from '../../src/language_service';

import {APP_COMPONENT, MockService, setup} from './mock_host';
import {HumanizedDefinitionInfo, humanizeDefinitionInfo} from './test_utils';

describe('type definitions', () => {
  let service: MockService;
  let ngLS: LanguageService;

  beforeAll(() => {
    const {project, service: _service, tsLS} = setup();
    service = _service;
    ngLS = new LanguageService(project, tsLS, {});
  });

  const possibleArrayDefFiles: readonly string[] = [
    'lib.es5.d.ts',
    'lib.es2015.core.d.ts',
    'lib.es2015.iterable.d.ts',
    'lib.es2015.symbol.wellknown.d.ts',
    'lib.es2016.array.include.d.ts',
    'lib.es2019.array.d.ts',
    'indexable.d.ts',
  ];

  beforeEach(() => {
    service.reset();
  });

  describe('elements', () => {
    it('should work for native elements', () => {
      const defs = getTypeDefinitions({
        templateOverride: `<butt¦on></button>`,
      });
      expect(defs.length).toEqual(2);
      expect(defs[0].fileName).toContain('lib.dom.d.ts');
      expect(defs[0].contextSpan).toContain('interface HTMLButtonElement extends HTMLElement');
      expect(defs[1].contextSpan).toContain('declare var HTMLButtonElement');
    });

    it('should return directives which match the element tag', () => {
      const defs = getTypeDefinitions({
        templateOverride: `<butt¦on compound custom-button></button>`,
      });
      expect(defs.length).toEqual(3);
      expect(defs[0].contextSpan).toContain('export class CompoundCustomButtonDirective');
      expect(defs[1].contextSpan).toContain('interface HTMLButtonElement extends HTMLElement');
      expect(defs[2].contextSpan).toContain('declare var HTMLButtonElement');
    });
  });

  describe('templates', () => {
    it('should return no definitions for ng-templates', () => {
      const {position} = service.overwriteInlineTemplate(
        APP_COMPONENT,
        `<ng-templ¦ate></ng-template>`,
      );
      const defs = ngLS.getTypeDefinitionAtPosition(APP_COMPONENT, position);
      expect(defs).toEqual([]);
    });
  });

  describe('directives', () => {
    it('should work for directives', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div string-model¦></div>`,
      });
      expect(definitions.length).toEqual(1);
      expect(definitions[0].fileName).toContain('parsing-cases.ts');
      expect(definitions[0].textSpan).toEqual('StringModel');
      expect(definitions[0].contextSpan).toContain('@Directive');
    });

    it('should work for components', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<t¦est-comp></test-comp>`,
      });
      expect(definitions.length).toEqual(1);
      expect(definitions[0].textSpan).toEqual('TestComponent');
      expect(definitions[0].contextSpan).toContain('@Component');
    });

    it('should work for structural directives', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div *¦ngFor="let item of heroes"></div>`,
      });
      expect(definitions.length).toEqual(1);
      expect(definitions[0].fileName).toContain('ng_for_of.d.ts');
      expect(definitions[0].textSpan).toEqual('NgForOf');
      expect(definitions[0].contextSpan).toContain(
        'export declare class NgForOf<T, U extends NgIterable<T> = NgIterable<T>> implements DoCheck',
      );
    });

    it('should work for directives with compound selectors', () => {
      let defs = getTypeDefinitions({
        templateOverride: `<button com¦pound custom-button></button>`,
      });
      expect(defs.length).toEqual(1);
      expect(defs[0].contextSpan).toContain('export class CompoundCustomButtonDirective');
      defs = getTypeDefinitions({
        templateOverride: `<button compound cu¦stom-button></button>`,
      });
      expect(defs.length).toEqual(1);
      expect(defs[0].contextSpan).toContain('export class CompoundCustomButtonDirective');
    });
  });

  describe('bindings', () => {
    describe('inputs', () => {
      it('should return something for input providers with non-primitive types', () => {
        const defs = getTypeDefinitions({
          templateOverride: `<button compound custom-button [config¦]="{}"></button>`,
        });
        expect(defs.length).toEqual(1);
        expect(defs[0].textSpan).toEqual('{color?: string}');
      });

      it('should work for structural directive inputs ngForTrackBy', () => {
        const definitions = getTypeDefinitions({
          templateOverride: `<div *ngFor="let item of heroes; tr¦ackBy: test;"></div>`,
        });
        expect(definitions!.length).toEqual(1);

        const [def] = definitions;
        expect(def.textSpan).toEqual('TrackByFunction');
        expect(def.contextSpan).toContain('export interface TrackByFunction<T>');
      });

      it('should work for structural directive inputs ngForOf', () => {
        const definitions = getTypeDefinitions({
          templateOverride: `<div *ngFor="let item o¦f heroes"></div>`,
        });
        // In addition to all the array defs, this will also return the NgForOf def because the
        // input is part of the selector ([ngFor][ngForOf]).
        expectAllDefinitions(
          definitions,
          new Set(['Array', 'NgForOf']),
          new Set([...possibleArrayDefFiles, 'ng_for_of.d.ts']),
        );
      });

      it('should return nothing for two-way binding providers', () => {
        const definitions = getTypeDefinitions({
          templateOverride: `<test-comp string-model [(mo¦del)]="title"></test-comp>`,
        });
        // TODO(atscott): This should actually return EventEmitter type but we only match the input
        // at the moment.
        expect(definitions).toEqual([]);
      });
    });

    describe('outputs', () => {
      it('should work for event providers', () => {
        const definitions = getTypeDefinitions({
          templateOverride: `<test-comp (te¦st)="myClick($event)"></test-comp>`,
        });
        expect(definitions!.length).toEqual(2);

        const [emitterInterface, emitterConst] = definitions;
        expect(emitterInterface.textSpan).toEqual('EventEmitter');
        expect(emitterInterface.contextSpan).toContain(
          'export interface EventEmitter<T> extends Subject<T>',
        );
        expect(emitterInterface.fileName).toContain('event_emitter.d.ts');
        expect(emitterConst.textSpan).toEqual('EventEmitter');
        expect(emitterConst.contextSpan).toContain('export declare const EventEmitter');
        expect(emitterConst.fileName).toContain('event_emitter.d.ts');
      });

      it('should return the directive when the event is part of the selector', () => {
        const definitions = getTypeDefinitions({
          templateOverride: `<div (eventSelect¦or)="title = ''"></div>`,
        });
        expect(definitions!.length).toEqual(3);

        // EventEmitter tested in previous test
        const directiveDef = definitions[2];
        expect(directiveDef.contextSpan).toContain('export class EventSelectorDirective');
      });

      it('should work for native event outputs', () => {
        const definitions = getTypeDefinitions({
          templateOverride: `<div (cl¦ick)="myClick($event)"></div>`,
        });
        expect(definitions!.length).toEqual(1);
        expect(definitions[0].textSpan).toEqual('addEventListener');
        expect(definitions[0].contextSpan).toEqual(
          'addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;',
        );
        expect(definitions[0].fileName).toContain('lib.dom.d.ts');
      });
    });
  });

  describe('references', () => {
    it('should work for element references', () => {
      const defs = getTypeDefinitions({
        templateOverride: `<div #chart></div>{{char¦t}}`,
      });
      expect(defs.length).toEqual(2);
      expect(defs[0].contextSpan).toContain('interface HTMLDivElement extends HTMLElement');
      expect(defs[1].contextSpan).toContain('declare var HTMLDivElement');
    });

    it('should work for directive references', () => {
      const defs = getTypeDefinitions({
        templateOverride: `<div #mod¦el="stringModel" string-model></div>`,
      });
      expect(defs.length).toEqual(1);
      expect(defs[0].contextSpan).toContain('@Directive');
      expect(defs[0].contextSpan).toContain('export class StringModel');
    });
  });

  describe('variables', () => {
    it('should work for array members', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div *ngFor="let hero of heroes">{{her¦o}}</div>`,
      });
      expect(definitions!.length).toEqual(1);

      expect(definitions[0].textSpan).toEqual('Hero');
      expect(definitions[0].contextSpan).toContain('export interface Hero');
    });
  });

  describe('@let declarations', () => {
    it('should work for a let declaration', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `@let address = hero.address; {{addr¦ess}}`,
      });

      expect(definitions.length).toEqual(1);
      expect(definitions[0].textSpan).toBe('Address');
      expect(definitions[0].contextSpan).toContain('export interface Address');
    });
  });

  describe('pipes', () => {
    it('should work for pipes', () => {
      const templateOverride = `<p>The hero's birthday is {{birthday | da¦te: "MM/dd/yy"}}</p>`;
      const definitions = getTypeDefinitions({
        templateOverride,
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('transform');
      expect(def.contextSpan).toContain('transform(value: Date');
    });
  });

  describe('expressions', () => {
    it('should return nothing for primitives', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div>{{ tit¦le }}</div>`,
      });
      expect(definitions!.length).toEqual(0);
    });

    // TODO(atscott): Investigate why this returns nothing in the test environment. This actually
    // works in the extension.
    xit('should work for functions on primitives', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div>{{ title.toLower¦case() }}</div>`,
      });
      expect(definitions!.length).toEqual(1);
      expect(definitions[0].textSpan).toEqual('toLowerCase');
      expect(definitions[0].fileName).toContain('lib.es5.d.ts');
    });

    it('should work for accessed property reads', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div>{{heroes[0].addre¦ss}}</div>`,
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('Address');
      expect(def.contextSpan).toContain('export interface Address');
    });

    it('should work for $event', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<button (click)="title=$ev¦ent"></button>`,
      });
      expect(definitions!.length).toEqual(2);

      const [def1, def2] = definitions;
      expect(def1.textSpan).toEqual('MouseEvent');
      expect(def1.contextSpan).toContain(`interface MouseEvent extends UIEvent`);
      expect(def2.textSpan).toEqual('MouseEvent');
      expect(def2.contextSpan).toContain(`declare var MouseEvent:`);
    });

    it('should work for method calls', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div (click)="setT¦itle('title')"></div>`,
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('setTitle');
      expect(def.contextSpan).toContain('setTitle(newTitle: string)');
    });

    it('should work for accessed properties in writes', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div (click)="hero.add¦ress = undefined"></div>`,
      });
      expect(definitions!.length).toEqual(1);

      const [def] = definitions;
      expect(def.textSpan).toEqual('Address');
      expect(def.contextSpan).toContain('export interface Address');
    });

    it('should work for variables in structural directives', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div *ngFor="let item of heroes as her¦oes2; trackBy: test;"></div>`,
      });
      expectAllDefinitions(
        definitions,
        new Set(['Hero', 'Array']),
        new Set([...possibleArrayDefFiles, 'app.component.ts']),
      );
    });

    it('should work for uses of members in structural directives', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div *ngFor="let item of heroes as heroes2">{{her¦oes2}}</div>`,
      });
      expectAllDefinitions(
        definitions,
        new Set(['Hero', 'Array']),
        new Set([...possibleArrayDefFiles, 'app.component.ts']),
      );
    });

    it('should work for members in structural directives', () => {
      const definitions = getTypeDefinitions({
        templateOverride: `<div *ngFor="let item of her¦oes; trackBy: test;"></div>`,
      });
      expectAllDefinitions(
        definitions,
        new Set(['Hero', 'Array']),
        new Set([...possibleArrayDefFiles, 'app.component.ts']),
      );
    });

    it('should return nothing for the $any() cast function', () => {
      const {position} = service.overwriteInlineTemplate(
        APP_COMPONENT,
        `<div>{{$an¦y(title)}}</div>`,
      );
      const definitionAndBoundSpan = ngLS.getTypeDefinitionAtPosition(APP_COMPONENT, position);
      expect(definitionAndBoundSpan).toBeUndefined();
    });
  });

  function getTypeDefinitions({
    templateOverride,
  }: {
    templateOverride: string;
  }): HumanizedDefinitionInfo[] {
    const {position} = service.overwriteInlineTemplate(APP_COMPONENT, templateOverride);
    const defs = ngLS.getTypeDefinitionAtPosition(APP_COMPONENT, position);
    expect(defs).toBeTruthy();
    return defs!.map((d) => humanizeDefinitionInfo(d, service));
  }

  function expectAllDefinitions(
    definitions: HumanizedDefinitionInfo[],
    textSpans: Set<string>,
    possibleFileNames: Set<string>,
  ) {
    expect(definitions!.length).toBeGreaterThan(0);
    const actualTextSpans = new Set(definitions.map((d) => d.textSpan));
    expect(actualTextSpans).toEqual(textSpans);
    for (const def of definitions) {
      const fileName = def.fileName.split('/').slice(-1)[0];
      expect(possibleFileNames)
        .withContext(`Expected ${fileName} to be one of: ${possibleFileNames}`)
        .toContain(fileName);
    }
  }
});
