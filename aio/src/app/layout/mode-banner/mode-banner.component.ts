import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { VersionInfo } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-mode-banner',
  template: `
    <div *ngIf="mode === 'archive'" class="mode-banner alert archive-warning">
      <p>
        This is the <strong>archived documentation for Angular v{{ version.major }}.</strong> Please visit
        <a href="https://angular.io{{currentPath}}?redirected_from={{version.major}}">angular.io</a>
         to see this page for the current version of Angular.
      </p>
    </div>
  `,
})
export class ModeBannerComponent {
  @Input() mode: string;
  @Input() version: VersionInfo;

  currentPath: string;

  constructor(private location: Location) {
    this.currentPath = this.location.path();
  }
}
