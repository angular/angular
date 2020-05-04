import {Component, Directive, NgModule, NgZone, Injectable} from '@angular/core';

export class ComponentTypeProvider {}
export class ComponentDontNeedCase {}
export class ComponentProvider {}
export class ComponentProvider2 {}

@Component({
  template: '',
  viewProviders: [ComponentTypeProvider, [
    {provide: ComponentDontNeedCase, useClass: ComponentProvider}]
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
    {provide: DirectiveDontNeedCase, useClass: DirectiveProvider}]
  ],
})
export class ProvidersTestDirective {}

export class TypeCase {}

@Injectable()
class BaseProviderCase {
  constructor(zone: NgZone) {}
}

export class EmptyProviderLiteralCase {}

export class ProviderClass extends BaseProviderCase {}

export class DontNeedCase {}

@Directive()
export class DirectiveCase {}

@NgModule({
  providers: [
    TypeCase,
    {provide: EmptyProviderLiteralCase},
    {provide: DontNeedCase, useValue: 0},
    {provide: DontNeedCase, useFactory: () => null},
    {provide: DontNeedCase, useExisting: TypeCase},
    {provide: DontNeedCase, useClass: ProviderClass},
    DirectiveCase,
  ],
  declarations: [ProvidersTestDirective, ProvidersTestComponent],
})
export class ProvidersTestModule {}
