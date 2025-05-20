import {Component, input} from '@angular/core';

@Component({
  selector: 'app-hydrated',
  template: `<p>{{title()}} works!</p>`,
})
export class HydratedComponent {
  title = input.required<string>();
}
