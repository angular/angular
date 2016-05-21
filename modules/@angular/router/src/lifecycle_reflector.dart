import './interfaces.dart';
bool hasLifecycleHook(String name, Object obj) {
  if (name == "routerOnActivate") return obj is OnActivate;
  if (name == "routerCanDeactivate") return obj is CanDeactivate;
  if (name == "routerCanDeactivateChild") return obj is CanDeactivateChild;
  if (name == "routerOnDeactivate") return obj is OnDeactivate;
  return false;
}
