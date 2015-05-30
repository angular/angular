import {bootstrap, Compiler, Component, Directive, View, ViewContainerRef} from 'angular2/angular2';

import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';
import {window, document, gc} from 'angular2/src/facade/browser';
import {
  getIntParameter,
  getStringParameter,
  bindAction,
  windowProfile,
  windowProfileEnd
} from 'angular2/src/test_lib/benchmark_util';
import {NgIf} from 'angular2/directives';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';
import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {bind, Binding} from 'angular2/di';

function createBindings(): List<Binding> {
  var viewCacheCapacity = getStringParameter('viewcache') == 'true' ? 10000 : 1;
  return [bind(APP_VIEW_POOL_CAPACITY).toValue(viewCacheCapacity)];
}

function setupReflector() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
}

var BASELINE_TREE_TEMPLATE;
var BASELINE_IF_TEMPLATE;

export function main() {
  BrowserDomAdapter.makeCurrent();
  var maxDepth = getIntParameter('depth');

  setupReflector();

  BASELINE_TREE_TEMPLATE = DOM.createTemplate(
      '<span>_<template class="ng-binding"></template><template class="ng-binding"></template></span>');
  BASELINE_IF_TEMPLATE = DOM.createTemplate('<span template="if"><tree></tree></span>');

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
      windowProfile(name + ' w GC');
      var duration = 0;
      var count = 0;
      while (count++ < 150) {
        gc();
        var start = window.performance.now();
        create();
        duration += window.performance.now() - start;
        destroy();
      }
      windowProfileEnd(name + ' w GC');
      window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);

      windowProfile(name + ' w/o GC');
      duration = 0;
      count = 0;
      while (count++ < 150) {
        var start = window.performance.now();
        create();
        duration += window.performance.now() - start;
        destroy();
      }
      windowProfileEnd(name + ' w/o GC');
      window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);
    };
  }

  function ng2CreateDom() {
    var values = count++ % 2 == 0 ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
                                    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '-'];

    app.initData = buildTree(maxDepth, values, 0);
    lifeCycle.tick();
  }

  function noop() {}

  function initNg2() {
    bootstrap(AppComponent, createBindings())
        .then((ref) => {
          var injector = ref.injector;
          lifeCycle = injector.get(LifeCycle);

          app = injector.get(AppComponent);
          bindAction('#ng2DestroyDom', ng2DestroyDom);
          bindAction('#ng2CreateDom', ng2CreateDom);
          bindAction('#ng2UpdateDomProfile', profile(ng2CreateDom, noop, 'ng2-update'));
          bindAction('#ng2CreateDomProfile', profile(ng2CreateDom, ng2DestroyDom, 'ng2-create'));
        });
  }

  function baselineDestroyDom() { baselineRootTreeComponent.update(new TreeNode('', null, null)); }

  function baselineCreateDom() {
    var values = count++ % 2 == 0 ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
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
    bindAction('#baselineCreateDomProfile',
               profile(baselineCreateDom, baselineDestroyDom, 'baseline-create'));
  }

  initNg2();
  initBaseline();
}

class TreeNode {
  value: string;
  left: TreeNode;
  right: TreeNode;
  constructor(value, left, right) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function buildTree(maxDepth, values, curDepth) {
  if (maxDepth === curDepth) return new TreeNode('', null, null);
  return new TreeNode(values[curDepth], buildTree(maxDepth, values, curDepth + 1),
                      buildTree(maxDepth, values, curDepth + 1));
}

// http://jsperf.com/nextsibling-vs-childnodes

class BaseLineTreeComponent {
  element;
  value: BaseLineInterpolation;
  left: BaseLineIf;
  right: BaseLineIf;
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
  update(value: TreeNode) {
    this.value.update(value.value);
    this.left.update(value.left);
    this.right.update(value.right);
  }
}

class BaseLineInterpolation {
  value: string;
  textNode;
  constructor(textNode) {
    this.value = null;
    this.textNode = textNode;
  }
  update(value: string) {
    if (this.value !== value) {
      this.value = value;
      DOM.setText(this.textNode, value + ' ');
    }
  }
}

class BaseLineIf {
  condition: boolean;
  component: BaseLineTreeComponent;
  anchor;
  constructor(anchor) {
    this.anchor = anchor;
    this.condition = false;
    this.component = null;
  }
  update(value: TreeNode) {
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

@Component({selector: 'tree', properties: ['data']})
@View({
  directives: [TreeComponent, NgIf],
  template:
      `<span> {{data.value}} <span template='ng-if data.right != null'><tree [data]='data.right'></tree></span><span template='ng-if data.left != null'><tree [data]='data.left'></tree></span></span>`
})
class TreeComponent {
  data: TreeNode;
}

@Component({selector: 'app'})
@View({directives: [TreeComponent], template: `<tree [data]='initData'></tree>`})
class AppComponent {
  initData: TreeNode;
  constructor() {
    // TODO: We need an initial value as otherwise the getter for data.value will fail
    // --> this should be already caught in change detection!
    this.initData = new TreeNode('', null, null);
  }
}
