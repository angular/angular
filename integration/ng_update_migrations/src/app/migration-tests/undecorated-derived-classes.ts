import {Directive, NgModule, NgZone} from '@angular/core';
import {CheckboxControlValueAccessor} from '@angular/forms';
import {BaseComponentFromOtherFile} from './base-component';


@Directive({
  selector: 'my-base-dir',
  providers: [{provide: NgZone, useValue: null}]
})
export class BaseDirective {}

export class DerivedDirective extends BaseDirective {}

export class DerivedDirectiveFromNodeModules extends CheckboxControlValueAccessor {}

export class DerivedComponentFromOtherSourceFile extends BaseComponentFromOtherFile {}

@NgModule({
  declarations: [
    DerivedDirective,
    DerivedDirectiveFromNodeModules,
    DerivedComponentFromOtherSourceFile,
  ],
})
export class TestModule {}


@NgModule({
  declarations: [BaseDirective],
})
export class BaseClassesModule {}
