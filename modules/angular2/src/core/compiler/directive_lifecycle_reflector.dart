library angular2.src.core.compiler.directive_lifecycle_reflector;

import 'package:angular2/src/core/metadata.dart';
import 'package:angular2/src/core/compiler/interfaces.dart';
import 'package:angular2/src/core/reflection/reflection.dart';

bool hasLifecycleHook(LifecycleEvent e, type, DirectiveMetadata annotation) {
  if (annotation.lifecycle != null) {
    return annotation.lifecycle.contains(e);
  } else {
    if (type is! Type) return false;

    final List interfaces = reflector.interfaces(type);
    var interface;

    if (e == LifecycleEvent.OnChanges) {
      interface = OnChanges;
    } else if (e == LifecycleEvent.OnDestroy) {
      interface = OnDestroy;
    } else if (e == LifecycleEvent.AfterContentInit) {
      interface = AfterContentInit;
    } else if (e == LifecycleEvent.AfterContentChecked) {
      interface = AfterContentChecked;
    } else if (e == LifecycleEvent.AfterViewInit) {
      interface = AfterViewInit;
    } else if (e == LifecycleEvent.AfterViewChecked) {
      interface = AfterViewChecked;
    } else if (e == LifecycleEvent.DoCheck) {
      interface = DoCheck;
    } else if (e == LifecycleEvent.OnInit) {
      interface = OnInit;
    }

    return interfaces.contains(interface);
  }
}
