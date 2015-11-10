library angular2.src.core.change_detection.interfaces;

import "parser/locals.dart" show Locals;
import "binding_record.dart" show BindingTarget, BindingRecord;
import "directive_record.dart" show DirectiveIndex, DirectiveRecord;
import "constants.dart" show ChangeDetectionStrategy;
import "change_detector_ref.dart" show ChangeDetectorRef;

class DebugContext {
  dynamic element;
  dynamic componentElement;
  dynamic directive;
  dynamic context;
  dynamic locals;
  dynamic injector;
  DebugContext(this.element, this.componentElement, this.directive,
      this.context, this.locals, this.injector) {}
}

abstract class ChangeDispatcher {
  DebugContext getDebugContext(num elementIndex, DirectiveIndex directiveIndex);
  void notifyOnBinding(BindingTarget bindingTarget, dynamic value);
  void logBindingUpdate(BindingTarget bindingTarget, dynamic value);
  void notifyAfterContentChecked();
  void notifyAfterViewChecked();
}

abstract class ChangeDetector {
  ChangeDetector parent;
  ChangeDetectionStrategy mode;
  ChangeDetectorRef ref;
  void addContentChild(ChangeDetector cd);
  void addViewChild(ChangeDetector cd);
  void removeContentChild(ChangeDetector cd);
  void removeViewChild(ChangeDetector cd);
  void remove();
  void hydrate(
      dynamic context, Locals locals, dynamic directives, dynamic pipes);
  void dehydrate();
  void markPathToRootAsCheckOnce();
  handleEvent(String eventName, num elIndex, Locals locals);
  void detectChanges();
  void checkNoChanges();
}

abstract class ProtoChangeDetector {
  ChangeDetector instantiate(ChangeDispatcher dispatcher);
}

class ChangeDetectorGenConfig {
  bool genDebugInfo;
  bool logBindingUpdate;
  bool useJit;
  ChangeDetectorGenConfig(
      this.genDebugInfo, this.logBindingUpdate, this.useJit) {}
}

class ChangeDetectorDefinition {
  String id;
  ChangeDetectionStrategy strategy;
  List<String> variableNames;
  List<BindingRecord> bindingRecords;
  List<BindingRecord> eventRecords;
  List<DirectiveRecord> directiveRecords;
  ChangeDetectorGenConfig genConfig;
  ChangeDetectorDefinition(
      this.id,
      this.strategy,
      this.variableNames,
      this.bindingRecords,
      this.eventRecords,
      this.directiveRecords,
      this.genConfig) {}
}
