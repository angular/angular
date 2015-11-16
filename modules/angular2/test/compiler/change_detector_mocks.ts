import {isBlank} from 'angular2/src/facade/lang';
import {Pipes} from 'angular2/src/core/change_detection/pipes';
import {
  ProtoChangeDetector,
  ChangeDispatcher,
  DirectiveIndex,
  BindingTarget
} from 'angular2/src/core/change_detection/change_detection';

export class TestDirective {
  eventLog: string[] = [];
  dirProp: string;

  onEvent(value: string) { this.eventLog.push(value); }
}

export class TestDispatcher implements ChangeDispatcher {
  log: string[];

  constructor(public directives: any[], public detectors: ProtoChangeDetector[]) { this.clear(); }

  getDirectiveFor(di: DirectiveIndex) { return this.directives[di.directiveIndex]; }

  getDetectorFor(di: DirectiveIndex) { return this.detectors[di.directiveIndex]; }

  clear() { this.log = []; }

  notifyOnBinding(target: BindingTarget, value) {
    this.log.push(`${target.mode}(${target.name})=${this._asString(value)}`);
  }

  logBindingUpdate(target, value) {}

  notifyAfterContentChecked() {}
  notifyAfterViewChecked() {}

  getDebugContext(a, b) { return null; }

  _asString(value) { return (isBlank(value) ? 'null' : value.toString()); }
}

export class TestPipes implements Pipes {
  get(type: string) { return null; }
}
