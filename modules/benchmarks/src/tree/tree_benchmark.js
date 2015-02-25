import {Parser, Lexer, ChangeDetector, ChangeDetection, jitChangeDetection}
  from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';

import {bootstrap, Component, Viewport, Template, ViewContainer, Compiler} from 'angular2/angular2';

import {CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';

import {reflector} from 'angular2/src/reflection/reflection';
import {DOM, document, window, Element, gc} from 'angular2/src/facade/dom';
import {isPresent} from 'angular2/src/facade/lang';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';

import {XHR} from 'angular2/src/core/compiler/xhr/xhr';
import {XHRImpl} from 'angular2/src/core/compiler/xhr/xhr_impl';

import {If} from 'angular2/directives';

function setupReflector() {
  // TODO: Put the general calls to reflector.register... in a shared file
  // as they are needed in all benchmarks...

  reflector.registerType(AppComponent, {
    'factory': () => new AppComponent(),
    'parameters': [],
    'annotations' : [
      new Component({selector: 'app'}),
      new Template({
        directives: [TreeComponent],
        inline: `<tree [data]='initData'></tree>`
      })]
  });

  reflector.registerType(TreeComponent, {
    'factory': () => new TreeComponent(),
    'parameters': [],
    'annotations' : [
      new Component({
        selector: 'tree',
        bind: {'data': 'data'}
      }),
      new Template({
        directives: [TreeComponent, If],
        inline: `<span> {{data.value}} <span template='if data.right != null'><tree [data]='data.right'></tree></span><span template='if data.left != null'><tree [data]='data.left'></tree></span></span>`
      })]
  });

  reflector.registerType(If, {
    'factory': (vp) => new If(vp),
    'parameters': [[ViewContainer]],
    'annotations' : [new Viewport({
      selector: '[if]',
      bind: {
        'condition': 'if'
      }
    })]
  });

  reflector.registerType(Compiler, {
    'factory': (cd, templateLoader, reader, parser, compilerCache, strategy, resolver) =>
      new Compiler(cd, templateLoader, reader, parser, compilerCache, strategy, resolver),
    'parameters': [[ChangeDetection], [TemplateLoader], [DirectiveMetadataReader],
                   [Parser], [CompilerCache], [ShadowDomStrategy], [TemplateResolver]],
    'annotations': []
  });

  reflector.registerType(CompilerCache, {
    'factory': () => new CompilerCache(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(Parser, {
    'factory': (lexer) => new Parser(lexer),
    'parameters': [[Lexer]],
    'annotations': []
  });

  reflector.registerType(TemplateLoader, {
    'factory': (xhr) => new TemplateLoader(xhr),
    'parameters': [[XHR]],
    'annotations': []
  });

  reflector.registerType(TemplateResolver, {
    'factory': () => new TemplateResolver(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(XHR, {
    'factory': () => new XHRImpl(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(DirectiveMetadataReader, {
    'factory': () => new DirectiveMetadataReader(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(ShadowDomStrategy, {
    'factory': () => new NativeShadowDomStrategy(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(Lexer, {
    'factory': () => new Lexer(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(ExceptionHandler, {
    "factory": () => new ExceptionHandler(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(LifeCycle, {
    "factory": (exHandler, cd) => new LifeCycle(exHandler, cd),
    "parameters": [[ExceptionHandler], [ChangeDetector]],
    "annotations": []
  });


  reflector.registerGetters({
    'value': (a) => a.value,
    'left': (a) => a.left,
    'right': (a) => a.right,
    'initData': (a) => a.initData,
    'data': (a) => a.data,
    'condition': (a) => a.condition,
  });

  reflector.registerSetters({
    'value': (a,v) => a.value = v,
    'left': (a,v) => a.left = v,
    'right': (a,v) => a.right = v,
    'initData': (a,v) => a.initData = v,
    'data': (a,v) => a.data = v,
    'condition': (a,v) => a.condition = v,
  });
}

export function main() {
 var maxDepth = getIntParameter('depth');

 setupReflector();

  var app;
  var lifeCycle;
  var baselineRootTreeComponent;
  var count = 0;

  function ng2DestroyDom() {
    // TODO: We need an initial value as otherwise the getter for data.value will fail
    // --> this should be already caught in change detection!
    app.initData = new TreeNode('', null, null);
    lifeCycle.tick();
  }

  function profile(create, destroy, name) {
    return function() {
      window.console.profile(name + ' w GC');
      var duration = 0;
      var count = 0;
      while(count++ < 150) {
        gc();
        var start = window.performance.now();
        create();
        duration += window.performance.now() - start;
        destroy();
      }
      window.console.profileEnd(name + ' w GC');
      window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);

      window.console.profile(name + ' w/o GC');
      duration = 0;
      count = 0;
      while(count++ < 150) {
        var start = window.performance.now();
        create();
        duration += window.performance.now() - start;
        destroy();
      }
      window.console.profileEnd(name + ' w/o GC');
      window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);
    };
  }

  function ng2CreateDom() {
    var values = count++ % 2 == 0 ?
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '-'];

    app.initData = buildTree(maxDepth, values, 0);
    lifeCycle.tick();
  }

  function noop() {}

  function initNg2() {
    bootstrap(AppComponent).then((injector) => {
      lifeCycle = injector.get(LifeCycle);

      app = injector.get(AppComponent);
      bindAction('#ng2DestroyDom', ng2DestroyDom);
      bindAction('#ng2CreateDom', ng2CreateDom);
      bindAction('#ng2UpdateDomProfile', profile(ng2CreateDom, noop, 'ng2-update'));
      bindAction('#ng2CreateDomProfile', profile(ng2CreateDom, ng2DestroyDom, 'ng2-create'));
    });
  }

  function baselineDestroyDom() {
    baselineRootTreeComponent.update(new TreeNode('', null, null));
  }

  function baselineCreateDom() {
    var values = count++ % 2 == 0 ?
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '-'];

    baselineRootTreeComponent.update(buildTree(maxDepth, values, 0));
  }

  function initBaseline() {
    var tree = DOM.createElement('tree');
    DOM.appendChild(DOM.querySelector(document, 'baseline'), tree);
    baselineRootTreeComponent = new BaseLineTreeComponent(tree);

    bindAction('#baselineDestroyDom', baselineDestroyDom);
    bindAction('#baselineCreateDom', baselineCreateDom);

    bindAction('#baselineUpdateDomProfile', profile(baselineCreateDom, noop, 'baseline-update'));
    bindAction('#baselineCreateDomProfile', profile(baselineCreateDom, baselineDestroyDom, 'baseline-create'));
  }

  initNg2();
  initBaseline();
}

class TreeNode {
  value:string;
  left:TreeNode;
  right:TreeNode;
  constructor(value, left, right) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function buildTree(maxDepth, values, curDepth) {
  if (maxDepth === curDepth) return new TreeNode('', null, null);
  return new TreeNode(
      values[curDepth],
      buildTree(maxDepth, values, curDepth+1),
      buildTree(maxDepth, values, curDepth+1));
}

var BASELINE_TREE_TEMPLATE = DOM.createTemplate(
    '<span>_<template class="ng-binding"></template><template class="ng-binding"></template></span>');
var BASELINE_IF_TEMPLATE = DOM.createTemplate(
    '<span template="if"><tree></tree></span>');
// http://jsperf.com/nextsibling-vs-childnodes

class BaseLineTreeComponent {
  element:Element;
  value:BaseLineInterpolation;
  left:BaseLineIf;
  right:BaseLineIf;
  constructor(element) {
    this.element = element;
    var clone = DOM.clone(BASELINE_TREE_TEMPLATE.content.firstChild);
    var shadowRoot = this.element.createShadowRoot();
    DOM.appendChild(shadowRoot, clone);

    var child = clone.firstChild;
    this.value = new BaseLineInterpolation(child);
    child = DOM.nextSibling(child);
    this.left = new BaseLineIf(child);
    child = DOM.nextSibling(child);
    this.right = new BaseLineIf(child);
  }
  update(value:TreeNode) {
    this.value.update(value.value);
    this.left.update(value.left);
    this.right.update(value.right);
  }
}

class BaseLineInterpolation {
  value:string;
  textNode;
  constructor(textNode) {
    this.value = null;
    this.textNode = textNode;
  }
  update(value:string) {
    if (this.value !== value) {
      this.value = value;
      DOM.setText(this.textNode, value + ' ');
    }
  }
}

class BaseLineIf {
  condition:boolean;
  component:BaseLineTreeComponent;
  anchor:Element;
  constructor(anchor) {
    this.anchor = anchor;
    this.condition = false;
    this.component = null;
  }
  update(value:TreeNode) {
    var newCondition = isPresent(value);
    if (this.condition !== newCondition) {
      this.condition = newCondition;
      if (isPresent(this.component)) {
        DOM.remove(this.component.element);
        this.component = null;
      }
      if (this.condition) {
        var element = DOM.firstChild(DOM.clone(BASELINE_IF_TEMPLATE).content);
        this.anchor.parentNode.insertBefore(element, DOM.nextSibling(this.anchor));
        this.component = new BaseLineTreeComponent(DOM.firstChild(element));
      }
    }
    if (isPresent(this.component)) {
      this.component.update(value);
    }
  }
}

class AppComponent {
  initData:TreeNode;
  constructor() {
    // TODO: We need an initial value as otherwise the getter for data.value will fail
    // --> this should be already caught in change detection!
    this.initData = new TreeNode('', null, null);
  }
}

class TreeComponent {
  data:TreeNode;
}

