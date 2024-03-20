// #docregion
import { Component, inject } from '@angular/core';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';

import { AdService } from './ad.service';

// #docregion component
@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [NgComponentOutlet, AsyncPipe],
  template: `
    <div class="ad-banner-example">
      <h3>Advertisements</h3>
      <ng-container *ngComponentOutlet="
        currentAd.component;
        inputs: currentAd.inputs;
      " />
      <button (click)="displayNextAd()">Next</button>
    </div>
  `
})
export class AdBannerComponent {
  private adList = inject(AdService).getAds();

  private currentAdIndex = 0;

  get currentAd() {
    return this.adList[this.currentAdIndex];
  }

  displayNextAd() {
    this.currentAdIndex++;
    // Reset the current ad index back to `0` when we reach the end of an array.
    if (this.currentAdIndex === this.adList.length) {
      this.currentAdIndex = 0;
    }
  }
}
// #enddocregion component
