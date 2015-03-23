import {Parser, Lexer, ChangeDetector, ChangeDetection, jitChangeDetection}
from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';

import {bootstrap, Component, Viewport, Template, ViewContainer, Compiler, NgElement, Decorator} from 'angular2/angular2';

import {CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {ShadowDomStrategy, NativeShadowDomStrategy, EmulatedUnscopedShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {Content} from 'angular2/src/core/compiler/shadow_dom_emulation/content_tag';
import {DestinationLightDom} from 'angular2/src/core/compiler/shadow_dom_emulation/light_dom';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {StyleUrlResolver} from 'angular2/src/core/compiler/style_url_resolver';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {StyleInliner} from 'angular2/src/core/compiler/style_inliner';
import {CssProcessor} from 'angular2/src/core/compiler/css_processor';
import {PrivateComponentLoader} from 'angular2/src/core/compiler/private_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';

import {reflector} from 'angular2/src/reflection/reflection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent, BaseException} from 'angular2/src/facade/lang';
import {window, document, gc} from 'angular2/src/facade/browser';
import {getIntParameter, getStringParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';

import {XHR} from 'angular2/src/core/compiler/xhr/xhr';
import {XHRImpl} from 'angular2/src/core/compiler/xhr/xhr_impl';

import {If, For, Switch, SwitchWhen, SwitchDefault} from 'angular2/directives';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

import {EventManager} from 'angular2/src/core/events/event_manager';

import {ListWrapper} from 'angular2/src/facade/collection';
import {Parent} from 'angular2/src/core/annotations/visibility';

var BASELINE_LARGETABLE_TEMPLATE;

function setupReflector() {
  // TODO: Put the general calls to reflector.register... in a shared file
  // as they are needed in all benchmarks...

  reflector.registerType(AppComponent, {
    'factory': () => new AppComponent(),
    'parameters': [],
    'annotations': [
        new Component({
            selector: 'app'

        }),
        new Template({
            directives: [LargetableComponent],
            inline: `<largetable [data]='data' [benchmarkType]='benchmarkType'></largetable>`
        })]
  });

  reflector.registerType(LargetableComponent, {
    'factory': () => new LargetableComponent(getStringParameter('benchmarkType'),
        getIntParameter('rows'), getIntParameter('columns')),
    'parameters': [],
    'annotations': [
        new Component({
            selector: 'largetable',
            bind: {
                'data': 'data',
                'benchmarkType': 'benchmarktype'
              }
        }),
        new Template({
            directives: [For, Switch, SwitchWhen, SwitchDefault],
            inline: `
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
    ]
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

  reflector.registerType(For, {
    'factory': (vp) => new For(vp),
    'parameters': [[ViewContainer]],
    'annotations' : [new Viewport({
      selector: '[for]',
      bind: {
        'iterableChanges': 'of | iterableDiff'
      }
    })]
  });

  reflector.registerType(Switch, {
    'factory': () => new Switch(),
    'parameters': [],
    'annotations' : [new Decorator({
      selector: '[switch]',
      bind: {
        'value': 'switch'
      }
    })]
  });

  reflector.registerType(SwitchWhen, {
    'factory': (el, vc, ss) => new SwitchWhen(el, vc, ss),
    'parameters': [[NgElement],[ViewContainer],[Switch, new Parent()]],
    'annotations' : [new Viewport({
        selector: '[switch-when]',
        bind: {
          'when': 'switch-when'
        }
      })]
  });

  reflector.registerType(SwitchDefault, {
    'factory': (vc, ss) => new SwitchDefault(vc, ss),
    'parameters': [[ViewContainer],[Switch, new Parent()]],
    'annotations' : [new Viewport({
        selector: '[switch-default]'
      })]
  });

  reflector.registerType(Compiler, {
    'factory': (cd, templateLoader, reader, parser, compilerCache, strategy, tplResolver,
      cmpUrlMapper, urlResolver, cssProcessor) =>
      new Compiler(cd, templateLoader, reader, parser, compilerCache, strategy, tplResolver,
        cmpUrlMapper, urlResolver, cssProcessor),
    'parameters': [[ChangeDetection], [TemplateLoader], [DirectiveMetadataReader],
                   [Parser], [CompilerCache], [ShadowDomStrategy], [TemplateResolver],
                   [ComponentUrlMapper], [UrlResolver], [CssProcessor]],
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
    'factory': (xhr, urlResolver) => new TemplateLoader(xhr, urlResolver),
    'parameters': [[XHR], [UrlResolver]],
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
    "factory": (strategy) => strategy,
    "parameters": [[NativeShadowDomStrategy]],
    "annotations": []
  });

  reflector.registerType(NativeShadowDomStrategy, {
    "factory": (styleUrlResolver) => new NativeShadowDomStrategy(styleUrlResolver),
    "parameters": [[StyleUrlResolver]],
    "annotations": []
  });

  reflector.registerType(EmulatedUnscopedShadowDomStrategy, {
    "factory": (styleUrlResolver) => new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, null),
    "parameters": [[StyleUrlResolver]],
    "annotations": []
  });

  reflector.registerType(StyleUrlResolver, {
    "factory": (urlResolver) => new StyleUrlResolver(urlResolver),
    "parameters": [[UrlResolver]],
    "annotations": []
  });

  reflector.registerType(TestabilityRegistry, {
    "factory": () => new TestabilityRegistry(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(Testability, {
    "factory": () => new Testability(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(Content, {
    "factory": (lightDom, el) => new Content(lightDom, el),
    "parameters": [[DestinationLightDom], [NgElement]],
    "annotations" : [new Decorator({selector: '[content]'})]
  });

  reflector.registerType(UrlResolver, {
    "factory": () => new UrlResolver(),
    "parameters": [],
    "annotations": []
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

  reflector.registerType(ComponentUrlMapper, {
    "factory": () => new ComponentUrlMapper(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(StyleInliner, {
    "factory": (xhr, styleUrlResolver, urlResolver) =>
      new StyleInliner(xhr, styleUrlResolver, urlResolver),
    "parameters": [[XHR], [StyleUrlResolver], [UrlResolver]],
    "annotations": []
  });

  reflector.registerType(CssProcessor, {
    "factory": () => new CssProcessor(null),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(EventManager, {
    "factory": () => new EventManager([], null),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(PrivateComponentLoader, {
    "factory": (compiler, strategy, eventMgr, reader) =>
      new PrivateComponentLoader(compiler, strategy, eventMgr, reader),
    "parameters": [[Compiler], [ShadowDomStrategy], [EventManager], [DirectiveMetadataReader]],
    "annotations": []
  });


  reflector.registerGetters({
    'data': (a) => a.data,
    'benchmarkType': (a) => a.benchmarkType,
    'benchmarktype': (a) => a.benchmarktype,
    'when': (a) => a.when,
    'switchWhen': (a) => a.switchWhen,
    'switchwhen': (a) => a.switchwhen,
    'value': (a) => a.value,
    'iterable': (a) => a.iterable,
    'iterableChanges': (a) => a.iterableChanges,
    'row': (a) => a.row,
    'column': (a) => a.column,
    'i': (a) => a.i,
    'j': (a) => a.j,
    'switch': (a) => {throw new BaseException('not implemented, reserved word in dart')},
    'for': (a) => {throw new BaseException('not implemented, reserved word in dart')},
    'of': (a) => a.of
  });

  reflector.registerMethods({
    'iFn': (a, args) => a.iFn(),
    'jFn': (a, args) => a.jFn(),
  })

  reflector.registerSetters({
    'data': (a,v) => a.data = v,
    'benchmarkType': (a,v) => a.benchmarkType = v,
    'benchmarktype': (a,v) => a.benchmarktype = v,
    'when': (a,v) => a.when = v,
    'switchWhen': (a,v) => a.switchWhen = v,
    'switchwhen': (a,v) => a.switchwhen = v,
    'value': (a,v) => a.value = v,
    'iterable': (a,v) => a.iterable = v,
    'iterableChanges': (a,v) => a.iterableChanges = v,
    'row': (a,v) => a.row = v,
    'column': (a,v) => a.column = v,
    'i': (a,v) => a.i = v,
    'j': (a,v) => a.j = v,
    'switch': (a,v) => {throw new BaseException('not implemented, reserved word in dart')},
    'for': (a,v) => {throw new BaseException('not implemented, reserved word in dart')},
    'of': (a,v) => a.j = v
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
    bootstrap(AppComponent).then((injector) => {
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

class AppComponent {
  data;
  benchmarkType:string;
}

class LargetableComponent {
  data;
  benchmarkType:string;
  rows:number;
  columns:number;
  constructor(benchmarkType:string,rows:number,columns:number) {
    this.benchmarkType = benchmarkType;
    this.rows = rows;
    this.columns = columns;
  }
}

