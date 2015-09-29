import {bootstrap} from 'angular2/bootstrap';
import {BrowserDomAdapter} from 'angular2/src/core/dom/browser_adapter';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {PromiseWrapper} from 'angular2/src/core/facade/async';
import {ListWrapper, Map, MapWrapper} from 'angular2/src/core/facade/collection';
import {DateWrapper, Type, print, isPresent} from 'angular2/src/core/facade/lang';

import {
  Compiler,
  Component,
  Directive,
  View,
  ViewContainerRef,
  bind,
  Binding,
  NgIf,
  ViewMetadata
} from 'angular2/core';

import {ChangeDetectorGenConfig} from 'angular2/src/core/change_detection/change_detection';
import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';

import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';

function _createBindings(): Binding[] {
  var multiplyTemplatesBy = getIntParameter('elements');
  return [
    bind(ViewResolver)
        .toFactory(() => new MultiplyViewResolver(
                       multiplyTemplatesBy,
                       [BenchmarkComponentNoBindings, BenchmarkComponentWithBindings]),
                   []),
    // Use DynamicChangeDetector as that is the only one that Dart supports as well
    // so that we can compare the numbers between JS and Dart
    bind(ChangeDetectorGenConfig).toValue(new ChangeDetectorGenConfig(false, false, false, false))
  ];
}

export function main() {
  BrowserDomAdapter.makeCurrent();
  bootstrap(CompilerAppComponent, _createBindings())
      .then((ref) => {
        var app = ref.hostComponent;
        bindAction('#compileNoBindings',
                   measureWrapper(() => app.compileNoBindings(), 'No Bindings'));
        bindAction('#compileWithBindings',
                   measureWrapper(() => app.compileWithBindings(), 'With Bindings'));
      });
}

function measureWrapper(func, desc) {
  return function() {
    var begin = DateWrapper.now();
    print(`[${desc}] Begin...`);
    var onSuccess = function(_) {
      var elapsedMs = DateWrapper.toMillis(DateWrapper.now()) - DateWrapper.toMillis(begin);
      print(`[${desc}] ...done, took ${elapsedMs} ms`);
    };
    var onError = function(e) { DOM.logError(e); };
    PromiseWrapper.then(func(), onSuccess, onError);
  };
}


class MultiplyViewResolver extends ViewResolver {
  _multiplyBy: number;
  _cache: Map<Type, ViewMetadata>;

  constructor(multiple: number, components: Type[]) {
    super();
    this._multiplyBy = multiple;
    this._cache = new Map();
    ListWrapper.forEach(components, (c) => this._fillCache(c));
  }

  _fillCache(component: Type) {
    var view = super.resolve(component);
    var multipliedTemplates = ListWrapper.createFixedSize(this._multiplyBy);
    for (var i = 0; i < this._multiplyBy; ++i) {
      multipliedTemplates[i] = view.template;
    }
    this._cache.set(
        component,
        new ViewMetadata({template: multipliedTemplates.join(''), directives: view.directives}));
  }

  resolve(component: Type): ViewMetadata {
    var result = this._cache.get(component);
    return isPresent(result) ? result : super.resolve(component);
  }
}

@Component({selector: 'app'})
@View({directives: [], template: ``})
class CompilerAppComponent {
  constructor(private _compiler: Compiler) {}
  compileNoBindings() {
    this._compiler.clearCache();
    return this._compiler.compileInHost(BenchmarkComponentNoBindings);
  }

  compileWithBindings() {
    this._compiler.clearCache();
    return this._compiler.compileInHost(BenchmarkComponentWithBindings);
  }
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
