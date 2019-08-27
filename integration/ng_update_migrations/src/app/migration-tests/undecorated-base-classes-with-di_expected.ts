import {Directive, NgModule, NgZone} from '@angular/core';

@Directive()
export class BaseClass1 {
  constructor(zone: NgZone) {}
}

@Directive({selector: 'sel'})
export class DirectiveWithInheritedCtor extends BaseClass1 {}

export class BaseClass2 {
  constructor(zone: NgZone) {}
}

@Directive({selector: 'sel'})
export class DirectiveWithExplicitCtor extends BaseClass2 {
  constructor(zone: NgZone) {
    super(zone);
  }
}

export class BaseClassWithoutCtor {}

@Directive({selector: 'sel'})
export class DirectiveWithoutInheritedCtor extends BaseClassWithoutCtor {}

@Directive()
export class BaseClass3 {
  constructor(zone: NgZone) {}
}
@Directive()
export class PassThroughClass extends BaseClass3 {}

@Directive({selector: 'sel'})
export class DirectiveWithInheritedCtorAndClassesInBetween extends PassThroughClass {}

@NgModule({
  declarations: [
    DirectiveWithInheritedCtor,
    DirectiveWithoutInheritedCtor,
    DirectiveWithExplicitCtor,
    DirectiveWithInheritedCtorAndClassesInBetween,
  ]
})
export class TestModule {}
