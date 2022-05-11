/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵIMAGE_LOADER as IMAGE_LOADER, ɵImageLoaderConfig as ImageLoaderConfig, ɵNgOptimizedImage as NgOptimizedImage} from '@angular/common';
import {Component} from '@angular/core';

const CUSTOM_IMGIX_LOADER = (config: ImageLoaderConfig) => {
  const widthStr = config.width ? `?w=${config.width}` : ``;
  return `https://aurora-project.imgix.net/${config.src}${widthStr}`;
};


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
      <img rawSrc="hermes.jpeg" width="4030" height="3020">
    </main>
  `,
  standalone: true,
  imports: [NgOptimizedImage],
  providers: [{provide: IMAGE_LOADER, useValue: CUSTOM_IMGIX_LOADER}],
})
export class BasicComponent {
}
