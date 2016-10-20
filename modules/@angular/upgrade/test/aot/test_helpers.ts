/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PlatformRef, Type} from '@angular/core';
import * as angular from '@angular/upgrade/src/angular_js';
import {$ROOT_SCOPE} from '@angular/upgrade/src/aot/constants';
import {UpgradeModule} from '@angular/upgrade/static';

export function bootstrap(
    platform: PlatformRef, Ng2Module: Type<{}>, element: Element, ng1Module: angular.IModule) {
  // We bootstrap the Angular 2 module first; then when it is ready (async)
  // We bootstrap the Angular 1 module on the bootstrap element
  return platform.bootstrapModule(Ng2Module).then(ref => {
    var upgrade = ref.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(element, [ng1Module.name]);
    return upgrade;
  });
}

export function digest(adapter: UpgradeModule) {
  const $rootScope = adapter.$injector.get($ROOT_SCOPE) as angular.IRootScopeService;
  $rootScope.$digest();
}

export function html(html: string): Element {
  // Don't return `body` itself, because using it as a `$rootElement` for ng1
  // will attach `$injector` to it and that will affect subsequent tests.
  const body = document.body;
  body.innerHTML = `<div>${html.trim()}</div>`;
  const div = document.body.firstChild as Element;

  if (div.childNodes.length === 1 && div.firstChild instanceof HTMLElement) {
    return div.firstChild;
  }

  return div;
}

export function multiTrim(text: string): string {
  return text.replace(/\n/g, '').replace(/\s\s+/g, ' ').trim();
}
