/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {Pane, ViewChildrenComp} from './view_children_example';

@NgModule({
  imports: [BrowserModule],
  declarations: [ViewChildrenComp, Pane],
  bootstrap: [ViewChildrenComp]
})
export class AppModule {
}

export {ViewChildrenComp as AppComponent};
