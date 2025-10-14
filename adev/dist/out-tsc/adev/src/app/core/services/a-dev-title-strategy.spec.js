/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {TestBed} from '@angular/core/testing';
import {TITLE_SUFFIX, ADevTitleStrategy, DEFAULT_PAGE_TITLE} from './a-dev-title-strategy';
import {Router, provideRouter} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Component} from '@angular/core';
let FakeComponent = (() => {
  let _classDecorators = [Component({})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FakeComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      FakeComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (FakeComponent = _classThis);
})();
describe('ADevTitleStrategy', () => {
  let service;
  let router;
  let title;
  const routes = [
    {path: 'first', data: {label: 'First'}, component: FakeComponent},
    {path: 'second', component: FakeComponent},
    {
      path: 'third',
      data: {label: 'Third'},
      component: FakeComponent,
      children: [{path: 'child', data: {label: 'Child'}, component: FakeComponent}],
    },
    {
      path: 'fourth',
      data: {label: 'Fourth'},
      component: FakeComponent,
      children: [
        {
          path: 'child',
          data: {label: 'Overview', parent: {label: 'Fourth'}},
          component: FakeComponent,
        },
      ],
    },
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    service = TestBed.inject(ADevTitleStrategy);
    router = TestBed.inject(Router);
    title = TestBed.inject(Title);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it(`should set '${TITLE_SUFFIX}' when route doesn't have defined label`, async () => {
    spyOn(title, 'setTitle');
    await router.navigateByUrl('/second');
    service.updateTitle(router.routerState.snapshot);
    expect(title.setTitle).toHaveBeenCalledOnceWith(TITLE_SUFFIX);
  });
  it(`should set 'Third - ${TITLE_SUFFIX}' when route has defined label equal to 'Third'`, async () => {
    spyOn(title, 'setTitle');
    await router.navigateByUrl('/third');
    service.updateTitle(router.routerState.snapshot);
    expect(title.setTitle).toHaveBeenCalledOnceWith('Third • Angular');
  });
  it(`shouldn't take label from the parent route when current route label is not equal to ${DEFAULT_PAGE_TITLE}`, async () => {
    spyOn(title, 'setTitle');
    await router.navigateByUrl('/third/child');
    service.updateTitle(router.routerState.snapshot);
    expect(title.setTitle).toHaveBeenCalledOnceWith('Child • Angular');
  });
  it(`should take label from the parent route when current route label is equal to ${DEFAULT_PAGE_TITLE}`, async () => {
    spyOn(title, 'setTitle');
    await router.navigateByUrl('/fourth/child');
    service.updateTitle(router.routerState.snapshot);
    expect(title.setTitle).toHaveBeenCalledOnceWith('Fourth • Overview • Angular');
  });
});
//# sourceMappingURL=a-dev-title-strategy.spec.js.map
