import {bootstrap, Component, Directive, View} from 'angular2/angular2';

import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';

import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {window, document, gc} from 'angular2/src/facade/browser';
import {
  getIntParameter,
  getStringParameter,
  bindAction,
  windowProfile,
  windowProfileEnd
} from 'angular2/src/test_lib/benchmark_util';

import {NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/directives';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';
import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';

import {ListWrapper} from 'angular2/src/facade/collection';

import {bind} from 'angular2/di';
import {Inject} from 'angular2/src/di/decorators';

export const BENCHMARK_TYPE = 'LargetableComponent.benchmarkType';
export const LARGETABLE_ROWS = 'LargetableComponent.rows';
export const LARGETABLE_COLS = 'LargetableComponent.cols';

function _createBindings() {
  var viewCacheCapacity = getStringParameter('viewcache') == 'true' ? 10000 : 1;
  return [
    bind(BENCHMARK_TYPE)
        .toValue(getStringParameter('benchmarkType')),
    bind(LARGETABLE_ROWS).toValue(getIntParameter('rows')),
    bind(LARGETABLE_COLS).toValue(getIntParameter('columns')),
    bind(APP_VIEW_POOL_CAPACITY).toValue(viewCacheCapacity)
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
  BASELINE_LARGETABLE_TEMPLATE = DOM.createTemplate('<table></table>');

  setupReflector();

  var app;
  var lifecycle;
  var baselineRootLargetableComponent;

  function ng2DestroyDom() {
    // TODO: We need an initial value as otherwise the getter for data.value will fail
    // --> this should be already caught in change detection!
    app.data = null;
    app.benchmarkType = 'none';
    lifecycle.tick();
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
    var data = ListWrapper.createFixedSize(totalRows);

    for (var i = 0; i < totalRows; i++) {
      data[i] = ListWrapper.createFixedSize(totalColumns);
      for (var j = 0; j < totalColumns; j++) {
        data[i][j] = new CellData(i, j);
      }
    }
    app.data = data;
    app.benchmarkType = getStringParameter('benchmarkType');
    lifecycle.tick();
  }

  function noop() {}

  function initNg2() {
    bootstrap(AppComponent, _createBindings())
        .then((ref) => {
          var injector = ref.injector;
          app = injector.get(AppComponent);
          lifecycle = injector.get(LifeCycle);
          bindAction('#ng2DestroyDom', ng2DestroyDom);
          bindAction('#ng2CreateDom', ng2CreateDom);
          bindAction('#ng2UpdateDomProfile', profile(ng2CreateDom, noop, 'ng2-update'));
          bindAction('#ng2CreateDomProfile', profile(ng2CreateDom, ng2DestroyDom, 'ng2-create'));
        });
  }

  function baselineDestroyDom() { baselineRootLargetableComponent.update(buildTable(0, 0)); }

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
    bindAction('#baselineCreateDomProfile',
               profile(baselineCreateDom, baselineDestroyDom, 'baseline-create'));
  }

  initNg2();
  initBaseline();
}

function buildTable(rows, columns) {
  var tbody = DOM.createElement('tbody');
  var template = DOM.createElement('span');
  var i, j, row, cell;
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
  benchmarkType: string;
  rows: number;
  columns: number;
  constructor(element, benchmarkType, rows: number, columns: number) {
    this.element = element;
    this.benchmarkType = benchmarkType;
    this.rows = rows;
    this.columns = columns;
    this.table = DOM.clone(BASELINE_LARGETABLE_TEMPLATE.content.firstChild);
    var shadowRoot = DOM.createShadowRoot(this.element);
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
  i: number;
  j: number;
  constructor(i, j) {
    this.i = i;
    this.j = j;
  }

  jFn() { return this.j; }

  iFn() { return this.i; }
}

@Component({selector: 'largetable', properties: ['data', 'benchmarkType']})
@View({
  directives: [NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault],
  template: `
      <table [ng-switch]="benchmarkType">
        <tbody template="ng-switch-when 'interpolation'">
          <tr template="ng-for #row of data">
            <td template="ng-for #column of row">
              {{column.i}}:{{column.j}}|
            </td>
          </tr>
        </tbody>
        <tbody template="ng-switch-when 'interpolationAttr'">
          <tr template="ng-for #row of data">
            <td template="ng-for #column of row" i="{{column.i}}" j="{{column.j}}">
              i,j attrs
            </td>
          </tr>
        </tbody>
        <tbody template="ng-switch-when 'interpolationFn'">
          <tr template="ng-for #row of data">
            <td template="ng-for #column of row">
              {{column.iFn()}}:{{column.jFn()}}|
            </td>
          </tr>
        </tbody>
        <tbody template="ng-switch-default">
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
  benchmarkType: string;
  rows: number;
  columns: number;
  constructor(@Inject(BENCHMARK_TYPE) benchmarkType, @Inject(LARGETABLE_ROWS) rows,
              @Inject(LARGETABLE_COLS) columns) {
    this.benchmarkType = benchmarkType;
    this.rows = rows;
    this.columns = columns;
  }
}

@Component({selector: 'app'})
@View({
  directives: [LargetableComponent],
  template: `<largetable [data]='data' [benchmarkType]='benchmarkType'></largetable>`
})
class AppComponent {
  data;
  benchmarkType: string;
}
