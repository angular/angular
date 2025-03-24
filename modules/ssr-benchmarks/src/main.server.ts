/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵenableProfiling} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {config} from './app/app.config.server';
import {renderApplication, ɵENABLE_DOM_EMULATION} from '@angular/platform-server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

/**
 * Function that will profile the server-side rendering
 *
 * @param DISABLE_DOM_EMULATION will prevent the platform-server from using the DominoAdapter, `false` by default
 * (But won't prevent the monkey patching of DOM apis as this is introduced by the CLI)
 */
const render = (DISABLE_DOM_EMULATION: boolean = false) => {
  ɵenableProfiling();

  let doc: Document | string;
  if (DISABLE_DOM_EMULATION) {
    doc = document.implementation.createHTMLDocument('');
    doc.body.innerHTML = '<app-root></app-root>';
  } else {
    doc = '<html><head></head><body><app-root></app-root></body></html>';
  }

  return renderApplication(bootstrap, {
    document: doc,
    platformProviders: [{provide: ɵENABLE_DOM_EMULATION, useValue: !DISABLE_DOM_EMULATION}],
  });
};

export {render};

// Tooling expects a default export but we don't use/need it.
export default bootstrap;
