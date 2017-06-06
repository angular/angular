library angular2.src.core.compiler.directive_lifecycle_reflector;

import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/metadata/lifecycle_hooks.dart';

const INTERFACES = const {
  LifecycleHooks.OnInit: OnInit,
  LifecycleHooks.OnDestroy: OnDestroy,
  LifecycleHooks.DoCheck: DoCheck,
  LifecycleHooks.OnChanges: OnChanges,
  LifecycleHooks.AfterContentInit: AfterContentInit,
  LifecycleHooks.AfterContentChecked: AfterContentChecked,
  LifecycleHooks.AfterViewInit: AfterViewInit,
  LifecycleHooks.AfterViewChecked: AfterViewChecked,
};

bool hasLifecycleHook(LifecycleHooks interface, token) {
  if (token is! Type) return false;
  Type interfaceType = INTERFACES[interface];
  return reflector.interfaces(token).contains(interfaceType);
}
