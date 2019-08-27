import { Directive, NgModule, NgZone, Injectable } from '@angular/core';

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
  ]
})
export class ProvidersTestModule {}
