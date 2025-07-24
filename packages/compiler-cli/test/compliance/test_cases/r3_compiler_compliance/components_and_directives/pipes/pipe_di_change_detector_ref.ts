import {ChangeDetectorRef, Component, NgModule, Optional, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'myPipe',
    standalone: false
})
export class MyPipe implements PipeTransform {
  constructor(changeDetectorRef: ChangeDetectorRef) {}

  transform(value: any, ...args: any[]) {
    return value;
  }
}

@Pipe({
    name: 'myOtherPipe',
    standalone: false
})
export class MyOtherPipe implements PipeTransform {
  constructor(@Optional() changeDetectorRef: ChangeDetectorRef) {}

  transform(value: any, ...args: any[]) {
    return value;
  }
}

@Component({
    selector: 'my-app', template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>',
    standalone: false
})
export class MyApp {
  name = 'World';
}

@NgModule({declarations: [MyPipe, MyOtherPipe, MyApp]})
export class MyModule {
}
