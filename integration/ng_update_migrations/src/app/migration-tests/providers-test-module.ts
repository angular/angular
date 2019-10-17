import {Component, Directive, NgModule, NgZone} from '@angular/core';

export class ComponentTypeProvider {}
export class ComponentDontNeedCase {}
export class ComponentProvider {}
export class ComponentProvider2 {}

@Component({
  template: '',
  viewProviders: [ComponentTypeProvider, [
    {provide: ComponentDontNeedCase, useExisting: ComponentProvider}]
  ],
  providers: [ComponentProvider2]
})
export class ProvidersTestComponent {}

export class DirectiveTypeProvider {}
export class DirectiveDontNeedCase {}
export class DirectiveProvider {}

@Directive({
  selector: 'test-dir',
  providers: [DirectiveTypeProvider, [
    {provide: DirectiveDontNeedCase, useExisting: DirectiveProvider}]
  ],
})
export class ProvidersTestDirective {}

export class TypeCase {}

// undecorated-classes-with-di migration will add "@Injectable" here
// because the constructor is inherited in "ProvideCase".
class BaseProviderCase {
  constructor(zone: NgZone) {}
}

export class ProvideCase extends BaseProviderCase {}

export class ProviderClass {}

export class DontNeedCase {}

@Directive()
export class DirectiveCase {}

@NgModule({
  providers: [
    TypeCase,
    {provide: ProvideCase},
    {provide: DontNeedCase, useValue: 0},
    {provide: DontNeedCase, useFactory: () => null},
    {provide: DontNeedCase, useExisting: TypeCase},
    {provide: DontNeedCase, useClass: ProviderClass},
    DirectiveCase,
  ],
  declarations: [ProvidersTestDirective, ProvidersTestComponent],
})
export class ProvidersTestModule {}

