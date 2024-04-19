import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  standalone: true,
  template: `
		<div style=":root {color: red;}"></div>
	`
})
export class MyComponent {
}
