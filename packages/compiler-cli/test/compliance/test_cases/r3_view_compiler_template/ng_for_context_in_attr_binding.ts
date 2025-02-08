import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
	<div *ngFor="let someElem of someField.someMethod()"
		[attr.someInputAttr]="someElem.someAttr()">
	</div>
`,
    standalone: false
})
export class MyComponent {
  someField!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
