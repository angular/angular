import { Component } from '@angular/core';

@Component({
  selector: 'aio-gs-property-binding',
  template: `
    <aio-gs-container>
      <ng-container class="template">&lt;img ... [title]="imageTitle"&gt;</ng-container>

      <ng-container class="data">
        imageTitle = '<input #input (input)="imageTitle = input.value" [value]="imageTitle">';
      </ng-container>

      <ng-container class="result">
        <img src="/assets/images/logos/angular/angular.svg" width="37" height="40" [title]="imageTitle">
      </ng-container>
    </aio-gs-container>
  `
})
export class PropertyBindingComponent {
  imageTitle = 'Angular Logo';
}
