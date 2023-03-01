import {Component, Input, NgModule} from '@angular/core';

@Component({
  selector: 'object-comp',
  template: `
    <p> {{ config['duration'] }} </p>
    <p> {{ config.animation }} </p>
  `
})
export class ObjectComp {
  @Input() config!: {[key: string]: any};
}

@Component({
  selector: 'my-app',
  template: `
  <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
`
})
export class MyApp {
  name = 'slide';
}

@NgModule({declarations: [ObjectComp, MyApp]})
export class MyModule {
}
