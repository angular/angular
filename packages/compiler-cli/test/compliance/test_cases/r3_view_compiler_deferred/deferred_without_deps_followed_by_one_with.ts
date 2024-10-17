import {Component, Directive} from '@angular/core';

@Directive({
  selector: 'lazy-dep',
})
export class LazyDep {
}

@Component({
  template: `
    <div>
      @defer {
        I'm so independent!
      }
      @defer {
        <lazy-dep/>
      }
    </div>
  `,
  imports: [LazyDep],
})
export class MyApp {
}
