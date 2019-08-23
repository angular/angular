/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {YouTubePlayerModule} from '@angular/youtube-player';
import {YouTubePlayerDemo} from './youtube-player-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    YouTubePlayerModule,
    RouterModule.forChild([{path: '', component: YouTubePlayerDemo}]),
  ],
  declarations: [YouTubePlayerDemo],
})
export class YouTubePlayerDemoModule {
}
