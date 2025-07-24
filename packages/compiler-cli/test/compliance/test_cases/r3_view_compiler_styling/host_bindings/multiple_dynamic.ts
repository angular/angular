import {Component, HostBinding, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '',
    host: { '[style.height.pt]': 'myHeightProp', '[class.bar]': 'myBarClass' },
    standalone: false
})
export class MyComponent {
  myHeightProp = 20;
  myBarClass = true;

  @HostBinding('style') myStyle = {};

  @HostBinding('style.width') myWidthProp = '500px';

  @HostBinding('class.foo') myFooClass = true;

  @HostBinding('class') myClasses = {a: true, b: true};
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
