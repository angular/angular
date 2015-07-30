import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit,
  SpyObject,
  proxy
} from 'angular2/test_lib';

import {IMPLEMENTS} from 'angular2/src/facade/lang';

import {AppView, AppViewContainer} from 'angular2/src/core/compiler/view';
import {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {ViewRef} from 'angular2/src/core/compiler/view_ref';

export function main() {
  // TODO(tbosch): add missing tests

  describe('ViewContainerRef', () => {
    var location;
    var view;
    var viewManager;

    function createViewContainer() { return new ViewContainerRef(viewManager, location); }

    beforeEach(() => {
      viewManager = new AppViewManagerSpy();
      view = new AppViewSpy();
      location = new ElementRef(new ViewRef(view), 0, 0, null);
    });

    describe('length', () => {

      it('should return a 0 length if there is no underlying AppViewContainer', () => {
        var vc = createViewContainer();
        expect(vc.length).toBe(0);
      });

      it('should return the size of the underlying AppViewContainer', () => {
        var vc = createViewContainer();
        var appVc = new AppViewContainer();
        view.viewContainers = [appVc];
        appVc.views = [<any>new AppViewSpy()];
        expect(vc.length).toBe(1);
      });

    });

    // TODO: add missing tests here!

  });
}

@proxy()
@IMPLEMENTS(AppView)
class AppViewSpy extends SpyObject {
  viewContainers: AppViewContainer[] = [null];
  constructor() { super(AppView); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@proxy()
@IMPLEMENTS(AppViewManager)
class AppViewManagerSpy extends SpyObject {
  constructor() { super(AppViewManager); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}
