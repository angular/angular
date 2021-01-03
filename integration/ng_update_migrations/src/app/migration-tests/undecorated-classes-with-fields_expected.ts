import {
  Component,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Injectable,
  Input,
  NgModule,
  Pipe
} from '@angular/core';

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

@Directive({selector: null})
export class AbstractDir {}

@Directive()
export class DerivedAbstractDir extends AbstractDir {}

@Directive()
export class WrappedDerivedAbstractDir extends DerivedAbstractDir {}

// TODO: Add Angular decorator.
export class UndecoratedService {
  ngOnDestroy() {}
}

// TODO: Add Angular decorator.
export class UndecoratedPipeBase {
  ngOnDestroy() {}
}

@Directive()
export class WithDirectiveLifecycleHook {
  ngOnInit() {}
}

// This class is already decorated and should not be migrated. i.e. no TODO
// or Angular decorator should be added. `@Injectable` is sufficient.
@Injectable()
export class MyService {
  ngOnDestroy() {}
}

// This class is already decorated and should not be migrated. i.e. no TODO
// or Angular decorator should be added. `@Injectable` is sufficient.
@Pipe({name: 'my-pipe'})
export class MyPipe {
  ngOnDestroy() {}
}
