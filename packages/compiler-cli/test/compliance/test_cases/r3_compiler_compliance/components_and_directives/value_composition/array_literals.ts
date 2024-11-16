import {Component, Input, NgModule} from '@angular/core';

@Component({
    selector: 'my-comp',
    template: `
    <p>{{ names[0] }}</p>
    <p>{{ names[1] }}</p>
  `,
    standalone: false
})
export class MyComp {
  @Input() names!: string[];
}

@Component({
    selector: 'my-app',
    template: `
  <my-comp [names]="['Nancy', customName]"></my-comp>
`,
    standalone: false
})
export class MyApp {
  customName = 'Bess';
}

@NgModule({declarations: [MyComp, MyApp]})
export class MyModule {
}
