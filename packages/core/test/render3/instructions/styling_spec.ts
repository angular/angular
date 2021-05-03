/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveDef} from '@angular/core/src/render3';
import {ɵɵdefineDirective} from '@angular/core/src/render3/definition';
import {classStringParser, styleStringParser, toStylingKeyValueArray, ɵɵclassProp, ɵɵstyleMap, ɵɵstyleProp} from '@angular/core/src/render3/instructions/styling';
import {AttributeMarker, TAttributes} from '@angular/core/src/render3/interfaces/node';
import {getTStylingRangeNext, getTStylingRangeNextDuplicate, getTStylingRangePrev, getTStylingRangePrevDuplicate, setTStylingRangeNext, setTStylingRangePrev, StylingRange, toTStylingRange, TStylingKey, TStylingRange} from '@angular/core/src/render3/interfaces/styling';
import {HEADER_OFFSET, TVIEW} from '@angular/core/src/render3/interfaces/view';
import {getLView, leaveView, setBindingRootForHostBindings} from '@angular/core/src/render3/state';
import {getNativeByIndex} from '@angular/core/src/render3/util/view_utils';
import {keyValueArraySet} from '@angular/core/src/util/array_utils';
import {ngDevModeResetPerfCounters} from '@angular/core/src/util/ng_dev_mode';
import {getElementClasses, getElementStyles} from '@angular/core/testing/src/styling';
import {expect} from '@angular/core/testing/src/testing_internal';

import {clearFirstUpdatePass, enterViewWithOneDiv, rewindBindingIndex} from './shared_spec';

describe('styling', () => {
  beforeEach(enterViewWithOneDiv);
  afterEach(leaveView);

  let div!: HTMLElement;
  beforeEach(() => div = getNativeByIndex(HEADER_OFFSET, getLView()) as HTMLElement);

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
    expect(ngDevMode!.rendererSetStyle).toEqual(2);
    ngDevModeResetPerfCounters();

    clearFirstUpdatePass();
    rewindBindingIndex();
    ɵɵstyleProp('color', 'red');    // no change
    ɵɵstyleProp('color', 'green');  // change to green
    expectStyle(div).toEqual({color: 'green'});
    expect(ngDevMode!.rendererSetStyle).toEqual(1);
    ngDevModeResetPerfCounters();

    rewindBindingIndex();
    ɵɵstyleProp('color', 'black');               // First binding update
    expectStyle(div).toEqual({color: 'green'});  // Green still has priority.
    expect(ngDevMode!.rendererSetStyle).toEqual(0);
    ngDevModeResetPerfCounters();

    rewindBindingIndex();
    ɵɵstyleProp('color', 'black');               // no change
    ɵɵstyleProp('color', undefined);             // Clear second binding
    expectStyle(div).toEqual({color: 'black'});  // default to first binding
    expect(ngDevMode!.rendererSetStyle).toEqual(1);
    ngDevModeResetPerfCounters();

    rewindBindingIndex();
    ɵɵstyleProp('color', null);
    expectStyle(div).toEqual({});  // default to first binding
    expect(ngDevMode!.rendererSetStyle).toEqual(0);
    expect(ngDevMode!.rendererRemoveStyle).toEqual(1);
  });

  it('should set class based on priority', () => {
    ɵɵclassProp('foo', false);
    ɵɵclassProp('foo', true);  // Higher priority, should win.
    expectClass(div).toEqual({foo: true});
    expect(ngDevMode!.rendererAddClass).toEqual(1);
    ngDevModeResetPerfCounters();

    clearFirstUpdatePass();
    rewindBindingIndex();
    ɵɵclassProp('foo', false);      // no change
    ɵɵclassProp('foo', undefined);  // change (have no opinion)
    expectClass(div).toEqual({});
    expect(ngDevMode!.rendererAddClass).toEqual(0);
    expect(ngDevMode!.rendererRemoveClass).toEqual(1);
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
      expect(ngDevMode!.rendererSetStyle).toEqual(0);
      expect(ngDevMode!.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      clearFirstUpdatePass();

      rewindBindingIndex();
      ɵɵstyleMap({color: 'blue'});
      expectStyle(div).toEqual({color: 'blue'});
      expect(ngDevMode!.rendererSetStyle).toEqual(1);
      expect(ngDevMode!.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      rewindBindingIndex();
      ɵɵstyleMap({color: 'red'});
      expectStyle(div).toEqual({color: 'red'});
      expect(ngDevMode!.rendererSetStyle).toEqual(1);
      expect(ngDevMode!.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      rewindBindingIndex();
      ɵɵstyleMap({color: null, width: '100px'});
      expectStyle(div).toEqual({width: '100px'});
      expect(ngDevMode!.rendererSetStyle).toEqual(1);
      expect(ngDevMode!.rendererRemoveStyle).toEqual(1);
      ngDevModeResetPerfCounters();
    });

    it('should work with object literal and strings', () => {
      ɵɵstyleMap('');
      expectStyle(div).toEqual({});
      expect(ngDevMode!.rendererSetStyle).toEqual(0);
      expect(ngDevMode!.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      clearFirstUpdatePass();

      rewindBindingIndex();
      ɵɵstyleMap('color: blue');
      expectStyle(div).toEqual({color: 'blue'});
      expect(ngDevMode!.rendererSetStyle).toEqual(1);
      expect(ngDevMode!.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      rewindBindingIndex();
      ɵɵstyleMap('color: red');
      expectStyle(div).toEqual({color: 'red'});
      expect(ngDevMode!.rendererSetStyle).toEqual(1);
      expect(ngDevMode!.rendererRemoveStyle).toEqual(0);
      ngDevModeResetPerfCounters();

      rewindBindingIndex();
      ɵɵstyleMap('width: 100px');
      expectStyle(div).toEqual({width: '100px'});
      expect(ngDevMode!.rendererSetStyle).toEqual(1);
      expect(ngDevMode!.rendererRemoveStyle).toEqual(1);
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
  });

  describe('static', () => {
    describe('template only', () => {
      it('should capture static values in TStylingKey', () => {
        givenTemplateAttrs([AttributeMarker.Styles, 'content', '"TEMPLATE"']);

        ɵɵstyleProp('content', '"dynamic"');
        expectTStylingKeys('style').toEqual([
          ['', 'content', 'content', '"TEMPLATE"'], 'prev',  // contains statics
          null                                               // residual
        ]);
        expectStyle(div).toEqual({content: '"dynamic"'});

        ɵɵstyleProp('content', undefined);
        expectTStylingKeys('style').toEqual([
          ['', 'content', 'content', '"TEMPLATE"'], 'both',  // contains statics
          'content', 'prev',  // Making sure that second instruction does not have statics again.
          null                // residual
        ]);
        expectStyle(div).toEqual({content: '"dynamic"'});
      });
    });

    describe('directives only', () => {
      it('should update residual on second directive', () => {
        givenDirectiveAttrs([
          [AttributeMarker.Styles, 'content', '"lowest"'],  // 0
          [AttributeMarker.Styles, 'content', '"middle"'],  // 1
        ]);
        expectStyle(div).toEqual({content: '"middle"'});

        activateHostBindings(0);
        ɵɵstyleProp('content', '"dynamic"');
        expectTStylingKeys('style').toEqual([
          ['', 'content', 'content', '"lowest"'], 'both',  // 1: contains statics
          ['content', '"middle"'],                         // residual
        ]);
        expectStyle(div).toEqual({content: '"middle"'});

        // second binding should not get statics
        ɵɵstyleProp('content', '"dynamic2"');
        expectTStylingKeys('style').toEqual([
          ['', 'content', 'content', '"lowest"'], 'both',  // 1: contains statics
          'content', 'both',                               // 1: Should not get statics
          ['content', '"middle"']                          // residual
        ]);
        expectStyle(div).toEqual({content: '"middle"'});

        activateHostBindings(1);
        ɵɵstyleProp('content', '"dynamic3"');
        expectTStylingKeys('style').toEqual([
          ['', 'content', 'content', '"lowest"'], 'both',  // 1: contains statics
          'content', 'both',                               // 1: Should not get statics
          ['', 'content', 'content', '"middle"'], 'prev',  // 0: contains statics
          null                                             // residual
        ]);
        expectStyle(div).toEqual({content: '"dynamic3"'});
      });
    });

    describe('template and directives', () => {
      it('should combine property and map', () => {
        givenDirectiveAttrs([
          [AttributeMarker.Styles, 'content', '"lowest"', 'color', 'blue'],   // 0
          [AttributeMarker.Styles, 'content', '"middle"', 'width', '100px'],  // 1
        ]);
        givenTemplateAttrs([AttributeMarker.Styles, 'content', '"TEMPLATE"', 'color', 'red']);

        // TEMPLATE
        ɵɵstyleProp('content', undefined);
        expectTStylingKeys('style').toEqual([
          // TEMPLATE
          ['', 'content', 'color', 'red', 'content', '"TEMPLATE"', 'width', '100px'], 'prev',
          // RESIDUAL
          null
        ]);
        expectStyle(div).toEqual({content: '"TEMPLATE"', color: 'red', width: '100px'});

        // Directive 0
        activateHostBindings(0);
        ɵɵstyleMap('color: red; width: 0px; height: 50px');
        expectTStylingKeys('style').toEqual([
          // Host Binding 0
          ['', null, 'color', 'blue', 'content', '"lowest"'], 'both',
          // TEMPLATE
          ['', 'content', 'color', 'red', 'content', '"TEMPLATE"', 'width', '100px'], 'prev',
          // RESIDUAL
          null
        ]);
        expectStyle(div).toEqual(
            {content: '"TEMPLATE"', color: 'red', width: '100px', height: '50px'});

        // Directive 1
        activateHostBindings(1);
        ɵɵstyleMap('color: red; width: 0px; height: 50px');
        expectTStylingKeys('style').toEqual([
          // Host Binding 0
          ['', null, 'color', 'blue', 'content', '"lowest"'], 'both',
          // Host Binding 1
          ['', null, 'content', '"middle"', 'width', '100px'], 'both',
          // TEMPLATE
          ['', 'content', 'color', 'red', 'content', '"TEMPLATE"'], 'prev',
          // RESIDUAL
          null
        ]);
        expectStyle(div).toEqual(
            {content: '"TEMPLATE"', color: 'red', width: '0px', height: '50px'});
      });

      it('should read value from residual', () => {
        givenDirectiveAttrs([
          [AttributeMarker.Styles, 'content', '"lowest"', 'color', 'blue'],   // 0
          [AttributeMarker.Styles, 'content', '"middle"', 'width', '100px'],  // 1
        ]);
        givenTemplateAttrs([AttributeMarker.Styles, 'content', '"TEMPLATE"', 'color', 'red']);

        // Directive 1
        activateHostBindings(1);
        ɵɵstyleProp('color', 'white');
        expectTStylingKeys('style').toEqual([
          // Host Binding 0 + 1
          ['', 'color', 'color', 'blue', 'content', '"middle"', 'width', '100px'], 'both',
          // RESIDUAL
          ['color', 'red', 'content', '"TEMPLATE"']
        ]);
        expectStyle(div).toEqual({content: '"TEMPLATE"', color: 'red', width: '100px'});
      });
    });
  });


  describe('toStylingArray', () => {
    describe('falsy', () => {
      it('should return empty KeyValueArray', () => {
        expect(toStylingKeyValueArray(keyValueArraySet, null!, '')).toEqual([] as any);
        expect(toStylingKeyValueArray(keyValueArraySet, null!, null)).toEqual([] as any);
        expect(toStylingKeyValueArray(keyValueArraySet, null!, undefined)).toEqual([] as any);
        expect(toStylingKeyValueArray(keyValueArraySet, null!, [])).toEqual([] as any);
        expect(toStylingKeyValueArray(keyValueArraySet, null!, {})).toEqual([] as any);
      });
      describe('string', () => {
        it('should parse classes', () => {
          expect(toStylingKeyValueArray(keyValueArraySet, classStringParser, '  '))
              .toEqual([] as any);
          expect(toStylingKeyValueArray(keyValueArraySet, classStringParser, ' X A ')).toEqual([
            'A', true, 'X', true
          ] as any);
        });
        it('should parse styles', () => {
          expect(toStylingKeyValueArray(keyValueArraySet, styleStringParser, '  '))
              .toEqual([] as any);
          expect(toStylingKeyValueArray(keyValueArraySet, styleStringParser, 'B:b;A:a')).toEqual([
            'A', 'a', 'B', 'b'
          ] as any);
        });
      });
      describe('array', () => {
        it('should parse', () => {
          expect(toStylingKeyValueArray(keyValueArraySet, null!, ['X', 'A'])).toEqual([
            'A', true, 'X', true
          ] as any);
        });
      });
      describe('object', () => {
        it('should parse', () => {
          expect(toStylingKeyValueArray(keyValueArraySet, null!, {X: 'x', A: 'a'})).toEqual([
            'A', 'a', 'X', 'x'
          ] as any);
        });
      });
    });
  });


  describe('TStylingRange', () => {
    const MAX_VALUE = StylingRange.UNSIGNED_MASK;

    it('should throw on negative values', () => {
      expect(() => toTStylingRange(0, -1)).toThrow();
      expect(() => toTStylingRange(-1, 0)).toThrow();
    });

    it('should throw on overflow', () => {
      expect(() => toTStylingRange(0, MAX_VALUE + 1)).toThrow();
      expect(() => toTStylingRange(MAX_VALUE + 1, 0)).toThrow();
    });

    it('should retrieve the same value which went in just below overflow', () => {
      const range = toTStylingRange(MAX_VALUE, MAX_VALUE);
      expect(getTStylingRangePrev(range)).toEqual(MAX_VALUE);
      expect(getTStylingRangeNext(range)).toEqual(MAX_VALUE);
    });

    it('should correctly increment', () => {
      let range = toTStylingRange(0, 0);
      for (let i = 0; i <= MAX_VALUE; i++) {
        range = setTStylingRangeNext(range, i);
        range = setTStylingRangePrev(range, i);
        expect(getTStylingRangeNext(range)).toEqual(i);
        expect(getTStylingRangePrev(range)).toEqual(i);
        if (i == 10) {
          // Skip the boring stuff in the middle.
          i = MAX_VALUE - 10;
        }
      }
    });
  });
});


function expectStyle(element: HTMLElement) {
  return expect(getElementStyles(element));
}

function expectClass(element: HTMLElement) {
  return expect(getElementClasses(element));
}

function givenTemplateAttrs(tAttrs: TAttributes) {
  const tNode = getTNode();
  tNode.attrs = tAttrs;
  applyTAttributes(tAttrs);
}

function getTNode() {
  return getLView()[TVIEW].firstChild!;
}

function getTData() {
  return getLView()[TVIEW].data;
}

class MockDir {}

function givenDirectiveAttrs(tAttrs: TAttributes[]) {
  const tNode = getTNode();
  const tData = getTData();
  tNode.directiveStart = getTDataIndexFromDirectiveIndex(0);
  tNode.directiveEnd = getTDataIndexFromDirectiveIndex(tAttrs.length);
  for (let i = 0; i < tAttrs.length; i++) {
    const tAttr = tAttrs[i];
    const directiveDef = ɵɵdefineDirective({type: MockDir, hostAttrs: tAttr}) as DirectiveDef<any>;
    applyTAttributes(directiveDef.hostAttrs);
    tData[getTDataIndexFromDirectiveIndex(i)] = directiveDef;
  }
}

function applyTAttributes(attrs: TAttributes|null) {
  if (attrs === null) return;
  const div: HTMLElement = getLView()[HEADER_OFFSET];
  let mode: AttributeMarker = AttributeMarker.ImplicitAttributes;
  for (let i = 0; i < attrs.length; i++) {
    const item = attrs[i];
    if (typeof item === 'number') {
      mode = item;
    } else if (typeof item === 'string') {
      if (mode == AttributeMarker.ImplicitAttributes) {
        div.setAttribute(item, attrs[++i] as string);
      } else if (mode == AttributeMarker.Classes) {
        div.classList.add(item);
      } else if (mode == AttributeMarker.Styles) {
        div.style.setProperty(item, attrs[++i] as string);
      }
    }
  }
}

function activateHostBindings(directiveIndex: number) {
  const bindingRootIndex = getBindingRootIndexFromDirectiveIndex(directiveIndex);
  const currentDirectiveIndex = getTDataIndexFromDirectiveIndex(directiveIndex);
  setBindingRootForHostBindings(bindingRootIndex, currentDirectiveIndex);
}

function getBindingRootIndexFromDirectiveIndex(index: number) {
  // For simplicity assume that each directive has 10 vars.
  // We need to offset 1 for template, and 1 for expando.
  return HEADER_OFFSET + (index + 2) * 10;
}

function getTDataIndexFromDirectiveIndex(index: number) {
  return HEADER_OFFSET + index + 10;  // offset to give template bindings space.
}

function expectTStylingKeys(styling: 'style'|'class') {
  const tNode = getTNode();
  const tData = getTData();
  const isClassBased = styling === 'class';
  const headIndex = getTStylingRangePrev(isClassBased ? tNode.classBindings : tNode.styleBindings);
  const tStylingKeys: (string|(null | string)[]|null)[] = [];
  let index = headIndex;
  let prevIndex = index;
  // rewind to beginning of list.
  while ((prevIndex = getTStylingRangePrev(tData[index + 1] as TStylingRange)) !== 0) {
    index = prevIndex;
  }

  // insert into array.
  while (index !== 0) {
    const tStylingKey = tData[index] as TStylingKey;
    const prevDup = getTStylingRangePrevDuplicate(tData[index + 1] as TStylingRange);
    const nextDup = getTStylingRangeNextDuplicate(tData[index + 1] as TStylingRange);
    tStylingKeys.push(tStylingKey as string[] | string | null);
    tStylingKeys.push(prevDup ? (nextDup ? 'both' : 'prev') : (nextDup ? 'next' : ''));
    index = getTStylingRangeNext(tData[index + 1] as TStylingRange);
  }
  tStylingKeys.push(
      (isClassBased ? tNode.residualClasses : tNode.residualStyles) as null | string[]);

  return expect(tStylingKeys);
}
