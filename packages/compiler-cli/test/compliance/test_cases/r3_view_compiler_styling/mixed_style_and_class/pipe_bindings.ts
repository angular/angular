import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({name: 'stylePipe'})
export class StylePipe {
  transform(v: any) {}
}

@Pipe({name: 'classPipe'})
export class ClassPipe {
  transform(v: any) {}
}

@Component({
  selector: 'my-component',
  template: `<div [style]="myStyleExp | stylePipe" [class]="myClassExp | classPipe"></div>`
})
export class MyComponent {
  myStyleExp = [{color: 'red'}, {color: 'blue', duration: 1000}]
  myClassExp = 'foo bar apple';
}

@NgModule({declarations: [MyComponent, StylePipe, ClassPipe]})
export class MyModule {
}
