import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <div>No interpolations: {{ $localize\`hello world \` }}</div>
    <span>With interpolations: {{ $localize\`hello \${name}, it is currently \${ $localize\`morning\` }!\` }}</span>
  `,
})
export class MyApp {
  name = 'Frodo';
}
