import {Component, Directive} from '@angular/core';

@Directive({selector: 'eager-dep', standalone: true})
export class EagerDep {
}

@Directive({selector: 'lazy-dep', standalone: true})
export class LazyDep {
}

@Directive({selector: 'loading-dep', standalone: true})
export class LoadingDep {
}

@Component({
  template: `
    <div>
      <eager-dep/>
      @defer {
        <lazy-dep/>
      } @loading {
        <loading-dep/>
      }
    </div>
  `,
  standalone: true,
  imports: [EagerDep, LazyDep, LoadingDep],
})
export class MyApp {
}
