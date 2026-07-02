import {Component, Pipe, PipeTransform, NgModule} from '@angular/core';

@Pipe({name: 'myPipe', standalone: false})
export class MyPipe implements PipeTransform {
  transform(value: any): any { return value; }
}

@Component({
    template: `{{ {name: 'Angular'} | myPipe }}`,
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [MyPipe, MyApp]})
export class MyMod {
}
