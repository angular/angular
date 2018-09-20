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
        expect(template).toEqual([element, null, [null], cleanStyle(0, 6), 0, null]);
      });

      it('should initialize static styles', () => {
        const template =
            initContext([InitialStylingFlags.VALUES_MODE, 'color', 'red', 'width', '10px']);
        expect(template).toEqual([
          element,
          null,
          [null, 'red', '10px'],
          dirtyStyle(0, 12),  //
          0,
          null,

          // #6
          cleanStyle(1, 12),
          'color',
          null,

          // #9
          cleanStyle(2, 15),
          'width',
          null,

          // #12
          dirtyStyle(1, 6),
          'color',
          null,

          // #15
          dirtyStyle(2, 9),
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
          [null],
          dirtyStyle(0, 12),  //
          2,
          null,

          // #6
          cleanStyle(0, 12),
          'width',
          null,

          // #9
          cleanStyle(0, 15),
          'height',
          null,

          // #12
          dirtyStyle(0, 6),
          'width',
          '100px',

          // #15
          dirtyStyle(0, 9),
          'height',
          '100px',
        ]);

        getStyles(stylingContext);
        updateStyles(stylingContext, {width: '200px', opacity: '0'});

        expect(stylingContext).toEqual([
          element,
          null,
          [null],
          dirtyStyle(0, 12),  //
          2,
          null,

          // #6
          cleanStyle(0, 12),
          'width',
          null,

          // #9
          cleanStyle(0, 18),
          'height',
          null,

          // #12
          dirtyStyle(0, 6),
          'width',
          '200px',

          // #15
          dirtyStyle(),
          'opacity',
          '0',

          // #18
          dirtyStyle(0, 9),
          'height',
          null,
        ]);

        getStyles(stylingContext);
        expect(stylingContext).toEqual([
          element,
          null,
          [null],
          cleanStyle(0, 12),  //
          2,
          null,

          // #6
          cleanStyle(0, 12),
          'width',
          null,

          // #9
          cleanStyle(0, 18),
          'height',
          null,

          // #12
          cleanStyle(0, 6),
          'width',
          '200px',

          // #15
          cleanStyle(),
          'opacity',
          '0',

          // #18
          cleanStyle(0, 9),
          'height',
          null,
        ]);

        updateStyles(stylingContext, {width: null});
        updateStyleProp(stylingContext, 0, '300px');

        expect(stylingContext).toEqual([
          element,
          null,
          [null],
          dirtyStyle(0, 12),  //
          2,
          null,

          // #6
          dirtyStyle(0, 12),
          'width',
          '300px',

          // #9
          cleanStyle(0, 18),
          'height',
          null,

          // #12
          cleanStyle(0, 6),
          'width',
          null,

          // #15
          dirtyStyle(),
          'opacity',
          null,

          // #18
          cleanStyle(0, 9),
          'height',
          null,
        ]);

        getStyles(stylingContext);

        updateStyleProp(stylingContext, 0, null);
        expect(stylingContext).toEqual([
          element,
          null,
          [null],
          dirtyStyle(0, 12),  //
          2,
          null,

          // #6
          dirtyStyle(0, 12),
          'width',
          null,

          // #9
          cleanStyle(0, 18),
          'height',
          null,

          // #12
          cleanStyle(0, 6),
          'width',
          null,

          // #15
          cleanStyle(),
          'opacity',
          null,

          // #18
          cleanStyle(0, 9),
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
             [null],
             dirtyStyle(0, 9),  //
             1,
             null,

             // #6
             cleanStyle(0, 18),
             'lineHeight',
             null,

             // #9
             dirtyStyle(),
             'width',
             '100px',

             // #12
             dirtyStyle(),
             'height',
             '100px',

             // #15
             dirtyStyle(),
             'opacity',
             '0.5',

             // #18
             cleanStyle(0, 6),
             'lineHeight',
             null,
           ]);

           getStyles(stylingContext);

           updateStyles(stylingContext, {});
           expect(stylingContext).toEqual([
             element,
             null,
             [null],
             dirtyStyle(0, 9),  //
             1,
             null,

             // #6
             cleanStyle(0, 18),
             'lineHeight',
             null,

             // #9
             dirtyStyle(),
             'width',
             null,

             // #12
             dirtyStyle(),
             'height',
             null,

             // #15
             dirtyStyle(),
             'opacity',
             null,

             // #18
             cleanStyle(0, 6),
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
             [null],
             dirtyStyle(0, 9),  //
             1,
             null,

             // #6
             cleanStyle(0, 21),
             'lineHeight',
             null,

             // #9
             dirtyStyle(),
             'borderWidth',
             '5px',

             // #12
             cleanStyle(),
             'width',
             null,

             // #15
             cleanStyle(),
             'height',
             null,

             // #18
             cleanStyle(),
             'opacity',
             null,

             // #21
             cleanStyle(0, 6),
             'lineHeight',
             null,
           ]);

           updateStyleProp(stylingContext, 0, '200px');

           expect(stylingContext).toEqual([
             element,
             null,
             [null],
             dirtyStyle(0, 9),  //
             1,
             null,

             // #6
             dirtyStyle(0, 21),
             'lineHeight',
             '200px',

             // #9
             dirtyStyle(),
             'borderWidth',
             '5px',

             // #12
             cleanStyle(),
             'width',
             null,

             // #15
             cleanStyle(),
             'height',
             null,

             // #18
             cleanStyle(),
             'opacity',
             null,

             // #21
             cleanStyle(0, 6),
             'lineHeight',
             null,
           ]);

           updateStyles(stylingContext, {borderWidth: '15px', borderColor: 'red'});

           expect(stylingContext).toEqual([
             element,
             null,
             [null],
             dirtyStyle(0, 9),  //
             1,
             null,

             // #6
             dirtyStyle(0, 24),
             'lineHeight',
             '200px',

             // #9
             dirtyStyle(),
             'borderWidth',
             '15px',

             // #12
             dirtyStyle(),
             'borderColor',
             'red',

             // #15
             cleanStyle(),
             'width',
             null,

             // #18
             cleanStyle(),
             'height',
             null,

             // #21
             cleanStyle(),
             'opacity',
             null,

             // #24
             cleanStyle(0, 6),
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
          [null],
          dirtyStyle(0, 9),  //
          1,
          null,

          // #6
          dirtyStyle(0, 12),
          'height',
          '200px',

          // #6
          dirtyStyle(),
          'width',
          '100px',

          // #12
          cleanStyle(0, 6),
          'height',
          null,
        ]);

        getStyles(stylingContext);

        expect(stylingContext).toEqual([
          element,
          null,
          [null],
          cleanStyle(0, 9),  //
          1,
          null,

          // #6
          cleanStyle(0, 12),
          'height',
          '200px',

          // #6
          cleanStyle(),
          'width',
          '100px',

          // #12
          cleanStyle(0, 6),
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
             styleSanitizer,
             [null],
             dirtyStyle(0, 12),  //
             2,
             null,

             // #6
             dirtyStyleWithSanitization(0, 12),
             'border-image',
             'url(foo.jpg)',

             // #9
             dirtyStyle(0, 15),
             'border-width',
             '100px',

             // #12
             cleanStyleWithSanitization(0, 6),
             'border-image',
             null,

             // #15
             cleanStyle(0, 9),
             'border-width',
             null,
           ]);

           updateStyles(stylingContext, {'background-image': 'unsafe'});

           expect(stylingContext).toEqual([
             element,
             styleSanitizer,
             [null],
             dirtyStyle(0, 12),  //
             2,
             null,

             // #6
             dirtyStyleWithSanitization(0, 15),
             'border-image',
             'url(foo.jpg)',

             // #9
             dirtyStyle(0, 18),
             'border-width',
             '100px',

             // #12
             dirtyStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',

             // #15
             cleanStyleWithSanitization(0, 6),
             'border-image',
             null,

             // #18
             cleanStyle(0, 9),
             'border-width',
             null,
           ]);

           getStyles(stylingContext);

           expect(stylingContext).toEqual([
             element,
             styleSanitizer,
             [null],
             cleanStyle(0, 12),  //
             2,
             null,

             // #6
             cleanStyleWithSanitization(0, 15),
             'border-image',
             'url(foo.jpg)',

             // #9
             cleanStyle(0, 18),
             'border-width',
             '100px',

             // #12
             cleanStyleWithSanitization(0, 0),
             'background-image',
             'unsafe',

             // #15
             cleanStyleWithSanitization(0, 6),
             'border-image',
             null,

             // #18
             cleanStyle(0, 9),
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
        element, null, [null, true, true], dirtyStyle(0, 12),  //
        0, null,

        // #6
        cleanClass(1, 12), 'one', null,

        // #9
        cleanClass(2, 15), 'two', null,

        // #12
        dirtyClass(1, 6), 'one', null,

        // #15
        dirtyClass(2, 9), 'two', null
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
        [null, '100px', true],
        dirtyStyle(0, 18),  //
        2,
        null,

        // #6
        cleanStyle(1, 18),
        'width',
        null,

        // #9
        cleanStyle(0, 21),
        'height',
        null,

        // #12
        cleanClass(2, 24),
        'wide',
        null,

        // #15
        cleanClass(0, 27),
        'tall',
        null,

        // #18
        dirtyStyle(1, 6),
        'width',
        null,

        // #21
        cleanStyle(0, 9),
        'height',
        null,

        // #24
        dirtyClass(2, 12),
        'wide',
        null,

        // #27
        cleanClass(0, 15),
        'tall',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([{width: '100px'}, {wide: true}]);

      updateStylingMap(stylingContext, 'tall round', {width: '200px', opacity: '0.5'});
      expect(stylingContext).toEqual([
        element,
        null,
        [null, '100px', true],
        dirtyStyle(0, 18),  //
        2,
        'tall round',

        // #6
        cleanStyle(1, 18),
        'width',
        null,

        // #9
        cleanStyle(0, 33),
        'height',
        null,

        // #12
        cleanClass(2, 30),
        'wide',
        null,

        // #15
        cleanClass(0, 24),
        'tall',
        null,

        // #18
        dirtyStyle(1, 6),
        'width',
        '200px',

        // #21
        dirtyStyle(0, 0),
        'opacity',
        '0.5',

        // #24
        dirtyClass(0, 15),
        'tall',
        true,

        // #27
        dirtyClass(0, 0),
        'round',
        true,

        // #30
        cleanClass(2, 12),
        'wide',
        null,

        // #33
        cleanStyle(0, 9),
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
        [null, '100px', true],
        dirtyStyle(0, 18),  //
        2,
        null,

        // #6
        dirtyStyle(1, 18),
        'width',
        '300px',

        // #9
        cleanStyle(0, 33),
        'height',
        null,

        // #12
        cleanClass(2, 24),
        'wide',
        null,

        // #15
        cleanClass(0, 21),
        'tall',
        null,

        // #18
        cleanStyle(1, 6),
        'width',
        '500px',

        // #21
        cleanClass(0, 15),
        'tall',
        true,

        // #24
        cleanClass(2, 12),
        'wide',
        true,

        // #27
        dirtyClass(0, 0),
        'round',
        null,

        // #30
        dirtyStyle(0, 0),
        'opacity',
        null,

        // #33
        cleanStyle(0, 9),
        'height',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([
        {width: '300px', opacity: null}, {tall: true, round: false, wide: true}
      ]);
    });
  });
});
