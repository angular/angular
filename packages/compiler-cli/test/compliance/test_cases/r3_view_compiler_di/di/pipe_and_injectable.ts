import {Component, Injectable, NgModule, Pipe, PipeTransform} from '@angular/core';

@Injectable()
class Service {
}

@Injectable()
@Pipe({
    name: 'myPipe',
    standalone: false
})
export class MyPipe implements PipeTransform {
  constructor(service: Service) {}
  transform(value: any, ...args: any[]) {
    return value;
  }
}

@Pipe({
    name: 'myOtherPipe',
    standalone: false
})
@Injectable()
export class MyOtherPipe implements PipeTransform {
  constructor(service: Service) {}
  transform(value: any, ...args: any[]) {
    return value;
  }
}

@Component({
    selector: 'my-app', template: '{{0 | myPipe | myOtherPipe}}',
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [MyPipe, MyOtherPipe, MyApp], providers: [Service]})
export class MyModule {
}
