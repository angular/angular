import {
  ChangeDetector,
  ProtoChangeDetector,
  DynamicChangeDetector
} from 'angular2/change_detection';
import {SpyObject, proxy} from './test_lib';

// Remove dummy methods after https://github.com/angular/ts2dart/issues/209 is fixed.
@proxy
export class SpyChangeDetector extends SpyObject implements ChangeDetector {
  parent: ChangeDetector;
  mode: string;

  constructor() { super(DynamicChangeDetector, true); }

  addChild(cd: ChangeDetector): void { return this.spy("addChild")(cd); }

  addShadowDomChild(cd: ChangeDetector): void { return this.spy("addShadowDomChild")(cd); }

  removeChild(cd: ChangeDetector): void { return this.spy("removeChild")(cd); }

  removeShadowDomChild(cd: ChangeDetector): void { return this.spy("removeShadowDomChild")(cd); }

  remove(): void { return this.spy("remove")(); }

  hydrate(context: any, locals: any, directives: any): void {
    return this.spy("hydrate")(context, locals, directives);
  }

  dehydrate(): void { return this.spy("dehydrate")(); }

  markPathToRootAsCheckOnce(): void { return this.spy("markPathToRootAsCheckOnce")(); }

  detectChanges(): void { return this.spy("detectChanges")(); }

  checkNoChanges(): void { return this.spy("checkNoChanges")(); }

  noSuchMethod(m) { return super.noSuchMethod(m) }
}

// Remove dummy methods after https://github.com/angular/ts2dart/issues/209 is fixed.
@proxy
export class SpyProtoChangeDetector extends SpyObject implements ProtoChangeDetector {
  constructor() { super(DynamicChangeDetector, true); }

  instantiate(v: any): any { return this.spy("instantiate")(v); }
}