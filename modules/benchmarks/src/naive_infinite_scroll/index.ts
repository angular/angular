import {bootstrap} from 'angular2/bootstrap';

import {App} from './app';

import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/linker/view_pool';
import {bind, provide} from 'angular2/core';

export function main() {
  bootstrap(App, createBindings());
}

function createBindings(): any[] {
  return [provide(APP_VIEW_POOL_CAPACITY, {asValue: 100000})];
}
