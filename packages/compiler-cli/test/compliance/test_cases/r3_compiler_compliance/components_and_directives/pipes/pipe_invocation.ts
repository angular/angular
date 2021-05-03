import {Component, NgModule, OnDestroy, Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'myPipe', pure: false})
export class MyPipe implements PipeTransform, OnDestroy {
  transform(value: any, ...args: any[]) {
    return value;
  }
  ngOnDestroy(): void {}
}

@Component({
  selector: 'my-app',
  template:
      '0:{{name | myPipe}}1:{{name | myPipe:1}}2:{{name | myPipe:1:2}}3:{{name | myPipe:1:2:3}}4:{{name | myPipe:1:2:3:4}}'
})
export class MyApp {
  name = '';
}

@NgModule({declarations: [MyPipe, MyApp]})
export class MyModule {
}
