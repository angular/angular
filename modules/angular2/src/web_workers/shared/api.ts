import {CONST_EXPR} from "angular2/src/core/facade/lang";
import {OpaqueToken} from "angular2/di";
import {RenderElementRef, RenderViewRef} from "angular2/src/core/render/api";

export const ON_WEB_WORKER = CONST_EXPR(new OpaqueToken('WebWorker.onWebWorker'));

export class WebWorkerElementRef implements RenderElementRef {
  constructor(public renderView: RenderViewRef, public renderBoundElementIndex: number) {}
}
