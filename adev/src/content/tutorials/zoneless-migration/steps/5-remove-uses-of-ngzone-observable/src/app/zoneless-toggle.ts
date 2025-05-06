import {Component} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'zoneless-toggle',
  imports: [MatSlideToggleModule],
  template: `<mat-slide-toggle class="example-margin" [checked]="zonelessInSearchParams" (change)="toggleZoneless()">
    Use zoneless
  </mat-slide-toggle>`,
})
export class ZonelessToggle {
  readonly zonelessInSearchParams = new URL(location.href).searchParams.get('zoneless') === 'true';

  toggleZoneless() {
    const url = new URL(location.href);
    url.searchParams.set('zoneless', `${!this.zonelessInSearchParams}`);
    location.href = url.toString();
  }
}
