import { Component, Directive, NgModule, NgZone, Injectable } from '@angular/core';

@Injectable()
export class ComponentTypeProvider {}
export class ComponentDontNeedCase {}
@Injectable()
export class ComponentProvider {}
@Injectable()
export class ComponentProvider2 {}

@Component({
  template: '',
  viewProviders: [ComponentTypeProvider, [
    {provide: ComponentDontNeedCase, useExisting: ComponentProvider}]
  ],
  providers: [ComponentProvider2]
})
export class ProvidersTestComponent {}

@Injectable()
export class DirectiveTypeProvider {}
export class DirectiveDontNeedCase {}
@Injectable()
export class DirectiveProvider {}

@Directive({
  selector: 'test-dir',
  providers: [DirectiveTypeProvider, [
    {provide: DirectiveDontNeedCase, useExisting: DirectiveProvider}]
  ],
})
export class ProvidersTestDirective {}

@Injectable()
export class TypeCase {}

// undecorated-classes-with-di migration will add "@Injectable" here
// because the constructor is inherited in "ProvideCase".
@Injectable()
class BaseProviderCase {
  constructor(zone: NgZone) {}
}

@Injectable()
export class ProvideCase extends BaseProviderCase {}

@Injectable()
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

