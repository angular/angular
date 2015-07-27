import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
import {DateWrapper, Type, print} from 'angular2/src/facade/lang';
import {
  NativeShadowDomStrategy
} from 'angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy';

import {
  Parser,
  Lexer,
  DynamicChangeDetection
} from 'angular2/src/change_detection/change_detection';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

import * as viewModule from 'angular2/src/core/annotations_impl/view';
import {Component, Directive, View} from 'angular2/angular2';
import {ViewLoader} from 'angular2/src/render/dom/compiler/view_loader';
import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {AppRootUrl} from 'angular2/src/services/app_root_url';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';

import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';

import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import * as rc from 'angular2/src/render/dom/compiler/compiler';

export function main() {
  BrowserDomAdapter.makeCurrent();
  var count = getIntParameter('elements');

  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var reader = new DirectiveResolver();
  var cache = new CompilerCache();
  var viewResolver = new MultipleViewResolver(
      count, [BenchmarkComponentNoBindings, BenchmarkComponentWithBindings]);
  var urlResolver = new UrlResolver();
  var shadowDomStrategy = new NativeShadowDomStrategy();
  var renderCompiler = new rc.DefaultDomCompiler(new Parser(new Lexer()), shadowDomStrategy,
                                                 new ViewLoader(null, null, null));
  var compiler = new Compiler(reader, cache, viewResolver, new ComponentUrlMapper(), urlResolver,
                              renderCompiler, new ProtoViewFactory(new DynamicChangeDetection()),
                              new AppRootUrl(""));

  function measureWrapper(func, desc) {
    return function() {
      var begin = DateWrapper.now();
      print(`[${desc}] Begin...`);
      var onSuccess = function(_) {
        var elapsedMs = DateWrapper.toMillis(DateWrapper.now()) - DateWrapper.toMillis(begin);
        print(`[${desc}] ...done, took ${elapsedMs} ms`);
      };
      PromiseWrapper.then(func(), onSuccess, null);
    };
  }

  function compileNoBindings() {
    cache.clear();
    return compiler.compileInHost(BenchmarkComponentNoBindings);
  }

  function compileWithBindings() {
    cache.clear();
    return compiler.compileInHost(BenchmarkComponentWithBindings);
  }

  bindAction('#compileNoBindings', measureWrapper(compileNoBindings, 'No Bindings'));
  bindAction('#compileWithBindings', measureWrapper(compileWithBindings, 'With Bindings'));
}

@Directive({selector: '[dir0]', properties: ['prop: attr0']})
class Dir0 {
}

@Directive({selector: '[dir1]', properties: ['prop: attr1']})
class Dir1 {
  constructor(dir0: Dir0) {}
}

@Directive({selector: '[dir2]', properties: ['prop: attr2']})
class Dir2 {
  constructor(dir1: Dir1) {}
}

@Directive({selector: '[dir3]', properties: ['prop: attr3']})
class Dir3 {
  constructor(dir2: Dir2) {}
}

@Directive({selector: '[dir4]', properties: ['prop: attr4']})
class Dir4 {
  constructor(dir3: Dir3) {}
}

class MultipleViewResolver extends ViewResolver {
  _multiple: number;
  _cache: Map<any, any>;

  constructor(multiple: number, components: List<Type>) {
    super();
    this._multiple = multiple;
    this._cache = new Map();
    ListWrapper.forEach(components, (c) => this._warmUp(c));
  }

  _warmUp(component: Type) {
    var view = super.resolve(component);
    var multiplier = ListWrapper.createFixedSize(this._multiple);
    for (var i = 0; i < this._multiple; ++i) {
      multiplier[i] = view.template;
    }
    this._cache.set(component, ListWrapper.join(multiplier, ''));
  }

  resolve(component: Type): viewModule.View {
    var view = super.resolve(component);
    var myView = new viewModule.View(
        {template:<string>this._cache.get(component), directives: view.directives});
    return myView;
  }
}

@Component({selector: 'cmp-nobind'})
@View({
  directives: [Dir0, Dir1, Dir2, Dir3, Dir4],
  template: `
<div class="class0 class1 class2 class3 class4 " nodir0="" attr0="value0" nodir1="" attr1="value1" nodir2="" attr2="value2" nodir3="" attr3="value3" nodir4="" attr4="value4">
  <div class="class0 class1 class2 class3 class4 " nodir0="" attr0="value0" nodir1="" attr1="value1" nodir2="" attr2="value2" nodir3="" attr3="value3" nodir4="" attr4="value4">
    <div class="class0 class1 class2 class3 class4 " nodir0="" attr0="value0" nodir1="" attr1="value1" nodir2="" attr2="value2" nodir3="" attr3="value3" nodir4="" attr4="value4">
      <div class="class0 class1 class2 class3 class4 " nodir0="" attr0="value0" nodir1="" attr1="value1" nodir2="" attr2="value2" nodir3="" attr3="value3" nodir4="" attr4="value4">
        <div class="class0 class1 class2 class3 class4 " nodir0="" attr0="value0" nodir1="" attr1="value1" nodir2="" attr2="value2" nodir3="" attr3="value3" nodir4="" attr4="value4">
        </div>
      </div>
    </div>
  </div>
</div>`
})
class BenchmarkComponentNoBindings {
}

@Component({selector: 'cmp-withbind'})
@View({
  directives: [Dir0, Dir1, Dir2, Dir3, Dir4],
  template: `
<div class="class0 class1 class2 class3 class4 " dir0="" [attr0]="value0" dir1="" [attr1]="value1" dir2="" [attr2]="value2" dir3="" [attr3]="value3" dir4="" [attr4]="value4">
  {{inter0}}{{inter1}}{{inter2}}{{inter3}}{{inter4}}
  <div class="class0 class1 class2 class3 class4 " dir0="" [attr0]="value0" dir1="" [attr1]="value1" dir2="" [attr2]="value2" dir3="" [attr3]="value3" dir4="" [attr4]="value4">
    {{inter0}}{{inter1}}{{inter2}}{{inter3}}{{inter4}}
    <div class="class0 class1 class2 class3 class4 " dir0="" [attr0]="value0" dir1="" [attr1]="value1" dir2="" [attr2]="value2" dir3="" [attr3]="value3" dir4="" [attr4]="value4">
      {{inter0}}{{inter1}}{{inter2}}{{inter3}}{{inter4}}
      <div class="class0 class1 class2 class3 class4 " dir0="" [attr0]="value0" dir1="" [attr1]="value1" dir2="" [attr2]="value2" dir3="" [attr3]="value3" dir4="" [attr4]="value4">
        {{inter0}}{{inter1}}{{inter2}}{{inter3}}{{inter4}}
        <div class="class0 class1 class2 class3 class4 " dir0="" [attr0]="value0" dir1="" [attr1]="value1" dir2="" [attr2]="value2" dir3="" [attr3]="value3" dir4="" [attr4]="value4">
          {{inter0}}{{inter1}}{{inter2}}{{inter3}}{{inter4}}
        </div>
      </div>
    </div>
  </div>
</div>`
})
class BenchmarkComponentWithBindings {
}
