import {Component, HostBinding, Input, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '',
  host: {'style': 'width:200px; height:500px', 'class': 'foo baz', 'title': 'foo title'}
})
export class MyComponent {
  @HostBinding('style') myStyle = {width: '100px'};

  @HostBinding('class') myClass = {bar: false};

  @HostBinding('id') id = 'some id';

  @HostBinding('title') title = 'some title';

  @Input('name') name = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
