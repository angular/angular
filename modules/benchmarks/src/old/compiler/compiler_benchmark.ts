/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerConfig, DirectiveResolver} from '@angular/compiler';
import {Component, ComponentResolver, Directive, ViewContainerRef,} from '@angular/core';
import {ViewMetadata} from '@angular/core/src/metadata/view';
import {PromiseWrapper} from '@angular/facade/src/async';
import {print, Type} from '@angular/facade/src/lang';
import {bootstrap} from '@angular/platform-browser';
import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
import {DOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {bindAction, getIntParameter} from '@angular/testing/src/benchmark_util';

function _createBindings(): any[] {
  const multiplyTemplatesBy = getIntParameter('elements');
  return [
    {
      provide: DirectiveResolver,
      useFactory: () => new MultiplyDirectiveResolver(
          multiplyTemplatesBy, [BenchmarkComponentNoBindings, BenchmarkComponentWithBindings]),
      deps: []
    },
    // Use interpretative mode as Dart does not support JIT and
    // we want to be able to compare the numbers between JS and Dart
    {
      provide: CompilerConfig,
      useValue: new CompilerConfig({genDebugInfo: false, useJit: false, logBindingUpdate: false})
    }
  ];
}

export function main() {
  BrowserDomAdapter.makeCurrent();
  bootstrap(CompilerAppComponent, _createBindings()).then((ref) => {
    const app = ref.instance;
    bindAction('#compileNoBindings', measureWrapper(() => app.compileNoBindings(), 'No Bindings'));
    bindAction(
        '#compileWithBindings', measureWrapper(() => app.compileWithBindings(), 'With Bindings'));
  });
}

function measureWrapper(func, desc) {
  return function() {
    const begin = new Date();
    print(`[${desc}] Begin...`);
    const onSuccess = function(_) {
      const elapsedMs = new Date().getTime() - begin.getTime();
      print(`[${desc}] ...done, took ${elapsedMs} ms`);
    };
    const onError = function(e) {
      DOM.logError(e);
    };
    PromiseWrapper.then(func(), onSuccess, onError);
  };
}


class MultiplyDirectiveResolver extends DirectiveResolver {
  private _multiplyBy: number;
  private _cache = new Map<Type, ViewMetadata>();

  constructor(multiple: number, components: Type[]) {
    super();
    this._multiplyBy = multiple;
    components.forEach(c => this._fillCache(c));
  }

  private _fillCache(component: Type) {
    const view = super.resolve(component);
    const multipliedTemplates = [];
    for (let i = 0; i < this._multiplyBy; ++i) {
      multipliedTemplates[i] = view.template;
    }
    this._cache.set(
        component,
        new ViewMetadata({template: multipliedTemplates.join(''), directives: view.directives}));
  }

  resolve(component: Type): ViewMetadata {
    return this._cache.get(component) || super.resolve(component);
  }
}

@Component({selector: 'app', directives: [], template: ``})
class CompilerAppComponent {
  constructor(private _compiler: ComponentResolver) {}
  compileNoBindings() {
    this._compiler.clearCache();
    return this._compiler.resolveComponent(BenchmarkComponentNoBindings);
  }

  compileWithBindings() {
    this._compiler.clearCache();
    return this._compiler.resolveComponent(BenchmarkComponentWithBindings);
  }
}

@Directive({selector: '[dir0]', inputs: ['prop: attr0']})
class Dir0 {
  prop: any;
}

@Directive({selector: '[dir1]', inputs: ['prop: attr1']})
class Dir1 {
  prop: any;
  constructor(dir0: Dir0) {}
}

@Directive({selector: '[dir2]', inputs: ['prop: attr2']})
class Dir2 {
  prop: any;
  constructor(dir1: Dir1) {}
}

@Directive({selector: '[dir3]', inputs: ['prop: attr3']})
class Dir3 {
  prop: any;
  constructor(dir2: Dir2) {}
}

@Directive({selector: '[dir4]', inputs: ['prop: attr4']})
class Dir4 {
  prop: any;
  constructor(dir3: Dir3) {}
}


@Component({
  selector: 'cmp-nobind',
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

@Component({
  selector: 'cmp-withbind',
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
  value0: any;
  value1: any;
  value2: any;
  value3: any;
  value4: any;

  inter0: any;
  inter1: any;
  inter2: any;
  inter3: any;
  inter4: any;
}
