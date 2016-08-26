import {
  NgModule,
  enableProdMode
} from '@angular/core';

import {ApplicationRef} from '@angular/core/src/application_ref';
import {
  bindAction,
  windowProfile,
  windowProfileEnd
} from '@angular/platform-browser/testing/benchmark_util';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppComponent, AppModule} from './app/tree';
import {TreeNode, buildTree, emptyTree, profile} from '../app/util';

export function main() {
  var app: AppComponent;
  var appRef: ApplicationRef;

  function destroyDom() {
    app.initData = emptyTree();
    appRef.tick();
  }

  function createDom() {
    app.initData = buildTree();
    appRef.tick();
  }

  function noop() {}

  function init() {
    enableProdMode();
    platformBrowserDynamic().bootstrapModule(AppModule)
        .then((ref) => {
          var injector = ref.injector;
          appRef = injector.get(ApplicationRef);

          app = appRef.components[0].instance;
          bindAction('#destroyDom', destroyDom);
          bindAction('#createDom', createDom);
          bindAction('#updateDomProfile', profile(createDom, noop, 'ng2-update'));
          bindAction('#createDomProfile', profile(createDom, destroyDom, 'ng2-create'));
        });
  }

  init();
}
