import {Component, HostBinding, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div [style.height!important]="myHeightExp"
         [class.bar!important]="myBarClassExp"></div>
  `,
  host: {'[style.width!important]': 'myStyleExp', '[class.baz!important]': 'myClassExp'},
  standalone: false,
})
export class MyComponent {
  myStyleExp = '';
  myClassExp = '';

  @HostBinding('class.foo!important') myFooClassExp = true;

  @HostBinding('style.width!important') myWidthExp = '100px';

  myBarClassExp = true;
  myHeightExp = '200px';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {}
