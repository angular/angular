import {RenderView} from './view';

import * as api from '../../api';

export function internalView(viewRef:api.RenderViewRef):RenderView {
  var ddvr:DirectDomRenderViewRef = viewRef;
  return ddvr._view;
}

export class DirectDomRenderViewRef extends api.RenderViewRef {
  _view:RenderView;

  constructor(view:RenderView) {
    super();
    this._view = view;
  }
}
