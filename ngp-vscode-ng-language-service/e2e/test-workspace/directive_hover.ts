import {Component, signal} from '@angular/core';

@Component({
  selector: 'my-dir-elem',
  standalone: true,
  template: `<div>My Dir Elem</div>`,
})
export class MyDirElemComponent {}

@Component({
  selector: 'app-root',
  template: `
    <div>Hello</div>
    <my-dir-elem></my-dir-elem>
  `,
  standalone: true,
  imports: [MyDirElemComponent],
})
export class AppComponent {}
