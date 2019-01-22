/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createRootContext} from '../../../src/render3/component';
import {getLContext} from '../../../src/render3/context_discovery';
import {defineComponent, defineDirective} from '../../../src/render3/index';
import {createLView, createTView, elementClassProp, elementEnd, elementHostAttrs, elementStart, elementStyleProp, elementStyling, elementStylingApply, elementStylingMap, namespaceSVG} from '../../../src/render3/instructions';
import {RenderFlags} from '../../../src/render3/interfaces/definition';
import {AttributeMarker, TAttributes} from '../../../src/render3/interfaces/node';
import {BindingStore, BindingType, PlayState, Player, PlayerContext, PlayerFactory, PlayerHandler} from '../../../src/render3/interfaces/player';
import {RElement, Renderer3, domRendererFactory3} from '../../../src/render3/interfaces/renderer';
import {StylingContext, StylingFlags, StylingIndex} from '../../../src/render3/interfaces/styling';
import {CONTEXT, LView, LViewFlags, RootContext} from '../../../src/render3/interfaces/view';
import {addPlayer, getPlayers} from '../../../src/render3/players';
import {ClassAndStylePlayerBuilder, compareLogSummaries, directiveOwnerPointers, generateConfigSummary, getDirectiveIndexFromEntry, initializeStaticContext, isContextDirty, patchContextWithStaticAttrs, renderStyling as _renderStyling, setContextDirty, updateClassProp, updateContextWithBindings, updateStyleProp, updateStylingMap} from '../../../src/render3/styling/class_and_style_bindings';
import {CorePlayerHandler} from '../../../src/render3/styling/core_player_handler';
import {BoundPlayerFactory, bindPlayerFactory} from '../../../src/render3/styling/player_factory';
import {allocStylingContext, createEmptyStylingContext} from '../../../src/render3/styling/util';
import {defaultStyleSanitizer} from '../../../src/sanitization/sanitization';
import {StyleSanitizeFn} from '../../../src/sanitization/style_sanitizer';
import {ComponentFixture, renderToHtml} from '../render_util';

import {MockPlayer} from './mock_player';

describe('style and class based bindings', () => {
  let element: RElement|null = null;
  beforeEach(() => { element = document.createElement('div') as any; });

  function createMockViewData(playerHandler: PlayerHandler, context: StylingContext): LView {
    const rootContext =
        createRootContext(requestAnimationFrame.bind(window), playerHandler || null);
    const lView = createLView(
        null, createTView(-1, null, 1, 0, null, null, null), rootContext, LViewFlags.IsRoot,
        domRendererFactory3, domRendererFactory3.createRenderer(element, null));
    return lView;
  }

  function initContext(
      initialStyles?: (number | string)[] | null, styleBindings?: string[] | null,
      initialClasses?: (string | number | boolean)[] | null, classBindings?: string[] | null,
      sanitizer?: StyleSanitizeFn | null): StylingContext {
    const attrsWithStyling: TAttributes = [];
    if (initialClasses) {
      attrsWithStyling.push(AttributeMarker.Classes);
      attrsWithStyling.push(...initialClasses as any);
    }
    if (initialStyles) {
      attrsWithStyling.push(AttributeMarker.Styles);
      attrsWithStyling.push(...initialStyles as any);
    }

    const tpl = initializeStaticContext(attrsWithStyling) !;
    updateContextWithBindings(tpl, null, classBindings || null, styleBindings || null, sanitizer);
    return allocStylingContext(element, tpl);
  }

  function patchContext(
      context: StylingContext, styles?: string[] | null, classes?: string[] | null,
      directiveRef?: any) {
    const attrs: (string | AttributeMarker)[] = [];
    if (classes && classes.length) {
      attrs.push(AttributeMarker.Classes);
      attrs.push(...classes);
    }
    if (styles && styles.length) {
      attrs.push(AttributeMarker.Styles);
      attrs.push(...styles);
    }
    patchContextWithStaticAttrs(context, attrs, 0, directiveRef || null);
  }

  function getRootContextInternal(lView: LView) { return lView[CONTEXT] as RootContext; }

  function renderStyles(
      context: StylingContext, firstRender?: boolean, renderer?: Renderer3, lView?: LView) {
    const store = new MockStylingStore(element as HTMLElement, BindingType.Style);
    const handler = new CorePlayerHandler();
    _renderStyling(
        context, (renderer || {}) as Renderer3,
        getRootContextInternal(lView || createMockViewData(handler, context)), !!firstRender, null,
        store);
    return store.getValues();
  }

  function trackStylesFactory(store?: MockStylingStore) {
    store = store || new MockStylingStore(element as HTMLElement, BindingType.Style);
    const handler = new CorePlayerHandler();
    return function(
        context: StylingContext, targetDirective?: any, firstRender?: boolean,
        renderer?: Renderer3): {[key: string]: any} {
      const lView = createMockViewData(handler, context);
      _renderStyling(
          context, (renderer || {}) as Renderer3, getRootContextInternal(lView), !!firstRender,
          null, store, targetDirective);
      return store !.getValues();
    };
  }

  function trackClassesFactory(store?: MockStylingStore) {
    store = store || new MockStylingStore(element as HTMLElement, BindingType.Class);
    const handler = new CorePlayerHandler();
    return function(context: StylingContext, firstRender?: boolean, renderer?: Renderer3):
        {[key: string]: any} {
          const lView = createMockViewData(handler, context);
          _renderStyling(
              context, (renderer || {}) as Renderer3, getRootContextInternal(lView), !!firstRender,
              store);
          return store !.getValues();
        };
  }

  function trackStylesAndClasses() {
    const classStore = new MockStylingStore(element as HTMLElement, BindingType.Class);
    const styleStore = new MockStylingStore(element as HTMLElement, BindingType.Style);
    const handler = new CorePlayerHandler();
    return function(context: StylingContext, firstRender?: boolean, renderer?: Renderer3):
        {[key: string]: any} {
          const lView = createMockViewData(handler, context);
          _renderStyling(
              context, (renderer || {}) as Renderer3, getRootContextInternal(lView), !!firstRender,
              classStore, styleStore);
          return [classStore.getValues(), styleStore.getValues()];
        };
  }

  function updateClasses(context: StylingContext, classes: string | {[key: string]: any} | null) {
    updateStylingMap(context, classes, null);
  }

  function updateStyles(context: StylingContext, styles: {[key: string]: any} | null) {
    updateStylingMap(context, null, styles);
  }

  function cleanStyle(a: number = 0, b: number = 0): number { return _clean(a, b, false, false); }

  function masterConfig(multiIndexStart: number, dirty: boolean = false, locked = true) {
    let num = 0;
    num |= multiIndexStart << (StylingFlags.BitCountSize + StylingIndex.BitCountSize);
    if (dirty) {
      num |= StylingFlags.Dirty;
    }
    if (locked) {
      num |= StylingFlags.BindingAllocationLocked;
    }
    return num;
  }

  function cleanStyleWithSanitization(a: number = 0, b: number = 0): number {
    return _clean(a, b, false, true);
  }

  function cleanClass(a: number, b: number) { return _clean(a, b, true); }

  function _clean(
      a: number = 0, b: number = 0, isClassBased: boolean, sanitizable?: boolean): number {
    let num = 0;
    if (a) {
      num |= a << StylingFlags.BitCountSize;
    }
    if (b) {
      num |= b << (StylingFlags.BitCountSize + StylingIndex.BitCountSize);
    }
    if (isClassBased) {
      num |= StylingFlags.Class;
    }
    if (sanitizable) {
      num |= StylingFlags.Sanitize;
    }
    return num;
  }

  function _dirty(
      a: number = 0, b: number = 0, isClassBased: boolean, sanitizable?: boolean): number {
    return _clean(a, b, isClassBased, sanitizable) | StylingFlags.Dirty;
  }

  function dirtyStyle(a: number = 0, b: number = 0): number {
    return _dirty(a, b, false) | StylingFlags.Dirty;
  }

  function dirtyStyleWithSanitization(a: number = 0, b: number = 0): number {
    return _dirty(a, b, false, true);
  }

  function dirtyClass(a: number, b: number) { return _dirty(a, b, true); }

  function makePlayerBuilder<T = any>(
      factory: PlayerFactory, isClassBased?: boolean, elm?: HTMLElement) {
    return new ClassAndStylePlayerBuilder(
        factory, (elm || element) as HTMLElement,
        isClassBased ? BindingType.Class : BindingType.Style);
  }

  describe('styles', () => {
    describe('static styling properties within a context', () => {
      it('should initialize empty template', () => {
        const template = initContext();
        assertContext(template, [
          masterConfig(9),
          [null, 2, false, null],
          [null],
          [null],
          [0, 0, 0, 0],
          element,
          null,
          null,
          null,
        ]);
      });

      it('should initialize static styles and classes', () => {
        const template = initContext(['color', 'red', 'width', '10px'], null, ['foo', 'bar']);
        assertContext(template, [
          masterConfig(9),
          [null, 2, false, null],
          [null, 'color', 'red', 'width', '10px'],
          [null, 'foo', true, 'bar', true],
          [0, 0, 0, 0],
          element,
          null,
          null,
          null,
        ]);
      });

      it('should initialize and then patch static styling inline with existing static styling',
         () => {
           const template = initContext(['color', 'red'], null, ['foo']);
           expect(template[StylingIndex.InitialStyleValuesPosition]).toEqual([
             null,
             'color',
             'red',
           ]);
           expect(template[StylingIndex.InitialClassValuesPosition]).toEqual([
             null,
             'foo',
             true,
           ]);

           patchContext(template, ['color', 'black', 'height', '200px'], ['bar', 'foo'], '1');
           expect(template[StylingIndex.InitialStyleValuesPosition]).toEqual([
             null, 'color', 'red', 'height', '200px'
           ]);
           expect(template[StylingIndex.InitialClassValuesPosition]).toEqual([
             null, 'foo', true, 'bar', true
           ]);
         });

      it('should only populate static styles for a given directive once', () => {
        const template = initContext(['color', 'red'], null, ['foo']);
        expect(template[StylingIndex.InitialStyleValuesPosition]).toEqual([
          null,
          'color',
          'red',
        ]);
        expect(template[StylingIndex.InitialClassValuesPosition]).toEqual([
          null,
          'foo',
          true,
        ]);

        patchContext(template, ['color', 'black', 'height', '200px'], ['bar', 'foo']);
        expect(template[StylingIndex.InitialStyleValuesPosition]).toEqual([
          null,
          'color',
          'red',
        ]);
        expect(template[StylingIndex.InitialClassValuesPosition]).toEqual([
          null,
          'foo',
          true,
        ]);

        patchContext(template, ['color', 'black', 'height', '200px'], ['bar', 'foo'], '1');
        expect(template[StylingIndex.InitialStyleValuesPosition]).toEqual([
          null,
          'color',
          'red',
          'height',
          '200px',
        ]);
        expect(template[StylingIndex.InitialClassValuesPosition]).toEqual([
          null, 'foo', true, 'bar', true
        ]);

        patchContext(template, ['color', 'black', 'height', '200px'], ['bar', 'foo'], '1');
        expect(template[StylingIndex.InitialStyleValuesPosition]).toEqual([
          null,
          'color',
          'red',
          'height',
          '200px',
        ]);
        expect(template[StylingIndex.InitialClassValuesPosition]).toEqual([
          null,
          'foo',
          true,
          'bar',
          true,
        ]);
      });
    });

    describe('instructions', () => {
      it('should handle a combination of initial, multi and singular style values (in that order)',
         () => {
           function Template(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               elementStart(0, 'span', [
                 AttributeMarker.Styles,
                 'width',
                 '200px',
                 'height',
                 '100px',
                 'opacity',
                 '0.5',
               ]);
               elementStyling(null, ['width']);
               elementEnd();
             }
             if (rf & RenderFlags.Update) {
               elementStylingMap(0, null, ctx.myStyles);
               elementStyleProp(0, 0, ctx.myWidth);
               elementStylingApply(0);
             }
           }

           expect(renderToHtml(
                      Template, {myStyles: {width: '200px', height: '200px'}, myWidth: '300px'}, 1))
               .toEqual('<span style="height: 200px; opacity: 0.5; width: 300px;"></span>');

           expect(
               renderToHtml(Template, {myStyles: {width: '200px', height: null}, myWidth: null}, 1))
               .toEqual('<span style="height: 100px; opacity: 0.5; width: 200px;"></span>');
         });

      it('should support styles on SVG elements', () => {
        // <svg [style.width.px]="diameter" [style.height.px]="diameter">
        //   <circle stroke="green" fill="yellow" />
        // </svg>
        class Comp {
          diameter: number = 100;

          static ngComponentDef = defineComponent({
            type: Comp,
            selectors: [['comp']],
            factory: () => new Comp(),
            consts: 2,
            vars: 0,
            template: (rf: RenderFlags, ctx: Comp) => {
              if (rf & RenderFlags.Create) {
                namespaceSVG();
                elementStart(0, 'svg');
                elementStyling(null, ['width', 'height']);
                elementStart(1, 'circle', ['stroke', 'green', 'fill', 'yellow']);
                elementEnd();
                elementEnd();
              }
              if (rf & RenderFlags.Update) {
                elementStyleProp(0, 0, ctx.diameter, 'px');
                elementStyleProp(0, 1, ctx.diameter, 'px');
                elementStylingApply(0);
              }
            }
          });
        }

        const fixture = new ComponentFixture(Comp);
        fixture.update();

        const target = fixture.hostElement.querySelector('svg') !as any;
        expect(target.style.width).toEqual('100px');
        expect(target.style.height).toEqual('100px');

        expect(fixture.html)
            .toEqual(
                '<svg style="height: 100px; width: 100px;"><circle fill="yellow" stroke="green"></circle></svg>');
      });

      it('should support binding to camelCased style properties', () => {
        // <div [style.borderWidth]="borderWidth"></div>
        class Comp {
          borderWidth: string = '3px';

          static ngComponentDef = defineComponent({
            type: Comp,
            selectors: [['comp']],
            factory: () => new Comp(),
            consts: 1,
            vars: 0,
            template: (rf: RenderFlags, ctx: Comp) => {
              if (rf & RenderFlags.Create) {
                elementStart(0, 'div');
                elementStyling(null, ['borderWidth']);
                elementEnd();
              }
              if (rf & RenderFlags.Update) {
                elementStyleProp(0, 0, ctx.borderWidth);
                elementStylingApply(0);
              }
            }
          });
        }

        const fixture = new ComponentFixture(Comp);
        fixture.update();

        const target = fixture.hostElement.querySelector('div') !as any;

        expect(target.style.borderWidth).toEqual('3px');
        expect(fixture.html).toEqual('<div style="border-width: 3px;"></div>');
      });

    });

    describe('dynamic styling properties within a styling context', () => {
      it('should initialize a context with a series of styling bindings as well as single property offsets',
         () => {
           const ctx = createEmptyStylingContext();
           updateContextWithBindings(ctx, null, ['foo'], ['width']);

           assertContext(ctx, [
             masterConfig(17, false, false),  //
             [null, 2, false, null],
             [null, 'width', null],
             [null, 'foo', false],
             [1, 1, 1, 1, 9, 13],
             null,
             null,
             null,
             null,

             // #9
             cleanStyle(2, 17),
             'width',
             null,
             0,

             // #13
             cleanClass(2, 21),
             'foo',
             null,
             0,

             // #17
             cleanStyle(2, 9),
             'width',
             null,
             0,

             // #21
             cleanClass(2, 13),
             'foo',
             null,
             0,
           ]);

           updateContextWithBindings(ctx, 'SOME DIRECTIVE', ['bar'], ['width', 'height']);

           assertContext(ctx, [
             masterConfig(25, false, false),  //
             [null, 2, false, null, 'SOME DIRECTIVE', 6, false, null],
             [null, 'width', null, 'height', null],
             [null, 'foo', false, 'bar', false],
             [2, 2, 1, 1, 9, 17, 2, 1, 9, 13, 21],
             null,
             null,
             null,
             null,

             // #9
             cleanStyle(2, 25),
             'width',
             null,
             0,

             // #13
             cleanStyle(4, 29),
             'height',
             null,
             1,

             // #17
             cleanClass(2, 33),
             'foo',
             null,
             0,

             // #21
             cleanClass(4, 37),
             'bar',
             null,
             1,

             // #25
             cleanStyle(2, 9),
             'width',
             null,
             0,

             // #29
             cleanStyle(4, 13),
             'height',
             null,
             1,

             // #33
             cleanClass(2, 17),
             'foo',
             null,
             0,

             // #37
             cleanClass(4, 21),
             'bar',
             null,
             1,
           ]);

           updateContextWithBindings(
               ctx, 'SOME DIRECTIVE 2', ['baz', 'bar', 'foo'], ['opacity', 'width', 'height']);

           assertContext(ctx, [
             masterConfig(33, false, false),  //
             [
               null, 2, false, null, 'SOME DIRECTIVE', 6, false, null, 'SOME DIRECTIVE 2', 11,
               false, null
             ],
             [null, 'width', null, 'height', null, 'opacity', null],
             [null, 'foo', false, 'bar', false, 'baz', false],
             [3, 3, 1, 1, 9, 21, 2, 1, 9, 13, 25, 3, 3, 17, 9, 13, 29, 25, 21],
             null,
             null,
             null,
             null,

             // #9
             cleanStyle(2, 33),
             'width',
             null,
             0,

             // #13
             cleanStyle(4, 37),
             'height',
             null,
             1,

             // #17
             cleanStyle(6, 41),
             'opacity',
             null,
             2,

             // #21
             cleanClass(2, 45),
             'foo',
             null,
             0,

             // #25
             cleanClass(4, 49),
             'bar',
             null,
             1,

             // #29
             cleanClass(6, 53),
             'baz',
             null,
             2,

             // #33
             cleanStyle(2, 9),
             'width',
             null,
             0,

             // #37
             cleanStyle(4, 13),
             'height',
             null,
             1,

             // #41
             cleanStyle(6, 17),
             'opacity',
             null,
             2,

             // #45
             cleanClass(2, 21),
             'foo',
             null,
             0,

             // #49
             cleanClass(4, 25),
             'bar',
             null,
             1,

             // #53
             cleanClass(6, 29),
             'baz',
             null,
             2,
           ]);
         });

      it('should only populate bindings for a given directive once', () => {
        const ctx = createEmptyStylingContext();
        updateContextWithBindings(ctx, null, ['foo'], ['width']);
        expect(ctx.length).toEqual(25);

        updateContextWithBindings(ctx, null, ['bar'], ['height']);
        expect(ctx.length).toEqual(25);

        updateContextWithBindings(ctx, '1', ['bar'], ['height']);
        expect(ctx.length).toEqual(41);

        updateContextWithBindings(ctx, '1', ['bar'], ['height']);
        expect(ctx.length).toEqual(41);
      });

      it('should build a list of multiple styling values', () => {
        const getStyles = trackStylesFactory();
        const stylingContext = initContext();
        updateStyles(stylingContext, {
          width: '100px',
          height: '100px',
        });
        updateStyles(stylingContext, {height: '200px'});
        expect(getStyles(stylingContext, null, true)).toEqual({height: '200px'});
      });

      it('should evaluate the delta between style changes when rendering occurs', () => {
        const stylingContext = initContext(['width', '100px'], ['width', 'height']);
        updateStyles(stylingContext, {
          height: '200px',
        });
        expect(renderStyles(stylingContext)).toEqual({height: '200px'});
        expect(renderStyles(stylingContext)).toEqual({});
        updateStyles(stylingContext, {
          width: '100px',
          height: '100px',
        });
        expect(renderStyles(stylingContext)).toEqual({height: '100px'});
        updateStyleProp(stylingContext, 1, '100px');
        expect(renderStyles(stylingContext)).toEqual({});
        updateStyles(stylingContext, {
          width: '100px',
          height: '100px',
        });
        expect(renderStyles(stylingContext)).toEqual({});
      });

      it('should update individual values on a set of styles', () => {
        const getStyles = trackStylesFactory();
        const stylingContext = initContext(null, ['width', 'height']);
        updateStyles(stylingContext, {
          width: '100px',
          height: '100px',
        });
        updateStyleProp(stylingContext, 1, '200px');
        expect(getStyles(stylingContext)).toEqual({width: '100px', height: '200px'});
      });

      it('should only mark itself as updated when one or more properties have been applied', () => {
        const stylingContext = initContext();
        expect(isContextDirty(stylingContext)).toBeFalsy();

        updateStyles(stylingContext, {
          width: '100px',
          height: '100px',
        });
        expect(isContextDirty(stylingContext)).toBeTruthy();

        setContextDirty(stylingContext, false);

        updateStyles(stylingContext, {
          width: '100px',
          height: '100px',
        });
        expect(isContextDirty(stylingContext)).toBeFalsy();

        updateStyles(stylingContext, {
          width: '200px',
          height: '100px',
        });
        expect(isContextDirty(stylingContext)).toBeTruthy();
      });

      it('should only mark itself as updated when any single properties have been applied', () => {
        const stylingContext = initContext(null, ['height']);
        updateStyles(stylingContext, {
          width: '100px',
          height: '100px',
        });

        setContextDirty(stylingContext, false);

        updateStyleProp(stylingContext, 0, '100px');
        expect(isContextDirty(stylingContext)).toBeFalsy();

        setContextDirty(stylingContext, false);

        updateStyleProp(stylingContext, 0, '200px');
        expect(isContextDirty(stylingContext)).toBeTruthy();
      });

      it('should prioritize multi and single styles over initial styles', () => {
        const getStyles = trackStylesFactory();

        const stylingContext = initContext(
            ['width', '100px', 'height', '100px', 'opacity', '0'], ['width', 'height', 'opacity']);

        expect(getStyles(stylingContext)).toEqual({});

        updateStyles(stylingContext, {width: '200px', height: '200px'});

        expect(getStyles(stylingContext)).toEqual({
          width: '200px',
          height: '200px',
        });

        updateStyleProp(stylingContext, 0, '300px');

        expect(getStyles(stylingContext)).toEqual({
          width: '300px',
          height: '200px',
        });

        updateStyleProp(stylingContext, 0, null);

        expect(getStyles(stylingContext)).toEqual({
          width: '200px',
          height: '200px',
        });

        updateStyles(stylingContext, {});

        expect(getStyles(stylingContext)).toEqual({
          width: '100px',
          height: '100px',
        });
      });

      it('should cleanup removed styles from the context once the styles are built', () => {
        const stylingContext = initContext(null, ['width', 'height']);
        const getStyles = trackStylesFactory();
        updateStyles(stylingContext, {width: '100px', height: '100px'});

        assertContextOnlyValues(stylingContext, [
          // #9
          cleanStyle(2, 17),
          'width',
          null,
          0,

          // #13
          cleanStyle(4, 21),
          'height',
          null,
          0,

          // #17
          dirtyStyle(2, 9),
          'width',
          '100px',
          0,

          // #21
          dirtyStyle(4, 13),
          'height',
          '100px',
          0,
        ]);

        getStyles(stylingContext);
        updateStyles(stylingContext, {width: '200px', opacity: '0'});

        assertContextOnlyValues(stylingContext, [
          // #9
          cleanStyle(2, 17),
          'width',
          null,
          0,

          // #13
          cleanStyle(4, 25),
          'height',
          null,
          0,

          // #17
          dirtyStyle(2, 9),
          'width',
          '200px',
          0,

          // #21
          dirtyStyle(),
          'opacity',
          '0',
          0,

          // #25
          dirtyStyle(4, 13),
          'height',
          null,
          0,
        ]);

        getStyles(stylingContext);
        assertContextOnlyValues(stylingContext, [
          // #9
          cleanStyle(2, 17),
          'width',
          null,
          0,

          // #13
          cleanStyle(4, 25),
          'height',
          null,
          0,

          // #17
          cleanStyle(2, 9),
          'width',
          '200px',
          0,

          // #21
          cleanStyle(),
          'opacity',
          '0',
          0,

          // #23
          cleanStyle(4, 13),
          'height',
          null,
          0,
        ]);

        updateStyles(stylingContext, {width: null});
        updateStyleProp(stylingContext, 0, '300px');

        assertContextOnlyValues(stylingContext, [
          // #9
          dirtyStyle(2, 17),
          'width',
          '300px',
          0,

          // #13
          cleanStyle(4, 25),
          'height',
          null,
          0,

          // #17
          cleanStyle(2, 9),
          'width',
          null,
          0,

          // #21
          dirtyStyle(),
          'opacity',
          null,
          0,

          // #23
          cleanStyle(4, 13),
          'height',
          null,
          0,
        ]);

        getStyles(stylingContext);

        updateStyleProp(stylingContext, 0, null);
        assertContextOnlyValues(stylingContext, [
          // #9
          dirtyStyle(2, 17),
          'width',
          null,
          0,

          // #13
          cleanStyle(4, 25),
          'height',
          null,
          0,

          // #17
          cleanStyle(2, 9),
          'width',
          null,
          0,

          // #21
          cleanStyle(),
          'opacity',
          null,
          0,

          // #23
          cleanStyle(4, 13),
          'height',
          null,
          0,
        ]);
      });

      it('should find the next available space in the context when data is added after being removed before',
         () => {
           const stylingContext = initContext(null, ['lineHeight']);
           const getStyles = trackStylesFactory();

           updateStyles(stylingContext, {width: '100px', height: '100px', opacity: '0.5'});

           assertContextOnlyValues(stylingContext, [
             // #9
             cleanStyle(2, 25),
             'lineHeight',
             null,
             0,

             // #13
             dirtyStyle(),
             'width',
             '100px',
             0,

             // #17
             dirtyStyle(),
             'height',
             '100px',
             0,

             // #21
             dirtyStyle(),
             'opacity',
             '0.5',
             0,

             // #23
             cleanStyle(2, 9),
             'lineHeight',
             null,
             0,
           ]);

           getStyles(stylingContext);

           updateStyles(stylingContext, {});
           assertContextOnlyValues(stylingContext, [
             // #9
             cleanStyle(2, 25),
             'lineHeight',
             null,
             0,

             // #13
             dirtyStyle(),
             'width',
             null,
             0,

             // #17
             dirtyStyle(),
             'height',
             null,
             0,

             // #21
             dirtyStyle(),
             'opacity',
             null,
             0,

             // #23
             cleanStyle(2, 9),
             'lineHeight',
             null,
             0,
           ]);

           getStyles(stylingContext);
           updateStyles(stylingContext, {
             borderWidth: '5px',
           });

           assertContextOnlyValues(stylingContext, [
             // #9
             cleanStyle(2, 29),
             'lineHeight',
             null,
             0,

             // #13
             dirtyStyle(),
             'borderWidth',
             '5px',
             0,

             // #17
             cleanStyle(),
             'width',
             null,
             0,

             // #21
             cleanStyle(),
             'height',
             null,
             0,

             // #23
             cleanStyle(),
             'opacity',
             null,
             0,

             // #29
             cleanStyle(2, 9),
             'lineHeight',
             null,
             0,
           ]);

           updateStyleProp(stylingContext, 0, '200px');

           assertContextOnlyValues(stylingContext, [
             // #9
             dirtyStyle(2, 29),
             'lineHeight',
             '200px',
             0,

             // #13
             dirtyStyle(),
             'borderWidth',
             '5px',
             0,

             // #17
             cleanStyle(),
             'width',
             null,
             0,

             // #21
             cleanStyle(),
             'height',
             null,
             0,

             // #23
             cleanStyle(),
             'opacity',
             null,
             0,

             // #29
             cleanStyle(2, 9),
             'lineHeight',
             null,
             0,
           ]);

           updateStyles(stylingContext, {borderWidth: '15px', borderColor: 'red'});

           assertContextOnlyValues(stylingContext, [
             // #9
             dirtyStyle(2, 33),
             'lineHeight',
             '200px',
             0,

             // #13
             dirtyStyle(),
             'borderWidth',
             '15px',
             0,

             // #17
             dirtyStyle(),
             'borderColor',
             'red',
             0,

             // #21
             cleanStyle(),
             'width',
             null,
             0,

             // #23
             cleanStyle(),
             'height',
             null,
             0,

             // #29
             cleanStyle(),
             'opacity',
             null,
             0,

             // #33
             cleanStyle(2, 9),
             'lineHeight',
             null,
             0,
           ]);
         });

      it('should render all data as not being dirty after the styles are built', () => {
        const getStyles = trackStylesFactory();
        const stylingContext = initContext(null, ['height']);

        updateStyles(stylingContext, {width: '100px'});
        updateStyleProp(stylingContext, 0, '200px');

        assertContext(stylingContext, [
          masterConfig(13, true),  //
          [null, 2, true, null],
          [null, 'height', null],
          [null],
          [1, 0, 1, 0, 9],
          element,
          null,
          {width: '100px'},
          null,

          // #9
          dirtyStyle(2, 17),
          'height',
          '200px',
          0,

          // #13
          dirtyStyle(),
          'width',
          '100px',
          0,

          // #17
          cleanStyle(2, 9),
          'height',
          null,
          0,
        ]);

        getStyles(stylingContext);

        assertContext(stylingContext, [
          masterConfig(13, false),  //
          [null, 2, false, null],
          [null, 'height', null],
          [null],
          [1, 0, 1, 0, 9],
          element,
          null,
          {width: '100px'},
          null,

          // #9
          cleanStyle(2, 17),
          'height',
          '200px',
          0,

          // #13
          cleanStyle(),
          'width',
          '100px',
          0,

          // #17
          cleanStyle(2, 9),
          'height',
          null,
          0,
        ]);
      });

      it('should mark styles that may contain url values as being sanitizable (when a sanitizer is passed in)',
         () => {
           const getStyles = trackStylesFactory();
           const styleBindings = ['border-image', 'border-width'];
           const styleSanitizer = defaultStyleSanitizer;
           const stylingContext = initContext(null, styleBindings, null, null, styleSanitizer);

           updateStyleProp(stylingContext, 0, 'url(foo.jpg)');
           updateStyleProp(stylingContext, 1, '100px');

           assertContextOnlyValues(stylingContext, [
             // #9
             dirtyStyleWithSanitization(2, 17),
             'border-image',
             'url(foo.jpg)',
             0,

             // #13
             dirtyStyle(4, 21),
             'border-width',
             '100px',
             0,

             // #17
             cleanStyleWithSanitization(2, 9),
             'border-image',
             null,
             0,

             // #21
             cleanStyle(4, 13),
             'border-width',
             null,
             0,
           ]);

           updateStyles(stylingContext, {'background-image': 'unsafe'});

           assertContextOnlyValues(stylingContext, [
             // #9
             dirtyStyleWithSanitization(2, 21),
             'border-image',
             'url(foo.jpg)',
             0,

             // #13
             dirtyStyle(4, 25),
             'border-width',
             '100px',
             0,

             // #17
             dirtyStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',
             0,

             // #21
             cleanStyleWithSanitization(2, 9),
             'border-image',
             null,
             0,

             // #23
             cleanStyle(4, 13),
             'border-width',
             null,
             0,
           ]);

           getStyles(stylingContext);

           assertContextOnlyValues(stylingContext, [
             // #9
             cleanStyleWithSanitization(2, 21),
             'border-image',
             'url(foo.jpg)',
             0,

             // #13
             cleanStyle(4, 25),
             'border-width',
             '100px',
             0,

             // #17
             cleanStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',
             0,

             // #21
             cleanStyleWithSanitization(2, 9),
             'border-image',
             null,
             0,

             // #23
             cleanStyle(4, 13),
             'border-width',
             null,
             0,
           ]);
         });

      it('should only update styling values for successive directives if null in a former directive',
         () => {
           const template = createEmptyStylingContext();

           const dir1 = {};
           const dir2 = {};
           const dir3 = {};

           updateContextWithBindings(template, dir1, null, ['width', 'height']);
           updateContextWithBindings(template, dir2, null, ['width', 'color']);
           updateContextWithBindings(template, dir3, null, ['color', 'opacity']);

           const ctx = allocStylingContext(element, template);

           // styles 0 = width, 1 = height, 2 = color within the context
           const widthIndex = StylingIndex.SingleStylesStartPosition + StylingIndex.Size * 0;
           const colorIndex = StylingIndex.SingleStylesStartPosition + StylingIndex.Size * 2;

           updateStyleProp(ctx, 0, '200px', dir1);
           updateStyleProp(ctx, 0, '100px', dir2);
           expect(ctx[widthIndex + StylingIndex.ValueOffset]).toEqual('200px');
           expect(getDirectiveIndexFromEntry(ctx, widthIndex)).toEqual(1);

           updateStyleProp(ctx, 0, 'blue', dir3);
           updateStyleProp(ctx, 1, 'red', dir2);
           expect(ctx[colorIndex + StylingIndex.ValueOffset]).toEqual('red');
           expect(getDirectiveIndexFromEntry(ctx, colorIndex)).toEqual(2);

           updateStyleProp(ctx, 0, null, dir1);
           updateStyleProp(ctx, 0, '100px', dir2);
           expect(ctx[widthIndex + StylingIndex.ValueOffset]).toEqual('100px');
           expect(getDirectiveIndexFromEntry(ctx, widthIndex)).toEqual(2);

           updateStyleProp(ctx, 1, null, dir2);
           updateStyleProp(ctx, 0, 'blue', dir3);
           updateStyleProp(ctx, 1, null, dir2);
           expect(ctx[colorIndex + StylingIndex.ValueOffset]).toEqual('blue');
           expect(getDirectiveIndexFromEntry(ctx, colorIndex)).toEqual(3);
         });

      it('should throw an error if a directive is provided that isn\'t registered', () => {
        const template = createEmptyStylingContext();
        const knownDir = {};
        const unknownDir = {};
        updateContextWithBindings(template, knownDir, null, ['color']);

        const ctx = allocStylingContext(element, template);
        updateStyleProp(ctx, 0, 'blue', knownDir);

        expect(() => { updateStyleProp(ctx, 0, 'blue', unknownDir); }).toThrow();
      });

      it('should use a different sanitizer when a different directive\'s binding is updated',
         () => {
           const getStyles = trackStylesFactory();

           const makeSanitizer = (id: string) => {
             return (function(prop: string, value?: string): string | boolean {
               return `${value}-${id}`;
             } as StyleSanitizeFn);
           };

           const template = createEmptyStylingContext();
           const dirWithSanitizer1 = {};
           const sanitizer1 = makeSanitizer('1');
           const dirWithSanitizer2 = {};
           const sanitizer2 = makeSanitizer('2');
           const dirWithoutSanitizer = {};
           updateContextWithBindings(template, dirWithSanitizer1, null, ['color'], sanitizer1);
           updateContextWithBindings(template, dirWithSanitizer2, null, ['color'], sanitizer2);
           updateContextWithBindings(template, dirWithoutSanitizer, null, ['color']);

           const ctx = allocStylingContext(element, template);
           expect(ctx[StylingIndex.DirectiveRegistryPosition]).toEqual([
             null,                 //
             -1,                   //
             false,                //
             null,                 //
             dirWithSanitizer1,    //
             2,                    //
             false,                //
             sanitizer1,           //
             dirWithSanitizer2,    //
             5,                    //
             false,                //
             sanitizer2,           //
             dirWithoutSanitizer,  //
             8,                    //
             false,                //
             null
           ]);

           const colorIndex = StylingIndex.SingleStylesStartPosition;
           expect(((ctx[colorIndex] as number) & StylingFlags.Sanitize) > 0).toBeTruthy();

           updateStyleProp(ctx, 0, 'green', dirWithoutSanitizer);
           expect(((ctx[colorIndex] as number) & StylingFlags.Sanitize) > 0).toBeFalsy();
           expect(getStyles(ctx, dirWithoutSanitizer)).toEqual({color: 'green'});

           updateStyleProp(ctx, 0, 'blue', dirWithSanitizer1);
           expect(((ctx[colorIndex] as number) & StylingFlags.Sanitize) > 0).toBeTruthy();
           expect(getStyles(ctx, dirWithSanitizer1)).toEqual({color: 'blue-1'});

           updateStyleProp(ctx, 0, null, dirWithSanitizer1);
           updateStyleProp(ctx, 0, 'red', dirWithSanitizer2);
           expect(((ctx[colorIndex] as number) & StylingFlags.Sanitize) > 0).toBeTruthy();
           expect(getStyles(ctx, dirWithSanitizer2)).toEqual({color: 'red-2'});

           updateStyleProp(ctx, 0, null, dirWithSanitizer2);
           updateStyleProp(ctx, 0, 'green', dirWithoutSanitizer);
           expect(((ctx[colorIndex] as number) & StylingFlags.Sanitize) > 0).toBeFalsy();
           expect(getStyles(ctx, dirWithoutSanitizer)).toEqual({color: 'green'});
         });
    });

    it('should skip issuing style updates if there is nothing to update upon first render', () => {
      const stylingContext = initContext(null, ['color']);
      const store = new MockStylingStore(element as HTMLElement, BindingType.Class);
      const getStyles = trackStylesFactory(store);
      const otherDirective = {};

      let styles: any = {fontSize: ''};
      updateStyleProp(stylingContext, 0, '');
      updateStylingMap(stylingContext, null, styles);
      patchContextWithStaticAttrs(stylingContext, [], 0, otherDirective);

      getStyles(stylingContext, otherDirective);
      expect(store.getValues()).toEqual({});

      styles = {fontSize: '20px'};
      updateStyleProp(stylingContext, 0, 'red');
      updateStylingMap(stylingContext, null, styles);

      getStyles(stylingContext);
      expect(store.getValues()).toEqual({fontSize: '20px', color: 'red'});

      styles = {};
      updateStyleProp(stylingContext, 0, '');
      updateStylingMap(stylingContext, null, styles);

      getStyles(stylingContext);
      expect(store.getValues()).toEqual({fontSize: null, color: ''});
    });
  });

  describe('classes', () => {
    it('should initialize with the provided class bindings', () => {
      const template = initContext(null, null, null, ['one', 'two']);
      assertContext(template, [
        masterConfig(17, false),  //
        [null, 2, false, null],
        [null],
        [null, 'one', false, 'two', false],
        [0, 2, 0, 2, 9, 13],
        element,
        null,
        null,
        null,

        // #9
        cleanClass(2, 17),
        'one',
        null,
        0,

        // #13
        cleanClass(4, 21),
        'two',
        null,
        0,

        // #17
        cleanClass(2, 9),
        'one',
        null,
        0,

        // #21
        cleanClass(4, 13),
        'two',
        null,
        0,
      ]);
    });

    it('should update multi class properties against the static classes', () => {
      const getClasses = trackClassesFactory();
      const stylingContext = initContext(null, null, ['bar'], ['bar', 'foo']);
      expect(getClasses(stylingContext)).toEqual({});
      updateClasses(stylingContext, {foo: true, bar: false});
      expect(getClasses(stylingContext)).toEqual({'foo': true, 'bar': false});
      updateClasses(stylingContext, 'bar');
      expect(getClasses(stylingContext)).toEqual({'foo': false, 'bar': true});
    });

    it('should update single class properties despite static classes being present', () => {
      const getClasses = trackClassesFactory();
      const stylingContext = initContext(null, null, ['bar'], ['bar', 'foo']);
      expect(getClasses(stylingContext)).toEqual({});

      updateClassProp(stylingContext, 0, true);
      updateClassProp(stylingContext, 1, true);
      expect(getClasses(stylingContext)).toEqual({'bar': true, 'foo': true});

      updateClassProp(stylingContext, 0, false);
      updateClassProp(stylingContext, 1, false);
      expect(getClasses(stylingContext)).toEqual({'bar': false, 'foo': false});
    });

    it('should understand updating multi-classes using a string-based value while respecting single class-based props',
       () => {
         const getClasses = trackClassesFactory();
         const stylingContext = initContext(null, null, null, ['baz']);
         expect(getClasses(stylingContext)).toEqual({});

         updateStylingMap(stylingContext, 'foo bar baz');
         expect(getClasses(stylingContext)).toEqual({'foo': true, 'bar': true, 'baz': true});

         updateStylingMap(stylingContext, 'foo car');
         updateClassProp(stylingContext, 0, true);
         expect(getClasses(stylingContext))
             .toEqual({'foo': true, 'car': true, 'bar': false, 'baz': true});
       });

    it('should place styles within the context and work alongside style-based values in harmony',
       () => {
         const getStylesAndClasses = trackStylesAndClasses();
         const stylingContext =
             initContext(['width', '100px'], ['width', 'height'], ['wide'], ['wide', 'tall']);
         assertContext(stylingContext, [
           masterConfig(25, false),  //
           [null, 2, false, null],
           [null, 'width', '100px', 'height', null],
           [null, 'wide', true, 'tall', false],
           [2, 2, 2, 2, 9, 13, 17, 21],
           element,
           null,
           null,
           null,

           // #9
           cleanStyle(2, 25),
           'width',
           null,
           0,

           // #13
           cleanStyle(4, 29),
           'height',
           null,
           0,

           // #17
           cleanClass(2, 33),
           'wide',
           null,
           0,

           // #21
           cleanClass(4, 37),
           'tall',
           null,
           0,

           // #25
           cleanStyle(2, 9),
           'width',
           null,
           0,

           // #29
           cleanStyle(4, 13),
           'height',
           null,
           0,

           // #33
           cleanClass(2, 17),
           'wide',
           null,
           0,

           // #37
           cleanClass(4, 21),
           'tall',
           null,
           0,
         ]);

         expect(getStylesAndClasses(stylingContext)).toEqual([{}, {}]);

         updateStylingMap(stylingContext, 'tall round', {width: '200px', opacity: '0.5'});
         assertContext(stylingContext, [
           masterConfig(25, true),  //
           [null, 2, true, null],
           [null, 'width', '100px', 'height', null],
           [null, 'wide', true, 'tall', false],
           [2, 2, 2, 2, 9, 13, 17, 21],
           element,
           'tall round',
           {width: '200px', opacity: '0.5'},
           null,

           // #9
           cleanStyle(2, 25),
           'width',
           null,
           0,

           // #13
           cleanStyle(4, 45),
           'height',
           null,
           0,

           // #17
           cleanClass(2, 41),
           'wide',
           null,
           0,

           // #21
           cleanClass(4, 33),
           'tall',
           null,
           0,

           // #23
           dirtyStyle(2, 9),
           'width',
           '200px',
           0,

           // #29
           dirtyStyle(0, 0),
           'opacity',
           '0.5',
           0,

           // #33
           dirtyClass(4, 21),
           'tall',
           true,
           0,

           // #37
           dirtyClass(0, 0),
           'round',
           true,
           0,

           // #41
           cleanClass(2, 17),
           'wide',
           null,
           0,

           // #45
           cleanStyle(4, 13),
           'height',
           null,
           0,
         ]);

         expect(getStylesAndClasses(stylingContext)).toEqual([
           {tall: true, round: true},
           {width: '200px', opacity: '0.5'},
         ]);

         updateStylingMap(stylingContext, {tall: true, wide: true}, {width: '500px'});
         updateStyleProp(stylingContext, 0, '300px');

         assertContext(stylingContext, [
           masterConfig(25, true),  //
           [null, 2, true, null],
           [null, 'width', '100px', 'height', null],
           [null, 'wide', true, 'tall', false],
           [2, 2, 2, 2, 9, 13, 17, 21],
           element,
           {tall: true, wide: true},
           {width: '500px'},
           null,

           // #9
           dirtyStyle(2, 25),
           'width',
           '300px',
           0,

           // #13
           cleanStyle(4, 45),
           'height',
           null,
           0,

           // #17
           cleanClass(2, 33),
           'wide',
           null,
           0,

           // #21
           cleanClass(4, 29),
           'tall',
           null,
           0,

           // #25
           cleanStyle(2, 9),
           'width',
           '500px',
           0,

           // #29
           cleanClass(4, 21),
           'tall',
           true,
           0,

           // #33
           cleanClass(2, 17),
           'wide',
           true,
           0,

           // #37
           dirtyClass(0, 0),
           'round',
           null,
           0,

           // #41
           dirtyStyle(0, 0),
           'opacity',
           null,
           0,

           // #45
           cleanStyle(4, 13),
           'height',
           null,
           0,
         ]);

         expect(getStylesAndClasses(stylingContext)).toEqual([
           {tall: true, round: false},
           {width: '300px', opacity: null},
         ]);

         updateStylingMap(stylingContext, {wide: false});

         expect(getStylesAndClasses(stylingContext)).toEqual([
           {wide: false, tall: false, round: false}, {width: '100px', opacity: null}
         ]);
       });

    it('should skip updating multi classes and styles if the input identity has not changed',
       () => {
         const stylingContext = initContext();
         const getStylesAndClasses = trackStylesAndClasses();

         const stylesMap = {width: '200px'};
         const classesMap = {foo: true};
         updateStylingMap(stylingContext, classesMap, stylesMap);

         // apply the styles
         getStylesAndClasses(stylingContext);

         assertContext(stylingContext, [
           masterConfig(9, false),  //
           [null, 2, false, null],  //
           [null],                  //
           [null],                  //
           [0, 0, 0, 0],            //
           element,                 //
           {foo: true},             //
           {width: '200px'},        //
           null,                    //

           // #9
           cleanStyle(0, 0), 'width', '200px', 0,

           // #13
           cleanClass(0, 0), 'foo', true, 0
         ]);

         stylesMap.width = '300px';
         classesMap.foo = false;

         updateStylingMap(stylingContext, classesMap, stylesMap);

         // apply the styles
         getStylesAndClasses(stylingContext);

         assertContext(stylingContext, [
           masterConfig(9, false),  //
           [null, 2, false, null],  //
           [null],                  //
           [null],                  //
           [0, 0, 0, 0],            //
           element,                 //
           {foo: false},            //
           {width: '300px'},        //
           null,                    //

           // #9
           cleanStyle(0, 0), 'width', '200px', 0,

           // #13
           cleanClass(0, 0), 'foo', true, 0
         ]);
       });

    it('should skip updating multi classes if the string-based identity has not changed', () => {
      const stylingContext = initContext();
      const getClasses = trackClassesFactory();

      const classes = 'apple orange banana';
      updateStylingMap(stylingContext, classes);

      // apply the styles
      expect(getClasses(stylingContext)).toEqual({apple: true, orange: true, banana: true});

      assertContext(stylingContext, [
        masterConfig(9, false),  //
        [null, 2, false, null],
        [null],
        [null],
        [0, 0, 0, 0],
        element,
        'apple orange banana',
        null,
        null,

        // #9
        cleanClass(0, 0),
        'apple',
        true,
        0,

        // #13
        cleanClass(0, 0),
        'orange',
        true,
        0,

        // #17
        cleanClass(0, 0),
        'banana',
        true,
        0,
      ]);

      stylingContext
          [StylingIndex.SingleStylesStartPosition + 1 * StylingIndex.Size +
           StylingIndex.ValueOffset] = false;  // no orange
      stylingContext
          [StylingIndex.SingleStylesStartPosition + 2 * StylingIndex.Size +
           StylingIndex.ValueOffset] = false;  // no banana
      updateStylingMap(stylingContext, classes);

      // apply the styles
      expect(getClasses(stylingContext)).toEqual({apple: true, orange: true, banana: true});
    });

    it('should skip issuing class updates if there is nothing to update upon first render', () => {
      const stylingContext = initContext(null, null, ['blue'], ['blue']);
      const store = new MockStylingStore(element as HTMLElement, BindingType.Class);
      const getClasses = trackClassesFactory(store);

      let classes: any = {red: false};
      updateClassProp(stylingContext, 0, false);
      updateStylingMap(stylingContext, classes);

      // apply the styles
      getClasses(stylingContext, true);
      expect(store.getValues()).toEqual({});

      classes = {red: true};
      updateClassProp(stylingContext, 0, true);
      updateStylingMap(stylingContext, classes);

      getClasses(stylingContext);
      expect(store.getValues()).toEqual({red: true, blue: true});

      classes = {red: false};
      updateClassProp(stylingContext, 0, false);
      updateStylingMap(stylingContext, classes);

      getClasses(stylingContext);
      expect(store.getValues()).toEqual({red: false, blue: false});
    });
  });

  describe('players', () => {
    it('should build a player with the computed styles and classes', () => {
      const context = initContext();

      const styles = {width: '100px', height: '200px'};
      const classes = 'foo bar';

      let classResult: any;
      const classFactory = bindPlayerFactory(
          (element: HTMLElement, type: BindingType, value: any, firstRender: boolean) => {
            const player = new MockPlayer();
            classResult = {player, element, type, value};
            return player;
          },
          classes);

      let styleResult: any;
      const styleFactory = bindPlayerFactory(
          (element: HTMLElement, type: BindingType, value: any, firstRender: boolean) => {
            const player = new MockPlayer();
            styleResult = {player, element, type, value};
            return player;
          },
          styles);

      updateStylingMap(context, classFactory, styleFactory);
      expect(classResult).toBeFalsy();

      renderStyles(context);

      expect(classResult.element).toBe(element);
      expect(classResult.type).toBe(BindingType.Class);
      expect(classResult.value).toEqual({foo: true, bar: true});
      expect(classResult.player instanceof MockPlayer).toBeTruthy();

      expect(styleResult.element).toBe(element);
      expect(styleResult.type).toBe(BindingType.Style);
      expect(styleResult.value).toEqual(styles);
      expect(styleResult.player instanceof MockPlayer).toBeTruthy();
    });

    it('should only build one player for a given style map', () => {
      const context = initContext(null, []);

      let count = 0;
      const buildFn = (element: HTMLElement, type: BindingType, value: any) => {
        count++;
        return new MockPlayer();
      };

      updateStylingMap(context, null, bindPlayerFactory(buildFn, {width: '100px'}));
      renderStyles(context);
      expect(count).toEqual(1);

      updateStylingMap(context, null, bindPlayerFactory(buildFn, {height: '100px'}));
      renderStyles(context);
      expect(count).toEqual(2);

      updateStylingMap(
          context, null, bindPlayerFactory(buildFn, {height: '200px', width: '200px'}));
      renderStyles(context);
      expect(count).toEqual(3);
    });

    it('should only build one player for a given class map', () => {
      const context = initContext(null, []);

      let count = 0;
      const buildFn = (element: HTMLElement, type: BindingType, value: any) => {
        count++;
        return new MockPlayer();
      };

      updateStylingMap(context, bindPlayerFactory(buildFn, {myClass: true}));
      renderStyles(context);
      expect(count).toEqual(1);

      updateStylingMap(context, bindPlayerFactory(buildFn, {otherClass: true}));
      renderStyles(context);
      expect(count).toEqual(2);

      updateStylingMap(context, bindPlayerFactory(buildFn, {myClass: false, otherClass: false}));
      renderStyles(context);
      expect(count).toEqual(3);
    });

    it('should store active players in the player context and remove them once destroyed', () => {
      const context = initContext(null, []);
      const handler = new CorePlayerHandler();
      const lView = createMockViewData(handler, context);

      let currentStylePlayer: Player;
      const styleBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
        return currentStylePlayer = new MockPlayer();
      };

      let currentClassPlayer: Player;
      const classBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
        return currentClassPlayer = new MockPlayer();
      };

      expect(context[StylingIndex.PlayerContext]).toEqual(null);

      const styleFactory = bindPlayerFactory(styleBuildFn, {width: '100px'});
      const classFactory = bindPlayerFactory(classBuildFn, 'foo');
      const stylePlayerBuilder =
          new ClassAndStylePlayerBuilder(styleFactory, element as HTMLElement, BindingType.Style);
      const classPlayerBuilder =
          new ClassAndStylePlayerBuilder(classFactory, element as HTMLElement, BindingType.Class);

      updateStylingMap(context, classFactory, styleFactory);
      expect(context[StylingIndex.PlayerContext]).toEqual([
        5, classPlayerBuilder, null, stylePlayerBuilder, null
      ]);

      renderStyles(context, false, undefined, lView);
      expect(context[StylingIndex.PlayerContext]).toEqual([
        5, classPlayerBuilder, currentClassPlayer !, stylePlayerBuilder, currentStylePlayer !
      ]);

      expect(currentStylePlayer !.state).toEqual(PlayState.Pending);
      expect(currentClassPlayer !.state).toEqual(PlayState.Pending);
      handler.flushPlayers();

      expect(currentStylePlayer !.state).toEqual(PlayState.Running);
      expect(currentClassPlayer !.state).toEqual(PlayState.Running);

      expect(context[StylingIndex.PlayerContext]).toEqual([
        5, classPlayerBuilder, currentClassPlayer !, stylePlayerBuilder, currentStylePlayer !
      ]);

      currentStylePlayer !.finish();
      expect(context[StylingIndex.PlayerContext]).toEqual([
        5, classPlayerBuilder, currentClassPlayer !, stylePlayerBuilder, currentStylePlayer !
      ]);

      currentStylePlayer !.destroy();
      expect(context[StylingIndex.PlayerContext]).toEqual([
        5, classPlayerBuilder, currentClassPlayer !, stylePlayerBuilder, null
      ]);

      currentClassPlayer !.destroy();
      expect(context[StylingIndex.PlayerContext]).toEqual([
        5, classPlayerBuilder, null, stylePlayerBuilder, null
      ]);
    });

    it('should kick off single property change players alongside map-based ones and remove the players',
       () => {
         const context = initContext(null, ['width', 'height'], null, ['foo', 'bar']);
         const handler = new CorePlayerHandler();
         const lView = createMockViewData(handler, context);

         const capturedStylePlayers: Player[] = [];
         const styleBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
           const player = new MockPlayer();
           capturedStylePlayers.push(player);
           return player;
         };

         const capturedClassPlayers: Player[] = [];
         const classBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
           const player = new MockPlayer();
           capturedClassPlayers.push(player);
           return player;
         };

         expect(context[StylingIndex.PlayerContext]).toEqual(null);

         const styleMapFactory = bindPlayerFactory(styleBuildFn, {opacity: '1'});
         const classMapFactory = bindPlayerFactory(classBuildFn, {map: true});
         const styleMapPlayerBuilder = new ClassAndStylePlayerBuilder(
             styleMapFactory, element as HTMLElement, BindingType.Style);
         const classMapPlayerBuilder = new ClassAndStylePlayerBuilder(
             classMapFactory, element as HTMLElement, BindingType.Class);

         updateStylingMap(context, classMapFactory, styleMapFactory);

         const widthFactory = bindPlayerFactory(styleBuildFn, '100px');
         const barFactory = bindPlayerFactory(classBuildFn, true);
         const widthPlayerBuilder = new ClassAndStylePlayerBuilder(
             widthFactory, element as HTMLElement, BindingType.Style);
         const barPlayerBuilder =
             new ClassAndStylePlayerBuilder(barFactory, element as HTMLElement, BindingType.Class);
         updateStyleProp(context, 0, widthFactory as any);
         updateClassProp(context, 0, barFactory as any);

         expect(context[StylingIndex.PlayerContext]).toEqual([
           9, classMapPlayerBuilder, null, styleMapPlayerBuilder, null, widthPlayerBuilder, null,
           barPlayerBuilder, null
         ]);

         renderStyles(context, false, undefined, lView);
         const classMapPlayer = capturedClassPlayers.shift() !;
         const barPlayer = capturedClassPlayers.shift() !;
         const styleMapPlayer = capturedStylePlayers.shift() !;
         const widthPlayer = capturedStylePlayers.shift() !;

         expect(context[StylingIndex.PlayerContext]).toEqual([
           9,
           classMapPlayerBuilder,
           classMapPlayer,
           styleMapPlayerBuilder,
           styleMapPlayer,
           widthPlayerBuilder,
           widthPlayer,
           barPlayerBuilder,
           barPlayer,
         ]);

         const heightFactory = bindPlayerFactory(styleBuildFn, '200px') !;
         const bazFactory = bindPlayerFactory(classBuildFn, true);
         const heightPlayerBuilder = new ClassAndStylePlayerBuilder(
             heightFactory, element as HTMLElement, BindingType.Style);
         const bazPlayerBuilder =
             new ClassAndStylePlayerBuilder(bazFactory, element as HTMLElement, BindingType.Class);
         updateStyleProp(context, 1, heightFactory as any);
         updateClassProp(context, 1, bazFactory as any);

         expect(context[StylingIndex.PlayerContext]).toEqual([
           13, classMapPlayerBuilder, classMapPlayer, styleMapPlayerBuilder, styleMapPlayer,
           widthPlayerBuilder, widthPlayer, barPlayerBuilder, barPlayer, heightPlayerBuilder, null,
           bazPlayerBuilder, null
         ]);

         renderStyles(context, false, undefined, lView);
         const heightPlayer = capturedStylePlayers.shift() !;
         const bazPlayer = capturedClassPlayers.shift() !;

         expect(context[StylingIndex.PlayerContext]).toEqual([
           13, classMapPlayerBuilder, classMapPlayer, styleMapPlayerBuilder, styleMapPlayer,
           widthPlayerBuilder, widthPlayer, barPlayerBuilder, barPlayer, heightPlayerBuilder,
           heightPlayer, bazPlayerBuilder, bazPlayer
         ]);

         widthPlayer.destroy();
         bazPlayer.destroy();
         expect(context[StylingIndex.PlayerContext]).toEqual([
           13, classMapPlayerBuilder, classMapPlayer, styleMapPlayerBuilder, styleMapPlayer,
           widthPlayerBuilder, null, barPlayerBuilder, barPlayer, heightPlayerBuilder, heightPlayer,
           bazPlayerBuilder, null
         ]);
       });

    it('should destroy an existing player that was queued before it is flushed once the binding updates',
       () => {
         const context = initContext(null, ['width']);
         const handler = new CorePlayerHandler();
         const lView = createMockViewData(handler, context);

         const players: MockPlayer[] = [];
         const buildFn =
             (element: HTMLElement, type: BindingType, value: any, firstRender: boolean,
              oldPlayer: MockPlayer | null) => {
               const player = new MockPlayer(value);
               players.push(player);
               return player;
             };

         expect(context[StylingIndex.PlayerContext]).toEqual(null);

         let mapFactory = bindPlayerFactory(buildFn, {width: '200px'});
         updateStylingMap(context, null, mapFactory);
         renderStyles(context, false, undefined, lView);

         expect(players.length).toEqual(1);
         const p1 = players.pop() !;
         expect(p1.state).toEqual(PlayState.Pending);

         mapFactory = bindPlayerFactory(buildFn, {width: '100px'});
         updateStylingMap(context, null, mapFactory);
         renderStyles(context, false, undefined, lView);

         expect(players.length).toEqual(1);
         const p2 = players.pop() !;
         expect(p1.state).toEqual(PlayState.Destroyed);
         expect(p2.state).toEqual(PlayState.Pending);
       });

    it('should nullify style map and style property factories if any follow up expressions not use them',
       () => {
         const context = initContext(null, ['color'], null, ['foo']);
         const handler = new CorePlayerHandler();
         const lView = createMockViewData(handler, context);

         const stylePlayers: Player[] = [];
         const buildStyleFn = (element: HTMLElement, type: BindingType, value: any) => {
           const player = new MockPlayer();
           stylePlayers.push(player);
           return player;
         };

         const classPlayers: Player[] = [];
         const buildClassFn = (element: HTMLElement, type: BindingType, value: any) => {
           const player = new MockPlayer();
           classPlayers.push(player);
           return player;
         };

         assertContext(context, [
           masterConfig(17, false),  //
           [null, 2, false, null],   //
           [null, 'color', null],    //
           [null, 'foo', false],     //
           [1, 1, 1, 1, 9, 13],      //
           element,                  //
           null,                     //
           null,                     //
           null,                     //

           // #9
           cleanStyle(2, 17),
           'color',
           null,
           0,

           // #13
           cleanClass(2, 21),
           'foo',
           null,
           0,

           // #17
           cleanStyle(2, 9),
           'color',
           null,
           0,

           // #21
           cleanClass(2, 13),
           'foo',
           null,
           0,
         ]);

         const styleMapWithPlayerFactory = bindPlayerFactory(buildStyleFn, {opacity: '1'});
         const classMapWithPlayerFactory = bindPlayerFactory(buildClassFn, {map: true});
         const styleMapPlayerBuilder = makePlayerBuilder(styleMapWithPlayerFactory, false);
         const classMapPlayerBuilder = makePlayerBuilder(classMapWithPlayerFactory, true);
         updateStylingMap(context, classMapWithPlayerFactory, styleMapWithPlayerFactory);

         const colorWithPlayerFactory = bindPlayerFactory(buildStyleFn, 'red');
         const fooWithPlayerFactory = bindPlayerFactory(buildClassFn, true);
         const colorPlayerBuilder = makePlayerBuilder(colorWithPlayerFactory, false);
         const fooPlayerBuilder = makePlayerBuilder(fooWithPlayerFactory, true);
         updateStyleProp(context, 0, colorWithPlayerFactory as any);
         updateClassProp(context, 0, fooWithPlayerFactory as any);
         renderStyles(context, false, undefined, lView);

         const p1 = classPlayers.shift();
         const p2 = stylePlayers.shift();
         const p3 = stylePlayers.shift();
         const p4 = classPlayers.shift();

         let playerContext = context[StylingIndex.PlayerContext] !;
         expect(playerContext).toEqual([
           9, classMapPlayerBuilder, p1, styleMapPlayerBuilder, p2, colorPlayerBuilder, p3,
           fooPlayerBuilder, p4
         ] as PlayerContext);

         assertContext(context, [
           masterConfig(17, false),  //
           [null, 2, false, null],   //
           [null, 'color', null],    //
           [null, 'foo', false],     //
           [1, 1, 1, 1, 9, 13],      //
           element,                  //
           {map: true},              //
           {opacity: '1'},           //
           playerContext,

           // #9
           cleanStyle(2, 25),
           'color',
           'red',
           directiveOwnerPointers(0, 5),

           // #13
           cleanClass(2, 29),
           'foo',
           true,
           directiveOwnerPointers(0, 7),

           // #17
           cleanStyle(0, 0),
           'opacity',
           '1',
           directiveOwnerPointers(0, 3),

           // #21
           cleanClass(0, 0),
           'map',
           true,
           directiveOwnerPointers(0, 1),

           // #23
           cleanStyle(2, 9),
           'color',
           null,
           0,

           // #29
           cleanClass(2, 13),
           'foo',
           null,
           0,
         ]);

         const styleMapWithoutPlayerFactory = {opacity: '1'};
         const classMapWithoutPlayerFactory = {map: true};
         updateStylingMap(context, classMapWithoutPlayerFactory, styleMapWithoutPlayerFactory);

         const colorWithoutPlayerFactory = 'blue';
         const fooWithoutPlayerFactory = false;
         updateStyleProp(context, 0, colorWithoutPlayerFactory);
         updateClassProp(context, 0, fooWithoutPlayerFactory);
         renderStyles(context, false, undefined, lView);

         playerContext = context[StylingIndex.PlayerContext] !;
         expect(playerContext).toEqual([
           9, null, null, null, null, null, null, null, null
         ] as PlayerContext);

         assertContext(context, [
           masterConfig(17, false),  //
           [null, 2, false, null],   //
           [null, 'color', null],    //
           [null, 'foo', false],     //
           [1, 1, 1, 1, 9, 13],      //
           element,                  //
           {map: true},              //
           {opacity: '1'},           //
           playerContext,

           // #9
           cleanStyle(2, 25),
           'color',
           'blue',
           0,

           // #13
           cleanClass(2, 29),
           'foo',
           false,
           0,

           // #17
           cleanStyle(0, 0),
           'opacity',
           '1',
           0,

           // #21
           cleanClass(0, 0),
           'map',
           true,
           0,

           // #23
           cleanStyle(2, 9),
           'color',
           null,
           0,

           // #29
           cleanClass(2, 13),
           'foo',
           null,
           0,
         ]);
       });

    it('should not call a factory if no style and/or class values have been updated', () => {
      const context = initContext([]);
      const handler = new CorePlayerHandler();
      const lView = createMockViewData(handler, context);

      let styleCalls = 0;
      const buildStyleFn = (element: HTMLElement, type: BindingType, value: any) => {
        styleCalls++;
        return new MockPlayer();
      };

      let classCalls = 0;
      const buildClassFn = (element: HTMLElement, type: BindingType, value: any) => {
        classCalls++;
        return new MockPlayer();
      };

      const styleFactory =
          bindPlayerFactory(buildStyleFn, {opacity: '1'}) as BoundPlayerFactory<any>;
      const classFactory = bindPlayerFactory(buildClassFn, 'bar') as BoundPlayerFactory<any>;
      updateStylingMap(context, classFactory, styleFactory);
      expect(styleCalls).toEqual(0);
      expect(classCalls).toEqual(0);

      renderStyles(context, false, undefined, lView);
      expect(styleCalls).toEqual(1);
      expect(classCalls).toEqual(1);

      renderStyles(context, false, undefined, lView);
      expect(styleCalls).toEqual(1);
      expect(classCalls).toEqual(1);

      styleFactory.value = {opacity: '0.5'};
      updateStylingMap(context, classFactory, styleFactory);
      renderStyles(context, false, undefined, lView);
      expect(styleCalls).toEqual(2);
      expect(classCalls).toEqual(1);

      classFactory.value = 'foo';
      updateStylingMap(context, classFactory, styleFactory);
      renderStyles(context, false, undefined, lView);
      expect(styleCalls).toEqual(2);
      expect(classCalls).toEqual(2);

      updateStylingMap(context, 'foo', {opacity: '0.5'});
      renderStyles(context, false, undefined, lView);
      expect(styleCalls).toEqual(2);
      expect(classCalls).toEqual(2);
    });

    it('should invoke a single prop player over a multi style player when present and delegate back if not',
       () => {
         const context = initContext(null, ['color']);
         const handler = new CorePlayerHandler();
         const lView = createMockViewData(handler, context);

         let propPlayer: Player|null = null;
         const propBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
           return propPlayer = new MockPlayer();
         };

         let styleMapPlayer: Player|null = null;
         const mapBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
           return styleMapPlayer = new MockPlayer();
         };

         const mapFactory = bindPlayerFactory(mapBuildFn, {color: 'black'});
         updateStylingMap(context, null, mapFactory);
         updateStyleProp(context, 0, 'green');
         renderStyles(context, false, undefined, lView);

         expect(propPlayer).toBeFalsy();
         expect(styleMapPlayer).toBeFalsy();

         const propFactory = bindPlayerFactory(propBuildFn, 'orange');
         updateStyleProp(context, 0, propFactory as any);
         renderStyles(context, false, undefined, lView);

         expect(propPlayer).toBeTruthy();
         expect(styleMapPlayer).toBeFalsy();

         propPlayer = styleMapPlayer = null;

         updateStyleProp(context, 0, null);
         renderStyles(context, false, undefined, lView);

         expect(propPlayer).toBeFalsy();
         expect(styleMapPlayer).toBeTruthy();

         propPlayer = styleMapPlayer = null;

         updateStylingMap(context, null, null);
         renderStyles(context, false, undefined, lView);

         expect(propPlayer).toBeFalsy();
         expect(styleMapPlayer).toBeFalsy();
       });

    it('should return the old player for styles when a follow-up player is instantiated', () => {
      const context = initContext([]);
      const handler = new CorePlayerHandler();
      const lView = createMockViewData(handler, context);

      let previousPlayer: MockPlayer|null = null;
      let currentPlayer: MockPlayer|null = null;
      const buildFn =
          (element: HTMLElement, type: BindingType, value: any, firstRender: boolean,
           existingPlayer: MockPlayer) => {
            previousPlayer = existingPlayer;
            return currentPlayer = new MockPlayer(value);
          };

      let factory = bindPlayerFactory<{[key: string]: any}>(buildFn, {width: '200px'});
      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lView);

      expect(previousPlayer).toEqual(null);
      expect(currentPlayer !.value).toEqual({width: '200px'});

      factory = bindPlayerFactory(buildFn, {height: '200px'});

      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lView);

      expect(previousPlayer !.value).toEqual({width: '200px'});
      expect(currentPlayer !.value).toEqual({width: null, height: '200px'});
    });

    it('should return the old player for classes when a follow-up player is instantiated', () => {
      const context = initContext();
      const handler = new CorePlayerHandler();
      const lView = createMockViewData(handler, context);

      let currentPlayer: MockPlayer|null = null;
      let previousPlayer: MockPlayer|null = null;
      const buildFn =
          (element: HTMLElement, type: BindingType, value: any, firstRender: boolean,
           existingPlayer: MockPlayer | null) => {
            previousPlayer = existingPlayer;
            return currentPlayer = new MockPlayer(value);
          };

      let factory = bindPlayerFactory<any>(buildFn, {foo: true});
      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lView);

      expect(currentPlayer).toBeTruthy();
      expect(previousPlayer).toBeFalsy();
      expect(currentPlayer !.value).toEqual({foo: true});

      previousPlayer = currentPlayer = null;

      factory = bindPlayerFactory(buildFn, {bar: true});
      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lView);

      expect(currentPlayer).toBeTruthy();
      expect(previousPlayer).toBeTruthy();
      expect(currentPlayer !.value).toEqual({foo: null, bar: true});
      expect(previousPlayer !.value).toEqual({foo: true});
    });

    it('should sanitize styles before they are passed into the player', () => {
      const sanitizer = (function(prop: string, value?: string): string | boolean {
        if (value === undefined) {
          return prop === 'width' || prop === 'height';
        } else {
          return `${value}-safe!`;
        }
      }) as StyleSanitizeFn;

      const context = initContext(null, null, null, null, sanitizer);
      const handler = new CorePlayerHandler();
      const lView = createMockViewData(handler, context);

      let values: {[key: string]: any}|null = null;
      const buildFn =
          (element: HTMLElement, type: BindingType, value: any, isFirstRender: boolean) => {
            values = value;
            return new MockPlayer();
          };

      let factory = bindPlayerFactory<{[key: string]: any}>(
          buildFn, {width: '200px', height: '100px', opacity: '1'});
      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lView);

      expect(values !).toEqual({width: '200px-safe!', height: '100px-safe!', opacity: '1'});

      factory = bindPlayerFactory(buildFn, {width: 'auto'});
      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lView);

      expect(values !).toEqual({width: 'auto-safe!', height: null, opacity: null});
    });

    it('should automatically destroy existing players when the follow-up binding is not apart of a factory',
       () => {
         const context = initContext(null, ['width'], null, ['foo', 'bar']);
         const handler = new CorePlayerHandler();
         const lView = createMockViewData(handler, context);

         const players: Player[] = [];
         const styleBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
           const player = new MockPlayer();
           players.push(player);
           return player;
         };

         const classBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
           const player = new MockPlayer();
           players.push(player);
           return player;
         };

         expect(context[StylingIndex.PlayerContext]).toEqual(null);

         const styleMapFactory = bindPlayerFactory(styleBuildFn, {opacity: '1'});
         const classMapFactory = bindPlayerFactory(classBuildFn, {map: true});
         updateStylingMap(context, classMapFactory, styleMapFactory);
         updateStyleProp(context, 0, bindPlayerFactory(styleBuildFn, '100px') as any);
         updateClassProp(context, 0, bindPlayerFactory(classBuildFn, true) as any);
         updateClassProp(context, 1, bindPlayerFactory(classBuildFn, true) as any);
         renderStyles(context, false, undefined, lView);
         handler.flushPlayers();

         const [p1, p2, p3, p4, p5] = players;
         expect(p1.state).toEqual(PlayState.Running);
         expect(p2.state).toEqual(PlayState.Running);
         expect(p3.state).toEqual(PlayState.Running);
         expect(p4.state).toEqual(PlayState.Running);

         updateStylingMap(context, {bar: true}, {height: '200px'});
         updateStyleProp(context, 0, '200px');
         updateClassProp(context, 0, false);
         expect(p1.state).toEqual(PlayState.Running);
         expect(p2.state).toEqual(PlayState.Running);
         expect(p3.state).toEqual(PlayState.Running);
         expect(p4.state).toEqual(PlayState.Running);
         expect(p5.state).toEqual(PlayState.Running);

         renderStyles(context, false, undefined, lView);
         expect(p1.state).toEqual(PlayState.Destroyed);
         expect(p2.state).toEqual(PlayState.Destroyed);
         expect(p3.state).toEqual(PlayState.Destroyed);
         expect(p4.state).toEqual(PlayState.Destroyed);
         expect(p5.state).toEqual(PlayState.Running);
       });

    it('should list all [style] and [class] players alongside custom players in the context',
       () => {
         const players: Player[] = [];
         const styleBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
           const player = new MockPlayer();
           players.push(player);
           return player;
         };

         const classBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
           const player = new MockPlayer();
           players.push(player);
           return player;
         };

         const styleMapFactory = bindPlayerFactory(styleBuildFn, {height: '200px'});
         const classMapFactory = bindPlayerFactory(classBuildFn, {bar: true});
         const widthFactory = bindPlayerFactory(styleBuildFn, '100px');
         const fooFactory = bindPlayerFactory(classBuildFn, true);

         class Comp {
           static ngComponentDef = defineComponent({
             type: Comp,
             selectors: [['comp']],
             directives: [Comp],
             factory: () => new Comp(),
             consts: 1,
             vars: 0,
             template: (rf: RenderFlags, ctx: Comp) => {
               if (rf & RenderFlags.Create) {
                 elementStart(0, 'div');
                 elementStyling(['foo'], ['width']);
                 elementEnd();
               }
               if (rf & RenderFlags.Update) {
                 elementStylingMap(0, classMapFactory, styleMapFactory);
                 elementStyleProp(0, 0, widthFactory);
                 elementClassProp(0, 0, fooFactory);
                 elementStylingApply(0);
               }
             }
           });
         }

         const fixture = new ComponentFixture(Comp);
         fixture.update();

         const target = fixture.hostElement.querySelector('div') !as any;
         const elementContext = getLContext(target) !;
         const context = elementContext.lView[elementContext.nodeIndex] as StylingContext;

         expect(players.length).toEqual(4);
         const [p1, p2, p3, p4] = players;

         const playerContext = context[StylingIndex.PlayerContext];
         expect(playerContext).toContain(p1);
         expect(playerContext).toContain(p2);
         expect(playerContext).toContain(p3);
         expect(playerContext).toContain(p4);

         expect(getPlayers(target)).toEqual([p1, p2, p3, p4]);

         const p5 = new MockPlayer();
         const p6 = new MockPlayer();
         addPlayer(target, p5);
         addPlayer(target, p6);

         expect(getPlayers(target)).toEqual([p1, p2, p3, p4, p5, p6]);
         p3.destroy();
         p5.destroy();

         expect(getPlayers(target)).toEqual([p1, p2, p4, p6]);
       });

    it('should build a player and signal that the first render is active', () => {
      const firstRenderCaptures: any[] = [];
      const otherRenderCaptures: any[] = [];
      const buildFn =
          (element: HTMLElement, type: BindingType, value: any, isFirstRender: boolean) => {
            if (isFirstRender) {
              firstRenderCaptures.push({type, value});
            } else {
              otherRenderCaptures.push({type, value});
            }
            return new MockPlayer();
          };

      const styleMapFactory =
          bindPlayerFactory(buildFn, {height: '200px'}) as BoundPlayerFactory<any>;
      const classMapFactory = bindPlayerFactory(buildFn, {bar: true}) as BoundPlayerFactory<any>;
      const widthFactory = bindPlayerFactory(buildFn, '100px') as BoundPlayerFactory<any>;
      const fooFactory = bindPlayerFactory(buildFn, true) as BoundPlayerFactory<any>;

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          directives: [Comp],
          factory: () => new Comp(),
          consts: 1,
          vars: 0,
          template: (rf: RenderFlags, ctx: Comp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'div');
              elementStyling(['foo'], ['width']);
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementStylingMap(0, classMapFactory, styleMapFactory);
              elementStyleProp(0, 0, widthFactory);
              elementClassProp(0, 0, fooFactory);
              elementStylingApply(0);
            }
          }
        });
      }

      const fixture = new ComponentFixture(Comp);

      expect(firstRenderCaptures.length).toEqual(4);
      expect(firstRenderCaptures[0]).toEqual({type: BindingType.Class, value: {bar: true}});
      expect(firstRenderCaptures[1]).toEqual({type: BindingType.Style, value: {height: '200px'}});
      expect(firstRenderCaptures[2]).toEqual({type: BindingType.Style, value: {width: '100px'}});
      expect(firstRenderCaptures[3]).toEqual({type: BindingType.Class, value: {foo: true}});
      expect(otherRenderCaptures.length).toEqual(0);

      firstRenderCaptures.length = 0;
      styleMapFactory.value = {height: '100px'};
      classMapFactory.value = {bar: false};
      widthFactory.value = '50px';
      fooFactory.value = false;

      fixture.update();

      expect(firstRenderCaptures.length).toEqual(0);
      expect(otherRenderCaptures.length).toEqual(4);
      expect(otherRenderCaptures[0]).toEqual({type: BindingType.Class, value: {bar: false}});
      expect(otherRenderCaptures[1]).toEqual({type: BindingType.Style, value: {height: '100px'}});
      expect(otherRenderCaptures[2]).toEqual({type: BindingType.Style, value: {width: '50px'}});
      expect(otherRenderCaptures[3]).toEqual({type: BindingType.Class, value: {foo: false}});
    });

    it('should render styling players on both template and directive host bindings', () => {
      const players: MockPlayer[] = [];
      const styleBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
        const player = new MockPlayer();
        player.data = value;
        players.push(player);
        return player;
      };

      const classBuildFn = (element: HTMLElement, type: BindingType, value: any) => {
        const player = new MockPlayer();
        player.data = value;
        players.push(player);
        return player;
      };

      const widthFactory1 = bindPlayerFactory(styleBuildFn, '100px');
      const widthFactory2 = bindPlayerFactory(styleBuildFn, '200px');
      const fooFactory1 = bindPlayerFactory(classBuildFn, true);
      const fooFactory2 = bindPlayerFactory(classBuildFn, true);

      class MyDir {
        static ngDirectiveDef = defineDirective({
          type: MyDir,
          selectors: [['', 'my-dir', '']],
          factory: () => new MyDir(),
          hostBindings: function(rf: RenderFlags, ctx: MyDir, elementIndex: number) {
            if (rf & RenderFlags.Create) {
              elementStyling(['foo'], ['width'], null, ctx);
            }
            if (rf & RenderFlags.Update) {
              elementStyleProp(0, 0, ctx.widthFactory, null, ctx);
              elementClassProp(0, 0, ctx.fooFactory, ctx);
              elementStylingApply(0, ctx);
            }
          }
        });

        widthFactory = widthFactory2;
        fooFactory = fooFactory2;
      }

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          directives: [Comp, MyDir],
          factory: () => new Comp(),
          consts: 1,
          vars: 0,
          template: (rf: RenderFlags, ctx: Comp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'div', ['my-dir', '']);
              elementStyling(['foo'], ['width']);
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementStyleProp(0, 0, ctx.widthFactory);
              elementClassProp(0, 0, ctx.fooFactory);
              elementStylingApply(0);
            }
          }
        });

        widthFactory: any = widthFactory1;
        fooFactory: any = fooFactory1;
      }

      const fixture = new ComponentFixture(Comp);
      const component = fixture.component;
      fixture.update();

      expect(players.length).toEqual(2);
      const [p1, p2] = players;
      players.length = 0;

      expect(p1.data).toEqual({width: '100px'});
      expect(p2.data).toEqual({foo: true});

      component.fooFactory = null;
      component.widthFactory = null;

      fixture.update();

      expect(players.length).toEqual(2);
      const [p3, p4] = players;

      expect(p3.data).toEqual({width: '200px'});
      expect(p4.data).toEqual({foo: true});
    });
  });
});

class MockStylingStore implements BindingStore {
  private _values: {[key: string]: any} = {};

  constructor(public element: HTMLElement, public type: BindingType) {}

  setValue(prop: string, value: any): void { this._values[prop] = value; }

  getValues() { return this._values; }
}

function assertContextOnlyValues(actual: StylingContext, target: any[]) {
  assertContext(actual, target as StylingContext, StylingIndex.SingleStylesStartPosition);
}

function assertContext(actual: StylingContext, target: StylingContext, startIndex: number = 0) {
  const errorPrefix = 'Assertion of styling context has failed: \n';
  if (startIndex === 0 && actual.length !== target.length) {
    fail(
        errorPrefix +
        `=> Expected length of context to be ${target.length} (actual = ${actual.length})`);
    return;
  }

  const log: string[] = [];
  for (let i = startIndex; i < actual.length; i++) {
    const actualValue = actual[i];
    const targetValue = target[i - startIndex];
    if (isConfigValue(i)) {
      const failures = compareLogSummaries(
          generateConfigSummary(actualValue as number),
          generateConfigSummary(targetValue as number));
      if (failures.length) {
        log.push(`i=${i}: Expected config values to match`);
        failures.forEach(f => { log.push('    ' + f); });
      }
    } else {
      let valueIsTheSame: boolean;
      let stringError: string|null = null;
      let fieldName: string;
      switch (i) {
        case StylingIndex.PlayerContext:
          valueIsTheSame = valueEqualsValue(actualValue, targetValue);
          stringError = !valueIsTheSame ?
              generateArrayCompareError(actualValue as any[], targetValue as any[], '  ') :
              null;
          fieldName = 'Player Context';
          break;
        case StylingIndex.ElementPosition:
          valueIsTheSame = actualValue === targetValue;
          stringError = !valueIsTheSame ?
              generateElementCompareError(actualValue as Element, targetValue as Element) :
              null;
          fieldName = 'Element Position';
          break;
        case StylingIndex.CachedClassValueOrInitialClassString:
        case StylingIndex.CachedStyleValue:
          valueIsTheSame = stringMapEqualsStringMap(actualValue, targetValue);
          stringError =
              !valueIsTheSame ? generateValueCompareError(actualValue, targetValue) : null;
          fieldName = 'Cached Style/Class Value';
          break;
        default:
          valueIsTheSame = valueEqualsValue(actualValue, targetValue);
          stringError =
              !valueIsTheSame ? generateValueCompareError(actualValue, targetValue) : null;
          fieldName = i > StylingIndex.SingleStylesStartPosition ?
              `styling value #${Math.floor(i / StylingIndex.Size)}` :
              'config value';
          break;
      }
      if (!valueIsTheSame) {
        log.push(`Error: i=${i}: (${fieldName}) ${stringError}`);
      }
    }
  }

  if (log.length) {
    fail(errorPrefix + log.join('\n'));
  }
}

function generateArrayCompareError(a: any[], b: any[], tab: string) {
  const values: string[] = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      values.push(`${tab}a[${i}] !== b[${i}]`);
    } else {
      values.push(`${tab}a[${i}] === b[${i}]`);
    }
  }
  return values.length ? '\n' + values.join('\n') : null;
}

function generateElementCompareError(a: Element, b: Element) {
  const aName = a.nodeName.toLowerCase() + a.className.replace(/ /g, '.').trim();
  const bName = b.nodeName.toLowerCase() + b.className.replace(/ /g, '.').trim();
  return `${aName} !== ${bName} (by instance)`;
}

function generateValueCompareError(a: any, b: any) {
  return `${JSON.stringify(a)} !== ${JSON.stringify(b)}`;
}

function isConfigValue(index: number) {
  if (index == StylingIndex.MasterFlagPosition) return true;
  if (index >= StylingIndex.SingleStylesStartPosition) {
    return (index - StylingIndex.SingleStylesStartPosition) % StylingIndex.Size === 0;
  }
}

function valueEqualsValue(a: any, b: any): boolean {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  return a === b;
}

function stringMapEqualsStringMap(a: any, b: any): boolean {
  if (a && b) {
    const k1 = Object.keys(a);
    const k2 = Object.keys(b);
    if (k1.length === k2.length) {
      return k1.every(key => { return a[key] === b[key]; });
    }
    return false;
  }
  return a == b;
}
