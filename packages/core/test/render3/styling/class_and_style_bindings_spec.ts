/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createRootContext} from '../../../src/render3/component';
import {getContext} from '../../../src/render3/context_discovery';
import {defineComponent} from '../../../src/render3/index';
import {createLViewData, createTView, elementClassProp, elementEnd, elementStart, elementStyleProp, elementStyling, elementStylingApply, elementStylingMap} from '../../../src/render3/instructions';
import {InitialStylingFlags, RenderFlags} from '../../../src/render3/interfaces/definition';
import {BindingStore, BindingType, PlayState, Player, PlayerFactory, PlayerHandler} from '../../../src/render3/interfaces/player';
import {RElement, Renderer3, domRendererFactory3} from '../../../src/render3/interfaces/renderer';
import {StylingContext, StylingFlags, StylingIndex} from '../../../src/render3/interfaces/styling';
import {CONTEXT, LViewData, LViewFlags, RootContext} from '../../../src/render3/interfaces/view';
import {addPlayer, getPlayers} from '../../../src/render3/players';
import {ClassAndStylePlayerBuilder, createStylingContextTemplate, isContextDirty, renderStyleAndClassBindings as _renderStyling, setContextDirty, updateClassProp, updateStyleProp, updateStylingMap} from '../../../src/render3/styling/class_and_style_bindings';
import {CorePlayerHandler} from '../../../src/render3/styling/core_player_handler';
import {BoundPlayerFactory, bindPlayerFactory} from '../../../src/render3/styling/player_factory';
import {allocStylingContext} from '../../../src/render3/styling/util';
import {defaultStyleSanitizer} from '../../../src/sanitization/sanitization';
import {StyleSanitizeFn} from '../../../src/sanitization/style_sanitizer';
import {ComponentFixture, renderToHtml} from '../render_util';

import {MockPlayer} from './mock_player';

describe('style and class based bindings', () => {
  let element: RElement|null = null;
  beforeEach(() => { element = document.createElement('div') as any; });

  function createMockViewData(playerHandler: PlayerHandler, context: StylingContext): LViewData {
    const rootContext =
        createRootContext(requestAnimationFrame.bind(window), playerHandler || null);
    const lViewData = createLViewData(
        domRendererFactory3.createRenderer(element, null),
        createTView(-1, null, 1, 0, null, null, null), rootContext, LViewFlags.IsRoot);
    return lViewData;
  }

  function initContext(
      styles?: (number | string)[] | null, classes?: (string | number | boolean)[] | null,
      sanitizer?: StyleSanitizeFn | null): StylingContext {
    return allocStylingContext(element, createStylingContextTemplate(classes, styles, sanitizer));
  }

  function getRootContextInternal(lViewData: LViewData) {
    return lViewData[CONTEXT] as RootContext;
  }

  function renderStyles(
      context: StylingContext, firstRender?: boolean, renderer?: Renderer3, lViewData?: LViewData) {
    const store = new MockStylingStore(element as HTMLElement, BindingType.Style);
    const handler = new CorePlayerHandler();
    _renderStyling(
        context, (renderer || {}) as Renderer3,
        getRootContextInternal(lViewData || createMockViewData(handler, context)), !!firstRender,
        null, store);
    return store.getValues();
  }

  function trackStylesFactory(store?: MockStylingStore) {
    store = store || new MockStylingStore(element as HTMLElement, BindingType.Style);
    const handler = new CorePlayerHandler();
    return function(context: StylingContext, firstRender?: boolean, renderer?: Renderer3):
        {[key: string]: any} {
          const lViewData = createMockViewData(handler, context);
          _renderStyling(
              context, (renderer || {}) as Renderer3, getRootContextInternal(lViewData),
              !!firstRender, null, store);
          return store !.getValues();
        };
  }

  function trackClassesFactory(store?: MockStylingStore) {
    store = store || new MockStylingStore(element as HTMLElement, BindingType.Class);
    const handler = new CorePlayerHandler();
    return function(context: StylingContext, firstRender?: boolean, renderer?: Renderer3):
        {[key: string]: any} {
          const lViewData = createMockViewData(handler, context);
          _renderStyling(
              context, (renderer || {}) as Renderer3, getRootContextInternal(lViewData),
              !!firstRender, store);
          return store !.getValues();
        };
  }

  function trackStylesAndClasses() {
    const classStore = new MockStylingStore(element as HTMLElement, BindingType.Class);
    const styleStore = new MockStylingStore(element as HTMLElement, BindingType.Style);
    const handler = new CorePlayerHandler();
    return function(context: StylingContext, firstRender?: boolean, renderer?: Renderer3):
        {[key: string]: any} {
          const lViewData = createMockViewData(handler, context);
          _renderStyling(
              context, (renderer || {}) as Renderer3, getRootContextInternal(lViewData),
              !!firstRender, classStore, styleStore);
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
    describe('createStylingContextTemplate', () => {
      it('should initialize empty template', () => {
        const template = initContext();
        expect(template).toEqual([null, null, [null], cleanStyle(0, 8), 0, element, null, null]);
      });

      it('should initialize static styles', () => {
        const template =
            initContext([InitialStylingFlags.VALUES_MODE, 'color', 'red', 'width', '10px']);
        expect(template).toEqual([
          null,
          null,
          [null, 'red', '10px'],
          dirtyStyle(0, 16),  //
          0,
          element,
          null,
          null,

          // #8
          cleanStyle(1, 16),
          'color',
          null,
          0,

          // #12
          cleanStyle(2, 20),
          'width',
          null,
          0,

          // #16
          dirtyStyle(1, 8),
          'color',
          null,
          0,

          // #20
          dirtyStyle(2, 12),
          'width',
          null,
          0,
        ]);
      });
    });

    describe('instructions', () => {
      it('should handle a combination of initial, multi and singular style values (in that order)',
         () => {
           function Template(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               elementStart(0, 'span');
               elementStyling([], [
                 'width', 'height', 'opacity',  //
                 InitialStylingFlags.VALUES_MODE, 'width', '100px', 'height', '100px', 'opacity',
                 '0.5'
               ]);
               elementEnd();
             }
             if (rf & RenderFlags.Update) {
               elementStylingMap(0, ctx.myStyles);
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
    });

    describe('helper functions', () => {
      it('should build a list of multiple styling values', () => {
        const getStyles = trackStylesFactory();
        const stylingContext = initContext();
        updateStyles(stylingContext, {
          width: '100px',
          height: '100px',
        });
        updateStyles(stylingContext, {height: '200px'});
        expect(getStyles(stylingContext, true)).toEqual({height: '200px'});
      });

      it('should evaluate the delta between style changes when rendering occurs', () => {
        const stylingContext =
            initContext(['width', 'height', InitialStylingFlags.VALUES_MODE, 'width', '100px']);
        updateStyles(stylingContext, {
          height: '200px',
        });
        expect(renderStyles(stylingContext)).toEqual({width: '100px', height: '200px'});
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
        const stylingContext = initContext(['width', 'height']);
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
        const stylingContext = initContext(['height']);
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

        const stylingContext = initContext([
          'width', 'height', 'opacity', InitialStylingFlags.VALUES_MODE, 'width', '100px', 'height',
          '100px', 'opacity', '0'
        ]);

        expect(getStyles(stylingContext)).toEqual({
          width: '100px',
          height: '100px',
          opacity: '0',
        });

        updateStyles(stylingContext, {width: '200px', height: '200px'});

        expect(getStyles(stylingContext)).toEqual({
          width: '200px',
          height: '200px',
          opacity: '0',
        });

        updateStyleProp(stylingContext, 0, '300px');

        expect(getStyles(stylingContext)).toEqual({
          width: '300px',
          height: '200px',
          opacity: '0',
        });

        updateStyleProp(stylingContext, 0, null);

        expect(getStyles(stylingContext)).toEqual({
          width: '200px',
          height: '200px',
          opacity: '0',
        });

        updateStyles(stylingContext, {});

        expect(getStyles(stylingContext)).toEqual({
          width: '100px',
          height: '100px',
          opacity: '0',
        });
      });

      it('should cleanup removed styles from the context once the styles are built', () => {
        const stylingContext = initContext(['width', 'height']);
        const getStyles = trackStylesFactory();

        updateStyles(stylingContext, {width: '100px', height: '100px'});

        expect(stylingContext).toEqual([
          null,
          null,
          [null],
          dirtyStyle(0, 16),  //
          2,
          element,
          null,
          {width: '100px', height: '100px'},

          // #8
          cleanStyle(0, 16),
          'width',
          null,
          0,

          // #12
          cleanStyle(0, 20),
          'height',
          null,
          0,

          // #16
          dirtyStyle(0, 8),
          'width',
          '100px',
          0,

          // #20
          dirtyStyle(0, 12),
          'height',
          '100px',
          0,
        ]);

        getStyles(stylingContext);
        updateStyles(stylingContext, {width: '200px', opacity: '0'});

        expect(stylingContext).toEqual([
          null,
          null,
          [null],
          dirtyStyle(0, 16),  //
          2,
          element,
          null,
          {width: '200px', opacity: '0'},

          // #8
          cleanStyle(0, 16),
          'width',
          null,
          0,

          // #12
          cleanStyle(0, 24),
          'height',
          null,
          0,

          // #16
          dirtyStyle(0, 8),
          'width',
          '200px',
          0,

          // #20
          dirtyStyle(),
          'opacity',
          '0',
          0,

          // #23
          dirtyStyle(0, 12),
          'height',
          null,
          0,
        ]);

        getStyles(stylingContext);
        expect(stylingContext).toEqual([
          null,
          null,
          [null],
          cleanStyle(0, 16),  //
          2,
          element,
          null,
          {width: '200px', opacity: '0'},

          // #8
          cleanStyle(0, 16),
          'width',
          null,
          0,

          // #12
          cleanStyle(0, 24),
          'height',
          null,
          0,

          // #16
          cleanStyle(0, 8),
          'width',
          '200px',
          0,

          // #20
          cleanStyle(),
          'opacity',
          '0',
          0,

          // #23
          cleanStyle(0, 12),
          'height',
          null,
          0,
        ]);

        updateStyles(stylingContext, {width: null});
        updateStyleProp(stylingContext, 0, '300px');

        expect(stylingContext).toEqual([
          null,
          null,
          [null],
          dirtyStyle(0, 16),  //
          2,
          element,
          null,
          {width: null},

          // #8
          dirtyStyle(0, 16),
          'width',
          '300px',
          0,

          // #12
          cleanStyle(0, 24),
          'height',
          null,
          0,

          // #16
          cleanStyle(0, 8),
          'width',
          null,
          0,

          // #20
          dirtyStyle(),
          'opacity',
          null,
          0,

          // #23
          cleanStyle(0, 12),
          'height',
          null,
          0,
        ]);

        getStyles(stylingContext);

        updateStyleProp(stylingContext, 0, null);
        expect(stylingContext).toEqual([
          null,
          null,
          [null],
          dirtyStyle(0, 16),  //
          2,
          element,
          null,
          {width: null},

          // #8
          dirtyStyle(0, 16),
          'width',
          null,
          0,

          // #12
          cleanStyle(0, 24),
          'height',
          null,
          0,

          // #16
          cleanStyle(0, 8),
          'width',
          null,
          0,

          // #20
          cleanStyle(),
          'opacity',
          null,
          0,

          // #23
          cleanStyle(0, 12),
          'height',
          null,
          0,
        ]);
      });

      it('should find the next available space in the context when data is added after being removed before',
         () => {
           const stylingContext = initContext(['lineHeight']);
           const getStyles = trackStylesFactory();

           updateStyles(stylingContext, {width: '100px', height: '100px', opacity: '0.5'});

           expect(stylingContext).toEqual([
             null,
             null,
             [null],
             dirtyStyle(0, 12),  //
             1,
             element,
             null,
             {width: '100px', height: '100px', opacity: '0.5'},

             // #8
             cleanStyle(0, 24),
             'lineHeight',
             null,
             0,

             // #12
             dirtyStyle(),
             'width',
             '100px',
             0,

             // #16
             dirtyStyle(),
             'height',
             '100px',
             0,

             // #20
             dirtyStyle(),
             'opacity',
             '0.5',
             0,

             // #23
             cleanStyle(0, 8),
             'lineHeight',
             null,
             0,
           ]);

           getStyles(stylingContext);

           updateStyles(stylingContext, {});
           expect(stylingContext).toEqual([
             null,
             null,
             [null],
             dirtyStyle(0, 12),  //
             1,
             element,
             null,
             {},

             // #8
             cleanStyle(0, 24),
             'lineHeight',
             null,
             0,

             // #12
             dirtyStyle(),
             'width',
             null,
             0,

             // #16
             dirtyStyle(),
             'height',
             null,
             0,

             // #20
             dirtyStyle(),
             'opacity',
             null,
             0,

             // #23
             cleanStyle(0, 8),
             'lineHeight',
             null,
             0,
           ]);

           getStyles(stylingContext);
           updateStyles(stylingContext, {
             borderWidth: '5px',
           });

           expect(stylingContext).toEqual([
             null,
             null,
             [null],
             dirtyStyle(0, 12),  //
             1,
             element,
             null,
             {borderWidth: '5px'},

             // #8
             cleanStyle(0, 28),
             'lineHeight',
             null,
             0,

             // #12
             dirtyStyle(),
             'borderWidth',
             '5px',
             0,

             // #16
             cleanStyle(),
             'width',
             null,
             0,

             // #20
             cleanStyle(),
             'height',
             null,
             0,

             // #23
             cleanStyle(),
             'opacity',
             null,
             0,

             // #28
             cleanStyle(0, 8),
             'lineHeight',
             null,
             0,
           ]);

           updateStyleProp(stylingContext, 0, '200px');

           expect(stylingContext).toEqual([
             null,
             null,
             [null],
             dirtyStyle(0, 12),  //
             1,
             element,
             null,
             {borderWidth: '5px'},

             // #8
             dirtyStyle(0, 28),
             'lineHeight',
             '200px',
             0,

             // #12
             dirtyStyle(),
             'borderWidth',
             '5px',
             0,

             // #16
             cleanStyle(),
             'width',
             null,
             0,

             // #20
             cleanStyle(),
             'height',
             null,
             0,

             // #23
             cleanStyle(),
             'opacity',
             null,
             0,

             // #28
             cleanStyle(0, 8),
             'lineHeight',
             null,
             0,
           ]);

           updateStyles(stylingContext, {borderWidth: '15px', borderColor: 'red'});

           expect(stylingContext).toEqual([
             null,
             null,
             [null],
             dirtyStyle(0, 12),  //
             1,
             element,
             null,
             {borderWidth: '15px', borderColor: 'red'},

             // #8
             dirtyStyle(0, 32),
             'lineHeight',
             '200px',
             0,

             // #12
             dirtyStyle(),
             'borderWidth',
             '15px',
             0,

             // #16
             dirtyStyle(),
             'borderColor',
             'red',
             0,

             // #20
             cleanStyle(),
             'width',
             null,
             0,

             // #23
             cleanStyle(),
             'height',
             null,
             0,

             // #28
             cleanStyle(),
             'opacity',
             null,
             0,

             // #32
             cleanStyle(0, 8),
             'lineHeight',
             null,
             0,
           ]);
         });

      it('should render all data as not being dirty after the styles are built', () => {
        const getStyles = trackStylesFactory();
        const stylingContext = initContext(['height']);

        updateStyles(stylingContext, {
          width: '100px',
        });

        updateStyleProp(stylingContext, 0, '200px');

        expect(stylingContext).toEqual([
          null,
          null,
          [null],
          dirtyStyle(0, 12),  //
          1,
          element,
          null,
          {width: '100px'},

          // #8
          dirtyStyle(0, 16),
          'height',
          '200px',
          0,

          // #12
          dirtyStyle(),
          'width',
          '100px',
          0,

          // #16
          cleanStyle(0, 8),
          'height',
          null,
          0,
        ]);

        getStyles(stylingContext);

        expect(stylingContext).toEqual([
          null,
          null,
          [null],
          cleanStyle(0, 12),  //
          1,
          element,
          null,
          {width: '100px'},

          // #8
          cleanStyle(0, 16),
          'height',
          '200px',
          0,

          // #12
          cleanStyle(),
          'width',
          '100px',
          0,

          // #16
          cleanStyle(0, 8),
          'height',
          null,
          0,
        ]);
      });

      it('should mark styles that may contain url values as being sanitizable (when a sanitizer is passed in)',
         () => {
           const getStyles = trackStylesFactory();
           const initialStyles = ['border-image', 'border-width'];
           const styleSanitizer = defaultStyleSanitizer;
           const stylingContext = initContext(initialStyles, null, styleSanitizer);

           updateStyleProp(stylingContext, 0, 'url(foo.jpg)');
           updateStyleProp(stylingContext, 1, '100px');

           expect(stylingContext).toEqual([
             null,
             styleSanitizer,
             [null],
             dirtyStyle(0, 16),  //
             2,
             element,
             null,
             null,

             // #8
             dirtyStyleWithSanitization(0, 16),
             'border-image',
             'url(foo.jpg)',
             0,

             // #12
             dirtyStyle(0, 20),
             'border-width',
             '100px',
             0,

             // #16
             cleanStyleWithSanitization(0, 8),
             'border-image',
             null,
             0,

             // #20
             cleanStyle(0, 12),
             'border-width',
             null,
             0,
           ]);

           updateStyles(stylingContext, {'background-image': 'unsafe'});

           expect(stylingContext).toEqual([
             null,
             styleSanitizer,
             [null],
             dirtyStyle(0, 16),  //
             2,
             element,
             null,
             {'background-image': 'unsafe'},

             // #8
             dirtyStyleWithSanitization(0, 20),
             'border-image',
             'url(foo.jpg)',
             0,

             // #12
             dirtyStyle(0, 24),
             'border-width',
             '100px',
             0,

             // #16
             dirtyStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',
             0,

             // #20
             cleanStyleWithSanitization(0, 8),
             'border-image',
             null,
             0,

             // #23
             cleanStyle(0, 12),
             'border-width',
             null,
             0,
           ]);

           getStyles(stylingContext);

           expect(stylingContext).toEqual([
             null,
             styleSanitizer,
             [null],
             cleanStyle(0, 16),  //
             2,
             element,
             null,
             {'background-image': 'unsafe'},

             // #8
             cleanStyleWithSanitization(0, 20),
             'border-image',
             'url(foo.jpg)',
             0,

             // #12
             cleanStyle(0, 24),
             'border-width',
             '100px',
             0,

             // #16
             cleanStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',
             0,

             // #20
             cleanStyleWithSanitization(0, 8),
             'border-image',
             null,
             0,

             // #23
             cleanStyle(0, 12),
             'border-width',
             null,
             0,
           ]);
         });
    });

    it('should skip issuing style updates if there is nothing to update upon first render', () => {
      const stylingContext = initContext([InitialStylingFlags.VALUES_MODE, 'color', '']);
      const store = new MockStylingStore(element as HTMLElement, BindingType.Class);
      const getStyles = trackStylesFactory(store);

      let styles: any = {fontSize: ''};
      updateStyleProp(stylingContext, 0, '');
      updateStylingMap(stylingContext, null, styles);

      getStyles(stylingContext, true);
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
    it('should initialize with the provided classes', () => {
      const template =
          initContext(null, [InitialStylingFlags.VALUES_MODE, 'one', true, 'two', true]);
      expect(template).toEqual([
        null,
        null,
        [null, true, true],
        dirtyStyle(0, 16),  //
        0,
        element,
        null,
        null,

        // #8
        cleanClass(1, 16),
        'one',
        null,
        0,

        // #12
        cleanClass(2, 20),
        'two',
        null,
        0,

        // #16
        dirtyClass(1, 8),
        'one',
        null,
        0,

        // #20
        dirtyClass(2, 12),
        'two',
        null,
        0,
      ]);
    });

    it('should update multi class properties against the static classes', () => {
      const getClasses = trackClassesFactory();
      const stylingContext = initContext(null, ['bar']);
      expect(getClasses(stylingContext)).toEqual({});
      updateClasses(stylingContext, {foo: true, bar: false});
      expect(getClasses(stylingContext)).toEqual({'foo': true, 'bar': false});
      updateClasses(stylingContext, 'bar');
      expect(getClasses(stylingContext)).toEqual({'foo': false, 'bar': true});
    });

    it('should update single class properties against the static classes', () => {
      const getClasses = trackClassesFactory();
      const stylingContext =
          initContext(null, ['bar', 'foo', InitialStylingFlags.VALUES_MODE, 'bar', true]);
      expect(getClasses(stylingContext)).toEqual({'bar': true});

      updateClassProp(stylingContext, 0, true);
      updateClassProp(stylingContext, 1, true);
      expect(getClasses(stylingContext)).toEqual({'bar': true, 'foo': true});

      updateClassProp(stylingContext, 0, false);
      updateClassProp(stylingContext, 1, false);
      expect(getClasses(stylingContext)).toEqual({'bar': true, 'foo': false});
    });

    it('should understand updating multi-classes using a string-based value while respecting single class-based props',
       () => {
         const getClasses = trackClassesFactory();
         const stylingContext = initContext(null, ['guy']);
         expect(getClasses(stylingContext)).toEqual({});

         updateStylingMap(stylingContext, 'foo bar guy');
         expect(getClasses(stylingContext)).toEqual({'foo': true, 'bar': true, 'guy': true});

         updateStylingMap(stylingContext, 'foo man');
         updateClassProp(stylingContext, 0, true);
         expect(getClasses(stylingContext))
             .toEqual({'foo': true, 'man': true, 'bar': false, 'guy': true});
       });

    it('should house itself inside the context alongside styling in harmony', () => {
      const getStylesAndClasses = trackStylesAndClasses();
      const initialStyles = ['width', 'height', InitialStylingFlags.VALUES_MODE, 'width', '100px'];
      const initialClasses = ['wide', 'tall', InitialStylingFlags.VALUES_MODE, 'wide', true];
      const stylingContext = initContext(initialStyles, initialClasses);
      expect(stylingContext).toEqual([
        null,
        null,
        [null, '100px', true],
        dirtyStyle(0, 24),  //
        2,
        element,
        null,
        null,

        // #8
        cleanStyle(1, 24),
        'width',
        null,
        0,

        // #12
        cleanStyle(0, 28),
        'height',
        null,
        0,

        // #16
        cleanClass(2, 32),
        'wide',
        null,
        0,

        // #20
        cleanClass(0, 36),
        'tall',
        null,
        0,

        // #23
        dirtyStyle(1, 8),
        'width',
        null,
        0,

        // #28
        cleanStyle(0, 12),
        'height',
        null,
        0,

        // #32
        dirtyClass(2, 16),
        'wide',
        null,
        0,

        // #36
        cleanClass(0, 20),
        'tall',
        null,
        0,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([{wide: true}, {width: '100px'}]);

      updateStylingMap(stylingContext, 'tall round', {width: '200px', opacity: '0.5'});
      expect(stylingContext).toEqual([
        null,
        null,
        [null, '100px', true],
        dirtyStyle(0, 24),  //
        2,
        element,
        'tall round',
        {width: '200px', opacity: '0.5'},

        // #8
        cleanStyle(1, 24),
        'width',
        null,
        0,

        // #12
        cleanStyle(0, 44),
        'height',
        null,
        0,

        // #16
        cleanClass(2, 40),
        'wide',
        null,
        0,

        // #20
        cleanClass(0, 32),
        'tall',
        null,
        0,

        // #23
        dirtyStyle(1, 8),
        'width',
        '200px',
        0,

        // #28
        dirtyStyle(0, 0),
        'opacity',
        '0.5',
        0,

        // #32
        dirtyClass(0, 20),
        'tall',
        true,
        0,

        // #36
        dirtyClass(0, 0),
        'round',
        true,
        0,

        // #40
        cleanClass(2, 16),
        'wide',
        null,
        0,

        // #44
        cleanStyle(0, 12),
        'height',
        null,
        0,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([
        {tall: true, round: true, wide: true},
        {width: '200px', opacity: '0.5'},
      ]);

      updateStylingMap(stylingContext, {tall: true, wide: true}, {width: '500px'});
      updateStyleProp(stylingContext, 0, '300px');

      expect(stylingContext).toEqual([
        null,
        null,
        [null, '100px', true],
        dirtyStyle(0, 24),  //
        2,
        element,
        {tall: true, wide: true},
        {width: '500px'},

        // #8
        dirtyStyle(1, 24),
        'width',
        '300px',
        0,

        // #12
        cleanStyle(0, 44),
        'height',
        null,
        0,

        // #16
        cleanClass(2, 32),
        'wide',
        null,
        0,

        // #20
        cleanClass(0, 28),
        'tall',
        null,
        0,

        // #23
        cleanStyle(1, 8),
        'width',
        '500px',
        0,

        // #28
        cleanClass(0, 20),
        'tall',
        true,
        0,

        // #32
        cleanClass(2, 16),
        'wide',
        true,
        0,

        // #35
        dirtyClass(0, 0),
        'round',
        null,
        0,

        // #39
        dirtyStyle(0, 0),
        'opacity',
        null,
        0,

        // #43
        cleanStyle(0, 12),
        'height',
        null,
        0,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([
        {tall: true, round: false, wide: true},
        {width: '300px', opacity: null},
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

         expect(stylingContext).toEqual([
           null,
           null,
           [null],
           cleanStyle(0, 8),  //
           0,
           element,
           {foo: true},
           {width: '200px'},

           // #8
           cleanStyle(0, 0),
           'width',
           '200px',
           0,

           // #11
           cleanClass(0, 0),
           'foo',
           true,
           0,
         ]);

         stylesMap.width = '300px';
         classesMap.foo = false;

         updateStylingMap(stylingContext, classesMap, stylesMap);

         // apply the styles
         getStylesAndClasses(stylingContext);

         expect(stylingContext).toEqual([
           null,
           null,
           [null],
           cleanStyle(0, 8),  //
           0,
           element,
           {foo: false},
           {width: '300px'},

           // #8
           cleanStyle(0, 0),
           'width',
           '200px',
           0,

           // #11
           cleanClass(0, 0),
           'foo',
           true,
           0,
         ]);
       });

    it('should skip updating multi classes if the string-based identity has not changed', () => {
      const stylingContext = initContext();
      const getClasses = trackClassesFactory();

      const classes = 'apple orange banana';
      updateStylingMap(stylingContext, classes);

      // apply the styles
      expect(getClasses(stylingContext)).toEqual({apple: true, orange: true, banana: true});

      expect(stylingContext).toEqual([
        null,
        null,
        [null],
        cleanStyle(0, 8),  //
        0,
        element,
        'apple orange banana',
        null,

        // #8
        cleanClass(0, 0),
        'apple',
        true,
        0,

        // #12
        cleanClass(0, 0),
        'orange',
        true,
        0,

        // #16
        cleanClass(0, 0),
        'banana',
        true,
        0,
      ]);

      stylingContext[13] = false;  // no orange
      stylingContext[16] = false;  // no banana
      updateStylingMap(stylingContext, classes);

      // apply the styles
      expect(getClasses(stylingContext)).toEqual({apple: true, orange: true, banana: true});
    });

    it('should skip issuing class updates if there is nothing to update upon first render', () => {
      const stylingContext = initContext(null, [InitialStylingFlags.VALUES_MODE, 'blue', false]);
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
      const context = initContext(null, []);

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
      const lViewData = createMockViewData(handler, context);

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

      renderStyles(context, false, undefined, lViewData);
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
         const context = initContext(['width', 'height'], ['foo', 'bar']);
         const handler = new CorePlayerHandler();
         const lViewData = createMockViewData(handler, context);

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

         renderStyles(context, false, undefined, lViewData);
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

         renderStyles(context, false, undefined, lViewData);
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
         const context = initContext(['width']);
         const handler = new CorePlayerHandler();
         const lViewData = createMockViewData(handler, context);

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
         renderStyles(context, false, undefined, lViewData);

         expect(players.length).toEqual(1);
         const p1 = players.pop() !;
         expect(p1.state).toEqual(PlayState.Pending);

         mapFactory = bindPlayerFactory(buildFn, {width: '100px'});
         updateStylingMap(context, null, mapFactory);
         renderStyles(context, false, undefined, lViewData);

         expect(players.length).toEqual(1);
         const p2 = players.pop() !;
         expect(p1.state).toEqual(PlayState.Destroyed);
         expect(p2.state).toEqual(PlayState.Pending);
       });

    it('should nullify style map and style property factories if any follow up expressions not use them',
       () => {
         const context = initContext(['color'], ['foo']);
         const handler = new CorePlayerHandler();
         const lViewData = createMockViewData(handler, context);

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

         expect(context).toEqual([
           null,
           null,
           [null],
           cleanStyle(0, 16),  //
           1,
           element,
           null,
           null,

           // #8
           cleanStyle(0, 16),
           'color',
           null,
           0,

           // #12
           cleanClass(0, 20),
           'foo',
           null,
           0,

           // #16
           cleanStyle(0, 8),
           'color',
           null,
           0,

           // #20
           cleanClass(0, 12),
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
         renderStyles(context, false, undefined, lViewData);

         const p1 = classPlayers.shift();
         const p2 = stylePlayers.shift();
         const p3 = stylePlayers.shift();
         const p4 = classPlayers.shift();
         expect(context).toEqual([
           ([
             9, classMapPlayerBuilder, p1, styleMapPlayerBuilder, p2, colorPlayerBuilder, p3,
             fooPlayerBuilder, p4
           ] as any),
           null,
           [null],
           cleanStyle(0, 16),  //
           1,
           element,
           {map: true},
           {opacity: '1'},

           // #8
           cleanStyle(0, 24),
           'color',
           'red',
           5,

           // #12
           cleanClass(0, 28),
           'foo',
           true,
           7,

           // #16
           cleanStyle(0, 0),
           'opacity',
           '1',
           3,

           // #20
           cleanClass(0, 0),
           'map',
           true,
           1,

           // #23
           cleanStyle(0, 8),
           'color',
           null,
           0,

           // #28
           cleanClass(0, 12),
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
         renderStyles(context, false, undefined, lViewData);

         expect(context).toEqual([
           ([9, null, null, null, null, null, null, null, null] as any),
           null,
           [null],
           cleanStyle(0, 16),  //
           1,
           element,
           {map: true},
           {opacity: '1'},

           // #8
           cleanStyle(0, 24),
           'color',
           'blue',
           0,

           // #12
           cleanClass(0, 28),
           'foo',
           false,
           0,

           // #16
           cleanStyle(0, 0),
           'opacity',
           '1',
           0,

           // #20
           cleanClass(0, 0),
           'map',
           true,
           0,

           // #23
           cleanStyle(0, 8),
           'color',
           null,
           0,

           // #28
           cleanClass(0, 12),
           'foo',
           null,
           0,
         ]);
       });

    it('should not call a factory if no style and/or class values have been updated', () => {
      const context = initContext([]);
      const handler = new CorePlayerHandler();
      const lViewData = createMockViewData(handler, context);

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

      renderStyles(context, false, undefined, lViewData);
      expect(styleCalls).toEqual(1);
      expect(classCalls).toEqual(1);

      renderStyles(context, false, undefined, lViewData);
      expect(styleCalls).toEqual(1);
      expect(classCalls).toEqual(1);

      styleFactory.value = {opacity: '0.5'};
      updateStylingMap(context, classFactory, styleFactory);
      renderStyles(context, false, undefined, lViewData);
      expect(styleCalls).toEqual(2);
      expect(classCalls).toEqual(1);

      classFactory.value = 'foo';
      updateStylingMap(context, classFactory, styleFactory);
      renderStyles(context, false, undefined, lViewData);
      expect(styleCalls).toEqual(2);
      expect(classCalls).toEqual(2);

      updateStylingMap(context, 'foo', {opacity: '0.5'});
      renderStyles(context, false, undefined, lViewData);
      expect(styleCalls).toEqual(2);
      expect(classCalls).toEqual(2);
    });

    it('should invoke a single prop player over a multi style player when present and delegate back if not',
       () => {
         const context = initContext(['color']);
         const handler = new CorePlayerHandler();
         const lViewData = createMockViewData(handler, context);

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
         renderStyles(context, false, undefined, lViewData);

         expect(propPlayer).toBeFalsy();
         expect(styleMapPlayer).toBeFalsy();

         const propFactory = bindPlayerFactory(propBuildFn, 'orange');
         updateStyleProp(context, 0, propFactory as any);
         renderStyles(context, false, undefined, lViewData);

         expect(propPlayer).toBeTruthy();
         expect(styleMapPlayer).toBeFalsy();

         propPlayer = styleMapPlayer = null;

         updateStyleProp(context, 0, null);
         renderStyles(context, false, undefined, lViewData);

         expect(propPlayer).toBeFalsy();
         expect(styleMapPlayer).toBeTruthy();

         propPlayer = styleMapPlayer = null;

         updateStylingMap(context, null, null);
         renderStyles(context, false, undefined, lViewData);

         expect(propPlayer).toBeFalsy();
         expect(styleMapPlayer).toBeFalsy();
       });

    it('should return the old player for styles when a follow-up player is instantiated', () => {
      const context = initContext([]);
      const handler = new CorePlayerHandler();
      const lViewData = createMockViewData(handler, context);

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
      renderStyles(context, false, undefined, lViewData);

      expect(previousPlayer).toEqual(null);
      expect(currentPlayer !.value).toEqual({width: '200px'});

      factory = bindPlayerFactory(buildFn, {height: '200px'});

      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lViewData);

      expect(previousPlayer !.value).toEqual({width: '200px'});
      expect(currentPlayer !.value).toEqual({width: null, height: '200px'});
    });

    it('should return the old player for classes when a follow-up player is instantiated', () => {
      const context = initContext([]);
      const handler = new CorePlayerHandler();
      const lViewData = createMockViewData(handler, context);

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
      renderStyles(context, false, undefined, lViewData);

      expect(currentPlayer).toBeTruthy();
      expect(previousPlayer).toBeFalsy();
      expect(currentPlayer !.value).toEqual({foo: true});

      previousPlayer = currentPlayer = null;

      factory = bindPlayerFactory(buildFn, {bar: true});
      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lViewData);

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

      const context = initContext([], [], sanitizer);
      const handler = new CorePlayerHandler();
      const lViewData = createMockViewData(handler, context);

      let values: {[key: string]: any}|null = null;
      const buildFn =
          (element: HTMLElement, type: BindingType, value: any, isFirstRender: boolean) => {
            values = value;
            return new MockPlayer();
          };

      let factory = bindPlayerFactory<{[key: string]: any}>(
          buildFn, {width: '200px', height: '100px', opacity: '1'});
      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lViewData);

      expect(values !).toEqual({width: '200px-safe!', height: '100px-safe!', opacity: '1'});

      factory = bindPlayerFactory(buildFn, {width: 'auto'});
      updateStylingMap(context, null, factory);
      renderStyles(context, false, undefined, lViewData);

      expect(values !).toEqual({width: 'auto-safe!', height: null, opacity: null});
    });

    it('should automatically destroy existing players when the follow-up binding is not apart of a factory',
       () => {
         const context = initContext(['width'], ['foo', 'bar']);
         const handler = new CorePlayerHandler();
         const lViewData = createMockViewData(handler, context);

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
         renderStyles(context, false, undefined, lViewData);
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

         renderStyles(context, false, undefined, lViewData);
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
         const elementContext = getContext(target) !;
         const context = elementContext.lViewData[elementContext.nodeIndex] as StylingContext;

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
  });
});

class MockStylingStore implements BindingStore {
  private _values: {[key: string]: any} = {};

  constructor(public element: HTMLElement, public type: BindingType) {}

  setValue(prop: string, value: any): void { this._values[prop] = value; }

  getValues() { return this._values; }
}
