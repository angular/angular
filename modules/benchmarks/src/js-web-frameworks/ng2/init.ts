/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, NgModuleRef} from '@angular/core';

import {bindAction} from '../../util';

import {JsWebFrameworksComponent, JsWebFrameworksModule, RowData} from './rows';


function _random(max: number) {
  return Math.round(Math.random() * 1000) % max;
}

function buildData(count: number): Array<RowData> {
  const data: Array<RowData> = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i,
      label: ADJECTIVES[_random(ADJECTIVES.length)] + ' ' + COLOURS[_random(COLOURS.length)] + ' ' +
          NOUNS[_random(NOUNS.length)]
    });
  }
  return data;
}

const ADJECTIVES = [
  'pretty',      'large',   'big',       'small', 'tall',      'short',    'long',
  'handsome',    'plain',   'quaint',    'clean', 'elegant',   'easy',     'angry',
  'crazy',       'helpful', 'mushy',     'odd',   'unsightly', 'adorable', 'important',
  'inexpensive', 'cheap',   'expensive', 'fancy'
];
const COLOURS = [
  'red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'
];
const NOUNS = [
  'table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza',
  'mouse', 'keyboard'
];

export function init(moduleRef: NgModuleRef<JsWebFrameworksModule>) {
  let component: JsWebFrameworksComponent;
  let appRef: ApplicationRef;

  function create1K() {
    component.data = buildData(1 * 1000);
    appRef.tick();
  }

  function create10K() {
    component.data = buildData(10 * 1000);
    appRef.tick();
  }

  function deleteAll() {
    component.data = [];
    appRef.tick();
  }

  function update() {
    for (let i = 0; i < component.data.length; i += 10) {
      component.data[i].label += ' !!!';
    }
    appRef.tick();
  }

  function swapRows() {
    const data = component.data;
    if (data.length > 998) {
      const a = data[1];
      data[1] = data[998];
      data[998] = a;
    }
    appRef.tick();
  }

  const injector = moduleRef.injector;
  appRef = injector.get(ApplicationRef);

  component = appRef.components[0].instance;

  bindAction('#create1KRows', create1K);
  bindAction('#create10KRows', create10K);
  bindAction('#deleteAll', deleteAll);
  bindAction('#update', update);
  bindAction('#swap', swapRows);
}
