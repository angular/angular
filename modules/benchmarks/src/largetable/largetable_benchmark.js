import {Parser, Lexer, ChangeDetector, ChangeDetection, jitChangeDetection}
from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';

import {bootstrap, Component, Viewport, View, ViewContainer, Compiler, NgElement, Decorator} from 'angular2/angular2';

import {CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {NativeShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy';
import {EmulatedUnscopedShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';

import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent, BaseException} from 'angular2/src/facade/lang';
import {window, document, gc} from 'angular2/src/facade/browser';
import {getIntParameter, getStringParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';

import {XHR} from 'angular2/src/services/xhr';
import {XHRImpl} from 'angular2/src/services/xhr_impl';

import {If, For, Switch, SwitchWhen, SwitchDefault} from 'angular2/directives';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

import {EventManager} from 'angular2/src/render/dom/events/event_manager';

import {ListWrapper} from 'angular2/src/facade/collection';
import {Parent} from 'angular2/src/core/annotations/visibility';

import {ViewFactory, VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_factory';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {Renderer} from 'angular2/src/render/api';
import {DirectDomRenderer} from 'angular2/src/render/dom/direct_dom_renderer';
import * as rc from 'angular2/src/render/dom/compiler/compiler';
import * as rvf from 'angular2/src/render/dom/view/view_factory';
import {Inject, bind} from 'angular2/di';

export const BENCHMARK_TYPE = 'LargetableComponent.benchmarkType';
export const LARGETABLE_ROWS = 'LargetableComponent.rows';
export const LARGETABLE_COLS = 'LargetableComponent.cols';
function _createBindings() {
  return [
    bind(BENCHMARK_TYPE).toValue(getStringParameter('benchmarkType')),
    bind(LARGETABLE_ROWS).toValue(getIntParameter('rows')),
    bind(LARGETABLE_COLS).toValue(getIntParameter('columns'))
  ];
}

var BASELINE_LARGETABLE_TEMPLATE;

function setupReflector() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();

  // TODO(kegluneq): Generate these.
  reflector.registerGetters({
    'benchmarktype': (o) => o.benchmarktype,
    'switch': (o) => null,
    'switchWhen': (o) => o.switchWhen
  });
  reflector.registerSetters({
    'benchmarktype': (o, v) => o.benchmarktype = v,
    'switch': (o, v) => null,
    'switchWhen': (o, v) => o.switchWhen = v
  });
}

export function main() {
  BrowserDomAdapter.makeCurrent();
  var totalRows = getIntParameter('rows');
  var totalColumns = getIntParameter('columns');
  BASELINE_LARGETABLE_TEMPLATE = DOM.createTemplate(
      '<table></table>');

  setupReflector();

  var app;
  var lifecycle;
  var baselineRootLargetableComponent;
  var count = 0;

  function ng2DestroyDom() {
    // TODO: We need an initial value as otherwise the getter for data.value will fail
    // --> this should be already caught in change detection!
    app.data = null;
    app.benchmarkType = 'none';
    lifecycle.tick();
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
    var data = ListWrapper.createFixedSize(totalRows);

    for (var i=0; i<totalRows; i++) {
      data[i] = ListWrapper.createFixedSize(totalColumns);
      for (var j=0; j<totalColumns; j++) {
        data[i][j] = new CellData(i,j);
      }
    }
    app.data = data;
    app.benchmarkType = getStringParameter('benchmarkType');
    lifecycle.tick();
  }

  function noop() {}

  function initNg2() {
    bootstrap(AppComponent, _createBindings()).then((ref) => {
      var injector = ref.injector;
      app = injector.get(AppComponent);
      lifecycle = injector.get(LifeCycle);
      bindAction('#ng2DestroyDom', ng2DestroyDom);
      bindAction('#ng2CreateDom', ng2CreateDom);
      bindAction('#ng2UpdateDomProfile', profile(ng2CreateDom, noop, 'ng2-update'));
      bindAction('#ng2CreateDomProfile', profile(ng2CreateDom, ng2DestroyDom, 'ng2-create'));
    });
  }

  function baselineDestroyDom() {
    baselineRootLargetableComponent.update(buildTable(0, 0));
  }

  function baselineCreateDom() {
    baselineRootLargetableComponent.update(buildTable(totalRows, totalColumns));
  }

  function initBaseline() {

    baselineRootLargetableComponent = new BaseLineLargetableComponent(
        DOM.querySelector(document, 'baseline'), getStringParameter('benchmarkType'),
        getIntParameter('rows'), getIntParameter('columns'));

    bindAction('#baselineDestroyDom', baselineDestroyDom);
    bindAction('#baselineCreateDom', baselineCreateDom);

    bindAction('#baselineUpdateDomProfile', profile(baselineCreateDom, noop, 'baseline-update'));
    bindAction('#baselineCreateDomProfile', profile(baselineCreateDom, baselineDestroyDom, 'baseline-create'));
  }

  initNg2();
  initBaseline();
}

function buildTable(rows, columns) {
  var tbody = DOM.createElement('tbody');
  var template = DOM.createElement('span');
  var i,j,row,cell;
  DOM.appendChild(template, DOM.createElement('span'));
  DOM.appendChild(template, DOM.createTextNode(':'));
  DOM.appendChild(template, DOM.createElement('span'));
  DOM.appendChild(template, DOM.createTextNode('|'));

  for (i = 0; i < rows; i++) {
    row = DOM.createElement('div');
    DOM.appendChild(tbody, row);
    for (j = 0; j < columns; j++) {
      cell = DOM.clone(template);
      DOM.appendChild(row, cell);
      DOM.setText(cell.childNodes[0], i.toString());
      DOM.setText(cell.childNodes[2], j.toString());
    }
  }

  return tbody;
}

class BaseLineLargetableComponent {
  element;
  table;
  benchmarkType:string;
  rows:number;
  columns:number;
  constructor(element,benchmarkType,rows:number,columns:number) {
    this.element = element;
    this.benchmarkType = benchmarkType;
    this.rows = rows;
    this.columns = columns;
    this.table = DOM.clone(BASELINE_LARGETABLE_TEMPLATE.content.firstChild);
    var shadowRoot = DOM.createShadowRoot(this.element)
    DOM.appendChild(shadowRoot, this.table);
  }
  update(tbody) {
    var oldBody = DOM.querySelector(this.table, 'tbody');
    if (oldBody != null) {
      DOM.replaceChild(this.table, tbody, oldBody);
    } else {
      DOM.appendChild(this.table, tbody);
    }
  }
}

class CellData {
  i:number;
  j:number;
  constructor(i,j) {
    this.i = i;
    this.j = j;
  }

  jFn () {
    return this.j;
  }

  iFn () {
    return this.i;
  }
}

@Component({
  selector: 'app'
})
@View({
  directives: [LargetableComponent],
  template: `<largetable [data]='data' [benchmarkType]='benchmarkType'></largetable>`
})
class AppComponent {
  data;
  benchmarkType:string;
}

@Component({
  selector: 'largetable',
  properties: {
      'data': 'data',
      'benchmarkType': 'benchmarktype'
  }
})
@View({
  directives: [For, Switch, SwitchWhen, SwitchDefault],
  template: `
      <table [switch]="benchmarkType">
        <tbody template="switch-when 'interpolation'">
          <tr template="for #row of data">
            <td template="for #column of row">
              {{column.i}}:{{column.j}}|
            </td>
          </tr>
        </tbody>
        <tbody template="switch-when 'interpolationAttr'">
          <tr template="for #row of data">
            <td template="for #column of row" i="{{column.i}}" j="{{column.j}}">
              i,j attrs
            </td>
          </tr>
        </tbody>
        <tbody template="switch-when 'interpolationFn'">
          <tr template="for #row of data">
            <td template="for #column of row">
              {{column.iFn()}}:{{column.jFn()}}|
            </td>
          </tr>
        </tbody>
        <tbody template="switch-default">
          <tr>
            <td>
              <em>{{benchmarkType}} not yet implemented</em>
            </td>
          </tr>
        </tbody>
      </table>`
})
class LargetableComponent {
  data;
  benchmarkType:string;
  rows:number;
  columns:number;
  constructor(
      @Inject(BENCHMARK_TYPE) benchmarkType,
      @Inject(LARGETABLE_ROWS) rows,
      @Inject(LARGETABLE_COLS) columns) {
    this.benchmarkType = benchmarkType;
    this.rows = rows;
    this.columns = columns;
  }
}

