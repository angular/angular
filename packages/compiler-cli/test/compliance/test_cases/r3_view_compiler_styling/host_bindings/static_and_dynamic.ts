import {Component, HostBinding, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '',
  host: {'style': 'width:200px; height:500px', 'class': 'foo baz'}
})
export class MyComponent {
  @HostBinding('style') myStyle = {width: '100px'};

  @HostBinding('class') myClass = {bar: false};

  @HostBinding('style.color') myColorProp = 'red';

  @HostBinding('class.foo') myFooClass = 'red';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
