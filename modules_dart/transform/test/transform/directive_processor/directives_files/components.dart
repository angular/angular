library angular2.test.transform.directive_processor.directive_files.components;

import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;
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
