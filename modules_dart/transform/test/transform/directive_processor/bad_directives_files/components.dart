library angular2.test.transform.directive_processor.directive_files.components;

import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement, Output, Input, Provider, ContentChild, ContentChildren, ViewChild, ViewChildren;

class ServiceDep {}

class SomeConstClass {
  const SomeConstClass();
}

class Ids {
  static const someValue = 'Test';
  static someFactory() => 'Test';
}

// --- part:component-with-providers-use-nothing
@Component(
    selector: '',
    template: '',
    providers: [const Provider(ServiceDep)])
class ComponentWithProvidersUseNothing {}

// --- part:component-with-providers-use-value-static
@Component(
    selector: '',
    template: '',
    providers: [const Provider(ServiceDep, useValue: Ids.someValue)])
class ComponentWithProvidersUseValueStatic {}

// --- part:component-with-providers-use-value-private
const _somePrivateVar = 'Test';

@Component(
    selector: '',
    template: '',
    providers: [const Provider(ServiceDep, useValue: _somePrivateVar)])
class ComponentWithProvidersUseValueStatic {}

// --- part:component-with-providers-use-value-ctor
@Component(
    selector: '',
    template: '',
    providers: [const Provider(ServiceDep, useValue: const SomeConstClass())])
class ComponentWithProvidersUseValueCtor {}

// --- part:component-with-providers-use-factory-static
@Component(
    selector: '',
    template: '',
    providers: [const Provider(ServiceDep, useFactory: Ids.someFactory)])
class ComponentWithProvidersUseFactoryStatic {}

// --- part:component-with-providers-use-factory-private
@Injectable()
_somePrivateFactory() => 'Test';

@Component(
    selector: '',
    template: '',
    providers: [const Provider(ServiceDep, useFactory: _somePrivateFactory)])
class ComponentWithProvidersUseFactoryPrivate {}
