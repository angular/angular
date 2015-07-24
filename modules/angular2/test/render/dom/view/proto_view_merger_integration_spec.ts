import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  beforeEachBindings,
  SpyObject,
  stringifyElement
} from 'angular2/test_lib';

import {isPresent} from 'angular2/src/facade/lang';

import {DomTestbed} from '../dom_testbed';

import {
  ViewDefinition,
  DirectiveMetadata,
  RenderProtoViewMergeMapping
} from 'angular2/src/render/api';
import {bind} from 'angular2/di';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {cloneAndQueryProtoView} from 'angular2/src/render/dom/util';
import {resolveInternalDomProtoView} from 'angular2/src/render/dom/view/proto_view';

import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/render/render';

export function main() {
  describe('ProtoViewMerger integration test', () => {
    beforeEachBindings(() => [DomTestbed]);

    describe('component views', () => {
      it('should merge a component view',
         runAndAssert('root', ['a'], ['<root class="ng-binding" idx="0">a</root>']));

      it('should merge component views with interpolation at root level',
         runAndAssert('root', ['{{a}}'], ['<root class="ng-binding" idx="0">{0}</root>']));

      it('should merge component views with interpolation not at root level',
         runAndAssert('root', ['<div>{{a}}</div>'], [
           '<root class="ng-binding" idx="0"><div class="ng-binding" idx="1">{0}</div></root>'
         ]));

      it('should merge component views with bound elements',
         runAndAssert('root', ['<div #a></div>'], [
           '<root class="ng-binding" idx="0"><div #a="" class="ng-binding" idx="1"></div></root>'
         ]));
    });

    describe('embedded views', () => {

      it('should merge embedded views as fragments',
         runAndAssert('root', ['<template>a</template>'], [
           '<root class="ng-binding" idx="0"><template class="ng-binding" idx="1"></template></root>',
           'a'
         ]));

      it('should merge embedded views with interpolation at root level',
         runAndAssert('root', ['<template>{{a}}</template>'], [
           '<root class="ng-binding" idx="0"><template class="ng-binding" idx="1"></template></root>',
           '{0}'
         ]));

      it('should merge embedded views with interpolation not at root level',
         runAndAssert('root', ['<div *ng-if>{{a}}</div>'], [
           '<root class="ng-binding" idx="0"><template class="ng-binding" idx="1" ng-if=""></template></root>',
           '<div *ng-if="" class="ng-binding" idx="2">{0}</div>'
         ]));

      it('should merge embedded views with bound elements',
         runAndAssert('root', ['<div *ng-if #a></div>'], [
           '<root class="ng-binding" idx="0"><template class="ng-binding" idx="1" ng-if=""></template></root>',
           '<div #a="" *ng-if="" class="ng-binding" idx="2"></div>'
         ]));

    });

    describe('projection', () => {

      it('should remove text nodes if there is no ng-content',
         runAndAssert(
             'root', ['<a>b</a>', ''],
             ['<root class="ng-binding" idx="0"><a class="ng-binding" idx="1"></a></root>']));

      it('should project static text',
         runAndAssert(
             'root', ['<a>b</a>', 'A(<ng-content></ng-content>)'],
             ['<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A(b)</a></root>']));

      it('should project text interpolation',
         runAndAssert(
             'root', ['<a>{{b}}</a>', 'A(<ng-content></ng-content>)'],
             ['<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A({0})</a></root>']));

      it('should project text interpolation to elements without bindings',
         runAndAssert('root', ['<a>{{b}}</a>', '<div><ng-content></ng-content></div>'], [
           '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1"><div class="ng-binding">{0}</div></a></root>'
         ]));

      it('should project elements',
         runAndAssert('root', ['<a><div></div></a>', 'A(<ng-content></ng-content>)'], [
           '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A(<div></div>)</a></root>'
         ]));

      it('should project elements using the selector',
         runAndAssert(
             'root',
             [
               '<a><div class="x">a</div><span></span><div class="x">b</div></a>',
               'A(<ng-content select=".x"></ng-content>)'
             ],
             [
               '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A(<div class="x">a</div><div class="x">b</div>)</a></root>'
             ]));

      it('should reproject',
         runAndAssert(
             'root',
             ['<a>x</a>', 'A(<b><ng-content></ng-content></b>)', 'B(<ng-content></ng-content>)'], [
               '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A(<b class="ng-binding" idx="2">B(x)</b>)</a></root>'
             ]));

      it('should reproject by combining selectors',
         runAndAssert(
             'root',
             [
               '<a><div class="x"></div><div class="x y"></div><div class="y"></div></a>',
               'A(<b><ng-content select=".x"></ng-content></b>)',
               'B(<ng-content select=".y"></ng-content>)'
             ],
             [
               '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A(<b class="ng-binding" idx="2">B(<div class="x y"></div>)</b>)</a></root>'
             ]));

      it('should keep non projected embedded views as fragments (so that they can be moved manually)',
         runAndAssert(
             'root', ['<a><template class="x">b</template></a>', ''],
             ['<root class="ng-binding" idx="0"><a class="ng-binding" idx="1"></a></root>', 'b']));

      it('should project embedded views and match the template element',
         runAndAssert(
             'root', ['<a><template class="x">b</template></a>', 'A(<ng-content></ng-content>)'], [
               '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A(<template class="x ng-binding" idx="2"></template>)</a></root>',
               'b'
             ]));

      it('should project nodes using the ng-content in embedded views',
         runAndAssert('root', ['<a>b</a>', 'A(<ng-content *ng-if></ng-content>)'], [
           '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A(<template class="ng-binding" idx="2" ng-if=""></template>)</a></root>',
           'b'
         ]));

      it('should allow to use wildcard selector after embedded view with non wildcard selector',
         runAndAssert(
             'root',
             [
               '<a><div class="x">a</div>b</a>',
               'A(<ng-content select=".x" *ng-if></ng-content>, <ng-content></ng-content>)'
             ],
             [
               '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">A(<template class="ng-binding" idx="2" ng-if=""></template>, b)</a></root>',
               '<div class="x">a</div>'
             ]));

    });

    describe('composition', () => {
      it('should merge multiple component views',
         runAndAssert('root', ['<a></a><b></b>', 'c', 'd'], [
           '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">c</a><b class="ng-binding" idx="2">d</b></root>'
         ]));

      it('should merge multiple embedded views as fragments',
         runAndAssert('root', ['<div *ng-if></div><span *ng-for></span>'], [
           '<root class="ng-binding" idx="0"><template class="ng-binding" idx="1" ng-if=""></template><template class="ng-binding" idx="2" ng-for=""></template></root>',
           '<div *ng-if=""></div>',
           '<span *ng-for=""></span>'
         ]));

      it('should merge nested embedded views as fragments',
         runAndAssert('root', ['<div *ng-if><span *ng-for></span></div>'], [
           '<root class="ng-binding" idx="0"><template class="ng-binding" idx="1" ng-if=""></template></root>',
           '<div *ng-if=""><template class="ng-binding" idx="2" ng-for=""></template></div>',
           '<span *ng-for=""></span>'
         ]));

    });

    describe('element index mapping should be grouped by view and view depth first', () => {

      it('should map component views correctly',
         runAndAssert('root', ['<a></a><b></b>', '<c></c>'], [
           '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1"><c class="ng-binding" idx="3"></c></a><b class="ng-binding" idx="2"></b></root>'
         ]));

      it('should map moved projected elements correctly',
         runAndAssert(
             'root',
             [
               '<a><b></b><c></c></a>',
               '<ng-content select="c"></ng-content><ng-content select="b"></ng-content>'
             ],
             [
               '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1"><c class="ng-binding" idx="3"></c><b class="ng-binding" idx="2"></b></a></root>'
             ]));

    });

    describe('text index mapping should be grouped by view and view depth first', () => {

      it('should map component views correctly', runAndAssert('root', ['<a></a>{{b}}', '{{c}}'], [
           '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1">{1}</a>{0}</root>'
         ]));

      it('should map moved projected elements correctly',
         runAndAssert(
             'root',
             [
               '<a><div x>{{x}}</div><div y>{{y}}</div></a>',
               '<ng-content select="[y]"></ng-content><ng-content select="[x]"></ng-content>'
             ],
             [
               '<root class="ng-binding" idx="0"><a class="ng-binding" idx="1"><div class="ng-binding" idx="3" y="">{1}</div><div class="ng-binding" idx="2" x="">{0}</div></a></root>'
             ]));

    });

    describe('native shadow dom support', () => {
      beforeEachBindings(
          () => { return [bind(ShadowDomStrategy).toValue(new NativeShadowDomStrategy())]; });

      it('should keep the non projected light dom and wrap the component view into a shadow-root element',
         runAndAssert('root', ['<a>b</a>', 'c'], [
           '<root class="ng-binding" idx="0"><shadow-root><a class="ng-binding" idx="1"><shadow-root>c</shadow-root>b</a></shadow-root></root>'
         ]));

    });

  });
}

function runAndAssert(hostElementName: string, componentTemplates: string[],
                      expectedFragments: string[]) {
  var rootComp = DirectiveMetadata.create(
      {id: 'rootComp', type: DirectiveMetadata.COMPONENT_TYPE, selector: hostElementName});
  return inject([AsyncTestCompleter, DomTestbed], (async, tb: DomTestbed) => {
    tb.compileAndMerge(rootComp, componentTemplates.map(template => new ViewDefinition({
                                                          componentId: 'someComp',
                                                          template: template,
                                                          directives: [aComp, bComp, cComp]
                                                        })))
        .then((mergeMappings) => {
          expect(stringify(mergeMappings)).toEqual(expectedFragments);
          async.done();
        });
  });
}

function stringify(protoViewMergeMapping: RenderProtoViewMergeMapping): string[] {
  var testView = cloneAndQueryProtoView(
      resolveInternalDomProtoView(protoViewMergeMapping.mergedProtoViewRef), false);
  for (var i = 0; i < protoViewMergeMapping.mappedElementIndices.length; i++) {
    var renderElIdx = protoViewMergeMapping.mappedElementIndices[i];
    if (isPresent(renderElIdx)) {
      DOM.setAttribute(testView.boundElements[renderElIdx], 'idx', `${i}`);
    }
  }
  for (var i = 0; i < protoViewMergeMapping.mappedTextIndices.length; i++) {
    var renderTextIdx = protoViewMergeMapping.mappedTextIndices[i];
    if (isPresent(renderTextIdx)) {
      DOM.setText(testView.boundTextNodes[renderTextIdx], `{${i}}`);
    }
  }
  expect(protoViewMergeMapping.fragmentCount).toEqual(testView.fragments.length);
  return testView.fragments.map(nodes => nodes.map(node => stringifyElement(node)).join(''));
}

var aComp =
    DirectiveMetadata.create({id: 'aComp', type: DirectiveMetadata.COMPONENT_TYPE, selector: 'a'});
var bComp =
    DirectiveMetadata.create({id: 'bComp', type: DirectiveMetadata.COMPONENT_TYPE, selector: 'b'});
var cComp =
    DirectiveMetadata.create({id: 'cComp', type: DirectiveMetadata.COMPONENT_TYPE, selector: 'c'});
