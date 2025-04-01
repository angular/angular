/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, Provider, Type, ViewEncapsulation} from '../../src/core';
import {TestBed} from '../../testing';

export interface ComponentTest {
  providers?: Provider[];
  viewProviders?: Provider[];
  directiveProviders?: Provider[];
  directive2Providers?: Provider[];
  directiveAssertion?: () => void;
  componentAssertion?: () => void;
}

export function expectProvidersScenario(defs: {
  app?: ComponentTest;
  parent?: ComponentTest;
  viewChild?: ComponentTest;
  contentChild?: ComponentTest;
  ngModule?: Type<any>;
}): void {
  @Component({
    standalone: true,
    selector: 'view-child',
    template: 'view-child',
    encapsulation: ViewEncapsulation.None,
    providers: defs.viewChild?.providers ?? [],
    viewProviders: defs.viewChild?.viewProviders ?? [],
  })
  class ViewChildComponent {
    constructor() {
      defs.viewChild?.componentAssertion?.();
    }
  }

  @Directive({
    standalone: true,
    selector: 'view-child',
    providers: defs.viewChild?.directiveProviders ?? [],
  })
  class ViewChildDirective {
    constructor() {
      defs.viewChild?.directiveAssertion?.();
    }
  }

  @Component({
    standalone: true,
    selector: 'content-child',
    template: 'content-child',
    encapsulation: ViewEncapsulation.None,
    providers: defs.contentChild?.providers ?? [],
    viewProviders: defs.contentChild?.viewProviders ?? [],
  })
  class ContentChildComponent {
    constructor() {
      defs.contentChild?.componentAssertion?.();
    }
  }

  @Directive({
    standalone: true,
    selector: 'content-child',
    providers: defs.contentChild?.directiveProviders ?? [],
  })
  class ContentChildDirective {
    constructor() {
      defs.contentChild?.directiveAssertion?.();
    }
  }

  @Component({
    standalone: true,
    imports: [ViewChildComponent, ViewChildDirective],
    selector: 'parent',
    template: '<view-child></view-child>',
    encapsulation: ViewEncapsulation.None,
    providers: defs.parent?.providers ?? [],
    viewProviders: defs.parent?.viewProviders ?? [],
  })
  class ParentComponent {
    constructor() {
      defs.parent?.componentAssertion?.();
    }
  }

  @Directive({
    standalone: true,
    selector: 'parent',
    providers: defs.parent?.directiveProviders ?? [],
  })
  class ParentDirective {
    constructor() {
      defs.parent?.directiveAssertion?.();
    }
  }
  @Directive({
    standalone: true,
    selector: 'parent',
    providers: defs.parent?.directive2Providers ?? [],
  })
  class ParentDirective2 {
    constructor() {
      defs.parent?.directiveAssertion?.();
    }
  }

  @Component({
    standalone: true,
    imports: [
      ParentComponent,
      // Note: tests are sensitive to the ordering here - the providers from `ParentDirective`
      // should override the providers from `ParentDirective2`.
      ParentDirective2,
      ParentDirective,
      ContentChildComponent,
      ContentChildDirective,
    ],
    template: '<parent><content-child></content-child></parent>',
    providers: defs.app?.providers ?? [],
    viewProviders: defs.app?.viewProviders ?? [],
  })
  class App {
    constructor() {
      defs.app?.componentAssertion?.();
    }
  }

  TestBed.configureTestingModule({
    imports: defs.ngModule ? [defs.ngModule] : [],
  });
  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  expect(fixture.nativeElement.innerHTML).toEqual(
    '<parent><view-child>view-child</view-child></parent>',
  );
  fixture.destroy();
}
