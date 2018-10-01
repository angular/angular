/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {elementEnd, elementStart, elementStyleProp, elementStyling, elementStylingApply, elementStylingMap} from '../../../src/render3/instructions';
import {InitialStylingFlags, RenderFlags} from '../../../src/render3/interfaces/definition';
import {LElementNode} from '../../../src/render3/interfaces/node';
import {Renderer3} from '../../../src/render3/interfaces/renderer';
import {StylingContext, StylingFlags, StylingIndex} from '../../../src/render3/interfaces/styling';
import {allocStylingContext, createStylingContextTemplate, isContextDirty, renderStyling as _renderStyling, setContextDirty, updateClassProp, updateStyleProp, updateStylingMap} from '../../../src/render3/styling/class_and_style_bindings';
import {defaultStyleSanitizer} from '../../../src/sanitization/sanitization';
import {StyleSanitizeFn} from '../../../src/sanitization/style_sanitizer';

import {renderToHtml} from '../render_util';

describe('styling', () => {
  let element: LElementNode|null = null;
  beforeEach(() => { element = {} as any; });

  function initContext(
      styles?: (number | string)[] | null, classes?: (string | number | boolean)[] | null,
      sanitizer?: StyleSanitizeFn | null): StylingContext {
    return allocStylingContext(element, createStylingContextTemplate(classes, styles, sanitizer));
  }

  function renderStyles(context: StylingContext, renderer?: Renderer3) {
    const styles: {[key: string]: any} = {};
    _renderStyling(context, (renderer || {}) as Renderer3, styles);
    return styles;
  }

  function trackStylesFactory() {
    const styles: {[key: string]: any} = {};
    return function(context: StylingContext, renderer?: Renderer3): {[key: string]: any} {
      _renderStyling(context, (renderer || {}) as Renderer3, styles);
      return styles;
    };
  }

  function trackClassesFactory() {
    const classes: {[className: string]: boolean} = {};
    return function(context: StylingContext, renderer?: Renderer3): {[key: string]: any} {
      _renderStyling(context, (renderer || {}) as Renderer3, {}, classes);
      return classes;
    };
  }

  function trackStylesAndClasses() {
    const classes: {[className: string]: boolean} = {};
    const styles: {[prop: string]: any} = {};
    return function(context: StylingContext, renderer?: Renderer3): {[key: string]: any} {
      _renderStyling(context, (renderer || {}) as Renderer3, styles, classes);
      return [styles, classes];
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

  describe('styles', () => {
    describe('createStylingContextTemplate', () => {
      it('should initialize empty template', () => {
        const template = initContext();
        expect(template).toEqual([element, null, null, [null], cleanStyle(0, 8), 0, null, null]);
      });

      it('should initialize static styles', () => {
        const template =
            initContext([InitialStylingFlags.VALUES_MODE, 'color', 'red', 'width', '10px']);
        expect(template).toEqual([
          element,
          null,
          null,
          [null, 'red', '10px'],
          dirtyStyle(0, 14),  //
          0,
          null,
          null,

          // #8
          cleanStyle(1, 14),
          'color',
          null,

          // #11
          cleanStyle(2, 17),
          'width',
          null,

          // #14
          dirtyStyle(1, 8),
          'color',
          null,

          // #17
          dirtyStyle(2, 11),
          'width',
          null,
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
        expect(getStyles(stylingContext)).toEqual({width: null, height: '200px'});
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
          element,
          null,
          null,
          [null],
          dirtyStyle(0, 14),  //
          2,
          null,
          {width: '100px', height: '100px'},

          // #8
          cleanStyle(0, 14),
          'width',
          null,

          // #11
          cleanStyle(0, 17),
          'height',
          null,

          // #14
          dirtyStyle(0, 8),
          'width',
          '100px',

          // #17
          dirtyStyle(0, 11),
          'height',
          '100px',
        ]);

        getStyles(stylingContext);
        updateStyles(stylingContext, {width: '200px', opacity: '0'});

        expect(stylingContext).toEqual([
          element,
          null,
          null,
          [null],
          dirtyStyle(0, 14),  //
          2,
          null,
          {width: '200px', opacity: '0'},

          // #8
          cleanStyle(0, 14),
          'width',
          null,

          // #11
          cleanStyle(0, 20),
          'height',
          null,

          // #14
          dirtyStyle(0, 8),
          'width',
          '200px',

          // #17
          dirtyStyle(),
          'opacity',
          '0',

          // #20
          dirtyStyle(0, 11),
          'height',
          null,
        ]);

        getStyles(stylingContext);
        expect(stylingContext).toEqual([
          element,
          null,
          null,
          [null],
          cleanStyle(0, 14),  //
          2,
          null,
          {width: '200px', opacity: '0'},

          // #8
          cleanStyle(0, 14),
          'width',
          null,

          // #11
          cleanStyle(0, 20),
          'height',
          null,

          // #14
          cleanStyle(0, 8),
          'width',
          '200px',

          // #17
          cleanStyle(),
          'opacity',
          '0',

          // #20
          cleanStyle(0, 11),
          'height',
          null,
        ]);

        updateStyles(stylingContext, {width: null});
        updateStyleProp(stylingContext, 0, '300px');

        expect(stylingContext).toEqual([
          element,
          null,
          null,
          [null],
          dirtyStyle(0, 14),  //
          2,
          null,
          {width: null},

          // #8
          dirtyStyle(0, 14),
          'width',
          '300px',

          // #11
          cleanStyle(0, 20),
          'height',
          null,

          // #14
          cleanStyle(0, 8),
          'width',
          null,

          // #17
          dirtyStyle(),
          'opacity',
          null,

          // #20
          cleanStyle(0, 11),
          'height',
          null,
        ]);

        getStyles(stylingContext);

        updateStyleProp(stylingContext, 0, null);
        expect(stylingContext).toEqual([
          element,
          null,
          null,
          [null],
          dirtyStyle(0, 14),  //
          2,
          null,
          {width: null},

          // #8
          dirtyStyle(0, 14),
          'width',
          null,

          // #11
          cleanStyle(0, 20),
          'height',
          null,

          // #14
          cleanStyle(0, 8),
          'width',
          null,

          // #17
          cleanStyle(),
          'opacity',
          null,

          // #20
          cleanStyle(0, 11),
          'height',
          null,
        ]);
      });

      it('should find the next available space in the context when data is added after being removed before',
         () => {
           const stylingContext = initContext(['lineHeight']);
           const getStyles = trackStylesFactory();

           updateStyles(stylingContext, {width: '100px', height: '100px', opacity: '0.5'});

           expect(stylingContext).toEqual([
             element,
             null,
             null,
             [null],
             dirtyStyle(0, 11),  //
             1,
             null,
             {width: '100px', height: '100px', opacity: '0.5'},

             // #8
             cleanStyle(0, 20),
             'lineHeight',
             null,

             // #11
             dirtyStyle(),
             'width',
             '100px',

             // #14
             dirtyStyle(),
             'height',
             '100px',

             // #17
             dirtyStyle(),
             'opacity',
             '0.5',

             // #20
             cleanStyle(0, 8),
             'lineHeight',
             null,
           ]);

           getStyles(stylingContext);

           updateStyles(stylingContext, {});
           expect(stylingContext).toEqual([
             element,
             null,
             null,
             [null],
             dirtyStyle(0, 11),  //
             1,
             null,
             {},

             // #8
             cleanStyle(0, 20),
             'lineHeight',
             null,

             // #11
             dirtyStyle(),
             'width',
             null,

             // #14
             dirtyStyle(),
             'height',
             null,

             // #17
             dirtyStyle(),
             'opacity',
             null,

             // #20
             cleanStyle(0, 8),
             'lineHeight',
             null,
           ]);

           getStyles(stylingContext);
           updateStyles(stylingContext, {
             borderWidth: '5px',
           });

           expect(stylingContext).toEqual([
             element,
             null,
             null,
             [null],
             dirtyStyle(0, 11),  //
             1,
             null,
             {borderWidth: '5px'},

             // #8
             cleanStyle(0, 23),
             'lineHeight',
             null,

             // #11
             dirtyStyle(),
             'borderWidth',
             '5px',

             // #14
             cleanStyle(),
             'width',
             null,

             // #17
             cleanStyle(),
             'height',
             null,

             // #20
             cleanStyle(),
             'opacity',
             null,

             // #23
             cleanStyle(0, 8),
             'lineHeight',
             null,
           ]);

           updateStyleProp(stylingContext, 0, '200px');

           expect(stylingContext).toEqual([
             element,
             null,
             null,
             [null],
             dirtyStyle(0, 11),  //
             1,
             null,
             {borderWidth: '5px'},

             // #8
             dirtyStyle(0, 23),
             'lineHeight',
             '200px',

             // #11
             dirtyStyle(),
             'borderWidth',
             '5px',

             // #14
             cleanStyle(),
             'width',
             null,

             // #17
             cleanStyle(),
             'height',
             null,

             // #20
             cleanStyle(),
             'opacity',
             null,

             // #23
             cleanStyle(0, 8),
             'lineHeight',
             null,
           ]);

           updateStyles(stylingContext, {borderWidth: '15px', borderColor: 'red'});

           expect(stylingContext).toEqual([
             element,
             null,
             null,
             [null],
             dirtyStyle(0, 11),  //
             1,
             null,
             {borderWidth: '15px', borderColor: 'red'},

             // #8
             dirtyStyle(0, 26),
             'lineHeight',
             '200px',

             // #11
             dirtyStyle(),
             'borderWidth',
             '15px',

             // #14
             dirtyStyle(),
             'borderColor',
             'red',

             // #17
             cleanStyle(),
             'width',
             null,

             // #20
             cleanStyle(),
             'height',
             null,

             // #23
             cleanStyle(),
             'opacity',
             null,

             // #26
             cleanStyle(0, 8),
             'lineHeight',
             null,
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
          element,
          null,
          null,
          [null],
          dirtyStyle(0, 11),  //
          1,
          null,
          {width: '100px'},

          // #8
          dirtyStyle(0, 14),
          'height',
          '200px',

          // #8
          dirtyStyle(),
          'width',
          '100px',

          // #14
          cleanStyle(0, 8),
          'height',
          null,
        ]);

        getStyles(stylingContext);

        expect(stylingContext).toEqual([
          element,
          null,
          null,
          [null],
          cleanStyle(0, 11),  //
          1,
          null,
          {width: '100px'},

          // #8
          cleanStyle(0, 14),
          'height',
          '200px',

          // #8
          cleanStyle(),
          'width',
          '100px',

          // #14
          cleanStyle(0, 8),
          'height',
          null,
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
             element,
             null,
             styleSanitizer,
             [null],
             dirtyStyle(0, 14),  //
             2,
             null,
             null,

             // #8
             dirtyStyleWithSanitization(0, 14),
             'border-image',
             'url(foo.jpg)',

             // #11
             dirtyStyle(0, 17),
             'border-width',
             '100px',

             // #14
             cleanStyleWithSanitization(0, 8),
             'border-image',
             null,

             // #17
             cleanStyle(0, 11),
             'border-width',
             null,
           ]);

           updateStyles(stylingContext, {'background-image': 'unsafe'});

           expect(stylingContext).toEqual([
             element,
             null,
             styleSanitizer,
             [null],
             dirtyStyle(0, 14),  //
             2,
             null,
             {'background-image': 'unsafe'},

             // #8
             dirtyStyleWithSanitization(0, 17),
             'border-image',
             'url(foo.jpg)',

             // #11
             dirtyStyle(0, 20),
             'border-width',
             '100px',

             // #14
             dirtyStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',

             // #17
             cleanStyleWithSanitization(0, 8),
             'border-image',
             null,

             // #20
             cleanStyle(0, 11),
             'border-width',
             null,
           ]);

           getStyles(stylingContext);

           expect(stylingContext).toEqual([
             element,
             null,
             styleSanitizer,
             [null],
             cleanStyle(0, 14),  //
             2,
             null,
             {'background-image': 'unsafe'},

             // #8
             cleanStyleWithSanitization(0, 17),
             'border-image',
             'url(foo.jpg)',

             // #11
             cleanStyle(0, 20),
             'border-width',
             '100px',

             // #14
             cleanStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',

             // #17
             cleanStyleWithSanitization(0, 8),
             'border-image',
             null,

             // #20
             cleanStyle(0, 11),
             'border-width',
             null,
           ]);
         });
    });
  });

  describe('classes', () => {
    it('should initialize with the provided classes', () => {
      const template =
          initContext(null, [InitialStylingFlags.VALUES_MODE, 'one', true, 'two', true]);
      expect(template).toEqual([
        element, null, null, [null, true, true], dirtyStyle(0, 14),  //
        0, null, null,

        // #8
        cleanClass(1, 14), 'one', null,

        // #11
        cleanClass(2, 17), 'two', null,

        // #14
        dirtyClass(1, 8), 'one', null,

        // #17
        dirtyClass(2, 11), 'two', null
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
        element,
        null,
        null,
        [null, '100px', true],
        dirtyStyle(0, 20),  //
        2,
        null,
        null,

        // #8
        cleanStyle(1, 20),
        'width',
        null,

        // #11
        cleanStyle(0, 23),
        'height',
        null,

        // #14
        cleanClass(2, 26),
        'wide',
        null,

        // #17
        cleanClass(0, 29),
        'tall',
        null,

        // #20
        dirtyStyle(1, 8),
        'width',
        null,

        // #23
        cleanStyle(0, 11),
        'height',
        null,

        // #26
        dirtyClass(2, 14),
        'wide',
        null,

        // #29
        cleanClass(0, 17),
        'tall',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([{width: '100px'}, {wide: true}]);

      updateStylingMap(stylingContext, 'tall round', {width: '200px', opacity: '0.5'});
      expect(stylingContext).toEqual([
        element,
        null,
        null,
        [null, '100px', true],
        dirtyStyle(0, 20),  //
        2,
        'tall round',
        {width: '200px', opacity: '0.5'},

        // #8
        cleanStyle(1, 20),
        'width',
        null,

        // #11
        cleanStyle(0, 35),
        'height',
        null,

        // #14
        cleanClass(2, 32),
        'wide',
        null,

        // #17
        cleanClass(0, 26),
        'tall',
        null,

        // #20
        dirtyStyle(1, 8),
        'width',
        '200px',

        // #23
        dirtyStyle(0, 0),
        'opacity',
        '0.5',

        // #26
        dirtyClass(0, 17),
        'tall',
        true,

        // #29
        dirtyClass(0, 0),
        'round',
        true,

        // #32
        cleanClass(2, 14),
        'wide',
        null,

        // #35
        cleanStyle(0, 11),
        'height',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([
        {width: '200px', opacity: '0.5'}, {tall: true, round: true, wide: true}
      ]);

      updateStylingMap(stylingContext, {tall: true, wide: true}, {width: '500px'});
      updateStyleProp(stylingContext, 0, '300px');

      expect(stylingContext).toEqual([
        element,
        null,
        null,
        [null, '100px', true],
        dirtyStyle(0, 20),  //
        2,
        {tall: true, wide: true},
        {width: '500px'},

        // #8
        dirtyStyle(1, 20),
        'width',
        '300px',

        // #11
        cleanStyle(0, 35),
        'height',
        null,

        // #14
        cleanClass(2, 26),
        'wide',
        null,

        // #17
        cleanClass(0, 23),
        'tall',
        null,

        // #20
        cleanStyle(1, 8),
        'width',
        '500px',

        // #23
        cleanClass(0, 17),
        'tall',
        true,

        // #26
        cleanClass(2, 14),
        'wide',
        true,

        // #29
        dirtyClass(0, 0),
        'round',
        null,

        // #32
        dirtyStyle(0, 0),
        'opacity',
        null,

        // #35
        cleanStyle(0, 11),
        'height',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([
        {width: '300px', opacity: null}, {tall: true, round: false, wide: true}
      ]);
    });
  });

  it('should skip updating multi classes and styles if the input identity has not changed', () => {
    const stylingContext = initContext();
    const getStylesAndClasses = trackStylesAndClasses();

    const stylesMap = {width: '200px'};
    const classesMap = {foo: true};
    updateStylingMap(stylingContext, classesMap, stylesMap);

    // apply the styles
    getStylesAndClasses(stylingContext);

    expect(stylingContext).toEqual([
      element,
      null,
      null,
      [null],
      cleanStyle(0, 8),  //
      0,
      {foo: true},
      {width: '200px'},

      // #8
      cleanStyle(0, 0),
      'width',
      '200px',

      // #11
      cleanClass(0, 0),
      'foo',
      true,
    ]);

    stylesMap.width = '300px';
    classesMap.foo = false;

    updateStylingMap(stylingContext, classesMap, stylesMap);

    // apply the styles
    getStylesAndClasses(stylingContext);

    expect(stylingContext).toEqual([
      element,
      null,
      null,
      [null],
      cleanStyle(0, 8),  //
      0,
      {foo: false},
      {width: '300px'},

      // #8
      cleanStyle(0, 0),
      'width',
      '200px',

      // #11
      cleanClass(0, 0),
      'foo',
      true,
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
      element,
      null,
      null,
      [null],
      cleanStyle(0, 8),  //
      0,
      'apple orange banana',
      null,

      // #8
      cleanClass(0, 0),
      'apple',
      true,

      // #11
      cleanClass(0, 0),
      'orange',
      true,

      // #14
      cleanClass(0, 0),
      'banana',
      true,
    ]);

    stylingContext[13] = false;  // no orange
    stylingContext[16] = false;  // no banana
    updateStylingMap(stylingContext, classes);

    // apply the styles
    expect(getClasses(stylingContext)).toEqual({apple: true, orange: true, banana: true});
  });
});
