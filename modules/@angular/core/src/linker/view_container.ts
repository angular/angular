/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {isPresent} from '../facade/lang';

import {ElementRef} from './element_ref';
import {QueryList} from './query_list';
import {AppView} from './view';
import {ViewContainerRef_} from './view_container_ref';
import {ViewType} from './view_type';


/**
 * A ViewContainer is created for elements that have a ViewContainerRef
 * to keep track of the nested views.
 */
export class ViewContainer {
  public nestedViews: AppView<any>[];
  // views that have been declared at the place of this view container,
  // but inserted into another view container
  public projectedViews: AppView<any>[];

  constructor(
      public index: number, public parentIndex: number, public parentView: AppView<any>,
      public nativeElement: any) {}

  get elementRef(): ElementRef { return new ElementRef(this.nativeElement); }

  get vcRef(): ViewContainerRef_ { return new ViewContainerRef_(this); }

  get parentInjector(): Injector { return this.parentView.injector(this.parentIndex); }
  get injector(): Injector { return this.parentView.injector(this.index); }

  detectChangesInNestedViews(throwOnChange: boolean): void {
    if (this.nestedViews) {
      for (var i = 0; i < this.nestedViews.length; i++) {
        this.nestedViews[i].detectChanges(throwOnChange);
      }
    }
  }

  destroyNestedViews(): void {
    if (this.nestedViews) {
      for (var i = 0; i < this.nestedViews.length; i++) {
        this.nestedViews[i].destroy();
      }
    }
  }

  visitNestedViewRootNodes<C>(cb: (node: any, ctx: C) => void, c: C): void {
    if (this.nestedViews) {
      for (var i = 0; i < this.nestedViews.length; i++) {
        this.nestedViews[i].visitRootNodesInternal(cb, c);
      }
    }
  }

  mapNestedViews(nestedViewClass: any, callback: Function): any[] {
    var result: any[] = [];
    if (this.nestedViews) {
      for (var i = 0; i < this.nestedViews.length; i++) {
        const nestedView = this.nestedViews[i];
        if (nestedView.clazz === nestedViewClass) {
          result.push(callback(nestedView));
        }
      }
    }
    if (this.projectedViews) {
      for (var i = 0; i < this.projectedViews.length; i++) {
        const projectedView = this.projectedViews[i];
        if (projectedView.clazz === nestedViewClass) {
          result.push(callback(projectedView));
        }
      }
    }
    return result;
  }

  moveView(view: AppView<any>, currentIndex: number) {
    var previousIndex = this.nestedViews.indexOf(view);
    if (view.type === ViewType.COMPONENT) {
      throw new Error(`Component views can't be moved!`);
    }
    var nestedViews = this.nestedViews;
    if (nestedViews == null) {
      nestedViews = [];
      this.nestedViews = nestedViews;
    }
    nestedViews.splice(previousIndex, 1);
    nestedViews.splice(currentIndex, 0, view);
    const prevView = currentIndex > 0 ? nestedViews[currentIndex - 1] : null;
    view.moveAfter(this, prevView);
  }

  attachView(view: AppView<any>, viewIndex: number) {
    if (view.type === ViewType.COMPONENT) {
      throw new Error(`Component views can't be moved!`);
    }
    var nestedViews = this.nestedViews;
    if (nestedViews == null) {
      nestedViews = [];
      this.nestedViews = nestedViews;
    }
    // perf: array.push is faster than array.splice!
    if (viewIndex >= nestedViews.length) {
      nestedViews.push(view);
    } else {
      nestedViews.splice(viewIndex, 0, view);
    }
    const prevView = viewIndex > 0 ? nestedViews[viewIndex - 1] : null;
    view.attachAfter(this, prevView);
  }

  detachView(viewIndex: number): AppView<any> {
    const view = this.nestedViews[viewIndex];
    // perf: array.pop is faster than array.splice!
    if (viewIndex >= this.nestedViews.length - 1) {
      this.nestedViews.pop();
    } else {
      this.nestedViews.splice(viewIndex, 1);
    }
    if (view.type === ViewType.COMPONENT) {
      throw new Error(`Component views can't be moved!`);
    }
    view.detach();
    return view;
  }
}
