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
import {AppView} from './view';
import {ViewContainerRef_} from './view_container_ref';
import {ViewType} from './view_type';
import {ListWrapper} from "../../../benchpress/src/facade/collection";

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
      for (let i = 0; i < this.nestedViews.length; i++) {
        this.nestedViews[i].detectChanges(throwOnChange);
      }
    }
  }

  destroyNestedViews(): void {
    if (this.nestedViews) {
      for (let i = 0; i < this.nestedViews.length; i++) {
        this.nestedViews[i].destroy();
      }
    }
  }

  visitNestedViewRootNodes<C>(cb: (node: any, ctx: C) => void, c: C): void {
    if (this.nestedViews) {
      for (let i = 0; i < this.nestedViews.length; i++) {
        this.nestedViews[i].visitRootNodesInternal(cb, c);
      }
    }
  }

  mapNestedViews(nestedViewClass: any, callback: Function): any[] {
    const result: any[] = [];
    if (this.nestedViews) {
      for (let i = 0; i < this.nestedViews.length; i++) {
        const nestedView = this.nestedViews[i];
        if (nestedView.clazz === nestedViewClass) {
          result.push(callback(nestedView));
        }
      }
    }
    if (this.projectedViews) {
      for (let i = 0; i < this.projectedViews.length; i++) {
        const projectedView = this.projectedViews[i];
        if (projectedView.clazz === nestedViewClass) {
          result.push(callback(projectedView));
        }
      }
    }
    return result;
  }

  moveView(view: AppView<any>, currentIndex: number) {
    const previousIndex = this.nestedViews.indexOf(view);
    if (view.type === ViewType.COMPONENT) {
      throw new Error(`Component views can't be moved!`);
    }
    let nestedViews = this.nestedViews;
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
    let nestedViews = this.nestedViews;
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

export class ViewContainerWithAnimations extends ViewContainer {
  public removedNestedViews: Array<AppView<any>[]> = null;

  mapNestedAnimationViews(nestedViewClass: any, callback: Function): any[] {
    const result: any[] = [];
    if (this.nestedViews) {
      const removedViews: any[] = this.removedNestedViews || [];
      for (let i = 0; i < this.nestedViews.length; i++) {
        const nextRemovedViews: any[] = removedViews.shift();
        if (nextRemovedViews && nextRemovedViews.length) {
          nextRemovedViews.forEach(view => {
            if (view.clazz === nestedViewClass) {
              result.push([view, callback(view)]);
            }
          });
        }

        const view = this.nestedViews[i];
        if (view.clazz === nestedViewClass) {
          result.push([view, callback(view)]);
        }
      }
    }

    if (this.removedNestedViews) {
      while (this.removedNestedViews.length) {
        let entries = this.removedNestedViews.shift();
        if (entries) {
          entries.forEach((view: any) => {
            if (view.clazz === nestedViewClass) {
              result.push([view, callback(view)]);
            }
          });
        }
      }
    }

    return result;
  }

  moveView(view: AppView<any>, currentIndex: number) {
    const previousIndex = this.nestedViews.indexOf(view);
    super.moveView(view, currentIndex);
    if (this.removedNestedViews) {
      const limit = this.removedNestedViews ? this.removedNestedViews.length - 1 : 0;
      if (currentIndex < previousIndex) {
        if (limit >= currentIndex) {
          this.removedNestedViews.splice(currentIndex, 0, null);
        }
        if (limit >= previousIndex) {
          this.removedNestedViews.splice(previousIndex, 1);
        }
      } else if (previousIndex > currentIndex) {
        if (limit >= currentIndex) {
          this.removedNestedViews.splice(currentIndex, 1);
        }
        if (limit >= previousIndex) {
          this.removedNestedViews.splice(previousIndex, 1, null);
        }
      }
    }
  }

  attachView(view: AppView<any>, viewIndex: number) {
    super.attachView(view, viewIndex);
    const limit = this.removedNestedViews ? this.removedNestedViews.length - 1 : -1;
    if (limit >= 0 && viewIndex <= limit) {
      this.removedNestedViews.splice(viewIndex, 0, null);
    }
  }

  detachView(viewIndex: number): AppView<any> {
    let oldView = this.nestedViews[viewIndex];
    if (oldView != null) {
      oldView = super.detachView(viewIndex);
      if (!this.removedNestedViews) {
        this.removedNestedViews = [];
      }
      if (viewIndex < this.removedNestedViews.length - 1) {
        // we have shrunk the size of the view array
        // therefore we need to also shrink the remove array
        this.removedNestedViews.splice(viewIndex, 1);
        let views = this.removedNestedViews[viewIndex];
        if (views) {
          views.unshift(oldView);
        } else {
          this.removedNestedViews[viewIndex] = [oldView];
        }
      } else {
        // we need to grow the remove array to be the same
        // length up to the length of the view array
        pushUntil(this.removedNestedViews, viewIndex, null);
        let views = this.removedNestedViews[viewIndex];
        if (views) {
          views.push(oldView);
        } else {
          this.removedNestedViews[viewIndex] = [oldView];
        }
      }
    }
    return oldView;
  }
}

function pushUntil(arr: any[], limit: number, value: any) {
  for (var i = 0; i <= limit; i++) {
    if (i < arr.length) {
      const value = arr[i];
      if (!value) arr[i] = value;
    } else {
      arr.push(value);
    }
  }
}
