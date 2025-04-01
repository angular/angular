import {Component, Input, NgModule} from '@angular/core';

@Component({
  selector: 'my-cmp',
  template: `
		<span i18n>
  			<input [disabled]="someBoolean">
			{{ someField }}
		</span>
	`,
})
export class MyComponent {
  someBoolean: boolean;
  someField!: any;
}