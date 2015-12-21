import {bootstrap} from 'angular2/bootstrap';

import {App} from './app';

import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/linker/view_pool';
import {provide} from 'angular2/core';

export function main() {
  bootstrap(App, _createProviders());
}

function _createProviders(): any[] {
  return [provide(APP_VIEW_POOL_CAPACITY, {useValue: 100000})];
}
