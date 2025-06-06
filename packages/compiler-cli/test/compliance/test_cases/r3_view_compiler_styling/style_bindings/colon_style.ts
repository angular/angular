import {Component} from '@angular/core';

@Component({selector: 'foo', template: ''})
class Foo {}

@Component({
  selector: 'my-component',
  imports: [Foo],
  template: `
		<foo style=":root {color: red;}"></foo>
	`
})
export class MyComponent {
}
