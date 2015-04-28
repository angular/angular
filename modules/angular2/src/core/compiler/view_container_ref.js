import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';
import {Injector} from 'angular2/di';
import * as eiModule from 'angular2/src/core/compiler/element_injector';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

import * as viewModule from './view';
import * as avmModule from './view_manager';

/**
 * @exportedAs angular2/view
 */
export class ViewContainerRef {
  _viewManager: avmModule.AppViewManager;
  _location: eiModule.ElementRef;
  _defaultProtoView: viewModule.AppProtoView;

  constructor(viewManager: avmModule.AppViewManager,
              location: eiModule.ElementRef,
              defaultProtoView: viewModule.AppProtoView) {
    this._viewManager = viewManager;
    this._location = location;
    this._defaultProtoView = defaultProtoView;
  }

  _getViews() {
    var vc = this._location.hostView.viewContainers[this._location.boundElementIndex];
    return isPresent(vc) ? vc.views : [];
  }

  clear():void {
    for (var i = this.length - 1; i >= 0; i--) {
      this.remove(i);
    }
  }

  get(index: number): viewModule.AppView {
    return this._getViews()[index];
  }

  get length() /* :int */ {
    return this._getViews().length;
  }

  // TODO(rado): profile and decide whether bounds checks should be added
  // to the methods below.
  create(atIndex:number=-1, protoView:viewModule.AppProtoView = null, injector:Injector = null): viewModule.AppView {
    if (atIndex == -1) atIndex = this.length;
    if (isBlank(protoView)) {
      protoView = this._defaultProtoView;
    }
    return this._viewManager.createViewInContainer(this._location, atIndex, protoView, injector);
  }

  insert(view:viewModule.AppView, atIndex:number=-1): viewModule.AppView {
    if (atIndex == -1) atIndex = this.length;
    return this._viewManager.attachViewInContainer(this._location, atIndex, view);
  }

  indexOf(view:viewModule.AppView) {
    return ListWrapper.indexOf(this._getViews(), view);
  }

  remove(atIndex:number=-1):void {
    if (atIndex == -1) atIndex = this.length - 1;
    this._viewManager.destroyViewInContainer(this._location, atIndex);
    // view is intentionally not returned to the client.
  }

  /**
   * The method can be used together with insert to implement a view move, i.e.
   * moving the dom nodes while the directives in the view stay intact.
   */
  detach(atIndex:number=-1): viewModule.AppView {
    if (atIndex == -1) atIndex = this.length - 1;
    return this._viewManager.detachViewInContainer(this._location, atIndex);
  }
}
