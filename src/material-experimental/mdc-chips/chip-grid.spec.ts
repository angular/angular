import {animate, style, transition, trigger} from '@angular/animations';
import {Directionality, Direction} from '@angular/cdk/bidi';
import {
  BACKSPACE,
  DELETE,
  ENTER,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  TAB
} from '@angular/cdk/keycodes';
import {MockNgZone} from '@angular/cdk/private/testing';
import {
  createFakeEvent,
  createKeyboardEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  typeInElement,
} from '@angular/cdk/testing';
import {
  Component,
  DebugElement,
  NgZone,
  Provider,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {fakeAsync, ComponentFixture, TestBed, tick} from '@angular/core/testing';
import {FormControl, FormsModule, NgForm, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {GridFocusKeyManager} from './grid-focus-key-manager';
import {
  MatChipEvent,
  MatChipGrid,
  MatChipInputEvent,
  MatChipRemove,
  MatChipRow,
  MatChipsModule
} from './index';


describe('MatChipGrid', () => {
  let fixture: ComponentFixture<any>;
  let chipGridDebugElement: DebugElement;
  let chipGridNativeElement: HTMLElement;
  let chipGridInstance: MatChipGrid;
  let chips: QueryList<MatChipRow>;
  let manager: GridFocusKeyManager;
  let zone: MockNgZone;
  let testComponent: StandardChipGrid;
  let dirChange: Subject<Direction>;

  describe('StandardChipGrid', () => {
    describe('basic behaviors', () => {
      beforeEach(() => {
        setupStandardGrid();
      });

      it('should add the `mat-mdc-chip-set` class', () => {
        expect(chipGridNativeElement.classList).toContain('mat-mdc-chip-set');
      });

      it('should toggle the chips disabled state based on whether it is disabled', () => {
        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

        chipGridInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

        chipGridInstance.disabled = false;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);
      });

      it('should disable a chip that is added after the list became disabled', fakeAsync(() => {
        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

        chipGridInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

        fixture.componentInstance.chips.push(5, 6);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);
      }));
    });

    describe('focus behaviors', () => {
      beforeEach(() => {
        setupStandardGrid();
        manager = chipGridInstance._keyManager;
      });

      it('should focus the first chip on focus', () => {
        chipGridInstance.focus();
        fixture.detectChanges();

        expect(manager.activeRowIndex).toBe(0);
        expect(manager.activeColumnIndex).toBe(0);
      });

      it('should watch for chip focus', () => {
        let array = chips.toArray();
        let lastIndex = array.length - 1;
        let lastItem = array[lastIndex];

        lastItem.focus();
        fixture.detectChanges();

        expect(manager.activeRowIndex).toBe(lastIndex);
      });

      it('should not be able to become focused when disabled', () => {
        expect(chipGridInstance.focused).toBe(false, 'Expected grid to not be focused.');

        chipGridInstance.disabled = true;
        fixture.detectChanges();

        chipGridInstance.focus();
        fixture.detectChanges();

        expect(chipGridInstance.focused).toBe(false, 'Expected grid to continue not to be focused');
      });

      it('should remove the tabindex from the grid if it is disabled', () => {
        expect(chipGridNativeElement.getAttribute('tabindex')).toBe('0');

        chipGridInstance.disabled = true;
        fixture.detectChanges();

        expect(chipGridNativeElement.getAttribute('tabindex')).toBe('-1');
      });

      describe('on chip destroy', () => {
        it('should focus the next item', () => {
          let array = chips.toArray();
          let midItem = array[2];

          // Focus the middle item
          midItem.focus();

          // Destroy the middle item
          testComponent.chips.splice(2, 1);
          fixture.detectChanges();

          // It focuses the 4th item (now at index 2)
          expect(manager.activeRowIndex).toEqual(2);
        });

        it('should focus the previous item', () => {
          let array = chips.toArray();
          let lastIndex = array.length - 1;
          let lastItem = array[lastIndex];

          // Focus the last item
          lastItem.focus();

          // Destroy the last item
          testComponent.chips.pop();
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeRowIndex).toEqual(lastIndex - 1);
        });

        it('should not focus if chip grid is not focused', fakeAsync(() => {
          let array = chips.toArray();
          let midItem = array[2];

          // Focus and blur the middle item
          midItem.focus();
          midItem._focusout();
          tick();
          zone.simulateZoneExit();

          // Destroy the middle item
          testComponent.chips.splice(2, 1);
          fixture.detectChanges();

          // Should not have focus
          expect(chipGridInstance._keyManager.activeRowIndex).toEqual(-1);
        }));

        it('should focus the grid if the last focused item is removed', () => {
          testComponent.chips = [0];

          spyOn(chipGridInstance, 'focus');
          chips.last.focus();

          testComponent.chips.pop();
          fixture.detectChanges();

          expect(chipGridInstance.focus).toHaveBeenCalled();
        });

        it('should move focus to the last chip when the focused chip was deleted inside a' +
          'component with animations', fakeAsync(() => {
            fixture.destroy();
            TestBed.resetTestingModule();
            fixture = createComponent(StandardChipGridWithAnimations, [], BrowserAnimationsModule);
            fixture.detectChanges();

            chipGridDebugElement = fixture.debugElement.query(By.directive(MatChipGrid));
            chipGridNativeElement = chipGridDebugElement.nativeElement;
            chipGridInstance = chipGridDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            chips = chipGridInstance._chips;

            chips.last.focus();
            fixture.detectChanges();

            expect(chipGridInstance._keyManager.activeRowIndex).toBe(chips.length - 1);

            dispatchKeyboardEvent(chips.last._elementRef.nativeElement, 'keydown', BACKSPACE);
            fixture.detectChanges();
            tick(500);

            expect(chipGridInstance._keyManager.activeRowIndex).toBe(chips.length - 1);
            expect(chipGridInstance._keyManager.activeColumnIndex).toBe(0);
        }));
      });
    });

    describe('keyboard behavior', () => {
      describe('LTR (default)', () => {
        beforeEach(() => {
          fixture = createComponent(ChipGridWithRemove);
          fixture.detectChanges();

          chipGridDebugElement = fixture.debugElement.query(By.directive(MatChipGrid));
          chipGridInstance = chipGridDebugElement.componentInstance;
          chipGridNativeElement = chipGridDebugElement.nativeElement;
          chips = chipGridInstance._chips;
          manager = chipGridInstance._keyManager;
        });

        it('should focus previous column when press LEFT ARROW', () => {
          let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
          let lastNativeChip = nativeChips[nativeChips.length - 1] as HTMLElement;

          let LEFT_EVENT = createKeyboardEvent('keydown', LEFT_ARROW, lastNativeChip);
          let array = chips.toArray();
          let lastRowIndex = array.length - 1;
          let lastChip = array[lastRowIndex];

          // Focus the first column of the last chip in the array
          lastChip.focus();
          expect(manager.activeRowIndex).toEqual(lastRowIndex);
          expect(manager.activeColumnIndex).toEqual(0);

          // Press the LEFT arrow
          chipGridInstance._keydown(LEFT_EVENT);
          chipGridInstance._blur(); // Simulate focus leaving the list and going to the chip.
          fixture.detectChanges();

          // It focuses the last column of the previous chip
          expect(manager.activeRowIndex).toEqual(lastRowIndex - 1);
          expect(manager.activeColumnIndex).toEqual(1);
        });

        it('should focus next column when press RIGHT ARROW', () => {
          let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
          let firstNativeChip = nativeChips[0] as HTMLElement;

          let RIGHT_EVENT: KeyboardEvent =
            createKeyboardEvent('keydown', RIGHT_ARROW, firstNativeChip);
          let array = chips.toArray();
          let firstItem = array[0];

          // Focus the first column of the first chip in the array
          firstItem.focus();
          expect(manager.activeRowIndex).toEqual(0);
          expect(manager.activeColumnIndex).toEqual(0);

          // Press the RIGHT arrow
          chipGridInstance._keydown(RIGHT_EVENT);
          chipGridInstance._blur(); // Simulate focus leaving the list and going to the chip.
          fixture.detectChanges();

          // It focuses the next column of the chip
          expect(manager.activeRowIndex).toEqual(0);
          expect(manager.activeColumnIndex).toEqual(1);
        });

        it('should not handle arrow key events from non-chip elements', () => {
          const event: KeyboardEvent =
              createKeyboardEvent('keydown', RIGHT_ARROW, chipGridNativeElement);
          const initialActiveIndex = manager.activeRowIndex;

          chipGridInstance._keydown(event);
          fixture.detectChanges();

          expect(manager.activeRowIndex)
              .toBe(initialActiveIndex, 'Expected focused item not to have changed.');
        });
      });

      describe('RTL', () => {
        beforeEach(() => {
          setupStandardGrid('rtl');
          manager = chipGridInstance._keyManager;
        });

        it('should focus previous column when press RIGHT ARROW', () => {
          let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
          let lastNativeChip = nativeChips[nativeChips.length - 1] as HTMLElement;

          let RIGHT_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', RIGHT_ARROW, lastNativeChip);
          let array = chips.toArray();
          let lastRowIndex = array.length - 1;
          let lastItem = array[lastRowIndex];

          // Focus the first column of the last chip in the array
          lastItem.focus();
          expect(manager.activeRowIndex).toEqual(lastRowIndex);
          expect(manager.activeColumnIndex).toEqual(0);


          // Press the RIGHT arrow
          chipGridInstance._keydown(RIGHT_EVENT);
          chipGridInstance._blur(); // Simulate focus leaving the list and going to the chip.
          fixture.detectChanges();

          // It focuses the last column of the previous chip
          expect(manager.activeRowIndex).toEqual(lastRowIndex - 1);
          expect(manager.activeColumnIndex).toEqual(0);
        });

        it('should focus next column when press LEFT ARROW', () => {
          let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
          let firstNativeChip = nativeChips[0] as HTMLElement;

          let LEFT_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', LEFT_ARROW, firstNativeChip);
          let array = chips.toArray();
          let firstItem = array[0];

          // Focus the first column of the first chip in the array
          firstItem.focus();
          expect(manager.activeRowIndex).toEqual(0);
          expect(manager.activeColumnIndex).toEqual(0);


          // Press the LEFT arrow
          chipGridInstance._keydown(LEFT_EVENT);
          chipGridInstance._blur(); // Simulate focus leaving the list and going to the chip.
          fixture.detectChanges();

          // It focuses the next column of the chip
          expect(manager.activeRowIndex).toEqual(1);
          expect(manager.activeColumnIndex).toEqual(0);
        });

        it('should allow focus to escape when tabbing away', fakeAsync(() => {
          let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
          let firstNativeChip = nativeChips[0] as HTMLElement;

          chipGridInstance._keydown(createKeyboardEvent('keydown', TAB, firstNativeChip));

          expect(chipGridInstance.tabIndex)
            .toBe(-1, 'Expected tabIndex to be set to -1 temporarily.');

          tick();

          expect(chipGridInstance.tabIndex).toBe(0, 'Expected tabIndex to be reset back to 0');
        }));

        it(`should use user defined tabIndex`, fakeAsync(() => {
          chipGridInstance.tabIndex = 4;

          fixture.detectChanges();

          expect(chipGridInstance.tabIndex)
            .toBe(4, 'Expected tabIndex to be set to user defined value 4.');

          let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
          let firstNativeChip = nativeChips[0] as HTMLElement;

          chipGridInstance._keydown(createKeyboardEvent('keydown', TAB, firstNativeChip));

          expect(chipGridInstance.tabIndex)
            .toBe(-1, 'Expected tabIndex to be set to -1 temporarily.');

          tick();

          expect(chipGridInstance.tabIndex).toBe(4, 'Expected tabIndex to be reset back to 4');
        }));
      });

      it('should account for the direction changing', () => {
        setupStandardGrid();
        manager = chipGridInstance._keyManager;

        let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
        let firstNativeChip = nativeChips[0] as HTMLElement;

        let RIGHT_EVENT: KeyboardEvent =
          createKeyboardEvent('keydown', RIGHT_ARROW, firstNativeChip);
        let array = chips.toArray();
        let firstItem = array[0];

        firstItem.focus();
        expect(manager.activeRowIndex).toBe(0);
        expect(manager.activeColumnIndex).toBe(0);

        chipGridInstance._keydown(RIGHT_EVENT);
        chipGridInstance._blur();
        fixture.detectChanges();

        expect(manager.activeRowIndex).toBe(1);
        expect(manager.activeColumnIndex).toBe(0);

        dirChange.next('rtl');
        fixture.detectChanges();

        chipGridInstance._keydown(RIGHT_EVENT);
        chipGridInstance._blur();
        fixture.detectChanges();

        expect(manager.activeRowIndex).toBe(0);
        expect(manager.activeColumnIndex).toBe(0);
      });
    });
  });

  describe('FormFieldChipGrid', () => {
    beforeEach(() => {
      setupInputGrid();
    });

    describe('keyboard behavior', () => {
      beforeEach(() => {
        manager = chipGridInstance._keyManager;
      });

      it('should maintain focus if the active chip is deleted', () => {
        const secondChip = fixture.nativeElement.querySelectorAll('.mat-mdc-chip')[1];

        secondChip.focus();
        fixture.detectChanges();

        expect(chipGridInstance._chips.toArray().findIndex(chip => chip._hasFocus)).toBe(1);

        dispatchKeyboardEvent(secondChip, 'keydown', DELETE);
        fixture.detectChanges();

        expect(chipGridInstance._chips.toArray().findIndex(chip => chip._hasFocus)).toBe(1);
      });

      describe('when the input has focus', () => {

        it('should not focus the last chip when press DELETE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');
          let DELETE_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', DELETE, nativeInput);

          // Focus the input
          nativeInput.focus();
          expect(manager.activeRowIndex).toBe(-1);
          expect(manager.activeColumnIndex).toBe(-1);

          // Press the DELETE key
          chipGridInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          // It doesn't focus the last chip
          expect(manager.activeRowIndex).toEqual(-1);
          expect(manager.activeColumnIndex).toBe(-1);
        });

        it('should focus the last chip when press BACKSPACE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');
          let BACKSPACE_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', BACKSPACE, nativeInput);

          // Focus the input
          nativeInput.focus();
          expect(manager.activeRowIndex).toBe(-1);
          expect(manager.activeColumnIndex).toBe(-1);

          // Press the BACKSPACE key
          chipGridInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          // It focuses the last chip
          expect(manager.activeRowIndex).toEqual(chips.length - 1);
          expect(manager.activeColumnIndex).toBe(0);
        });
      });
    });

    it('should complete the stateChanges stream on destroy', () => {
      const spy = jasmine.createSpy('stateChanges complete');
      const subscription = chipGridInstance.stateChanges.subscribe({complete: spy});

      fixture.destroy();
      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should point the label id to the chip input', () => {
      const label = fixture.nativeElement.querySelector('label');
      const input = fixture.nativeElement.querySelector('input');

      fixture.detectChanges();

      expect(label.getAttribute('for')).toBeTruthy();
      expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
      expect(label.getAttribute('aria-owns')).toBe(input.getAttribute('id'));
    });
  });

  describe('with chip remove', () => {
    let chipGrid: MatChipGrid;
    let chipElements: DebugElement[];
    let chipRemoveDebugElements: DebugElement[];

    beforeEach(() => {
      fixture = createComponent(ChipGridWithRemove);
      fixture.detectChanges();

      chipGrid = fixture.debugElement.query(By.directive(MatChipGrid)).componentInstance;
      chipElements = fixture.debugElement.queryAll(By.directive(MatChipRow));
      chipRemoveDebugElements = fixture.debugElement.queryAll(By.directive(MatChipRemove));
      chips = chipGrid._chips;
    });

    it('should properly focus next item if chip is removed through click', () => {
      chips.toArray()[2].focus();

      // Destroy the third focused chip by dispatching a bubbling click event on the
      // associated chip remove element.
      dispatchMouseEvent(chipRemoveDebugElements[2].nativeElement, 'click');
      fixture.detectChanges();

      const fakeEvent = Object.assign(createFakeEvent('transitionend'), {propertyName: 'width'});
      chipElements[2].nativeElement.dispatchEvent(fakeEvent);

      fixture.detectChanges();

      expect(chips.toArray()[2].value).not.toBe(2, 'Expected the third chip to be removed.');
      expect(chipGrid._keyManager.activeRowIndex).toBe(2);
    });
  });

  describe('chip grid with chip input', () => {
    let nativeChips: HTMLElement[];

    beforeEach(() => {
      fixture = createComponent(InputChipGrid);
      fixture.detectChanges();

      nativeChips = fixture.debugElement.queryAll(By.css('mat-chip-row'))
        .map((chip) => chip.nativeElement);
    });

    it('should take an initial view value with reactive forms', () => {
      fixture.componentInstance.control = new FormControl('[pizza-1]');
      fixture.detectChanges();

      expect(fixture.componentInstance.chipGrid.value).toEqual('[pizza-1]');
    });

    it('should set the view value from the form', () => {
      const chipGrid = fixture.componentInstance.chipGrid;

      expect(chipGrid.value).toBeFalsy('Expect chip grid to have no initial value');

      fixture.componentInstance.control.setValue('[pizza-1]');
      fixture.detectChanges();

      expect(chipGrid.value).toEqual('[pizza-1]');
    });

    it('should update the form value when the view changes', fakeAsync(() => {
      expect(fixture.componentInstance.control.value)
        .toEqual(null, `Expected the control's value to be empty initially.`);

      const nativeInput = fixture.nativeElement.querySelector('input');
      // tick();
      nativeInput.focus();

      typeInElement('123', nativeInput);
      fixture.detectChanges();
      dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
      fixture.detectChanges();
      tick();

      dispatchFakeEvent(nativeInput, 'blur');
      tick();

      expect(fixture.componentInstance.control.value).toContain('123-8');
    }));

    it('should clear the value when the control is reset', () => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      expect(fixture.componentInstance.chipGrid.value).toEqual(null);
    });

    it('should set the control to touched when the chip grid is touched', fakeAsync(() => {
      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to start off as untouched.');

      const nativeChipGrid = fixture.debugElement.query(By.css('mat-chip-grid')).nativeElement;
      dispatchFakeEvent(nativeChipGrid, 'blur');
      tick();

      expect(fixture.componentInstance.control.touched)
        .toBe(true, 'Expected the control to be touched.');
    }));

    it('should not set touched when a disabled chip grid is touched', fakeAsync(() => {
      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to start off as untouched.');

      fixture.componentInstance.control.disable();
      const nativeChipGrid = fixture.debugElement.query(By.css('mat-chip-grid')).nativeElement;
      dispatchFakeEvent(nativeChipGrid, 'blur');
      tick();

      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to stay untouched.');
    }));

    it('should set the control to dirty when the chip grid\'s value changes in the DOM',
      fakeAsync(() => {
      expect(fixture.componentInstance.control.dirty)
          .toEqual(false, `Expected control to start out pristine.`);

      const nativeInput = fixture.nativeElement.querySelector('input');
      nativeInput.focus();

      typeInElement('123', nativeInput);
      fixture.detectChanges();
      dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
      fixture.detectChanges();
      tick();

      dispatchFakeEvent(nativeInput, 'blur');
      tick();

      expect(fixture.componentInstance.control.dirty)
          .toEqual(true, `Expected control to be dirty after value was changed by user.`);
    }));

    it('should not set the control to dirty when the value changes programmatically', () => {
      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to start out pristine.`);

      fixture.componentInstance.control.setValue(['pizza-1']);

      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to stay pristine after programmatic change.`);
    });

    it('should set an asterisk after the placeholder if the control is required', () => {
      let requiredMarker = fixture.debugElement.query(By.css('.mat-form-field-required-marker'));
      expect(requiredMarker)
        .toBeNull(`Expected placeholder not to have an asterisk, as control was not required.`);

      fixture.componentInstance.isRequired = true;
      fixture.detectChanges();

      requiredMarker = fixture.debugElement.query(By.css('.mat-form-field-required-marker'));
      expect(requiredMarker)
        .not.toBeNull(`Expected placeholder to have an asterisk, as control was required.`);
    });

    it('should blur the form field when the active chip is blurred', fakeAsync(() => {
      const formField: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field');

      dispatchFakeEvent(nativeChips[0], 'focusin');
      fixture.detectChanges();

      expect(formField.classList).toContain('mat-focused');

      dispatchFakeEvent(nativeChips[0], 'focusout');
      fixture.detectChanges();
      zone.simulateZoneExit();
      fixture.detectChanges();
      tick();
      expect(formField.classList).not.toContain('mat-focused');
    }));

    it('should keep focus on the input after adding the first chip', fakeAsync(() => {
      const nativeInput = fixture.nativeElement.querySelector('input');
      const chipEls = Array.from<HTMLElement>(
          fixture.nativeElement.querySelectorAll('mat-chip-row')).reverse();

      // Remove the chips via backspace to simulate the user removing them.
      chipEls.forEach(chip => {
        chip.focus();
        dispatchKeyboardEvent(chip, 'keydown', BACKSPACE);
        fixture.detectChanges();
        const fakeEvent = Object.assign(createFakeEvent('transitionend'), {propertyName: 'width'});
        chip.dispatchEvent(fakeEvent);
        fixture.detectChanges();
        tick();
      });

      nativeInput.focus();
      expect(fixture.componentInstance.foods).toEqual([], 'Expected all chips to be removed.');
      expect(document.activeElement).toBe(nativeInput, 'Expected input to be focused.');

      typeInElement('123', nativeInput);
      fixture.detectChanges();
      dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(nativeInput, 'Expected input to remain focused.');
    }));

    it('should set aria-invalid if the form field is invalid', fakeAsync(() => {
      fixture.componentInstance.control = new FormControl(undefined, [Validators.required]);
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      expect(input.getAttribute('aria-invalid')).toBe('true');

      typeInElement('123', input);
      fixture.detectChanges();
      dispatchKeyboardEvent(input, 'keydown', ENTER);
      fixture.detectChanges();
      tick();

      dispatchFakeEvent(input, 'blur');
      tick();

      fixture.detectChanges();
      expect(input.getAttribute('aria-invalid')).toBe('false');
    }));
  });

  describe('error messages', () => {
    let errorTestComponent: ChipGridWithFormErrorMessages;
    let containerEl: HTMLElement;
    let chipGridEl: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(ChipGridWithFormErrorMessages);
      fixture.detectChanges();
      errorTestComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
      chipGridEl = fixture.debugElement.query(By.css('mat-chip-grid')).nativeElement;
    });

    it('should not show any errors if the user has not interacted', () => {
      expect(errorTestComponent.formControl.untouched)
        .toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');
      expect(chipGridEl.getAttribute('aria-invalid'))
        .toBe('false', 'Expected aria-invalid to be set to "false".');
    });

    it('should display an error message when the grid is touched and invalid', fakeAsync(() => {
      expect(errorTestComponent.formControl.invalid)
        .toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(0, 'Expected no error message');

      errorTestComponent.formControl.markAsTouched();
      fixture.detectChanges();
      tick();

      expect(containerEl.classList)
        .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(1, 'Expected one error message to have been rendered.');
      expect(chipGridEl.getAttribute('aria-invalid'))
        .toBe('true', 'Expected aria-invalid to be set to "true".');
    }));

    it('should display an error message when the parent form is submitted', fakeAsync(() => {
      expect(errorTestComponent.form.submitted)
        .toBe(false, 'Expected form not to have been submitted');
      expect(errorTestComponent.formControl.invalid)
        .toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');

      dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(errorTestComponent.form.submitted)
          .toBe(true, 'Expected form to have been submitted');
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('mat-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(chipGridEl.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to "true".');
      });
    }));

    it('should hide the errors and show the hints once the chip grid becomes valid',
        fakeAsync(() => {
      errorTestComponent.formControl.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('mat-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(containerEl.querySelectorAll('mat-hint').length)
          .toBe(0, 'Expected no hints to be shown.');

        errorTestComponent.formControl.setValue('something');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(containerEl.classList).not.toContain('mat-form-field-invalid',
            'Expected container not to have the invalid class when valid.');
          expect(containerEl.querySelectorAll('mat-error').length)
            .toBe(0, 'Expected no error messages when the input is valid.');
          expect(containerEl.querySelectorAll('mat-hint').length)
            .toBe(1, 'Expected one hint to be shown once the input is valid.');
        });
      });
    }));

    it('should set the proper role on the error messages', () => {
      errorTestComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelector('mat-error')!.getAttribute('role')).toBe('alert');
    });

    it('sets the aria-describedby to reference errors when in error state', () => {
      let hintId = fixture.debugElement.query(By.css('.mat-hint')).nativeElement.getAttribute('id');
      let describedBy = chipGridEl.getAttribute('aria-describedby');

      expect(hintId).toBeTruthy('hint should be shown');
      expect(describedBy).toBe(hintId);

      fixture.componentInstance.formControl.markAsTouched();
      fixture.detectChanges();

      let errorIds = fixture.debugElement.queryAll(By.css('.mat-error'))
        .map(el => el.nativeElement.getAttribute('id')).join(' ');
      describedBy = chipGridEl.getAttribute('aria-describedby');

      expect(errorIds).toBeTruthy('errors should be shown');
      expect(describedBy).toBe(errorIds);
    });
  });

  function createComponent<T>(component: Type<T>, providers: Provider[] = [], animationsModule:
      Type<NoopAnimationsModule> | Type<BrowserAnimationsModule> = NoopAnimationsModule):
          ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        animationsModule,
      ],
      declarations: [component],
      providers: [
        {provide: NgZone, useFactory: () => zone = new MockNgZone()},
        ...providers
      ]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
  }

  function setupStandardGrid(direction: Direction = 'ltr') {
    dirChange = new Subject();
    fixture = createComponent(StandardChipGrid, [{
      provide: Directionality, useFactory: () => ({
        value: direction.toLowerCase(),
        change: dirChange
      })
    }]);
    fixture.detectChanges();

    chipGridDebugElement = fixture.debugElement.query(By.directive(MatChipGrid));
    chipGridNativeElement = chipGridDebugElement.nativeElement;
    chipGridInstance = chipGridDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipGridInstance._chips;
  }

  function setupInputGrid() {
    fixture = createComponent(FormFieldChipGrid);
    fixture.detectChanges();

    chipGridDebugElement = fixture.debugElement.query(By.directive(MatChipGrid));
    chipGridNativeElement = chipGridDebugElement.nativeElement;
    chipGridInstance = chipGridDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipGridInstance._chips;
  }
});

@Component({
  template: `
    <mat-chip-grid [tabIndex]="tabIndex" #chipGrid>
      <mat-chip-row *ngFor="let i of chips">
        {{name}} {{i + 1}}
      </mat-chip-row>
    </mat-chip-grid>
    <input name="test" [matChipInputFor]="chipGrid"/>`
})
class StandardChipGrid {
  name: string = 'Test';
  tabIndex: number = 0;
  chips = [0, 1, 2, 3, 4];
}

@Component({
  template: `
    <mat-form-field>
      <mat-label>Add a chip</mat-label>
      <mat-chip-grid #chipGrid>
        <mat-chip-row *ngFor="let chip of chips" (removed)="remove(chip)">{{chip}}</mat-chip-row>
      </mat-chip-grid>
      <input name="test" [matChipInputFor]="chipGrid"/>
    </mat-form-field>
  `
})
class FormFieldChipGrid {
  chips = ['Chip 0', 'Chip 1', 'Chip 2'];

  remove(chip: string) {
    const index = this.chips.indexOf(chip);

    if (index > -1) {
      this.chips.splice(index, 1);
    }
  }
}

@Component({
  template: `
    <mat-form-field>
      <mat-chip-grid #chipGrid
                    placeholder="Food" [formControl]="control" [required]="isRequired">
        <mat-chip-row *ngFor="let food of foods" [value]="food.value" (removed)="remove(food)">
          {{ food.viewValue }}
        </mat-chip-row>
      </mat-chip-grid>
      <input placeholder="New food..."
          [matChipInputFor]="chipGrid"
          [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
          [matChipInputAddOnBlur]="addOnBlur"
          (matChipInputTokenEnd)="add($event)"/>
    </mat-form-field>
  `
})
class InputChipGrid {
  foods: any[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos', disabled: true},
    {value: 'sandwich-3', viewValue: 'Sandwich'},
    {value: 'chips-4', viewValue: 'Chips'},
    {value: 'eggs-5', viewValue: 'Eggs'},
    {value: 'pasta-6', viewValue: 'Pasta'},
    {value: 'sushi-7', viewValue: 'Sushi'},
  ];
  control = new FormControl();

  separatorKeyCodes = [ENTER, SPACE];
  addOnBlur: boolean = true;
  isRequired: boolean;

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add our foods
    if ((value || '').trim()) {
      this.foods.push({
        value: `${value.trim().toLowerCase()}-${this.foods.length}`,
        viewValue: value.trim()
      });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(food: any): void {
    const index = this.foods.indexOf(food);

    if (index > -1) {
      this.foods.splice(index, 1);
    }
  }

  @ViewChild(MatChipGrid, {static: false}) chipGrid: MatChipGrid;
  @ViewChildren(MatChipRow) chips: QueryList<MatChipRow>;
}

@Component({
  template: `
<form #form="ngForm" novalidate>
  <mat-form-field>
    <mat-chip-grid #chipGrid [formControl]="formControl">
      <mat-chip-row *ngFor="let food of foods" [value]="food.value">
      {{food.viewValue}}
      </mat-chip-row>
    </mat-chip-grid>
    <input name="test" [matChipInputFor]="chipGrid"/>
    <mat-hint>Please select a chip, or type to add a new chip</mat-hint>
    <mat-error>Should have value</mat-error>
  </mat-form-field>
</form>
  `
})
class ChipGridWithFormErrorMessages {
  foods: any[] = [
    {value: 0, viewValue: 'Steak'},
    {value: 1, viewValue: 'Pizza'},
    {value: 2, viewValue: 'Pasta'},
  ];
  @ViewChildren(MatChipRow) chips: QueryList<MatChipRow>;

  @ViewChild('form', {static: false}) form: NgForm;
  formControl = new FormControl('', Validators.required);
}

@Component({
  template: `
    <mat-chip-grid #chipGrid>
      <mat-chip-row *ngFor="let i of numbers" (removed)="remove(i)">{{i}}</mat-chip-row>
      <input name="test" [matChipInputFor]="chipGrid"/>
    </mat-chip-grid>`,
  animations: [
    // For the case we're testing this animation doesn't
    // have to be used anywhere, it just has to be defined.
    trigger('dummyAnimation', [
      transition(':leave', [
        style({opacity: 0}),
        animate('500ms', style({opacity: 1}))
      ])
    ])
  ]
})
class StandardChipGridWithAnimations {
  numbers = [0, 1, 2, 3, 4];

  remove(item: number): void {
    const index = this.numbers.indexOf(item);

    if (index > -1) {
      this.numbers.splice(index, 1);
    }
  }
}

@Component({
  template: `
    <mat-form-field>
      <mat-chip-grid #chipGrid>
        <mat-chip-row [value]="i" (removed)="removeChip($event)" *ngFor="let i of chips">
          Chip {{i + 1}}
          <span matChipRemove>Remove</span>
        </mat-chip-row>
      </mat-chip-grid>
      <input name="test" [matChipInputFor]="chipGrid"/>
    </mat-form-field>
  `
})
class ChipGridWithRemove {
  chips = [0, 1, 2, 3, 4];

  removeChip(event: MatChipEvent) {
    this.chips.splice(event.chip.value, 1);
  }
}
