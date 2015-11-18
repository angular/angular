library angular2.test.transform.directive_processor.directive_files.components;

import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement, Output, Input;
import 'dep1.dart';
import 'dep2.dart' as dep2;

@Component(selector: 'component-first')
@View(template: '<dep1></dep1><dep2></dep2>', directives: [Dep, dep2.Dep])
class ComponentFirst {}

@View(template: '<dep1></dep1><dep2></dep2>', directives: [dep2.Dep, Dep])
@Component(selector: 'view-first')
class ViewFirst {}

@Component(
    selector: 'component-only',
    template: '<dep1></dep1><dep2></dep2>',
    directives: [Dep, dep2.Dep])
class ComponentOnly {}

@Component(
    selector: 'component-with-outputs',
    template: '<dep1></dep1><dep2></dep2>',
    outputs: ['a'])
class ComponentWithOutputs {
  @Output() Object b;
  @Output('renamed') Object c;

  Object _d;
  @Output() Object get d => _d;

  Object _e;
  @Output('get-renamed') Object get e => _e;
}

@Component(
    selector: 'component-with-inputs',
    template: '<dep1></dep1><dep2></dep2>',
    inputs: ['a'])
class ComponentWithInputs {
  @Input() Object b;
  @Input('renamed') Object c;

  Object _d;
  @Input() void set d(Object value) {
    _d = value;
  }

  Object _e;
  @Input('set-renamed') void set e(Object value) {
    _e = value;
  }
}

@Component(
    selector: 'component-with-inputs',
    template: '<dep1></dep1><dep2></dep2>',
    host: {'[a]': 'a'})
class ComponentWithHostBindings {
  @HostBinding() Object b;
  @HostBinding('renamed') Object c;
}

@Component(
    selector: 'component-with-inputs',
    template: '<dep1></dep1><dep2></dep2>',
    host: {'(a)': 'onA()'})
class ComponentWithHostListeners {
  @HostListener('b') void onB() {}
  @HostListener('c', ['\$event.target', '\$event.target.value']) void onC(
      t, v) {}
}
