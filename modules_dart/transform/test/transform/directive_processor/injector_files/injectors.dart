library angular2.test.transform.directive_processor.injector_files.injectors;

import 'package:angular2/angular2.dart'
    show InjectorModule, Injectable;

@InjectorModule(
    providers: [ServiceDep])
class InjectorWithProvidersTypes {}

@InjectorModule()
class InjectorWithProviderProperties {
  @Provides(ServiceDep)
  dynamic someProp = true;

  @Provides(ServiceDep)
  get someGetter => true;

  @Provides(ServiceDep, multi: true)
  get someMultiProp => true;
}

@InjectorModule()
@Injectable()
class InjectorWithDeps {
  ServiceDep dep2;

  InjectorWithDeps(ServiceDep dep0, @Inject(ServiceDep) dep1, this.dep2, invalidArg);
}

@InjectorModule()
class NonInjectable {
}
