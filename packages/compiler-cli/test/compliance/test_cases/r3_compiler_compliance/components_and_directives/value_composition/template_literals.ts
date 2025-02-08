import {Component, Pipe} from '@angular/core';

@Pipe({name: 'uppercase'})
export class UppercasePipe {
  transform(value: string) {
    return value.toUpperCase();
  }
}

@Component({
  selector: 'my-app',
  template: `
    <div>No interpolations: {{ \`hello world \` }}</div>
    <span>With interpolations: {{ \`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
    <p>With pipe: {{\`hello \${name}\` | uppercase}}</p>
  `,
  imports: [UppercasePipe],
})
export class MyApp {
  name = 'Frodo';
  timeOfDay = 'morning';
}
