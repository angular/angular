import {isBlank} from 'angular2/src/facade/lang';
import {Pipes} from 'angular2/src/core/change_detection/pipes';
import {EventEmitter} from 'angular2/src/facade/async';
import {
  ChangeDetector,
  ChangeDispatcher,
  DirectiveIndex,
  BindingTarget
} from 'angular2/src/core/change_detection/change_detection';

export class TestDirective {
  eventLog: string[] = [];
  dirProp: string;
  click: EventEmitter<any> = new EventEmitter<any>();

  onEvent(value: string) { this.eventLog.push(value); }
}

export class TestDispatcher implements ChangeDispatcher {
  log: string[];

  constructor(public directives: any[], public detectors: ChangeDetector[]) { this.clear(); }

  getDirectiveFor(di: DirectiveIndex) { return this.directives[di.directiveIndex]; }

  getDetectorFor(di: DirectiveIndex) { return this.detectors[di.directiveIndex]; }

  clear() { this.log = []; }

  notifyOnBinding(target: BindingTarget, value) {
    this.log.push(`${target.mode}(${target.name})=${this._asString(value)}`);
  }

  logBindingUpdate(target, value) {}

  notifyAfterContentChecked() {}
  notifyAfterViewChecked() {}

  notifyOnDestroy() {}

  getDebugContext(a, b, c) { return null; }

  _asString(value) { return (isBlank(value) ? 'null' : value.toString()); }
}

export class TestPipes implements Pipes {
  get(type: string) { return null; }
}
