import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  standalone: true,
  template: `
		<div *ngIf="true" [class.bar]="field"></div>
	`
})
export class MyComponent {
  field!: any;
}
