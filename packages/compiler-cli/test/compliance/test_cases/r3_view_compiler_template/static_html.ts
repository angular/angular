import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
      <div><div class="foo-bar">foo</div> <div>bar</div> </div>
      <div>second div</div>
      
      @if (true) {
        <div>Conditionally rendered div</div>
      }`,
})
export class MyComponent {}
