import {Component, NgModule, Pipe, PipeTransform} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>{{ valueA | pipeA }} and {{ valueB | pipeB }}</div>
  <div i18n><span>{{ valueA | pipeA }}</span> and {{ valueB | pipeB }} <span>and {{ valueC | pipeC }}</span></div>
`,
    standalone: false
})
export class MyComponent {
  valueA: 0;
  valueB: 0;
  valueC: 0;
}

@Pipe({
    name: 'pipeA',
    standalone: false
})
export class PipeA implements PipeTransform {
  transform() {
    return null;
  }
}

@Pipe({
    name: 'pipeB',
    standalone: false
})
export class PipeB implements PipeTransform {
  transform() {
    return null;
  }
}

@Pipe({
    name: 'pipeC',
    standalone: false
})
export class PipeC implements PipeTransform {
  transform() {
    return null;
  }
}

@NgModule({declarations: [MyComponent, PipeA, PipeB, PipeC]})
export class MyModule {
}
