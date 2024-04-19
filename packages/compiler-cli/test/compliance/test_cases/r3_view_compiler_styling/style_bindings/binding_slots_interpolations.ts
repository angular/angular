import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<div style="opacity:1"
                   [attr.style]="'border-width: 10px'"
                   [style.width]="myWidth"
                   [style]="myStyleExp"
                   [style.height]="myHeight"></div>`
})
export class MyComponent {
  myStyleExp = [{color: 'red'}, {color: 'blue', duration: 1000}]
  myWidth = '100px';
  myHeight = '100px';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
