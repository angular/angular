/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgOptimizedImageModule, provideImgixLoader} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'basic',
  styles: [`
    h1 {
      display: flex;
      align-items: center;
    }

    main {
      border: 1px solid blue;
      margin: 16px;
      padding: 16px;
    }

    .spacer {
      height: 3000px;
    }

    main img {
      width: 100%;
      height: auto;
    }
  `],
  template: `
    <h1> 
      <img ngSrc="a.png" width="50" height="50" priority ngSrcset="1x, 2x">
      <span>Angular image app</span>
    </h1>
    <main>
      <div class="spacer"></div>
      <img ngSrc="hermes2.jpeg" ngSrcset="100w, 200w, 1000w, 2000w" width="1791" height="1008">
    </main>
  `,
  providers: [provideImgixLoader('https://aurora-project.imgix.net')],
})
export class PlaygroundComponent {
}

@NgModule({
  declarations: [PlaygroundComponent],
  imports: [
    NgOptimizedImageModule,
    RouterModule.forChild([{
      path: '',
      component: PlaygroundComponent,
    }]),
  ],
  providers: [provideImgixLoader('https://aurora-project.imgix.net')],
})
export class PlaygroundModule {
}
