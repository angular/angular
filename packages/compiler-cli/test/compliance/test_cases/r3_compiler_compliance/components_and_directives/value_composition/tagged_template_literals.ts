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
    <div>No interpolations: {{ tag\`hello world \` }}</div>
    <span>With interpolations: {{ tag\`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
    <p>With pipe: {{ tag\`hello \${name}\` | uppercase }}</p>
  `,
  imports: [UppercasePipe],
})
export class MyApp {
  name = 'Frodo';
  timeOfDay = 'morning';
  tag = (strings: TemplateStringsArray, ...args: string[]) => '';
}
