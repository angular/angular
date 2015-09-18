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
} from 'angular2/testing_internal';

import {SpyView, SpyAppViewManager} from '../spies';
import {AppView, AppViewContainer} from 'angular2/src/core/linker/view';
import {ViewContainerRef, ViewContainerRef_} from 'angular2/src/core/linker/view_container_ref';
import {ElementRef, ElementRef_} from 'angular2/src/core/linker/element_ref';
import {ViewRef, ViewRef_} from 'angular2/src/core/linker/view_ref';

export function main() {
  // TODO(tbosch): add missing tests

  describe('ViewContainerRef', () => {
    var location;
    var view;
    var viewManager;

    function createViewContainer() { return new ViewContainerRef_(viewManager, location); }

    beforeEach(() => {
      viewManager = new SpyAppViewManager();
      view = new SpyView();
      view.prop("viewContainers", [null]);
      location = new ElementRef_(new ViewRef_(view), 0, null);
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
