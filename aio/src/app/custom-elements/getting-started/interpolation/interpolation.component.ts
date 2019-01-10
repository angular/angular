import { Component } from '@angular/core';


@Component({
  selector: 'aio-gs-interpolation',
  template: `
    <aio-gs-container>
      <ng-container class="template">&lt;h1&gt;Welcome to {{'{'+'{'}}siteName{{'}'+'}'}}&lt;h1&gt;</ng-container>

      <ng-container class="data">
        siteName = '<input #input (input)="siteName = input.value" [value]="siteName">';
      </ng-container>

      <ng-container class="result"><h1>Welcome to {{ siteName }}</h1></ng-container>
    </aio-gs-container>
  `
})
export class InterpolationComponent {
  siteName = 'My Store';
}
