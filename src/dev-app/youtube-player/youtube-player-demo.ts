/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

 import {ChangeDetectorRef, Component} from '@angular/core';

declare global {
  interface Window {
    YT: typeof YT | undefined;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Video {
  id: string;
  name: string;
}

const VIDEOS: Video[] = [
  {
    id: 'PRQCAL_RMVo',
    name: 'Instructional',
  },
  {
    id: 'O0xx5SvjmnU',
    name: 'Angular Conf',
  },
  {
    id: 'invalidname',
    name: 'Invalid',
  },
];

@Component({
  moduleId: module.id,
  selector: 'youtube-player-demo',
  templateUrl: 'youtube-player-demo.html',
  styleUrls: ['youtube-player-demo.css'],
})
export class YouTubePlayerDemo {
  video: Video | undefined = VIDEOS[0];
  videos = VIDEOS;
  apiLoaded = false;

  constructor(private _ref: ChangeDetectorRef) {
    if (window.YT) {
      this.apiLoaded = true;
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      this.apiLoaded = true;
      this._ref.detectChanges();
    };
  }
}
