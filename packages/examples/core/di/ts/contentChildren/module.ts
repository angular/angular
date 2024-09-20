/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ContentChildrenComp, Pane, Tab} from './content_children_example';

@NgModule({
  imports: [BrowserModule],
  declarations: [ContentChildrenComp, Pane, Tab],
  bootstrap: [ContentChildrenComp],
})
export class AppModule {}

export {ContentChildrenComp as AppComponent};
