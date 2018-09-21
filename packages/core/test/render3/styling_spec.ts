/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {elementEnd, elementStart, elementStyleProp, elementStyling, elementStylingApply, elementStylingMap} from '../../src/render3/instructions';
import {InitialStylingFlags, RenderFlags} from '../../src/render3/interfaces/definition';
import {LElementNode} from '../../src/render3/interfaces/node';
import {Renderer3} from '../../src/render3/interfaces/renderer';
import {StylingContext, StylingFlags, StylingIndex, allocStylingContext, createStylingContextTemplate, isContextDirty, renderStyling as _renderStyling, setContextDirty, updateClassProp, updateStyleProp, updateStylingMap} from '../../src/render3/styling';
import {defaultStyleSanitizer} from '../../src/sanitization/sanitization';
import {StyleSanitizeFn} from '../../src/sanitization/style_sanitizer';

import {renderToHtml} from './render_util';

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
        expect(template).toEqual([element, null, null, [null], cleanStyle(0, 7), 0, null]);
      });

      it('should initialize static styles', () => {
        const template =
            initContext([InitialStylingFlags.VALUES_MODE, 'color', 'red', 'width', '10px']);
        expect(template).toEqual([
          element,
          null,
          null,
          [null, 'red', '10px'],
          dirtyStyle(0, 13),  //
          0,
          null,

          // #7
          cleanStyle(1, 13),
          'color',
          null,

          // #10
          cleanStyle(2, 16),
          'width',
          null,

          // #13
          dirtyStyle(1, 7),
          'color',
          null,

          // #16
          dirtyStyle(2, 10),
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
          dirtyStyle(0, 13),  //
          2,
          null,

          // #7
          cleanStyle(0, 13),
          'width',
          null,

          // #10
          cleanStyle(0, 16),
          'height',
          null,

          // #13
          dirtyStyle(0, 7),
          'width',
          '100px',

          // #16
          dirtyStyle(0, 10),
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
          dirtyStyle(0, 13),  //
          2,
          null,

          // #7
          cleanStyle(0, 13),
          'width',
          null,

          // #10
          cleanStyle(0, 19),
          'height',
          null,

          // #13
          dirtyStyle(0, 7),
          'width',
          '200px',

          // #16
          dirtyStyle(),
          'opacity',
          '0',

          // #19
          dirtyStyle(0, 10),
          'height',
          null,
        ]);

        getStyles(stylingContext);
        expect(stylingContext).toEqual([
          element,
          null,
          null,
          [null],
          cleanStyle(0, 13),  //
          2,
          null,

          // #7
          cleanStyle(0, 13),
          'width',
          null,

          // #10
          cleanStyle(0, 19),
          'height',
          null,

          // #13
          cleanStyle(0, 7),
          'width',
          '200px',

          // #16
          cleanStyle(),
          'opacity',
          '0',

          // #19
          cleanStyle(0, 10),
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
          dirtyStyle(0, 13),  //
          2,
          null,

          // #7
          dirtyStyle(0, 13),
          'width',
          '300px',

          // #10
          cleanStyle(0, 19),
          'height',
          null,

          // #13
          cleanStyle(0, 7),
          'width',
          null,

          // #16
          dirtyStyle(),
          'opacity',
          null,

          // #19
          cleanStyle(0, 10),
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
          dirtyStyle(0, 13),  //
          2,
          null,

          // #7
          dirtyStyle(0, 13),
          'width',
          null,

          // #10
          cleanStyle(0, 19),
          'height',
          null,

          // #13
          cleanStyle(0, 7),
          'width',
          null,

          // #16
          cleanStyle(),
          'opacity',
          null,

          // #19
          cleanStyle(0, 10),
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
             dirtyStyle(0, 10),  //
             1,
             null,

             // #7
             cleanStyle(0, 19),
             'lineHeight',
             null,

             // #10
             dirtyStyle(),
             'width',
             '100px',

             // #13
             dirtyStyle(),
             'height',
             '100px',

             // #16
             dirtyStyle(),
             'opacity',
             '0.5',

             // #19
             cleanStyle(0, 7),
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
             dirtyStyle(0, 10),  //
             1,
             null,

             // #7
             cleanStyle(0, 19),
             'lineHeight',
             null,

             // #10
             dirtyStyle(),
             'width',
             null,

             // #13
             dirtyStyle(),
             'height',
             null,

             // #16
             dirtyStyle(),
             'opacity',
             null,

             // #19
             cleanStyle(0, 7),
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
             dirtyStyle(0, 10),  //
             1,
             null,

             // #7
             cleanStyle(0, 22),
             'lineHeight',
             null,

             // #10
             dirtyStyle(),
             'borderWidth',
             '5px',

             // #13
             cleanStyle(),
             'width',
             null,

             // #16
             cleanStyle(),
             'height',
             null,

             // #19
             cleanStyle(),
             'opacity',
             null,

             // #22
             cleanStyle(0, 7),
             'lineHeight',
             null,
           ]);

           updateStyleProp(stylingContext, 0, '200px');

           expect(stylingContext).toEqual([
             element,
             null,
             null,
             [null],
             dirtyStyle(0, 10),  //
             1,
             null,

             // #7
             dirtyStyle(0, 22),
             'lineHeight',
             '200px',

             // #10
             dirtyStyle(),
             'borderWidth',
             '5px',

             // #13
             cleanStyle(),
             'width',
             null,

             // #16
             cleanStyle(),
             'height',
             null,

             // #19
             cleanStyle(),
             'opacity',
             null,

             // #22
             cleanStyle(0, 7),
             'lineHeight',
             null,
           ]);

           updateStyles(stylingContext, {borderWidth: '15px', borderColor: 'red'});

           expect(stylingContext).toEqual([
             element,
             null,
             null,
             [null],
             dirtyStyle(0, 10),  //
             1,
             null,

             // #7
             dirtyStyle(0, 25),
             'lineHeight',
             '200px',

             // #10
             dirtyStyle(),
             'borderWidth',
             '15px',

             // #13
             dirtyStyle(),
             'borderColor',
             'red',

             // #16
             cleanStyle(),
             'width',
             null,

             // #19
             cleanStyle(),
             'height',
             null,

             // #22
             cleanStyle(),
             'opacity',
             null,

             // #25
             cleanStyle(0, 7),
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
          dirtyStyle(0, 10),  //
          1,
          null,

          // #7
          dirtyStyle(0, 13),
          'height',
          '200px',

          // #7
          dirtyStyle(),
          'width',
          '100px',

          // #13
          cleanStyle(0, 7),
          'height',
          null,
        ]);

        getStyles(stylingContext);

        expect(stylingContext).toEqual([
          element,
          null,
          null,
          [null],
          cleanStyle(0, 10),  //
          1,
          null,

          // #7
          cleanStyle(0, 13),
          'height',
          '200px',

          // #7
          cleanStyle(),
          'width',
          '100px',

          // #13
          cleanStyle(0, 7),
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
             dirtyStyle(0, 13),  //
             2,
             null,

             // #7
             dirtyStyleWithSanitization(0, 13),
             'border-image',
             'url(foo.jpg)',

             // #10
             dirtyStyle(0, 16),
             'border-width',
             '100px',

             // #13
             cleanStyleWithSanitization(0, 7),
             'border-image',
             null,

             // #16
             cleanStyle(0, 10),
             'border-width',
             null,
           ]);

           updateStyles(stylingContext, {'background-image': 'unsafe'});

           expect(stylingContext).toEqual([
             element,
             null,
             styleSanitizer,
             [null],
             dirtyStyle(0, 13),  //
             2,
             null,

             // #7
             dirtyStyleWithSanitization(0, 16),
             'border-image',
             'url(foo.jpg)',

             // #10
             dirtyStyle(0, 19),
             'border-width',
             '100px',

             // #13
             dirtyStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',

             // #16
             cleanStyleWithSanitization(0, 7),
             'border-image',
             null,

             // #19
             cleanStyle(0, 10),
             'border-width',
             null,
           ]);

           getStyles(stylingContext);

           expect(stylingContext).toEqual([
             element,
             null,
             styleSanitizer,
             [null],
             cleanStyle(0, 13),  //
             2,
             null,

             // #7
             cleanStyleWithSanitization(0, 16),
             'border-image',
             'url(foo.jpg)',

             // #10
             cleanStyle(0, 19),
             'border-width',
             '100px',

             // #13
             cleanStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',

             // #16
             cleanStyleWithSanitization(0, 7),
             'border-image',
             null,

             // #19
             cleanStyle(0, 10),
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
        element, null, null, [null, true, true], dirtyStyle(0, 13),  //
        0, null,

        // #7
        cleanClass(1, 13), 'one', null,

        // #10
        cleanClass(2, 16), 'two', null,

        // #13
        dirtyClass(1, 7), 'one', null,

        // #16
        dirtyClass(2, 10), 'two', null
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
        dirtyStyle(0, 19),  //
        2,
        null,

        // #7
        cleanStyle(1, 19),
        'width',
        null,

        // #10
        cleanStyle(0, 22),
        'height',
        null,

        // #13
        cleanClass(2, 25),
        'wide',
        null,

        // #16
        cleanClass(0, 28),
        'tall',
        null,

        // #19
        dirtyStyle(1, 7),
        'width',
        null,

        // #22
        cleanStyle(0, 10),
        'height',
        null,

        // #25
        dirtyClass(2, 13),
        'wide',
        null,

        // #28
        cleanClass(0, 16),
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
        dirtyStyle(0, 19),  //
        2,
        'tall round',

        // #7
        cleanStyle(1, 19),
        'width',
        null,

        // #10
        cleanStyle(0, 34),
        'height',
        null,

        // #13
        cleanClass(2, 31),
        'wide',
        null,

        // #16
        cleanClass(0, 25),
        'tall',
        null,

        // #19
        dirtyStyle(1, 7),
        'width',
        '200px',

        // #22
        dirtyStyle(0, 0),
        'opacity',
        '0.5',

        // #25
        dirtyClass(0, 16),
        'tall',
        true,

        // #28
        dirtyClass(0, 0),
        'round',
        true,

        // #31
        cleanClass(2, 13),
        'wide',
        null,

        // #34
        cleanStyle(0, 10),
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
        dirtyStyle(0, 19),  //
        2,
        null,

        // #7
        dirtyStyle(1, 19),
        'width',
        '300px',

        // #10
        cleanStyle(0, 34),
        'height',
        null,

        // #13
        cleanClass(2, 25),
        'wide',
        null,

        // #16
        cleanClass(0, 22),
        'tall',
        null,

        // #19
        cleanStyle(1, 7),
        'width',
        '500px',

        // #22
        cleanClass(0, 16),
        'tall',
        true,

        // #25
        cleanClass(2, 13),
        'wide',
        true,

        // #28
        dirtyClass(0, 0),
        'round',
        null,

        // #31
        dirtyStyle(0, 0),
        'opacity',
        null,

        // #34
        cleanStyle(0, 10),
        'height',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([
        {width: '300px', opacity: null}, {tall: true, round: false, wide: true}
      ]);
    });
  });
});
