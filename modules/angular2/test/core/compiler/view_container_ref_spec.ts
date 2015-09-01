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
  xit
} from 'angular2/test_lib';

import {SpyView, SpyAppViewManager} from '../spies';
import {AppView, AppViewContainer} from 'angular2/src/core/compiler/view';
import {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
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
      viewManager = new SpyAppViewManager();
      view = new SpyView();
      view.prop("viewContainers", [null]);
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
        view.prop("viewContainers", [appVc]);
        appVc.views = [<any>new SpyView()];
        expect(vc.length).toBe(1);
      });

    });

    // TODO: add missing tests here!

  });
}