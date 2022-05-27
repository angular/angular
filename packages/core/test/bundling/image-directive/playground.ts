/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵIMAGE_LOADER as IMAGE_LOADER, ɵImageLoaderConfig as ImageLoaderConfig, ɵNgOptimizedImageModule as NgOptimizedImageModule, ɵprovideImgixLoader as provideImgixLoader} from '@angular/common';
import {Component} from '@angular/core';

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
      <img rawSrc="a.png" width="50" height="50" priority>
      <span>Angular image app</span>
    </h1>
    <main>
      <div class="spacer"></div>
      <img rawSrc="hermes.jpeg" rawSrcset="100w, 200w, 1000w" width="4030" height="3020">
    </main>
  `,
  standalone: true,
  imports: [NgOptimizedImageModule],
  providers: [provideImgixLoader('https://aurora-project.imgix.net')],
})
export class PlaygroundComponent {
}
