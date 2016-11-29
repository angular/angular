/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {AppView} from '../../src/linker/view';
import {ViewContainer, ViewContainerWithAnimations} from '../../src/linker/view_container';
import {el} from '@angular/platform-browser/testing/browser_util';

export function main() {
  describe('ViewContainerWithAnimations', () => {
    function makeViewContainer(): ViewContainerWithAnimations {
      const element = el('<div></div>');
      return new ViewContainerWithAnimations(0, 0, makeView(), element);
    }

    function makeView(name = ''): AppView<any> {
      const view = new DumpAppView(name);
      return <any>view;
    }

    function reduceViewsToString(views: DumpAppView[]): string {
      return views.map(v => v.name).join(' -> ');
    }

    describe('mapNestedAnimationViews', () => {
      it('should map over all the existing views in the container', () => {
        const container = makeViewContainer();
        const views = [
          makeView(),
          makeView(),
          makeView()
        ];
        container.attachView(views[0], 0);
        container.attachView(views[1], 1);
        container.attachView(views[2], 2);

        const list: any[] = [];
        container.mapNestedAnimationViews(DumpAppView, (view: any) => list.push(view));
        expect(list).toEqual(views);
      });

      it('should return all removed views when called for the first time', () => {
        const container = makeViewContainer();
        const views = [
          makeView(),
          makeView(),
          makeView()
        ];
        container.attachView(views[0], 0);
        container.attachView(views[1], 1);
        container.attachView(views[2], 2);
        container.detachView(0);
        container.detachView(0);
        container.detachView(0);

        let list: any[] = [];
        container.mapNestedAnimationViews(DumpAppView, (view: any) => list.push(view));
        expect(list).toEqual(views);

        list = [];
        container.mapNestedAnimationViews(DumpAppView, (view: any) => list.push(view));
        expect(list).toEqual([]);
      });

      it('should maintain ordering of nodes that are removed alongside nodes that are preserved', () => {
        const container = makeViewContainer();
        const views = [
          makeView('0'),
          makeView('1'),
          makeView('2'),
          makeView('3'),
          makeView('4')
        ];
        container.attachView(views[0], 0);
        container.attachView(views[1], 1);
        container.attachView(views[2], 2);
        container.attachView(views[3], 3);
        container.attachView(views[4], 4);
        container.detachView(3);
        container.detachView(2);
        container.detachView(0);

        let list: any[] = [];
        container.mapNestedAnimationViews(DumpAppView, (view: any) => list.push(view));
        expect(list).toEqual(views);
      });

      it('should maintain ordering of nodes that are removed alongside nodes that are attached after detach', () => {
        const container = makeViewContainer();
        const views = [
          makeView('0'),
          makeView('1'),
          makeView('2'),
          makeView('3'),
          makeView('4'),
          makeView('5')
        ];
        container.attachView(views[0], 0);
        container.attachView(views[1], 1);
        container.attachView(views[2], 2);
        container.attachView(views[3], 3);
        container.attachView(views[4], 4);
        container.detachView(4);
        container.detachView(0);
        container.attachView(views[5], 3);

        // 1 -> 4 -> 2 -> 3 -> 0
        let list: any[] = [];
        container.mapNestedAnimationViews(DumpAppView, (view: any) => list.push(view));
        expect(reduceViewsToString(list)).toEqual('0 -> 1 -> 2 -> 3 -> 5 -> 4');
      });

      it('should maintain ordering of nodes that are removed alongside nodes that are moved', () => {
        const container = makeViewContainer();
        const views = [
          makeView('0'),
          makeView('1'),
          makeView('2'),
          makeView('3'),
          makeView('4')
        ];
        container.attachView(views[0], 0);
        container.attachView(views[1], 1);
        container.attachView(views[2], 2);
        container.attachView(views[3], 3);
        container.attachView(views[4], 4);
        container.detachView(3);
        container.moveView(views[4], 2);
        container.moveView(views[0], 4);
        container.detachView(1);

        // 1 -> 4 -> 2 -> 3 -> 0
        let list: any[] = [];
        container.mapNestedAnimationViews(DumpAppView, (view: any) => list.push(view));
        expect(reduceViewsToString(list)).toEqual('1 -> 4 -> 2 -> 3 -> 0');
      });
    });
  });
}

class DumpAppView {
  constructor(public name: string) {}

  attachAfter(viewContainer: ViewContainer, prevView: AppView<any>) {}
  moveAfter(viewContainer: ViewContainer, prevView: AppView<any>) {}

  get clazz() {
    return DumpAppView;
  }

  detach(): void {}
}
