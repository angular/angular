import {RenderProtoView} from './proto_view';

import * as api from '../../api';

export function internalProtoView(protoViewRef:api.RenderProtoViewRef):RenderProtoView {
  var ddpvr:DirectDomRenderProtoViewRef = protoViewRef;
  return ddpvr._protoView;
}

export class DirectDomRenderProtoViewRef extends api.RenderProtoViewRef {
  _protoView:RenderProtoView;

  constructor(protoView:RenderProtoView) {
    super();
    this._protoView = protoView;
  }
}
