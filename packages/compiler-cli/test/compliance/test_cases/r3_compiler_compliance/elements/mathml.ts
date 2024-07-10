import {Component, NgModule} from '@angular/core';

@Component({selector: 'math', template: ''})
export class MathCmp {
}

@Component({selector: 'infinity', template: ''})
export class InfinityCmp {
}

@Component({
  selector: 'my-component',
  template: '<div class="my-app" title="Hello"><math><infinity/></math><p>test</p></div>'
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent, MathCmp, InfinityCmp]})
export class MyModule {
}
