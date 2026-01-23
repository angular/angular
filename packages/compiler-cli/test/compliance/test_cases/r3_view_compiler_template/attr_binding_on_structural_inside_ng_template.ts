import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
	<ng-template #someLocalRef>
		<span [attr.someAttr]="someField" *ngIf="someBooleanField"></span>
	</ng-template>
`,
    standalone: false
})
export class MyComponent {
  someField!: any;
  someBooleanField!: boolean;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}