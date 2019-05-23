import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing/src/test_bed';
import {By} from '@angular/platform-browser';

describe('MatCheckbox bug reproduction', () => {

  @Component({
    selector: 'mat-checkbox',
    template: `{{checked}}`,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class MatCheckbox {
    @Input()
    get checked(): boolean {return this._checked;}
    set checked(checked) {this._checked = checked; };
    private _checked = false;

    constructor(public _changeDetectorRef: ChangeDetectorRef) {}

    ngAfterViewInit() {
      // With Ivy this doesn't have any effect as the component lview dirty flag is reset
      // after the view init hooks were executed ("leaveView"). With View Engine, the order
      // is slightly because a component is marked as *non-dirty* when it's children have
      // been checked. The lifecycle hooks execute when the parent is checked. This means
      // that the "dirty" flag is not reset once the "ngAfterViewInit" hook executed.

      /*
          1.  Running AfterViewInit for children of: MatCheckbox
          2.  Resetting "ChecksEnabled" / aka Dirty-Flag for: MatCheckbox
          3.  Running AfterViewInit for children of: MyTestComp
          4.  Marked checkbox **dirty** as part of: MatCheckbox#ngAfterViewInit
          5.  Running AfterViewInit hooks for children of [ROOT]

          ==> "MatCheckbox" is left as dirty. Test passes as `detectChanges` re-checks
              the checkbox bindings.
       */

      this._changeDetectorRef.markForCheck();
    }
  }

  @Component({
    template: `
      <mat-checkbox [checked]="isChecked"></mat-checkbox>
    `
  })
  class MyTestComp {
    isChecked = false;
  }

  fit('should work', () => {
    TestBed.configureTestingModule({declarations: [MyTestComp, MatCheckbox]});
    const fixture = TestBed.createComponent(MyTestComp);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.directive(MatCheckbox)).componentInstance as MatCheckbox;

    checkbox.checked = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('true');
  })

});
