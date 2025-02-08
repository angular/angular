import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[my-anim-dir]',
    host: { '[@myAnim]': 'myAnimState', '(@myAnim.start)': 'onStart()', '(@myAnim.done)': 'onDone()' },
    standalone: false
})
class MyAnimDir {
  onStart() {}
  onDone() {}
  myAnimState = '123';
}

@Component({
    selector: 'my-cmp',
    template: `
    <div my-anim-dir></div>
  `,
    standalone: false
})
class MyComponent {
}

@NgModule({declarations: [MyComponent, MyAnimDir]})
export class MyModule {
}
