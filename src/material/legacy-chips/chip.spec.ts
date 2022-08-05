import {Directionality} from '@angular/cdk/bidi';
import {BACKSPACE, DELETE, SPACE} from '@angular/cdk/keycodes';
import {createKeyboardEvent, dispatchFakeEvent} from '../../cdk/testing/private';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
  MatLegacyChip,
  MatLegacyChipEvent,
  MatLegacyChipSelectionChange,
  MatLegacyChipsModule,
  MatLegacyChipList,
} from './index';

describe('MatChip', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatLegacyChip;
  let globalRippleOptions: RippleGlobalOptions;
  let dir = 'ltr';

  beforeEach(waitForAsync(() => {
    globalRippleOptions = {};
    TestBed.configureTestingModule({
      imports: [MatLegacyChipsModule],
      declarations: [
        BasicChip,
        SingleChip,
        BasicChipWithStaticTabindex,
        BasicChipWithBoundTabindex,
      ],
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

  describe('MatBasicChip', () => {
    it('adds a class to indicate that it is a basic chip', () => {
      fixture = TestBed.createComponent(BasicChip);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.classList).toContain('mat-chip');
      expect(chip.classList).toContain('mat-basic-chip');
    });

    it('should be able to set a static tabindex', () => {
      fixture = TestBed.createComponent(BasicChipWithStaticTabindex);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.getAttribute('tabindex')).toBe('3');
    });

    it('should be able to set a dynamic tabindex', () => {
      fixture = TestBed.createComponent(BasicChipWithBoundTabindex);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.getAttribute('tabindex')).toBe('12');

      fixture.componentInstance.tabindex = 15;
      fixture.detectChanges();

      expect(chip.getAttribute('tabindex')).toBe('15');
    });

    it('should have the correct role', () => {
      fixture = TestBed.createComponent(BasicChip);
      fixture.detectChanges();
      chipDebugElement = fixture.debugElement.query(By.directive(MatLegacyChip))!;
      chipNativeElement = chipDebugElement.nativeElement;

      expect(chipNativeElement.getAttribute('role')).toBe('option');
    });

    it('should be able to set a custom role', () => {
      fixture = TestBed.createComponent(BasicChip);
      fixture.detectChanges();
      chipDebugElement = fixture.debugElement.query(By.directive(MatLegacyChip))!;
      chipInstance = chipDebugElement.injector.get<MatLegacyChip>(MatLegacyChip);
      chipNativeElement = chipDebugElement.nativeElement;

      chipInstance.role = 'gridcell';
      fixture.detectChanges();

      expect(chipNativeElement.getAttribute('role')).toBe('gridcell');
    });
  });

  describe('MatChip', () => {
    let testComponent: SingleChip;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatLegacyChip))!;
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get<MatLegacyChip>(MatLegacyChip);
      testComponent = fixture.debugElement.componentInstance;
    });

    describe('basic behaviors', () => {
      it('adds the `mat-chip` class', () => {
        expect(chipNativeElement.classList).toContain('mat-chip');
      });

      it('does not add the `mat-basic-chip` class', () => {
        expect(chipNativeElement.classList).not.toContain('mat-basic-chip');
      });

      it('emits focus only once for multiple clicks', () => {
        let counter = 0;
        chipInstance._onFocus.subscribe(() => {
          counter++;
        });

        chipNativeElement.focus();
        chipNativeElement.focus();
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
        expect(chipNativeElement.classList).not.toContain('mat-chip-selected');

        testComponent.selected = true;
        fixture.detectChanges();

        expect(chipNativeElement.classList).toContain('mat-chip-selected');
        expect(testComponent.chipSelectionChange).toHaveBeenCalledWith({
          source: chipInstance,
          isUserInput: false,
          selected: true,
        });
      });

      it('allows removal', () => {
        spyOn(testComponent, 'chipRemove');

        chipInstance.remove();
        fixture.detectChanges();

        expect(testComponent.chipRemove).toHaveBeenCalledWith({chip: chipInstance});
      });

      it('should not prevent the default click action', () => {
        const event = dispatchFakeEvent(chipNativeElement, 'click');
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(false);
      });

      it('should prevent the default click action when the chip is disabled', () => {
        chipInstance.disabled = true;
        fixture.detectChanges();

        const event = dispatchFakeEvent(chipNativeElement, 'click');
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
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
        expect(chipInstance.rippleDisabled)
          .withContext('Expected chip ripples to be enabled.')
          .toBe(false);

        globalRippleOptions.disabled = true;

        expect(chipInstance.rippleDisabled)
          .withContext('Expected chip ripples to be disabled.')
          .toBe(true);
      });

      it('should return the chip text if value is undefined', () => {
        expect(chipInstance.value.trim()).toBe(fixture.componentInstance.name);
      });

      it('should return the chip value if defined', () => {
        fixture.componentInstance.value = 123;
        fixture.detectChanges();

        expect(chipInstance.value).toBe(123);
      });

      it('should return the chip value if set to null', () => {
        fixture.componentInstance.value = null;
        fixture.detectChanges();

        expect(chipInstance.value).toBeNull();
      });
    });

    describe('keyboard behavior', () => {
      describe('when selectable is true', () => {
        beforeEach(() => {
          testComponent.selectable = true;
          fixture.detectChanges();
        });

        it('should selects/deselects the currently focused chip on SPACE', () => {
          const SPACE_EVENT = createKeyboardEvent('keydown', SPACE);
          const CHIP_SELECTED_EVENT: MatLegacyChipSelectionChange = {
            source: chipInstance,
            isUserInput: true,
            selected: true,
          };

          const CHIP_DESELECTED_EVENT: MatLegacyChipSelectionChange = {
            source: chipInstance,
            isUserInput: true,
            selected: false,
          };

          spyOn(testComponent, 'chipSelectionChange');

          // Use the spacebar to select the chip
          chipInstance._handleKeydown(SPACE_EVENT);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeTruthy();
          expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(1);
          expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_SELECTED_EVENT);

          // Use the spacebar to deselect the chip
          chipInstance._handleKeydown(SPACE_EVENT);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeFalsy();
          expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(2);
          expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_DESELECTED_EVENT);
        });

        it('should have correct aria-selected in single selection mode', () => {
          expect(chipNativeElement.hasAttribute('aria-selected')).toBe(false);

          testComponent.selected = true;
          fixture.detectChanges();

          expect(chipNativeElement.getAttribute('aria-selected')).toBe('true');
        });

        it('should have the correct aria-selected in multi-selection mode', () => {
          testComponent.chipList.multiple = true;
          fixture.detectChanges();

          expect(chipNativeElement.getAttribute('aria-selected')).toBe('false');

          testComponent.selected = true;
          fixture.detectChanges();

          expect(chipNativeElement.getAttribute('aria-selected')).toBe('true');
        });
      });

      describe('when selectable is false', () => {
        beforeEach(() => {
          testComponent.selectable = false;
          fixture.detectChanges();
        });

        it('SPACE ignores selection', () => {
          const SPACE_EVENT = createKeyboardEvent('keydown', SPACE);

          spyOn(testComponent, 'chipSelectionChange');

          // Use the spacebar to attempt to select the chip
          chipInstance._handleKeydown(SPACE_EVENT);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeFalsy();
          expect(testComponent.chipSelectionChange).not.toHaveBeenCalled();
        });

        it('should not have the aria-selected attribute', () => {
          expect(chipNativeElement.hasAttribute('aria-selected')).toBe(false);
        });
      });

      describe('when removable is true', () => {
        beforeEach(() => {
          testComponent.removable = true;
          fixture.detectChanges();
        });

        it('DELETE emits the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE);

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._handleKeydown(DELETE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });

        it('BACKSPACE emits the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE);

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._handleKeydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });
      });

      describe('when removable is false', () => {
        beforeEach(() => {
          testComponent.removable = false;
          fixture.detectChanges();
        });

        it('DELETE does not emit the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE);

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._handleKeydown(DELETE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });

        it('BACKSPACE does not emit the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE);

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._handleKeydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });
      });

      it('should update the aria-label for disabled chips', () => {
        expect(chipNativeElement.getAttribute('aria-disabled')).toBe('false');

        testComponent.disabled = true;
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should make disabled chips non-focusable', () => {
        expect(chipNativeElement.getAttribute('tabindex')).toBe('-1');

        testComponent.disabled = true;
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('tabindex')).toBeFalsy();
      });
    });

    it('should have a focus indicator', () => {
      expect(chipNativeElement.classList.contains('mat-focus-indicator')).toBe(true);
    });
  });
});

@Component({
  template: `
    <mat-chip-list>
      <div *ngIf="shouldShow">
        <mat-chip [selectable]="selectable" [removable]="removable"
                 [color]="color" [selected]="selected" [disabled]="disabled"
                 (focus)="chipFocus($event)" (destroyed)="chipDestroy($event)"
                 (selectionChange)="chipSelectionChange($event)"
                 (removed)="chipRemove($event)" [value]="value">
          {{name}}
        </mat-chip>
      </div>
    </mat-chip-list>`,
})
class SingleChip {
  @ViewChild(MatLegacyChipList) chipList: MatLegacyChipList;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  selected: boolean = false;
  selectable: boolean = true;
  removable: boolean = true;
  shouldShow: boolean = true;
  value: any;

  chipFocus: (event?: MatLegacyChipEvent) => void = () => {};
  chipDestroy: (event?: MatLegacyChipEvent) => void = () => {};
  chipSelectionChange: (event?: MatLegacyChipSelectionChange) => void = () => {};
  chipRemove: (event?: MatLegacyChipEvent) => void = () => {};
}

@Component({
  template: `<mat-basic-chip>Hello</mat-basic-chip>`,
})
class BasicChip {}

@Component({
  template: `<mat-basic-chip tabindex="3">Hello</mat-basic-chip>`,
})
class BasicChipWithStaticTabindex {}

@Component({
  template: `<mat-basic-chip [tabIndex]="tabindex">Hello</mat-basic-chip>`,
})
class BasicChipWithBoundTabindex {
  tabindex = 12;
}
