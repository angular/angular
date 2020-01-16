/**
  * @license
  * Copyright Google Inc. All Rights Reserved.
  *
  * Use of this source code is governed by an MIT-style license that can be
  * found in the LICENSE file at https://angular.io/license
  */

import {classStringParser, initializeStylingStaticArrayMap, styleStringParser, toStylingArrayMap, ɵɵclassProp, ɵɵstyleMap, ɵɵstyleProp, ɵɵstyleSanitizer} from '@angular/core/src/render3/instructions/styling';
import {AttributeMarker} from '@angular/core/src/render3/interfaces/node';
import {TVIEW} from '@angular/core/src/render3/interfaces/view';
import {getLView, leaveView} from '@angular/core/src/render3/state';
import {getNativeByIndex} from '@angular/core/src/render3/util/view_utils';
import {bypassSanitizationTrustStyle} from '@angular/core/src/sanitization/bypass';
import {ɵɵsanitizeStyle} from '@angular/core/src/sanitization/sanitization';
import {arrayMapSet} from '@angular/core/src/util/array_utils';
import {ngDevModeResetPerfCounters} from '@angular/core/src/util/ng_dev_mode';
import {getElementClasses, getElementStyles} from '@angular/core/testing/src/styling';
import {expect} from '@angular/core/testing/src/testing_internal';

import {clearFirstUpdatePass, enterViewWithOneDiv, rewindBindingIndex} from './shared_spec';

describe('styling', () => {
  beforeEach(enterViewWithOneDiv);
  afterEach(leaveView);

  let div !: HTMLElement;
  beforeEach(() => div = getNativeByIndex(0, getLView()) as HTMLElement);

  it('should do set basic style', () => {
    ɵɵstyleProp('color', 'red');
    expectStyle(div).toEqual({color: 'red'});
  });

  it('should search across multiple instructions backwards', () => {
    ɵɵstyleProp('color', 'red');
    ɵɵstyleProp('color', undefined);
    ɵɵstyleProp('color', 'blue');
    expectStyle(div).toEqual({color: 'blue'});

    clearFirstUpdatePass();

    rewindBindingIndex();
    ɵɵstyleProp('color', 'red');
    ɵɵstyleProp('color', undefined);
    ɵɵstyleProp('color', undefined);
    expectStyle(div).toEqual({color: 'red'});
  });

  it('should search across multiple instructions forwards', () => {
    ɵɵstyleProp('color', 'red');
    ɵɵstyleProp('color', 'green');
    ɵɵstyleProp('color', 'blue');
    expectStyle(div).toEqual({color: 'blue'});

    clearFirstUpdatePass();

    rewindBindingIndex();
    ɵɵstyleProp('color', 'white');
    expectStyle(div).toEqual({color: 'blue'});
  });

  it('should set style based on priority', () => {
    ɵɵstyleProp('color', 'red');
    ɵɵstyleProp('color', 'blue');  // Higher priority, should win.
    expectStyle(div).toEqual({color: 'blue'});
    // The intermediate value has to set since it does not know if it is last one.
    expect(ngDevMode !.rendererSetStyle).toEqual(2);
    ngDevModeResetPerfCounters();

    clearFirstUpdatePass();
    rewindBindingIndex();
    ɵɵstyleProp('color', 'red');    // no change
    ɵɵstyleProp('color', 'green');  // change to green
    expectStyle(div).toEqual({color: 'green'});
    expect(ngDevMode !.rendererSetStyle).toEqual(1);
    ngDevModeResetPerfCounters();

    rewindBindingIndex();
    ɵɵstyleProp('color', 'black');               // First binding update
    expectStyle(div).toEqual({color: 'green'});  // Green still has priority.
    expect(ngDevMode !.rendererSetStyle).toEqual(0);
    ngDevModeResetPerfCounters();

    rewindBindingIndex();
    ɵɵstyleProp('color', 'black');               // no change
    ɵɵstyleProp('color', undefined);             // Clear second binding
    expectStyle(div).toEqual({color: 'black'});  // default to first binding
    expect(ngDevMode !.rendererSetStyle).toEqual(1);
    ngDevModeResetPerfCounters();

    rewindBindingIndex();
    ɵɵstyleProp('color', null);
    expectStyle(div).toEqual({});  // default to first binding
    expect(ngDevMode !.rendererSetStyle).toEqual(0);
    expect(ngDevMode !.rendererRemoveStyle).toEqual(1);
  });

  it('should set class based on priority', () => {
    ɵɵclassProp('foo', false);
    ɵɵclassProp('foo', true);  // Higher priority, should win.
    expectClass(div).toEqual({foo: true});
    expect(ngDevMode !.rendererAddClass).toEqual(1);
    ngDevModeResetPerfCounters();

    clearFirstUpdatePass();
    rewindBindingIndex();
    ɵɵclassProp('foo', false);      // no change
    ɵɵclassProp('foo', undefined);  // change (have no opinion)
    expectClass(div).toEqual({});
    expect(ngDevMode !.rendererAddClass).toEqual(0);
    expect(ngDevMode !.rendererRemoveClass).toEqual(1);
    ngDevModeResetPerfCounters();

    rewindBindingIndex();
    ɵɵclassProp('foo', false);  // no change
    ɵɵclassProp('foo', 'truthy' as any);
    expectClass(div).toEqual({foo: true});

    rewindBindingIndex();
    ɵɵclassProp('foo', true);       // change
    ɵɵclassProp('foo', undefined);  // change
    expectClass(div).toEqual({foo: true});
  });

  describe('styleMap', () => {
    it('should work with maps', () => {
      ɵɵstyleMap({});
      expectStyle(div).toEqual({});
      expect(ngDevMode !.rendererSetStyle).toEqual(0);
      expect(ngDevMode !.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      clearFirstUpdatePass();

      rewindBindingIndex();
      ɵɵstyleMap({color: 'blue'});
      expectStyle(div).toEqual({color: 'blue'});
      expect(ngDevMode !.rendererSetStyle).toEqual(1);
      expect(ngDevMode !.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      rewindBindingIndex();
      ɵɵstyleMap({color: 'red'});
      expectStyle(div).toEqual({color: 'red'});
      expect(ngDevMode !.rendererSetStyle).toEqual(1);
      expect(ngDevMode !.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      rewindBindingIndex();
      ɵɵstyleMap({color: null, width: '100px'});
      expectStyle(div).toEqual({width: '100px'});
      expect(ngDevMode !.rendererSetStyle).toEqual(1);
      expect(ngDevMode !.rendererRemoveStyle).toEqual(1);
      ngDevModeResetPerfCounters();
    });

    it('should work with object literal and strings', () => {
      ɵɵstyleMap('');
      expectStyle(div).toEqual({});
      expect(ngDevMode !.rendererSetStyle).toEqual(0);
      expect(ngDevMode !.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      clearFirstUpdatePass();

      rewindBindingIndex();
      ɵɵstyleMap('color: blue');
      expectStyle(div).toEqual({color: 'blue'});
      expect(ngDevMode !.rendererSetStyle).toEqual(1);
      expect(ngDevMode !.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      rewindBindingIndex();
      ɵɵstyleMap('color: red');
      expectStyle(div).toEqual({color: 'red'});
      expect(ngDevMode !.rendererSetStyle).toEqual(1);
      expect(ngDevMode !.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      rewindBindingIndex();
      ɵɵstyleMap('width: 100px');
      expectStyle(div).toEqual({width: '100px'});
      expect(ngDevMode !.rendererSetStyle).toEqual(1);
      expect(ngDevMode !.rendererRemoveStyle).toEqual(1);
      ngDevModeResetPerfCounters();
    });

    it('should collaborate with properties', () => {
      ɵɵstyleProp('color', 'red');
      ɵɵstyleMap({color: 'blue', width: '100px'});
      expectStyle(div).toEqual({color: 'blue', width: '100px'});

      clearFirstUpdatePass();

      rewindBindingIndex();
      ɵɵstyleProp('color', 'red');
      ɵɵstyleMap({width: '200px'});
      expectStyle(div).toEqual({color: 'red', width: '200px'});
    });

    it('should collaborate with other maps', () => {
      ɵɵstyleMap('color: red');
      ɵɵstyleMap({color: 'blue', width: '100px'});
      expectStyle(div).toEqual({color: 'blue', width: '100px'});

      clearFirstUpdatePass();

      rewindBindingIndex();
      ɵɵstyleMap('color: red');
      ɵɵstyleMap({width: '200px'});
      expectStyle(div).toEqual({color: 'red', width: '200px'});
    });

    describe('suffix', () => {
      it('should append suffix', () => {
        ɵɵstyleProp('width', 200, 'px');
        ɵɵstyleProp('width', 100, 'px');
        expectStyle(div).toEqual({width: '100px'});

        clearFirstUpdatePass();

        rewindBindingIndex();
        ɵɵstyleProp('width', 200, 'px');
        ɵɵstyleProp('width', undefined, 'px');
        expectStyle(div).toEqual({width: '200px'});
      });

      it('should append suffix and non-suffix bindings', () => {
        ɵɵstyleProp('width', 200, 'px');
        ɵɵstyleProp('width', '100px');
        expectStyle(div).toEqual({width: '100px'});

        clearFirstUpdatePass();

        rewindBindingIndex();
        ɵɵstyleProp('width', 200, 'px');
        ɵɵstyleProp('width', undefined, 'px');
        expectStyle(div).toEqual({width: '200px'});
      });
    });

    describe('sanitization', () => {
      it('should sanitize property', () => {
        ɵɵstyleSanitizer(ɵɵsanitizeStyle);
        ɵɵstyleProp('background', 'url("javascript:/unsafe")');
        expect(div.style.getPropertyValue('background')).not.toContain('javascript');

        clearFirstUpdatePass();

        rewindBindingIndex();
        ɵɵstyleProp('background', bypassSanitizationTrustStyle('url("javascript:/trusted")'));
        expect(div.style.getPropertyValue('background')).toContain('url("javascript:/trusted")');
      });

      it('should sanitize map', () => {
        ɵɵstyleSanitizer(ɵɵsanitizeStyle);
        ɵɵstyleMap('background: url("javascript:/unsafe")');
        expect(div.style.getPropertyValue('background')).not.toContain('javascript');

        clearFirstUpdatePass();

        rewindBindingIndex();
        ɵɵstyleMap({'background': bypassSanitizationTrustStyle('url("javascript:/trusted")')});
        expect(div.style.getPropertyValue('background')).toContain('url("javascript:/trusted")');
      });
    });

    describe('populateStylingStaticArrayMap', () => {
      it('should initialize to null if no mergedAttrs', () => {
        const tNode = getLView()[TVIEW].firstChild !;
        expect(tNode.stylesMap).toEqual(undefined);
        expect(tNode.classesMap).toEqual(undefined);
        initializeStylingStaticArrayMap(tNode);
        expect(tNode.stylesMap).toEqual(null);
        expect(tNode.classesMap).toEqual(null);
      });

      it('should initialize from mergeAttrs', () => {
        const tNode = getLView()[TVIEW].firstChild !;
        expect(tNode.stylesMap).toEqual(undefined);
        expect(tNode.classesMap).toEqual(undefined);
        tNode.mergedAttrs = [
          'ignore', 'value',                                     //
          AttributeMarker.Classes, 'foo', 'bar',                 //
          AttributeMarker.Styles, 'width', '0', 'color', 'red',  //
        ];
        initializeStylingStaticArrayMap(tNode);
        expect(tNode.classesMap).toEqual(['bar', true, 'foo', true] as any);
        expect(tNode.stylesMap).toEqual(['color', 'red', 'width', '0'] as any);
      });
    });
  });


  describe('toStylingArray', () => {
    describe('falsy', () => {
      it('should return empty ArrayMap', () => {
        expect(toStylingArrayMap(arrayMapSet, null !, '')).toEqual([] as any);
        expect(toStylingArrayMap(arrayMapSet, null !, null)).toEqual([] as any);
        expect(toStylingArrayMap(arrayMapSet, null !, undefined)).toEqual([] as any);
        expect(toStylingArrayMap(arrayMapSet, null !, [])).toEqual([] as any);
        expect(toStylingArrayMap(arrayMapSet, null !, {})).toEqual([] as any);
      });
      describe('string', () => {
        it('should parse classes', () => {
          expect(toStylingArrayMap(arrayMapSet, classStringParser, '  ')).toEqual([] as any);
          expect(toStylingArrayMap(arrayMapSet, classStringParser, ' X A ')).toEqual([
            'A', true, 'X', true
          ] as any);
        });
        it('should parse styles', () => {
          expect(toStylingArrayMap(arrayMapSet, styleStringParser, '  ')).toEqual([] as any);
          expect(toStylingArrayMap(arrayMapSet, styleStringParser, 'B:b;A:a')).toEqual([
            'A', 'a', 'B', 'b'
          ] as any);
        });
      });
      describe('array', () => {
        it('should parse', () => {
          expect(toStylingArrayMap(arrayMapSet, null !, ['X', 'A'])).toEqual([
            'A', true, 'X', true
          ] as any);
        });
      });
      describe('object', () => {
        it('should parse', () => {
          expect(toStylingArrayMap(arrayMapSet, null !, {X: 'x', A: 'a'})).toEqual([
            'A', 'a', 'X', 'x'
          ] as any);
        });
      });
      describe('Map', () => {
        it('should parse', () => {
          expect(toStylingArrayMap(
                     arrayMapSet, null !, new Map<string, string>([['X', 'x'], ['A', 'a']])))
              .toEqual(['A', 'a', 'X', 'x'] as any);
        });
      });
      describe('Iterable', () => {
        it('should parse', () => {
          expect(toStylingArrayMap(arrayMapSet, null !, new Set<string>(['X', 'A']))).toEqual([
            'A', true, 'X', true
          ] as any);
        });
      });
    });
  });
});


function expectStyle(element: HTMLElement) {
  return expect(getElementStyles(element));
}

function expectClass(element: HTMLElement) {
  return expect(getElementClasses(element));
}