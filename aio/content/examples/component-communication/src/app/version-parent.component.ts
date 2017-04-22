// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'version-parent',
  template: `
    <h2>Source code version</h2>
    <button (click)="newMinor()">New minor version</button>
    <button (click)="newMajor()">New major version</button>
    <version-child [major]="major" [minor]="minor"></version-child>
  `
})
export class VersionParentComponent {
  major: number = 1;
  minor: number = 23;

  newMinor() {
    this.minor++;
  }

  newMajor() {
    this.major++;
    this.minor = 0;
  }
}
// #enddocregion
