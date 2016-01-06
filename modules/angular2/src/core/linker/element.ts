import {isPresent, isBlank, Type} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';

import {Injector} from 'angular2/src/core/di';

import {AppView} from './view';
import {ViewType} from './view_type';
import {ElementRef_} from './element_ref';

import {ViewContainerRef, ViewContainerRef_} from './view_container_ref';

import {QueryList} from './query_list';

export class AppElement {
  public nestedViews: AppView<any>[] = null;
  public componentView: AppView<any> = null;

  private _ref: ElementRef_;
  private _vcRef: ViewContainerRef_;
  public component: any;
  public componentConstructorViewQueries: QueryList<any>[];

  constructor(public index: number, public parentIndex: number, public parentView: AppView<any>,
              public nativeElement: any) {}

  get ref(): ElementRef_ {
    if (isBlank(this._ref)) {
      this._ref = new ElementRef_(this);
    }
    return this._ref;
  }

  get vcRef(): ViewContainerRef_ {
    if (isBlank(this._vcRef)) {
      this._vcRef = new ViewContainerRef_(this);
    }
    return this._vcRef;
  }

  initComponent(component: any, componentConstructorViewQueries: QueryList<any>[],
                view: AppView<any>) {
    this.component = component;
    this.componentConstructorViewQueries = componentConstructorViewQueries;
    this.componentView = view;
  }

  get parentInjector(): Injector { return this.parentView.injector(this.parentIndex); }
  get injector(): Injector { return this.parentView.injector(this.index); }

  mapNestedViews(nestedViewClass: any, callback: Function): any[] {
    var result = [];
    if (isPresent(this.nestedViews)) {
      this.nestedViews.forEach((nestedView) => {
        if (nestedView.clazz === nestedViewClass) {
          result.push(callback(nestedView));
        }
      });
    }
    return result;
  }


  attachView(view: AppView<any>, viewIndex: number) {
    if (view.type === ViewType.COMPONENT) {
      throw new BaseException(`Component views can't be moved!`);
    }
    var nestedViews = this.nestedViews;
    if (nestedViews == null) {
      nestedViews = [];
      this.nestedViews = nestedViews;
    }
    ListWrapper.insert(nestedViews, viewIndex, view);
    var refRenderNode;
    if (viewIndex > 0) {
      var prevView = nestedViews[viewIndex - 1];
      refRenderNode = prevView.lastRootNode;
    } else {
      refRenderNode = this.nativeElement;
    }
    if (isPresent(refRenderNode)) {
      view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
    }
    this.parentView.addRenderContentChild(view);
  }

  detachView(viewIndex: number): AppView<any> {
    var view = ListWrapper.removeAt(this.nestedViews, viewIndex);
    if (view.type === ViewType.COMPONENT) {
      throw new BaseException(`Component views can't be moved!`);
    }

    view.renderer.detachView(view.flatRootNodes);

    view.renderParent.removeContentChild(view);
    return view;
  }
}
