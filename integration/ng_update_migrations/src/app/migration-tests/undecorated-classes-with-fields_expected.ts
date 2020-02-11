import { Component, ElementRef, HostBinding, HostListener, Input, NgModule, Directive } from '@angular/core';

export class NonAngularBaseClass {
  greet() {}
}

@Directive()
export class BaseClass extends NonAngularBaseClass {
  @Input() enabled = true;
}

@Directive()
export class SecondBaseClass extends BaseClass {
  toggleEnabled() {
    this.enabled = !this.enabled;
  }
}

@Directive()
export class ThirdBaseClass extends SecondBaseClass {
  @HostListener('focus') onFocus() {}
}

@Directive()
export class FourthBaseClass extends ThirdBaseClass {
  focus() {
    this.onFocus();
  }
}

export class FifthBaseClass {
  constructor(private _elementRef: ElementRef) {}
  protected calculatePosition(): any {}
}

@Directive()
export class MyCompSuperBase {
  @HostBinding('class.hello') hello = true;
}

@Directive()
export class MyCompBase extends MyCompSuperBase {}

@Component({
  selector: 'my-comp',
  template: '',
})
export class MyComp extends MyCompBase {}

@Component({
    selector: 'my-comp',
    template: '',
})
export class WrappedMyComp extends MyComp {}

@NgModule({declarations: [MyComp, WrappedMyComp]})
export class TestModule {}
