library angular2.test.compiler.change_detector_mocks;

import "package:angular2/src/facade/lang.dart" show isBlank;
import "package:angular2/src/core/change_detection/pipes.dart" show Pipes;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ProtoChangeDetector, ChangeDispatcher, DirectiveIndex, BindingTarget;

class TestDirective {
  List<String> eventLog = [];
  String dirProp;
  onEvent(String value) {
    this.eventLog.add(value);
  }
}

class TestDispatcher implements ChangeDispatcher {
  List<dynamic> directives;
  List<ProtoChangeDetector> detectors;
  List<String> log;
  TestDispatcher(this.directives, this.detectors) {
    this.clear();
  }
  getDirectiveFor(DirectiveIndex di) {
    return this.directives[di.directiveIndex];
  }

  getDetectorFor(DirectiveIndex di) {
    return this.detectors[di.directiveIndex];
  }

  clear() {
    this.log = [];
  }

  notifyOnBinding(BindingTarget target, value) {
    this.log.add(
        '''${ target . mode}(${ target . name})=${ this . _asString ( value )}''');
  }

  logBindingUpdate(target, value) {}
  notifyAfterContentChecked() {}
  notifyAfterViewChecked() {}
  getDebugContext(a, b) {
    return null;
  }

  _asString(value) {
    return (isBlank(value) ? "null" : value.toString());
  }
}

class TestPipes implements Pipes {
  get(String type) {
    return null;
  }
}
