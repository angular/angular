import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {YouTubePlayer} from './youtube-player';

const COMPONENTS = [YouTubePlayer];

@NgModule({
  declarations: COMPONENTS,
  exports: COMPONENTS,
  imports: [CommonModule],
})
export class YouTubePlayerModule {
}
