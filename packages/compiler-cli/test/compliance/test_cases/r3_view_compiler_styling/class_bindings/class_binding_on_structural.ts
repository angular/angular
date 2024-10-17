import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
		<div *ngIf="true" [class.bar]="field"></div>
	`
})
export class MyComponent {
  field!: any;
}
