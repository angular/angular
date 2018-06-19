/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {elementEnd, elementStart, elementStyle, elementStyleProp, elementStyling, elementStylingApply} from '../../src/render3/instructions';
import {InitialStylingFlags, RenderFlags} from '../../src/render3/interfaces/definition';
import {LElementNode} from '../../src/render3/interfaces/node';
import {Renderer3} from '../../src/render3/interfaces/renderer';
import {StylingContext, StylingFlags, StylingIndex, allocStylingContext, createStylingContextTemplate, isContextDirty, renderStyles as _renderStyles, setContextDirty, updateStyleMap, updateStyleProp} from '../../src/render3/styling';

import {renderToHtml} from './render_util';

describe('styling', () => {
  let lElement: LElementNode|null = null;
  beforeEach(() => { lElement = { native: {} } as any; });

  function initContext(styles?: (number | string)[]): StylingContext {
    return allocStylingContext(createStylingContextTemplate(styles));
  }

  function renderStyles(context: StylingContext, renderer?: Renderer3) {
    const styles: {[key: string]: any} = {};
    _renderStyles(lElement !, context, (renderer || {}) as Renderer3, styles);
    return styles;
  }

  function trackStylesFactory() {
    const styles: {[key: string]: any} = {};
    return function(context: StylingContext, renderer?: Renderer3): {[key: string]: any} {
      _renderStyles(lElement !, context, (renderer || {}) as Renderer3, styles);
      return styles;
    };
  }

  function clean(a: number = 0, b: number = 0): number {
    let num = 0;
    if (a) {
      num |= a << StylingFlags.BitCountSize;
    }
    if (b) {
      num |= b << (StylingFlags.BitCountSize + StylingIndex.BitCountSize);
    }
    return num;
  }

  function dirty(a: number = 0, b: number = 0): number { return clean(a, b) | StylingFlags.Dirty; }

  describe('createStylingContextTemplate', () => {
    it('should initialize empty template', () => {
      const template = createStylingContextTemplate();
      expect(template).toEqual([
        [null],
        clean(0, 2),
      ]);
    });

    it('should initialize static styles', () => {
      debugger;
      const template = createStylingContextTemplate(
          [InitialStylingFlags.INITIAL_STYLES, 'color', 'red', 'width', '10px']);
      expect(template).toEqual([
        [null, 'red', '10px'],
        dirty(0, 8),  //

        // #2
        clean(1, 8),
        'color',
        null,

        // #5
        clean(2, 11),
        'width',
        null,

        // #8
        dirty(1, 2),
        'color',
        null,

        // #11
        dirty(2, 5),
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
             elementStyling(1, [
               'width', 'height', 'opacity',  //
               0, 'width', '100px', 'height', '100px', 'opacity', '0.5'
             ]);
             elementEnd();
           }
           if (rf & RenderFlags.Update) {
             elementStyle(1, ctx.myStyles);
             elementStyleProp(1, 0, ctx.myWidth);
             elementStylingApply(1);
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
      updateStyleMap(stylingContext, {
        width: '100px',
        height: '100px',
      });
      updateStyleMap(stylingContext, {height: '200px'});
      expect(getStyles(stylingContext)).toEqual({width: null, height: '200px'});
    });

    it('should evaluate the delta between style changes when rendering occurs', () => {
      const stylingContext = initContext(['width', 'height', 0, 'width', '100px']);
      updateStyleMap(stylingContext, {
        height: '200px',
      });
      expect(renderStyles(stylingContext)).toEqual({width: '100px', height: '200px'});
      expect(renderStyles(stylingContext)).toEqual({});
      updateStyleMap(stylingContext, {
        width: '100px',
        height: '100px',
      });
      expect(renderStyles(stylingContext)).toEqual({height: '100px'});
      updateStyleProp(stylingContext, 1, '100px');
      expect(renderStyles(stylingContext)).toEqual({});
      updateStyleMap(stylingContext, {
        width: '100px',
        height: '100px',
      });
      expect(renderStyles(stylingContext)).toEqual({});
    });

    it('should update individual values on a set of styles', () => {
      const getStyles = trackStylesFactory();
      const stylingContext = initContext(['width', 'height']);
      updateStyleMap(stylingContext, {
        width: '100px',
        height: '100px',
      });
      updateStyleProp(stylingContext, 1, '200px');
      expect(getStyles(stylingContext)).toEqual({width: '100px', height: '200px'});
    });

    it('should only mark itself as updated when one or more properties have been applied', () => {
      const stylingContext = initContext();
      expect(isContextDirty(stylingContext)).toBeFalsy();

      updateStyleMap(stylingContext, {
        width: '100px',
        height: '100px',
      });
      expect(isContextDirty(stylingContext)).toBeTruthy();

      setContextDirty(stylingContext, false);

      updateStyleMap(stylingContext, {
        width: '100px',
        height: '100px',
      });
      expect(isContextDirty(stylingContext)).toBeFalsy();

      updateStyleMap(stylingContext, {
        width: '200px',
        height: '100px',
      });
      expect(isContextDirty(stylingContext)).toBeTruthy();
    });

    it('should only mark itself as updated when any single properties have been applied', () => {
      const stylingContext = initContext(['height']);
      updateStyleMap(stylingContext, {
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
          ['width', 'height', 'opacity', 0, 'width', '100px', 'height', '100px', 'opacity', '0']);

      expect(getStyles(stylingContext)).toEqual({
        width: '100px',
        height: '100px',
        opacity: '0',
      });

      updateStyleMap(stylingContext, {width: '200px', height: '200px'});

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

      updateStyleMap(stylingContext, {});

      expect(getStyles(stylingContext)).toEqual({
        width: '100px',
        height: '100px',
        opacity: '0',
      });
    });

    it('should cleanup removed styles from the context once the styles are built', () => {
      const stylingContext = initContext(['width', 'height']);
      const getStyles = trackStylesFactory();

      updateStyleMap(stylingContext, {width: '100px', height: '100px'});

      expect(stylingContext).toEqual([
        [null],
        dirty(0, 8),  //

        // #2
        clean(0, 8),
        'width',
        null,

        // #5
        clean(0, 11),
        'height',
        null,

        // #8
        dirty(0, 2),
        'width',
        '100px',

        // #11
        dirty(0, 5),
        'height',
        '100px',
      ]);

      getStyles(stylingContext);
      updateStyleMap(stylingContext, {width: '200px', opacity: '0'});

      expect(stylingContext).toEqual([
        [null],
        dirty(0, 8),  //

        // #2
        clean(0, 8),
        'width',
        null,

        // #5
        clean(0, 14),
        'height',
        null,

        // #8
        dirty(0, 2),
        'width',
        '200px',

        // #11
        dirty(),
        'opacity',
        '0',

        // #14
        dirty(0, 5),
        'height',
        null,
      ]);

      getStyles(stylingContext);
      expect(stylingContext).toEqual([
        [null],
        clean(0, 8),  //

        // #2
        clean(0, 8),
        'width',
        null,

        // #5
        clean(0, 14),
        'height',
        null,

        // #8
        clean(0, 2),
        'width',
        '200px',

        // #11
        clean(),
        'opacity',
        '0',

        // #14
        clean(0, 5),
        'height',
        null,
      ]);

      updateStyleMap(stylingContext, {width: null});
      updateStyleProp(stylingContext, 0, '300px');

      expect(stylingContext).toEqual([
        [null],
        dirty(0, 8),  //

        // #2
        dirty(0, 8),
        'width',
        '300px',

        // #5
        clean(0, 14),
        'height',
        null,

        // #8
        clean(0, 2),
        'width',
        null,

        // #11
        dirty(),
        'opacity',
        null,

        // #14
        clean(0, 5),
        'height',
        null,
      ]);

      getStyles(stylingContext);

      updateStyleProp(stylingContext, 0, null);
      expect(stylingContext).toEqual([
        [null],
        dirty(0, 8),  //

        // #2
        dirty(0, 8),
        'width',
        null,

        // #5
        clean(0, 14),
        'height',
        null,

        // #8
        clean(0, 2),
        'width',
        null,

        // #11
        clean(),
        'opacity',
        null,

        // #14
        clean(0, 5),
        'height',
        null,
      ]);
    });

    it('should find the next available space in the context when data is added after being removed before',
       () => {
         const stylingContext = initContext(['lineHeight']);
         const getStyles = trackStylesFactory();

         updateStyleMap(stylingContext, {width: '100px', height: '100px', opacity: '0.5'});

         expect(stylingContext).toEqual([
           [null],
           dirty(0, 5),  //

           // #2
           clean(0, 14),
           'lineHeight',
           null,

           // #5
           dirty(),
           'width',
           '100px',

           // #8
           dirty(),
           'height',
           '100px',

           // #11
           dirty(),
           'opacity',
           '0.5',

           // #14
           dirty(0, 2),
           'lineHeight',
           null,
         ]);

         getStyles(stylingContext);

         updateStyleMap(stylingContext, {});
         expect(stylingContext).toEqual([
           [null],
           dirty(0, 5),  //

           // #2
           clean(0, 14),
           'lineHeight',
           null,

           // #5
           dirty(),
           'width',
           null,

           // #8
           dirty(),
           'height',
           null,

           // #11
           dirty(),
           'opacity',
           null,

           // #14
           clean(0, 2),
           'lineHeight',
           null,
         ]);

         getStyles(stylingContext);
         updateStyleMap(stylingContext, {
           borderWidth: '5px',
         });

         expect(stylingContext).toEqual([
           [null],
           dirty(0, 5),  //

           // #2
           clean(0, 17),
           'lineHeight',
           null,

           // #5
           dirty(),
           'borderWidth',
           '5px',

           // #8
           clean(),
           'width',
           null,

           // #11
           clean(),
           'height',
           null,

           // #14
           clean(),
           'opacity',
           null,

           // #17
           clean(0, 2),
           'lineHeight',
           null,
         ]);

         updateStyleProp(stylingContext, 0, '200px');

         expect(stylingContext).toEqual([
           [null],
           dirty(0, 5),  //

           // #2
           dirty(0, 17),
           'lineHeight',
           '200px',

           // #5
           dirty(),
           'borderWidth',
           '5px',

           // #8
           clean(),
           'width',
           null,

           // #11
           clean(),
           'height',
           null,

           // #14
           clean(),
           'opacity',
           null,

           // #17
           clean(0, 2),
           'lineHeight',
           null,
         ]);

         updateStyleMap(stylingContext, {borderWidth: '15px', borderColor: 'red'});

         expect(stylingContext).toEqual([
           [null],
           dirty(0, 5),  //

           // #2
           dirty(0, 20),
           'lineHeight',
           '200px',

           // #5
           dirty(),
           'borderWidth',
           '15px',

           // #8
           dirty(),
           'borderColor',
           'red',

           // #11
           clean(),
           'width',
           null,

           // #14
           clean(),
           'height',
           null,

           // #17
           clean(),
           'opacity',
           null,

           // #20
           clean(0, 2),
           'lineHeight',
           null,
         ]);
       });

    it('should render all data as not being dirty after the styles are built', () => {
      const getStyles = trackStylesFactory();
      const stylingContext = initContext(['height']);

      updateStyleMap(stylingContext, {
        width: '100px',
      });

      updateStyleProp(stylingContext, 0, '200px');

      expect(stylingContext).toEqual([
        [null],
        dirty(0, 5),  //

        // #2
        dirty(0, 8),
        'height',
        '200px',

        // #2
        dirty(),
        'width',
        '100px',

        // #8
        clean(0, 2),
        'height',
        null,
      ]);

      getStyles(stylingContext);

      expect(stylingContext).toEqual([
        [null],
        clean(0, 5),  //

        // #2
        clean(0, 8),
        'height',
        '200px',

        // #2
        clean(),
        'width',
        '100px',

        // #8
        clean(0, 2),
        'height',
        null,
      ]);
    });
  });
});
