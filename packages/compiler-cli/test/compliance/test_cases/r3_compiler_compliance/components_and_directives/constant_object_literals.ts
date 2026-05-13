import {Component, Input, NgModule} from '@angular/core';

@Component({
    selector: 'some-comp', template: '',
    standalone: false
})
export class SomeComp {
  @Input() prop!: any;
  @Input() otherProp!: any;
}

@Component({
    template: '<some-comp [prop]="{}" [otherProp]="{a: 1, b: 2}"></some-comp>',
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [SomeComp, MyApp]})
export class MyMod {
}
