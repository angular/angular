library angular2.src.core.change_detection.directive_record;

import "package:angular2/src/facade/lang.dart"
    show StringWrapper, normalizeBool, isBlank;
import "constants.dart"
    show isDefaultChangeDetectionStrategy, ChangeDetectionStrategy;

class DirectiveIndex {
  num elementIndex;
  num directiveIndex;
  DirectiveIndex(this.elementIndex, this.directiveIndex) {}
  get name {
    return '''${ this . elementIndex}_${ this . directiveIndex}''';
  }
}

class DirectiveRecord {
  DirectiveIndex directiveIndex;
  bool callAfterContentInit;
  bool callAfterContentChecked;
  bool callAfterViewInit;
  bool callAfterViewChecked;
  bool callOnChanges;
  bool callDoCheck;
  bool callOnInit;
  ChangeDetectionStrategy changeDetection;
  DirectiveRecord(
      {directiveIndex,
      callAfterContentInit,
      callAfterContentChecked,
      callAfterViewInit,
      callAfterViewChecked,
      callOnChanges,
      callDoCheck,
      callOnInit,
      changeDetection}) {
    this.directiveIndex = directiveIndex;
    this.callAfterContentInit = normalizeBool(callAfterContentInit);
    this.callAfterContentChecked = normalizeBool(callAfterContentChecked);
    this.callOnChanges = normalizeBool(callOnChanges);
    this.callAfterViewInit = normalizeBool(callAfterViewInit);
    this.callAfterViewChecked = normalizeBool(callAfterViewChecked);
    this.callDoCheck = normalizeBool(callDoCheck);
    this.callOnInit = normalizeBool(callOnInit);
    this.changeDetection = changeDetection;
  }
  bool isDefaultChangeDetection() {
    return isDefaultChangeDetectionStrategy(this.changeDetection);
  }
}
