import {Injectable, Inject} from "angular2/src/core/di";
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

  allocate(): RenderProtoViewRef {
    var index = this._nextIndex++;
    var result = new WebWorkerRenderProtoViewRef(index);
    this.store(result, index);
    return result;
  }

  store(ref: RenderProtoViewRef, index: number): void {
    this._lookupByProtoView.set(ref, index);
    this._lookupByIndex.set(index, ref);
  }

  deserialize(index: number): RenderProtoViewRef {
    if (index == null) {
      return null;
    }
    return this._lookupByIndex.get(index);
  }

  serialize(ref: RenderProtoViewRef): number {
    if (ref == null) {
      return null;
    }
    if (this._onWebworker) {
      return (<WebWorkerRenderProtoViewRef>ref).refNumber;
    } else {
      return this._lookupByProtoView.get(ref);
    }
  }
}

export class WebWorkerRenderProtoViewRef extends RenderProtoViewRef {
  constructor(public refNumber: number) { super(); }
}
