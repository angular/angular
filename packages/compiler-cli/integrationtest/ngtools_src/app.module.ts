/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {AppComponent} from './app.component';

@Component({selector: 'home-view', template: 'home!'})
export class HomeView {
}


@NgModule({
  declarations: [AppComponent, HomeView],
  imports: [
    BrowserModule, RouterModule.forRoot([
      {path: 'lazy', loadChildren: () => import('./lazy.module').then(mod => mod.LazyModule)}, {
        path: 'feature2',
        loadChildren: () => import('./feature2/feature2.module').then(mod => mod.Feature2Module)
      },
      {path: '', component: HomeView}
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
