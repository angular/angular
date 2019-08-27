import { Directive, NgModule, NgZone, Component } from '@angular/core';
import { CheckboxControlValueAccessor, NG_VALUE_ACCESSOR, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { BaseComponentFromOtherFile, hostBindings } from './base-component';


@Directive({
  selector: 'my-base-dir',
  providers: [{provide: NgZone, useValue: null}]
})
export class BaseDirective {}

@Directive({
    selector: 'my-base-dir',
    providers: [{ provide: NgZone, useValue: null }]
})
export class DerivedDirective extends BaseDirective {}

@Directive({
    selector: "input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]",
    host: {
        "(change)": "onChange($event.target.checked)",
        "(blur)": "onTouched()"
    },
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: CheckboxControlValueAccessor,
            multi: true
        }]
})
export class DerivedDirectiveFromNodeModules extends CheckboxControlValueAccessor {}

@Component({
    selector: 'base-comp',
    template: `
    <span>This is the template.</span>
  `,
    host: hostBindings,
    providers: [
        { provide: NG_ASYNC_VALIDATORS, useValue: null },
    ],
    // The following fields were copied from the base class,
    // but could not be updated automatically to work in the
    // new file location. Please add any required imports for
    // the properties below:
    styleUrls: nonExportedStyleUrlsVar
})
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
