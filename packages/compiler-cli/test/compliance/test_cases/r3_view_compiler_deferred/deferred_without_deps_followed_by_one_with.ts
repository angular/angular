import {Component, Directive} from '@angular/core';

@Directive({
  selector: 'lazy-dep',
  standalone: true,
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
  standalone: true,
  imports: [LazyDep],
})
export class MyApp {
}
