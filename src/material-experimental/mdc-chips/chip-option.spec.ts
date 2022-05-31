import {Directionality} from '@angular/cdk/bidi';
import {dispatchFakeEvent, dispatchKeyboardEvent} from '@angular/cdk/testing/private';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
} from '@angular/material-experimental/mdc-core';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
  MatChipEvent,
  MatChipListbox,
  MatChipOption,
  MatChipSelectionChange,
  MatChipsModule,
} from './index';
import {SPACE} from '@angular/cdk/keycodes';

describe('MDC-based Option Chips', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let primaryAction: HTMLElement;
  let chipInstance: MatChipOption;
  let globalRippleOptions: RippleGlobalOptions;
  let dir = 'ltr';

  beforeEach(waitForAsync(() => {
    globalRippleOptions = {};
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [SingleChip],
      providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useFactory: () => globalRippleOptions},
        {
          provide: Directionality,
          useFactory: () => ({
            value: dir,
            change: new Subject(),
          }),
        },
      ],
    });

    TestBed.compileComponents();
  }));

  describe('MatChipOption', () => {
    let testComponent: SingleChip;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatChipOption))!;
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get<MatChipOption>(MatChipOption);
      primaryAction = chipNativeElement.querySelector('.mdc-evolution-chip__action--primary')!;
      testComponent = fixture.debugElement.componentInstance;
    });

    describe('basic behaviors', () => {
      it('adds the `mat-chip` class', () => {
        expect(chipNativeElement.classList).toContain('mat-mdc-chip');
      });

      it('emits focus only once for multiple clicks', () => {
        let counter = 0;
        chipInstance._onFocus.subscribe(() => {
          counter++;
        });

        primaryAction.focus();
        primaryAction.focus();
        fixture.detectChanges();

        expect(counter).toBe(1);
      });

      it('emits destroy on destruction', () => {
        spyOn(testComponent, 'chipDestroy').and.callThrough();

        // Force a destroy callback
        testComponent.shouldShow = false;
        fixture.detectChanges();

        expect(testComponent.chipDestroy).toHaveBeenCalledTimes(1);
      });

      it('allows color customization', () => {
        expect(chipNativeElement.classList).toContain('mat-primary');

        testComponent.color = 'warn';
        fixture.detectChanges();

        expect(chipNativeElement.classList).not.toContain('mat-primary');
        expect(chipNativeElement.classList).toContain('mat-warn');
      });

      it('allows selection', () => {
        spyOn(testComponent, 'chipSelectionChange');
        expect(chipNativeElement.classList).not.toContain('mat-mdc-chip-selected');

        testComponent.selected = true;
        fixture.detectChanges();

        expect(chipNativeElement.classList).toContain('mat-mdc-chip-selected');
        expect(testComponent.chipSelectionChange).toHaveBeenCalledWith({
          source: chipInstance,
          isUserInput: false,
          selected: true,
        });
      });

      it('should not prevent the default click action', () => {
        const event = dispatchFakeEvent(chipNativeElement, 'click');
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(false);
      });

      it('should not dispatch `selectionChange` event when deselecting a non-selected chip', () => {
        chipInstance.deselect();

        const spy = jasmine.createSpy('selectionChange spy');
        const subscription = chipInstance.selectionChange.subscribe(spy);

        chipInstance.deselect();

        expect(spy).not.toHaveBeenCalled();
        subscription.unsubscribe();
      });

      it('should not dispatch `selectionChange` event when selecting a selected chip', () => {
        chipInstance.select();

        const spy = jasmine.createSpy('selectionChange spy');
        const subscription = chipInstance.selectionChange.subscribe(spy);

        chipInstance.select();

        expect(spy).not.toHaveBeenCalled();
        subscription.unsubscribe();
      });

      it(
        'should not dispatch `selectionChange` event when selecting a selected chip via ' +
          'user interaction',
        () => {
          chipInstance.select();

          const spy = jasmine.createSpy('selectionChange spy');
          const subscription = chipInstance.selectionChange.subscribe(spy);

          chipInstance.selectViaInteraction();

          expect(spy).not.toHaveBeenCalled();
          subscription.unsubscribe();
        },
      );

      it('should not dispatch `selectionChange` through setter if the value did not change', () => {
        chipInstance.selected = false;

        const spy = jasmine.createSpy('selectionChange spy');
        const subscription = chipInstance.selectionChange.subscribe(spy);

        chipInstance.selected = false;

        expect(spy).not.toHaveBeenCalled();
        subscription.unsubscribe();
      });

      it('should be able to disable ripples through ripple global options at runtime', () => {
        expect(chipInstance._isRippleDisabled())
          .withContext('Expected chip ripples to be enabled.')
          .toBe(false);

        globalRippleOptions.disabled = true;

        expect(chipInstance._isRippleDisabled())
          .withContext('Expected chip ripples to be disabled.')
          .toBe(true);
      });

      it('should have the correct role', () => {
        expect(chipNativeElement.getAttribute('role')).toBe('presentation');
      });

      it('should be able to set a custom role', () => {
        chipInstance.role = 'button';
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('role')).toBe('button');
      });
    });

    describe('keyboard behavior', () => {
      describe('when selectable is true', () => {
        beforeEach(() => {
          testComponent.selectable = true;
          fixture.detectChanges();
        });

        it('should selects/deselects the currently focused chip on SPACE', () => {
          const CHIP_SELECTED_EVENT: MatChipSelectionChange = {
            source: chipInstance,
            isUserInput: true,
            selected: true,
          };

          const CHIP_DESELECTED_EVENT: MatChipSelectionChange = {
            source: chipInstance,
            isUserInput: true,
            selected: false,
          };

          spyOn(testComponent, 'chipSelectionChange');

          // Use the spacebar to select the chip
          dispatchKeyboardEvent(primaryAction, 'keydown', SPACE);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeTruthy();
          expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(1);
          expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_SELECTED_EVENT);

          // Use the spacebar to deselect the chip
          dispatchKeyboardEvent(primaryAction, 'keydown', SPACE);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeFalsy();
          expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(2);
          expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_DESELECTED_EVENT);
        });

        it('should have correct aria-selected in single selection mode', () => {
          expect(primaryAction.hasAttribute('aria-selected')).toBe(false);

          testComponent.selected = true;
          fixture.detectChanges();

          expect(primaryAction.getAttribute('aria-selected')).toBe('true');
        });

        it('should have the correct aria-selected in multi-selection mode', fakeAsync(() => {
          testComponent.chipList.multiple = true;
          flush();
          fixture.detectChanges();
          expect(primaryAction.getAttribute('aria-selected')).toBe('false');

          testComponent.selected = true;
          fixture.detectChanges();

          expect(primaryAction.getAttribute('aria-selected')).toBe('true');
        }));

        it('should disable focus on the checkmark', fakeAsync(() => {
          // The checkmark is only shown in multi selection mode.
          testComponent.chipList.multiple = true;
          flush();
          fixture.detectChanges();

          const checkmark = chipNativeElement.querySelector('.mdc-evolution-chip__checkmark-svg')!;
          expect(checkmark.getAttribute('focusable')).toBe('false');
        }));
      });

      describe('when selectable is false', () => {
        beforeEach(() => {
          testComponent.selectable = false;
          fixture.detectChanges();
        });

        it('SPACE ignores selection', () => {
          spyOn(testComponent, 'chipSelectionChange');

          // Use the spacebar to attempt to select the chip
          dispatchKeyboardEvent(primaryAction, 'keydown', SPACE);
          fixture.detectChanges();

          expect(chipInstance.selected).toBe(false);
          expect(testComponent.chipSelectionChange).not.toHaveBeenCalled();
        });

        it('should not have the aria-selected attribute', () => {
          expect(primaryAction.hasAttribute('aria-selected')).toBe(false);
        });
      });

      it('should update the aria-disabled for disabled chips', () => {
        expect(primaryAction.getAttribute('aria-disabled')).toBe('false');

        testComponent.disabled = true;
        fixture.detectChanges();

        expect(primaryAction.getAttribute('aria-disabled')).toBe('true');
      });
    });

    it('should contain a focus indicator inside the text label', () => {
      const label = chipNativeElement.querySelector('.mdc-evolution-chip__text-label');
      expect(label?.querySelector('.mat-mdc-focus-indicator')).toBeTruthy();
    });
  });
});

@Component({
  template: `
    <mat-chip-listbox>
      <div *ngIf="shouldShow">
        <mat-chip-option [selectable]="selectable"
                 [color]="color" [selected]="selected" [disabled]="disabled"
                 (destroyed)="chipDestroy($event)"
                 (selectionChange)="chipSelectionChange($event)">
          <span class="avatar" matChipAvatar></span>
          {{name}}
        </mat-chip-option>
      </div>
    </mat-chip-listbox>`,
})
class SingleChip {
  @ViewChild(MatChipListbox) chipList: MatChipListbox;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  selected: boolean = false;
  selectable: boolean = true;
  shouldShow: boolean = true;

  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipSelectionChange: (event?: MatChipSelectionChange) => void = () => {};
}
