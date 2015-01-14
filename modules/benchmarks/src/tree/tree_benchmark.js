import {Parser, Lexer, ChangeDetector} from 'change_detection/change_detection';

import {bootstrap, Component, Template, TemplateConfig, ViewPort, Compiler} from 'core/core';

import {CompilerCache} from 'core/compiler/compiler';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';
import {TemplateLoader} from 'core/compiler/template_loader';
import {LifeCycle} from 'core/life_cycle/life_cycle';

import {reflector} from 'reflection/reflection';
import {DOM, document, window, Element, gc} from 'facade/dom';
import {isPresent} from 'facade/lang';

var MAX_DEPTH = 9;

function setupReflector() {
  // TODO: Put the general calls to reflector.register... in a shared file
  // as they are needed in all benchmarks...

  reflector.registerType(AppComponent, {
    'factory': () => new AppComponent(),
    'parameters': [],
    'annotations' : [new Component({
      selector: 'app',
      template: new TemplateConfig({
        directives: [TreeComponent],
        inline: `<tree [data]='initData'></tree>`
      })
    })]
  });

  reflector.registerType(TreeComponent, {
    'factory': () => new TreeComponent(),
    'parameters': [],
    'annotations' : [new Component({
      selector: 'tree',
      bind: {
        'data': 'data'
      },
      template: new TemplateConfig({
          directives: [TreeComponent, NgIf],
          inline: `
    <span> {{data.value}}
       <span template='ng-if data.right != null'><tree [data]='data.right'></tree></span>
       <span template='ng-if data.left != null'><tree [data]='data.left'></tree></span>
    </span>`
      })
    })]
  });

  reflector.registerType(NgIf, {
    'factory': (vp) => new NgIf(vp),
    'parameters': [[ViewPort]],
    'annotations' : [new Template({
      selector: '[ng-if]',
      bind: {
        'ng-if': 'ngIf'
      }
    })]
  });

  reflector.registerType(Compiler, {
    'factory': (templateLoader, reader, parser, compilerCache) => new Compiler(templateLoader, reader, parser, compilerCache),
    'parameters': [[TemplateLoader], [DirectiveMetadataReader], [Parser], [CompilerCache]],
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
    'factory': () => new TemplateLoader(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(DirectiveMetadataReader, {
    'factory': () => new DirectiveMetadataReader(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(Lexer, {
    'factory': () => new Lexer(),
    'parameters': [],
    'annotations': []
  });

  reflector.registerType(LifeCycle, {
    "factory": (cd) => new LifeCycle(cd),
    "parameters": [[ChangeDetector]],
    "annotations": []
  });


  reflector.registerGetters({
    'value': (a) => a.value,
    'left': (a) => a.left,
    'right': (a) => a.right,
    'initData': (a) => a.initData,
    'data': (a) => a.data
  });

  reflector.registerSetters({
    'value': (a,v) => a.value = v,
    'left': (a,v) => a.left = v,
    'right': (a,v) => a.right = v,
    'initData': (a,v) => a.initData = v,
    'data': (a,v) => a.data = v,
    'ngIf': (a,v) => a.ngIf = v
  });
}

export function main() {
  setupReflector();

  var app;
  var changeDetector;
  var baselineRootTreeComponent;
  var count = 0;

  function ng2DestroyDom(_) {
    // TODO: We need an initial value as otherwise the getter for data.value will fail
    // --> this should be already caught in change detection!
    app.initData = new TreeNode('', null, null);
    changeDetector.detectChanges();
  }

  function profile(create, destroy, name) {
    return function(_) {
      window.console.profile(name + ' w GC');
      var duration = 0;
      var count = 0;
      while(count++ < 150) {
        gc();
        var start = window.performance.now();
        create(_);
        duration += window.performance.now() - start;
        destroy(_);
      }
      window.console.profileEnd(name + ' w GC');
      window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);

      window.console.profile(name + ' w/o GC');
      duration = 0;
      count = 0;
      while(count++ < 150) {
        var start = window.performance.now();
        create(_);
        duration += window.performance.now() - start;
        destroy(_);
      }
      window.console.profileEnd(name + ' w/o GC');
      window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);
    };
  }

  function ng2CreateDom(_) {
    var values = count++ % 2 == 0 ?
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '-'];

    app.initData = buildTree(MAX_DEPTH, values, 0);
    changeDetector.detectChanges();
  }

  function noop() {}

  function initNg2() {
    bootstrap(AppComponent).then((injector) => {
      changeDetector = injector.get(ChangeDetector);
      app = injector.get(AppComponent);
      DOM.on(DOM.querySelector(document, '#ng2DestroyDom'), 'click', ng2DestroyDom);
      DOM.on(DOM.querySelector(document, '#ng2CreateDom'), 'click', ng2CreateDom);
      DOM.on(DOM.querySelector(document, '#ng2UpdateDomProfile'), 'click', profile(ng2CreateDom, noop, 'ng2-update'));
      DOM.on(DOM.querySelector(document, '#ng2CreateDomProfile'), 'click', profile(ng2CreateDom, ng2DestroyDom, 'ng2-create'));
    });
  }

  function baselineDestroyDom(_) {
    baselineRootTreeComponent.update(new TreeNode('', null, null));
  }

  function baselineCreateDom(_) {
    var values = count++ % 2 == 0 ?
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '-'];

    baselineRootTreeComponent.update(buildTree(MAX_DEPTH, values, 0));
  }

  function initBaseline() {
    var tree = DOM.createElement('tree');
    DOM.appendChild(DOM.querySelector(document, 'baseline'), tree);
    baselineRootTreeComponent = new BaseLineTreeComponent(tree);
    DOM.on(DOM.querySelector(document, '#baselineDestroyDom'), 'click', baselineDestroyDom);
    DOM.on(DOM.querySelector(document, '#baselineCreateDom'), 'click', baselineCreateDom);
    DOM.on(DOM.querySelector(document, '#baselineUpdateDomProfile'), 'click', profile(baselineCreateDom, noop, 'baseline-update'));
    DOM.on(DOM.querySelector(document, '#baselineCreateDomProfile'), 'click', profile(baselineCreateDom, baselineDestroyDom, 'baseline-create'));
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
    '<span template="ng-if"><tree></tree></span>');
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
        this.component.element.remove();
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

// TODO: Move this into a reusable directive in the 'core' module!
class NgIf {
  _viewPort:ViewPort;
  constructor(viewPort:ViewPort) {
    this._viewPort = viewPort;
  }
  set ngIf(value:boolean) {
    if (this._viewPort.length > 0) {
      this._viewPort.remove(0);
    }
    if (value) {
      this._viewPort.create();
    }
  }
}

class TreeComponent {
  data:TreeNode;
}

