library angular2.src.core.change_detection.interfaces;

import "parser/locals.dart" show Locals;
import "binding_record.dart" show BindingTarget, BindingRecord;
import "directive_record.dart" show DirectiveRecord, DirectiveIndex;
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
  DebugContext getDebugContext(
      dynamic appElement, num elementIndex, num directiveIndex);
  void notifyOnBinding(BindingTarget bindingTarget, dynamic value);
  void logBindingUpdate(BindingTarget bindingTarget, dynamic value);
  void notifyAfterContentChecked();
  void notifyAfterViewChecked();
  void notifyOnDestroy();
  ChangeDetector getDetectorFor(DirectiveIndex directiveIndex);
  dynamic getDirectiveFor(DirectiveIndex directiveIndex);
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
  void hydrate(dynamic context, Locals locals, ChangeDispatcher dispatcher,
      dynamic pipes);
  void dehydrate();
  void markPathToRootAsCheckOnce();
  handleEvent(String eventName, num elIndex, dynamic event);
  void detectChanges();
  void checkNoChanges();
  void destroyRecursive();
  void markAsCheckOnce();
}

abstract class ProtoChangeDetector {
  ChangeDetector instantiate();
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
