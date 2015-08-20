import {Injectable, Inject} from "angular2/di";
import {RenderProtoViewRef} from "angular2/src/core/render/api";
import {ON_WEB_WORKER} from "angular2/src/web_workers/shared/api";

@Injectable()
export class RenderProtoViewRefStore {
  private _lookupByIndex: Map<number, RenderProtoViewRef> = new Map<number, RenderProtoViewRef>();
  private _lookupByProtoView: Map<RenderProtoViewRef, number> =
      new Map<RenderProtoViewRef, number>();
  private _nextIndex: number = 0;
  private _onWebworker: boolean;

  constructor(@Inject(ON_WEB_WORKER) onWebworker) { this._onWebworker = onWebworker; }

  storeRenderProtoViewRef(ref: RenderProtoViewRef): number {
    if (this._lookupByProtoView.has(ref)) {
      return this._lookupByProtoView.get(ref);
    } else {
      this._lookupByIndex.set(this._nextIndex, ref);
      this._lookupByProtoView.set(ref, this._nextIndex);
      return this._nextIndex++;
    }
  }

  retreiveRenderProtoViewRef(index: number): RenderProtoViewRef {
    return this._lookupByIndex.get(index);
  }

  deserialize(index: number): RenderProtoViewRef {
    if (index == null) {
      return null;
    }

    if (this._onWebworker) {
      return new WebWorkerRenderProtoViewRef(index);
    } else {
      return this.retreiveRenderProtoViewRef(index);
    }
  }

  serialize(ref: RenderProtoViewRef): number {
    if (ref == null) {
      return null;
    }

    if (this._onWebworker) {
      return (<WebWorkerRenderProtoViewRef>ref).refNumber;
    } else {
      return this.storeRenderProtoViewRef(ref);
    }
  }
}

export class WebWorkerRenderProtoViewRef extends RenderProtoViewRef {
  constructor(public refNumber: number) { super(); }
}
