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

import {renderToHtml} from './render_util';

describe('styling', () => {
  let element: LElementNode|null = null;
  beforeEach(() => { element = {} as any; });

  function initContext(
      styles?: (number | string)[] | null,
      classes?: (string | number | boolean)[] | null): StylingContext {
    return allocStylingContext(element, createStylingContextTemplate(styles, classes));
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
    updateStylingMap(context, null, classes);
  }

  function cleanStyle(a: number = 0, b: number = 0): number { return _clean(a, b, false); }

  function cleanClass(a: number, b: number) { return _clean(a, b, true); }

  function _clean(a: number = 0, b: number = 0, isClassBased: boolean): number {
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
    return num;
  }

  function _dirty(a: number = 0, b: number = 0, isClassBased: boolean): number {
    return _clean(a, b, isClassBased) | StylingFlags.Dirty;
  }

  function dirtyStyle(a: number = 0, b: number = 0): number {
    return _dirty(a, b, false) | StylingFlags.Dirty;
  }

  function dirtyClass(a: number, b: number) { return _dirty(a, b, true); }

  describe('styles', () => {
    describe('createStylingContextTemplate', () => {
      it('should initialize empty template', () => {
        const template = initContext();
        expect(template).toEqual([element, [null], cleanStyle(0, 5), 0, null]);
      });

      it('should initialize static styles', () => {
        const template =
            initContext([InitialStylingFlags.VALUES_MODE, 'color', 'red', 'width', '10px']);
        expect(template).toEqual([
          element,
          [null, 'red', '10px'],
          dirtyStyle(0, 11),  //
          0,
          null,

          // #5
          cleanStyle(1, 11),
          'color',
          null,

          // #8
          cleanStyle(2, 14),
          'width',
          null,

          // #11
          dirtyStyle(1, 5),
          'color',
          null,

          // #14
          dirtyStyle(2, 8),
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
               elementStyling([
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

           expect(renderToHtml(Template, {
             myStyles: {width: '200px', height: '200px'},
             myWidth: '300px'
           })).toEqual('<span style="width: 300px; height: 200px; opacity: 0.5;"></span>');

           expect(renderToHtml(Template, {myStyles: {width: '200px', height: null}, myWidth: null}))
               .toEqual('<span style="width: 200px; height: 100px; opacity: 0.5;"></span>');
         });
    });

    describe('helper functions', () => {
      it('should build a list of multiple styling values', () => {
        const getStyles = trackStylesFactory();
        const stylingContext = initContext();
        updateStylingMap(stylingContext, {
          width: '100px',
          height: '100px',
        });
        updateStylingMap(stylingContext, {height: '200px'});
        expect(getStyles(stylingContext)).toEqual({width: null, height: '200px'});
      });

      it('should evaluate the delta between style changes when rendering occurs', () => {
        const stylingContext =
            initContext(['width', 'height', InitialStylingFlags.VALUES_MODE, 'width', '100px']);
        updateStylingMap(stylingContext, {
          height: '200px',
        });
        expect(renderStyles(stylingContext)).toEqual({width: '100px', height: '200px'});
        expect(renderStyles(stylingContext)).toEqual({});
        updateStylingMap(stylingContext, {
          width: '100px',
          height: '100px',
        });
        expect(renderStyles(stylingContext)).toEqual({height: '100px'});
        updateStyleProp(stylingContext, 1, '100px');
        expect(renderStyles(stylingContext)).toEqual({});
        updateStylingMap(stylingContext, {
          width: '100px',
          height: '100px',
        });
        expect(renderStyles(stylingContext)).toEqual({});
      });

      it('should update individual values on a set of styles', () => {
        const getStyles = trackStylesFactory();
        const stylingContext = initContext(['width', 'height']);
        updateStylingMap(stylingContext, {
          width: '100px',
          height: '100px',
        });
        updateStyleProp(stylingContext, 1, '200px');
        expect(getStyles(stylingContext)).toEqual({width: '100px', height: '200px'});
      });

      it('should only mark itself as updated when one or more properties have been applied', () => {
        const stylingContext = initContext();
        expect(isContextDirty(stylingContext)).toBeFalsy();

        updateStylingMap(stylingContext, {
          width: '100px',
          height: '100px',
        });
        expect(isContextDirty(stylingContext)).toBeTruthy();

        setContextDirty(stylingContext, false);

        updateStylingMap(stylingContext, {
          width: '100px',
          height: '100px',
        });
        expect(isContextDirty(stylingContext)).toBeFalsy();

        updateStylingMap(stylingContext, {
          width: '200px',
          height: '100px',
        });
        expect(isContextDirty(stylingContext)).toBeTruthy();
      });

      it('should only mark itself as updated when any single properties have been applied', () => {
        const stylingContext = initContext(['height']);
        updateStylingMap(stylingContext, {
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

        updateStylingMap(stylingContext, {width: '200px', height: '200px'});

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

        updateStylingMap(stylingContext, {});

        expect(getStyles(stylingContext)).toEqual({
          width: '100px',
          height: '100px',
          opacity: '0',
        });
      });

      it('should cleanup removed styles from the context once the styles are built', () => {
        const stylingContext = initContext(['width', 'height']);
        const getStyles = trackStylesFactory();

        updateStylingMap(stylingContext, {width: '100px', height: '100px'});

        expect(stylingContext).toEqual([
          element,
          [null],
          dirtyStyle(0, 11),  //
          2,
          null,

          // #5
          cleanStyle(0, 11),
          'width',
          null,

          // #8
          cleanStyle(0, 14),
          'height',
          null,

          // #11
          dirtyStyle(0, 5),
          'width',
          '100px',

          // #14
          dirtyStyle(0, 8),
          'height',
          '100px',
        ]);

        getStyles(stylingContext);
        updateStylingMap(stylingContext, {width: '200px', opacity: '0'});

        expect(stylingContext).toEqual([
          element,
          [null],
          dirtyStyle(0, 11),  //
          2,
          null,

          // #5
          cleanStyle(0, 11),
          'width',
          null,

          // #8
          cleanStyle(0, 17),
          'height',
          null,

          // #11
          dirtyStyle(0, 5),
          'width',
          '200px',

          // #14
          dirtyStyle(),
          'opacity',
          '0',

          // #17
          dirtyStyle(0, 8),
          'height',
          null,
        ]);

        getStyles(stylingContext);
        expect(stylingContext).toEqual([
          element,
          [null],
          cleanStyle(0, 11),  //
          2,
          null,

          // #5
          cleanStyle(0, 11),
          'width',
          null,

          // #8
          cleanStyle(0, 17),
          'height',
          null,

          // #11
          cleanStyle(0, 5),
          'width',
          '200px',

          // #14
          cleanStyle(),
          'opacity',
          '0',

          // #17
          cleanStyle(0, 8),
          'height',
          null,
        ]);

        updateStylingMap(stylingContext, {width: null});
        updateStyleProp(stylingContext, 0, '300px');

        expect(stylingContext).toEqual([
          element,
          [null],
          dirtyStyle(0, 11),  //
          2,
          null,

          // #5
          dirtyStyle(0, 11),
          'width',
          '300px',

          // #8
          cleanStyle(0, 17),
          'height',
          null,

          // #11
          cleanStyle(0, 5),
          'width',
          null,

          // #14
          dirtyStyle(),
          'opacity',
          null,

          // #17
          cleanStyle(0, 8),
          'height',
          null,
        ]);

        getStyles(stylingContext);

        updateStyleProp(stylingContext, 0, null);
        expect(stylingContext).toEqual([
          element,
          [null],
          dirtyStyle(0, 11),  //
          2,
          null,

          // #5
          dirtyStyle(0, 11),
          'width',
          null,

          // #8
          cleanStyle(0, 17),
          'height',
          null,

          // #11
          cleanStyle(0, 5),
          'width',
          null,

          // #14
          cleanStyle(),
          'opacity',
          null,

          // #17
          cleanStyle(0, 8),
          'height',
          null,
        ]);
      });

      it('should find the next available space in the context when data is added after being removed before',
         () => {
           const stylingContext = initContext(['lineHeight']);
           const getStyles = trackStylesFactory();

           updateStylingMap(stylingContext, {width: '100px', height: '100px', opacity: '0.5'});

           expect(stylingContext).toEqual([
             element,
             [null],
             dirtyStyle(0, 8),  //
             1,
             null,

             // #5
             cleanStyle(0, 17),
             'lineHeight',
             null,

             // #8
             dirtyStyle(),
             'width',
             '100px',

             // #11
             dirtyStyle(),
             'height',
             '100px',

             // #14
             dirtyStyle(),
             'opacity',
             '0.5',

             // #17
             cleanStyle(0, 5),
             'lineHeight',
             null,
           ]);

           getStyles(stylingContext);

           updateStylingMap(stylingContext, {});
           expect(stylingContext).toEqual([
             element,
             [null],
             dirtyStyle(0, 8),  //
             1,
             null,

             // #5
             cleanStyle(0, 17),
             'lineHeight',
             null,

             // #8
             dirtyStyle(),
             'width',
             null,

             // #11
             dirtyStyle(),
             'height',
             null,

             // #14
             dirtyStyle(),
             'opacity',
             null,

             // #17
             cleanStyle(0, 5),
             'lineHeight',
             null,
           ]);

           getStyles(stylingContext);
           updateStylingMap(stylingContext, {
             borderWidth: '5px',
           });

           expect(stylingContext).toEqual([
             element,
             [null],
             dirtyStyle(0, 8),  //
             1,
             null,

             // #5
             cleanStyle(0, 20),
             'lineHeight',
             null,

             // #8
             dirtyStyle(),
             'borderWidth',
             '5px',

             // #11
             cleanStyle(),
             'width',
             null,

             // #14
             cleanStyle(),
             'height',
             null,

             // #17
             cleanStyle(),
             'opacity',
             null,

             // #20
             cleanStyle(0, 5),
             'lineHeight',
             null,
           ]);

           updateStyleProp(stylingContext, 0, '200px');

           expect(stylingContext).toEqual([
             element,
             [null],
             dirtyStyle(0, 8),  //
             1,
             null,

             // #5
             dirtyStyle(0, 20),
             'lineHeight',
             '200px',

             // #8
             dirtyStyle(),
             'borderWidth',
             '5px',

             // #11
             cleanStyle(),
             'width',
             null,

             // #14
             cleanStyle(),
             'height',
             null,

             // #17
             cleanStyle(),
             'opacity',
             null,

             // #20
             cleanStyle(0, 5),
             'lineHeight',
             null,
           ]);

           updateStylingMap(stylingContext, {borderWidth: '15px', borderColor: 'red'});

           expect(stylingContext).toEqual([
             element,
             [null],
             dirtyStyle(0, 8),  //
             1,
             null,

             // #5
             dirtyStyle(0, 23),
             'lineHeight',
             '200px',

             // #8
             dirtyStyle(),
             'borderWidth',
             '15px',

             // #11
             dirtyStyle(),
             'borderColor',
             'red',

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
             cleanStyle(0, 5),
             'lineHeight',
             null,
           ]);
         });

      it('should render all data as not being dirty after the styles are built', () => {
        const getStyles = trackStylesFactory();
        const stylingContext = initContext(['height']);

        updateStylingMap(stylingContext, {
          width: '100px',
        });

        updateStyleProp(stylingContext, 0, '200px');

        expect(stylingContext).toEqual([
          element,
          [null],
          dirtyStyle(0, 8),  //
          1,
          null,

          // #5
          dirtyStyle(0, 11),
          'height',
          '200px',

          // #5
          dirtyStyle(),
          'width',
          '100px',

          // #11
          cleanStyle(0, 5),
          'height',
          null,
        ]);

        getStyles(stylingContext);

        expect(stylingContext).toEqual([
          element,
          [null],
          cleanStyle(0, 8),  //
          1,
          null,

          // #5
          cleanStyle(0, 11),
          'height',
          '200px',

          // #5
          cleanStyle(),
          'width',
          '100px',

          // #11
          cleanStyle(0, 5),
          'height',
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
        element, [null, true, true], dirtyStyle(0, 11),  //
        0, null,

        // #5
        cleanClass(1, 11), 'one', null,

        // #8
        cleanClass(2, 14), 'two', null,

        // #11
        dirtyClass(1, 5), 'one', null,

        // #14
        dirtyClass(2, 8), 'two', null
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

         updateStylingMap(stylingContext, null, 'foo bar guy');
         expect(getClasses(stylingContext)).toEqual({'foo': true, 'bar': true, 'guy': true});

         updateStylingMap(stylingContext, null, 'foo man');
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
        [null, '100px', true],
        dirtyStyle(0, 17),  //
        2,
        null,

        // #5
        cleanStyle(1, 17),
        'width',
        null,

        // #8
        cleanStyle(0, 20),
        'height',
        null,

        // #11
        cleanClass(2, 23),
        'wide',
        null,

        // #14
        cleanClass(0, 26),
        'tall',
        null,

        // #17
        dirtyStyle(1, 5),
        'width',
        null,

        // #20
        cleanStyle(0, 8),
        'height',
        null,

        // #23
        dirtyClass(2, 11),
        'wide',
        null,

        // #26
        cleanClass(0, 14),
        'tall',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([{width: '100px'}, {wide: true}]);

      updateStylingMap(stylingContext, {width: '200px', opacity: '0.5'}, 'tall round');
      expect(stylingContext).toEqual([
        element,
        [null, '100px', true],
        dirtyStyle(0, 17),  //
        2,
        'tall round',

        // #5
        cleanStyle(1, 17),
        'width',
        null,

        // #8
        cleanStyle(0, 32),
        'height',
        null,

        // #11
        cleanClass(2, 29),
        'wide',
        null,

        // #14
        cleanClass(0, 23),
        'tall',
        null,

        // #17
        dirtyStyle(1, 5),
        'width',
        '200px',

        // #20
        dirtyStyle(0, 0),
        'opacity',
        '0.5',

        // #23
        dirtyClass(0, 14),
        'tall',
        true,

        // #26
        dirtyClass(0, 0),
        'round',
        true,

        // #29
        cleanClass(2, 11),
        'wide',
        null,

        // #32
        cleanStyle(0, 8),
        'height',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([
        {width: '200px', opacity: '0.5'}, {tall: true, round: true, wide: true}
      ]);

      updateStylingMap(stylingContext, {width: '500px'}, {tall: true, wide: true});
      updateStyleProp(stylingContext, 0, '300px');

      expect(stylingContext).toEqual([
        element,
        [null, '100px', true],
        dirtyStyle(0, 17),  //
        2,
        null,

        // #5
        dirtyStyle(1, 17),
        'width',
        '300px',

        // #8
        cleanStyle(0, 32),
        'height',
        null,

        // #11
        cleanClass(2, 23),
        'wide',
        null,

        // #14
        cleanClass(0, 20),
        'tall',
        null,

        // #17
        cleanStyle(1, 5),
        'width',
        '500px',

        // #20
        cleanClass(0, 14),
        'tall',
        true,

        // #23
        cleanClass(2, 11),
        'wide',
        true,

        // #26
        dirtyClass(0, 0),
        'round',
        null,

        // #29
        dirtyStyle(0, 0),
        'opacity',
        null,

        // #32
        cleanStyle(0, 8),
        'height',
        null,
      ]);

      expect(getStylesAndClasses(stylingContext)).toEqual([
        {width: '300px', opacity: null}, {tall: true, round: false, wide: true}
      ]);
    });
  });
});
