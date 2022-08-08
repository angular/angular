/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {YouTubePlayerModule} from '@angular/youtube-player';

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
  selector: 'youtube-player-demo',
  templateUrl: 'youtube-player-demo.html',
  styleUrls: ['youtube-player-demo.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatLegacyRadioModule, YouTubePlayerModule],
})
export class YouTubePlayerDemo implements AfterViewInit, OnDestroy {
  @ViewChild('demoYouTubePlayer') demoYouTubePlayer: ElementRef<HTMLDivElement>;
  selectedVideo: Video | undefined = VIDEOS[0];
  videos = VIDEOS;
  videoWidth: number | undefined;
  videoHeight: number | undefined;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this._loadApi();
  }

  ngAfterViewInit(): void {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  onResize = (): void => {
    // Automatically expand the video to fit the page up to 1200px x 720px
    this.videoWidth = Math.min(this.demoYouTubePlayer.nativeElement.clientWidth, 1200);
    this.videoHeight = this.videoWidth * 0.6;
    this._changeDetectorRef.detectChanges();
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  private _loadApi() {
    if (!window.YT) {
      // We don't need to wait for the API to load since the
      // component is set up to wait for it automatically.
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }
  }
}
