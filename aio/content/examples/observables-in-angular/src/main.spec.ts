import { NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

import {
  AsyncObservablePipeComponent,
  HeroFormComponent,
  Routable1Component, Routable2Component,
  ZippyComponent
} from './main';

// should write some real tests.
// this placeholder prevents `ng test` from failing and ensures that the example components compile.
describe('observables-in-angular', () => {
  it('should write some real tests', () => {
    expect(true).toBe(true);
  });

  it('can instantiate AsyncObservablePipeComponent', () =>
    expect(new AsyncObservablePipeComponent()).toBeDefined()
  );

  it('can instantiate HeroFormComponent', () =>
    expect(new HeroFormComponent()).toBeDefined()
  );

  it('can instantiate Routable1Component', () =>
    expect(new Routable1Component(new MockRouter() as any)).toBeDefined()
  );

  it('can instantiate Routable2Component', () =>
    expect(new Routable2Component(new MockActivatedRoute() as any)).toBeDefined()
  );

  it('can instantiate ZippyComponent', () =>
    expect(new ZippyComponent()).toBeDefined()
  );
});

class MockActivatedRoute {
  url = new Subject<any>();
}

class MockRouter {
  events = new Subject<NavigationStart>();
}
