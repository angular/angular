import {isPresent} from 'angular2/src/facade/lang';
import * as viewModule from './view';
import {RenderViewRef} from 'angular2/src/render/api';

// This is a workaround for privacy in Dart as we don't have library parts
export function internalView(viewRef:ViewRef):viewModule.AppView {
  return viewRef._view;
}

// This is a workaround for privacy in Dart as we don't have library parts
export function internalProtoView(protoViewRef:ProtoViewRef):viewModule.AppProtoView {
  return isPresent(protoViewRef) ? protoViewRef._protoView : null;
}

/**
 * @exportedAs angular2/view
 */
export class ViewRef {
  _view:viewModule.AppView;

  constructor(view:viewModule.AppView) {
    this._view = view;
  }

  get render():RenderViewRef {
    return this._view.render;
  }

  setLocal(contextName:string, value:any):void {
    this._view.setLocal(contextName, value);
  }
}

/**
 * @exportedAs angular2/view
 */
export class ProtoViewRef {
  _protoView:viewModule.AppProtoView;

  constructor(protoView) {
    this._protoView = protoView;
  }
}
