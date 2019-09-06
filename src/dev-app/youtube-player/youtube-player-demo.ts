/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

 import {Component} from '@angular/core';

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
}
