import {Injectable, Inject} from "angular2/di";
import {RenderProtoViewRef} from "angular2/src/render/api";
import {ON_WEBWORKER} from "angular2/src/web-workers/shared/api";

@Injectable()
export class RenderProtoViewRefStore {
  private _lookupByIndex: Map<number, RenderProtoViewRef> = new Map<number, RenderProtoViewRef>();
  private _lookupByProtoView: Map<RenderProtoViewRef, number> =
      new Map<RenderProtoViewRef, number>();
  private _nextIndex: number = 0;
  private _onWebworker: boolean;

  constructor(@Inject(ON_WEBWORKER) onWebworker) { this._onWebworker = onWebworker; }

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
      return new WebworkerRenderProtoViewRef(index);
    } else {
      return this.retreiveRenderProtoViewRef(index);
    }
  }

  serialize(ref: RenderProtoViewRef): number {
    if (ref == null) {
      return null;
    }

    if (this._onWebworker) {
      return (<WebworkerRenderProtoViewRef>ref).refNumber;
    } else {
      return this.storeRenderProtoViewRef(ref);
    }
  }
}

export class WebworkerRenderProtoViewRef extends RenderProtoViewRef {
  constructor(public refNumber: number) { super(); }
}
