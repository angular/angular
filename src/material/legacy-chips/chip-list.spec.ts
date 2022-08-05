import {animate, style, transition, trigger} from '@angular/animations';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {
  A,
  BACKSPACE,
  DELETE,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  TAB,
} from '@angular/cdk/keycodes';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  MockNgZone,
  typeInElement,
} from '../../cdk/testing/private';
import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  NgZone,
  Provider,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {MatLegacyInputModule} from '../legacy-input/index';
import {MatLegacyChip} from './chip';
import {MatLegacyChipInputEvent} from './chip-input';
import {
  MatLegacyChipEvent,
  MatLegacyChipList,
  MatLegacyChipRemove,
  MatLegacyChipsModule,
} from './index';

describe('MatChipList', () => {
  let fixture: ComponentFixture<any>;
  let chipListDebugElement: DebugElement;
  let chipListNativeElement: HTMLElement;
  let chipListInstance: MatLegacyChipList;
  let testComponent: StandardChipList;
  let chips: QueryList<MatLegacyChip>;
  let manager: FocusKeyManager<MatLegacyChip>;
  let zone: MockNgZone;
  let dirChange: Subject<Direction>;

  describe('StandardChipList', () => {
    describe('basic behaviors', () => {
      beforeEach(() => {
        setupStandardList();
      });

      it('should add the `mat-chip-list` class', () => {
        expect(chipListNativeElement.classList).toContain('mat-chip-list');
      });

      it('should not have the aria-selected attribute when is not selectable', () => {
        testComponent.selectable = false;
        fixture.detectChanges();

        const chipsValid = chips
          .toArray()
          .every(
            chip =>
              !chip.selectable && !chip._elementRef.nativeElement.hasAttribute('aria-selected'),
          );

        expect(chipsValid).toBe(true);
      });

      it('should toggle the chips disabled state based on whether it is disabled', () => {
        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

        chipListInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

        chipListInstance.disabled = false;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);
      });

      it('should disable a chip that is added after the list became disabled', fakeAsync(() => {
        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

        chipListInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

        fixture.componentInstance.chips.push(5, 6);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);
      }));

      it('should preserve the disabled state of a chip if the list gets re-enabled', () => {
        const chipArray = chips.toArray();

        chipArray[2].disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().map(chip => chip.disabled)).toEqual([
          false,
          false,
          true,
          false,
          false,
        ]);

        chipListInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().map(chip => chip.disabled)).toEqual([true, true, true, true, true]);

        chipListInstance.disabled = false;
        fixture.detectChanges();

        expect(chips.toArray().map(chip => chip.disabled)).toEqual([
          false,
          false,
          true,
          false,
          false,
        ]);
      });
    });

    describe('with selected chips', () => {
      beforeEach(() => {
        fixture = createComponent(SelectedChipList);
        fixture.detectChanges();
        chipListDebugElement = fixture.debugElement.query(By.directive(MatLegacyChipList))!;
        chipListNativeElement = chipListDebugElement.nativeElement;
      });

      it('should not override chips selected', () => {
        const instanceChips = fixture.componentInstance.chips.toArray();

        expect(instanceChips[0].selected)
          .withContext('Expected first option to be selected.')
          .toBe(true);
        expect(instanceChips[1].selected)
          .withContext('Expected second option to be not selected.')
          .toBe(false);
        expect(instanceChips[2].selected)
          .withContext('Expected third option to be selected.')
          .toBe(true);
      });

      it('should have role listbox', () => {
        expect(chipListNativeElement.getAttribute('role')).toBe('listbox');
      });

      it('should not have role when empty', () => {
        fixture.componentInstance.foods = [];
        fixture.detectChanges();

        expect(chipListNativeElement.getAttribute('role'))
          .withContext('Expect no role attribute')
          .toBeNull();
      });

      it('should not have aria-required when it has no role', () => {
        fixture.componentInstance.foods = [];
        fixture.detectChanges();

        expect(chipListNativeElement.hasAttribute('role')).toBe(false);
        expect(chipListNativeElement.hasAttribute('aria-required')).toBe(false);
      });

      it('should be able to set a custom role', () => {
        fixture.componentInstance.chipList.role = 'grid';
        fixture.detectChanges();

        expect(chipListNativeElement.getAttribute('role')).toBe('grid');
      });
    });

    describe('focus behaviors', () => {
      beforeEach(() => {
        setupStandardList();
        manager = chipListInstance._keyManager;
      });

      it('should focus the first chip on focus', () => {
        chipListInstance.focus();
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(0);
      });

      it('should watch for chip focus', () => {
        const array = chips.toArray();
        const lastIndex = array.length - 1;
        const lastItem = array[lastIndex];

        lastItem.focus();
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(lastIndex);
      });

      it('should be able to become focused when disabled', () => {
        expect(chipListInstance.focused)
          .withContext('Expected list to not be focused.')
          .toBe(false);

        chipListInstance.disabled = true;
        fixture.detectChanges();

        chipListInstance.focus();
        fixture.detectChanges();

        expect(chipListInstance.focused)
          .withContext('Expected list to continue not to be focused')
          .toBe(false);
      });

      it('should remove the tabindex from the list if it is disabled', () => {
        expect(chipListNativeElement.getAttribute('tabindex')).toBeTruthy();

        chipListInstance.disabled = true;
        fixture.detectChanges();

        expect(chipListNativeElement.hasAttribute('tabindex')).toBeFalsy();
      });

      describe('on chip destroy', () => {
        it('should focus the next item', () => {
          const array = chips.toArray();
          const midItem = array[2];

          // Focus the middle item
          midItem.focus();

          // Destroy the middle item
          testComponent.chips.splice(2, 1);
          fixture.detectChanges();

          // It focuses the 4th item (now at index 2)
          expect(manager.activeItemIndex).toEqual(2);
        });

        it('should focus the previous item', () => {
          const array = chips.toArray();
          const lastIndex = array.length - 1;
          const lastItem = array[lastIndex];

          // Focus the last item
          lastItem.focus();

          // Destroy the last item
          testComponent.chips.pop();
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(lastIndex - 1);
        });

        it('should not focus if chip list is not focused', () => {
          const array = chips.toArray();
          const midItem = array[2];

          // Focus and blur the middle item
          midItem.focus();
          midItem._blur();
          zone.simulateZoneExit();

          // Destroy the middle item
          testComponent.chips.splice(2, 1);
          fixture.detectChanges();

          // Should not have focus
          expect(chipListInstance._keyManager.activeItemIndex).toEqual(-1);
        });

        it('should focus the list if the last focused item is removed', () => {
          testComponent.chips = [0];

          spyOn(chipListInstance, 'focus');
          chips.last.focus();

          testComponent.chips.pop();
          fixture.detectChanges();

          expect(chipListInstance.focus).toHaveBeenCalled();
        });

        it(
          'should move focus to the last chip when the focused chip was deleted inside a' +
            'component with animations',
          fakeAsync(() => {
            fixture.destroy();
            TestBed.resetTestingModule();
            fixture = createComponent(StandardChipListWithAnimations, [], BrowserAnimationsModule);
            fixture.detectChanges();

            chipListDebugElement = fixture.debugElement.query(By.directive(MatLegacyChipList))!;
            chipListNativeElement = chipListDebugElement.nativeElement;
            chipListInstance = chipListDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            chips = chipListInstance.chips;

            chips.last.focus();
            fixture.detectChanges();

            expect(chipListInstance._keyManager.activeItemIndex).toBe(chips.length - 1);

            dispatchKeyboardEvent(chips.last._elementRef.nativeElement, 'keydown', BACKSPACE);
            fixture.detectChanges();
            tick(500);

            expect(chipListInstance._keyManager.activeItemIndex).toBe(chips.length - 1);
          }),
        );
      });
    });

    describe('keyboard behavior', () => {
      describe('LTR (default)', () => {
        beforeEach(() => {
          setupStandardList();
          manager = chipListInstance._keyManager;
        });

        it('should focus previous item when press LEFT ARROW', () => {
          const nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          const lastNativeChip = nativeChips[nativeChips.length - 1] as HTMLElement;

          const array = chips.toArray();
          const lastIndex = array.length - 1;
          const lastItem = array[lastIndex];

          // Focus the last item in the array
          lastItem.focus();
          expect(manager.activeItemIndex).toEqual(lastIndex);

          // Press the LEFT arrow
          dispatchKeyboardEvent(lastNativeChip, 'keydown', LEFT_ARROW);
          chipListInstance._blur(); // Simulate focus leaving the list and going to the chip.
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(lastIndex - 1);
        });

        it('should focus next item when press RIGHT ARROW', () => {
          const nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          const firstNativeChip = nativeChips[0] as HTMLElement;

          const array = chips.toArray();
          const firstItem = array[0];

          // Focus the last item in the array
          firstItem.focus();
          expect(manager.activeItemIndex).toEqual(0);

          // Press the RIGHT arrow
          dispatchKeyboardEvent(firstNativeChip, 'keydown', RIGHT_ARROW);
          chipListInstance._blur(); // Simulate focus leaving the list and going to the chip.
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(1);
        });

        it('should not handle arrow key events from non-chip elements', () => {
          const initialActiveIndex = manager.activeItemIndex;

          dispatchKeyboardEvent(chipListNativeElement, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(manager.activeItemIndex)
            .withContext('Expected focused item not to have changed.')
            .toBe(initialActiveIndex);
        });

        it('should focus the first item when pressing HOME', () => {
          const nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          const lastNativeChip = nativeChips[nativeChips.length - 1] as HTMLElement;
          const HOME_EVENT = createKeyboardEvent('keydown', HOME);
          const array = chips.toArray();
          const lastItem = array[array.length - 1];

          lastItem.focus();
          expect(manager.activeItemIndex).toBe(array.length - 1);

          dispatchEvent(lastNativeChip, HOME_EVENT);
          fixture.detectChanges();

          expect(manager.activeItemIndex).toBe(0);
          expect(HOME_EVENT.defaultPrevented).toBe(true);
        });

        it('should focus the last item when pressing END', () => {
          const nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          const END_EVENT = createKeyboardEvent('keydown', END);

          expect(manager.activeItemIndex).toBe(-1);

          dispatchEvent(nativeChips[0], END_EVENT);
          fixture.detectChanges();

          expect(manager.activeItemIndex).toBe(chips.length - 1);
          expect(END_EVENT.defaultPrevented).toBe(true);
        });
      });

      describe('RTL', () => {
        beforeEach(() => {
          setupStandardList('rtl');
          manager = chipListInstance._keyManager;
        });

        it('should focus previous item when press RIGHT ARROW', () => {
          const nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          const lastNativeChip = nativeChips[nativeChips.length - 1] as HTMLElement;

          const array = chips.toArray();
          const lastIndex = array.length - 1;
          const lastItem = array[lastIndex];

          // Focus the last item in the array
          lastItem.focus();
          expect(manager.activeItemIndex).toEqual(lastIndex);

          // Press the RIGHT arrow
          dispatchKeyboardEvent(lastNativeChip, 'keydown', RIGHT_ARROW);
          chipListInstance._blur(); // Simulate focus leaving the list and going to the chip.
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(lastIndex - 1);
        });

        it('should focus next item when press LEFT ARROW', () => {
          const nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          const firstNativeChip = nativeChips[0] as HTMLElement;

          const array = chips.toArray();
          const firstItem = array[0];

          // Focus the last item in the array
          firstItem.focus();
          expect(manager.activeItemIndex).toEqual(0);

          // Press the LEFT arrow
          dispatchKeyboardEvent(firstNativeChip, 'keydown', LEFT_ARROW);
          chipListInstance._blur(); // Simulate focus leaving the list and going to the chip.
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(1);
        });

        it('should allow focus to escape when tabbing away', fakeAsync(() => {
          chipListInstance._keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

          expect(chipListInstance._tabIndex)
            .withContext('Expected tabIndex to be set to -1 temporarily.')
            .toBe(-1);

          tick();

          expect(chipListInstance._tabIndex)
            .withContext('Expected tabIndex to be reset back to 0')
            .toBe(0);
        }));

        it(`should use user defined tabIndex`, fakeAsync(() => {
          chipListInstance.tabIndex = 4;

          fixture.detectChanges();

          expect(chipListInstance._tabIndex)
            .withContext('Expected tabIndex to be set to user defined value 4.')
            .toBe(4);

          chipListInstance._keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

          expect(chipListInstance._tabIndex)
            .withContext('Expected tabIndex to be set to -1 temporarily.')
            .toBe(-1);

          tick();

          expect(chipListInstance._tabIndex)
            .withContext('Expected tabIndex to be reset back to 4')
            .toBe(4);
        }));
      });

      it('should account for the direction changing', () => {
        setupStandardList();
        manager = chipListInstance._keyManager;

        const nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
        const firstNativeChip = nativeChips[0] as HTMLElement;

        const RIGHT_EVENT = createKeyboardEvent('keydown', RIGHT_ARROW);
        const array = chips.toArray();
        const firstItem = array[0];

        firstItem.focus();
        expect(manager.activeItemIndex).toBe(0);

        dispatchEvent(firstNativeChip, RIGHT_EVENT);
        chipListInstance._blur();
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(1);

        dirChange.next('rtl');
        fixture.detectChanges();

        chipListInstance._keydown(RIGHT_EVENT);
        chipListInstance._blur();
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(0);
      });
    });
  });

  describe('FormFieldChipList', () => {
    beforeEach(() => {
      setupInputList();
    });

    describe('keyboard behavior', () => {
      beforeEach(() => {
        manager = chipListInstance._keyManager;
      });

      it('should maintain focus if the active chip is deleted', () => {
        const secondChip = fixture.nativeElement.querySelectorAll('.mat-chip')[1];

        secondChip.focus();
        fixture.detectChanges();

        expect(chipListInstance.chips.toArray().findIndex(chip => chip._hasFocus)).toBe(1);

        dispatchKeyboardEvent(secondChip, 'keydown', DELETE);
        fixture.detectChanges();

        expect(chipListInstance.chips.toArray().findIndex(chip => chip._hasFocus)).toBe(1);
      });

      describe('when the input has focus', () => {
        it('should not focus the last chip when press DELETE', () => {
          const nativeInput = fixture.nativeElement.querySelector('input');

          // Focus the input
          nativeInput.focus();
          expect(manager.activeItemIndex).toBe(-1);

          // Press the DELETE key
          dispatchKeyboardEvent(nativeInput, 'keydown', DELETE);
          fixture.detectChanges();

          // It doesn't focus the last chip
          expect(manager.activeItemIndex).toEqual(-1);
        });

        it('should focus the last chip when press BACKSPACE', () => {
          const nativeInput = fixture.nativeElement.querySelector('input');

          // Focus the input
          nativeInput.focus();
          expect(manager.activeItemIndex).toBe(-1);

          // Press the BACKSPACE key
          dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
          fixture.detectChanges();

          // It focuses the last chip
          expect(manager.activeItemIndex).toEqual(chips.length - 1);
        });

        it('should not focus the last chip when pressing BACKSPACE on a non-empty input', () => {
          const nativeInput = fixture.nativeElement.querySelector('input');
          nativeInput.value = 'hello';
          nativeInput.focus();
          fixture.detectChanges();
          expect(manager.activeItemIndex).toBe(-1);

          dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
          fixture.detectChanges();

          expect(manager.activeItemIndex).toBe(-1);
        });
      });
    });

    it('should complete the stateChanges stream on destroy', () => {
      const spy = jasmine.createSpy('stateChanges complete');
      const subscription = chipListInstance.stateChanges.subscribe({complete: spy});

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
    let chipList: MatLegacyChipList;
    let chipRemoveDebugElements: DebugElement[];

    beforeEach(() => {
      fixture = createComponent(ChipListWithRemove);
      fixture.detectChanges();

      chipList = fixture.debugElement.query(By.directive(MatLegacyChipList))!.componentInstance;
      chipRemoveDebugElements = fixture.debugElement.queryAll(By.directive(MatLegacyChipRemove));
      chips = chipList.chips;
    });

    it('should properly focus next item if chip is removed through click', () => {
      chips.toArray()[2].focus();

      // Destroy the third focused chip by dispatching a bubbling click event on the
      // associated chip remove element.
      dispatchMouseEvent(chipRemoveDebugElements[2].nativeElement, 'click');
      fixture.detectChanges();

      expect(chips.toArray()[2].value).not.toBe(2, 'Expected the third chip to be removed.');
      expect(chipList._keyManager.activeItemIndex).toBe(2);
    });
  });

  describe('selection logic', () => {
    let formField: HTMLElement;
    let nativeChips: HTMLElement[];

    beforeEach(() => {
      fixture = createComponent(BasicChipList);
      fixture.detectChanges();

      formField = fixture.debugElement.query(By.css('.mat-form-field'))!.nativeElement;
      nativeChips = fixture.debugElement
        .queryAll(By.css('mat-chip'))
        .map(chip => chip.nativeElement);

      chipListDebugElement = fixture.debugElement.query(By.directive(MatLegacyChipList))!;
      chipListInstance = chipListDebugElement.componentInstance;
      chips = chipListInstance.chips;
    });

    it('should float placeholder if chip is selected', () => {
      expect(formField.classList.contains('mat-form-field-should-float'))
        .withContext('placeholder should be floating')
        .toBe(true);
    });

    it('should remove selection if chip has been removed', fakeAsync(() => {
      const instanceChips = fixture.componentInstance.chips;
      const chipList = fixture.componentInstance.chipList;
      const firstChip = nativeChips[0];
      dispatchKeyboardEvent(firstChip, 'keydown', SPACE);
      fixture.detectChanges();

      expect(instanceChips.first.selected)
        .withContext('Expected first option to be selected.')
        .toBe(true);
      expect(chipList.selected)
        .withContext('Expected first option to be selected.')
        .toBe(chips.first);

      fixture.componentInstance.foods = [];
      fixture.detectChanges();
      tick();

      expect(chipList.selected)
        .withContext('Expected selection to be removed when option no longer exists.')
        .toBe(undefined);
    }));

    it('should select an option that was added after initialization', () => {
      fixture.componentInstance.foods.push({viewValue: 'Potatoes', value: 'potatoes-8'});
      fixture.detectChanges();

      nativeChips = fixture.debugElement
        .queryAll(By.css('mat-chip'))
        .map(chip => chip.nativeElement);
      const lastChip = nativeChips[8];
      dispatchKeyboardEvent(lastChip, 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.chipList.value)
        .withContext('Expect value contain the value of the last option')
        .toContain('potatoes-8');
      expect(fixture.componentInstance.chips.last.selected)
        .withContext('Expect last option selected')
        .toBeTruthy();
    });

    it('should not select disabled chips', () => {
      const array = chips.toArray();
      const disabledChip = nativeChips[2];
      dispatchKeyboardEvent(disabledChip, 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.chipList.value)
        .withContext('Expect value to be undefined')
        .toBeUndefined();
      expect(array[2].selected).withContext('Expect disabled chip not selected').toBeFalsy();
      expect(fixture.componentInstance.chipList.selected)
        .withContext('Expect no selected chips')
        .toBeUndefined();
    });
  });

  describe('forms integration', () => {
    let nativeChips: HTMLElement[];

    describe('single selection', () => {
      beforeEach(() => {
        fixture = createComponent(BasicChipList);
        fixture.detectChanges();

        nativeChips = fixture.debugElement
          .queryAll(By.css('mat-chip'))
          .map(chip => chip.nativeElement);
        chips = fixture.componentInstance.chips;
      });

      it('should take an initial view value with reactive forms', () => {
        fixture.componentInstance.control = new FormControl('pizza-1');
        fixture.detectChanges();

        const array = chips.toArray();

        expect(array[1].selected).withContext('Expect pizza-1 chip to be selected').toBeTruthy();

        dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
        fixture.detectChanges();

        expect(array[1].selected)
          .withContext('Expect chip to be not selected after toggle selected')
          .toBeFalsy();
      });

      it('should set the view value from the form', () => {
        const chipList = fixture.componentInstance.chipList;
        const array = chips.toArray();

        expect(chipList.value).withContext('Expect chip list to have no initial value').toBeFalsy();

        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        expect(array[1].selected).withContext('Expect chip to be selected').toBeTruthy();
      });

      it('should update the form value when the view changes', () => {
        expect(fixture.componentInstance.control.value)
          .withContext(`Expected the control's value to be empty initially.`)
          .toEqual(null);

        dispatchKeyboardEvent(nativeChips[0], 'keydown', SPACE);
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value)
          .withContext(`Expected control's value to be set to the new option.`)
          .toEqual('steak-0');
      });

      it('should clear the selection when a nonexistent option value is selected', () => {
        const array = chips.toArray();

        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        expect(array[1].selected)
          .withContext(`Expected chip with the value to be selected.`)
          .toBeTruthy();

        fixture.componentInstance.control.setValue('gibberish');

        fixture.detectChanges();

        expect(array[1].selected)
          .withContext(`Expected chip with the old value not to be selected.`)
          .toBeFalsy();
      });

      it('should clear the selection when the control is reset', () => {
        const array = chips.toArray();

        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        fixture.componentInstance.control.reset();
        fixture.detectChanges();

        expect(array[1].selected)
          .withContext(`Expected chip with the old value not to be selected.`)
          .toBeFalsy();
      });

      it('should set the control to touched when the chip list is touched', () => {
        expect(fixture.componentInstance.control.touched)
          .withContext('Expected the control to start off as untouched.')
          .toBe(false);

        const nativeChipList = fixture.debugElement.query(By.css('.mat-chip-list'))!.nativeElement;
        dispatchFakeEvent(nativeChipList, 'blur');

        expect(fixture.componentInstance.control.touched)
          .withContext('Expected the control to be touched.')
          .toBe(true);
      });

      it('should not set touched when a disabled chip list is touched', () => {
        expect(fixture.componentInstance.control.touched)
          .withContext('Expected the control to start off as untouched.')
          .toBe(false);

        fixture.componentInstance.control.disable();
        const nativeChipList = fixture.debugElement.query(By.css('.mat-chip-list'))!.nativeElement;
        dispatchFakeEvent(nativeChipList, 'blur');

        expect(fixture.componentInstance.control.touched)
          .withContext('Expected the control to stay untouched.')
          .toBe(false);
      });

      it("should set the control to dirty when the chip list's value changes in the DOM", () => {
        expect(fixture.componentInstance.control.dirty)
          .withContext(`Expected control to start out pristine.`)
          .toEqual(false);

        dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
        fixture.detectChanges();

        expect(fixture.componentInstance.control.dirty)
          .withContext(`Expected control to be dirty after value was changed by user.`)
          .toEqual(true);
      });

      it('should not set the control to dirty when the value changes programmatically', () => {
        expect(fixture.componentInstance.control.dirty)
          .withContext(`Expected control to start out pristine.`)
          .toEqual(false);

        fixture.componentInstance.control.setValue('pizza-1');

        expect(fixture.componentInstance.control.dirty)
          .withContext(`Expected control to stay pristine after programmatic change.`)
          .toEqual(false);
      });

      it('should set an asterisk after the placeholder if the control is required', () => {
        let requiredMarker = fixture.debugElement.query(By.css('.mat-form-field-required-marker'))!;
        expect(requiredMarker)
          .withContext(`Expected placeholder not to have an asterisk, as control was not required.`)
          .toBeNull();

        fixture.componentInstance.chipList.required = true;
        fixture.detectChanges();

        requiredMarker = fixture.debugElement.query(By.css('.mat-form-field-required-marker'))!;
        expect(requiredMarker)
          .withContext(`Expected placeholder to have an asterisk, as control was required.`)
          .not.toBeNull();
      });

      it('should mark the component as required if the control has a required validator', () => {
        fixture.componentInstance.control = new FormControl(undefined, [Validators.required]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.mat-form-field-required-marker')).toBeTruthy();
      });

      it('should be able to programmatically select a falsy option', () => {
        fixture.destroy();
        TestBed.resetTestingModule();

        const falsyFixture = createComponent(FalsyValueChipList);
        falsyFixture.detectChanges();

        falsyFixture.componentInstance.control.setValue([0]);
        falsyFixture.detectChanges();
        falsyFixture.detectChanges();

        expect(falsyFixture.componentInstance.chips.first.selected)
          .withContext('Expected first option to be selected')
          .toBe(true);
      });

      it('should not focus the active chip when the value is set programmatically', () => {
        const chipArray = fixture.componentInstance.chips.toArray();

        spyOn(chipArray[4], 'focus').and.callThrough();

        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        expect(chipArray[4].focus).not.toHaveBeenCalled();
      });

      it('should blur the form field when the active chip is blurred', fakeAsync(() => {
        const formField: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field');

        nativeChips[0].focus();
        fixture.detectChanges();

        expect(formField.classList).toContain('mat-focused');

        nativeChips[0].blur();
        fixture.detectChanges();
        zone.simulateZoneExit();
        fixture.detectChanges();

        expect(formField.classList).not.toContain('mat-focused');
      }));
    });

    describe('multiple selection', () => {
      beforeEach(() => {
        fixture = createComponent(MultiSelectionChipList);
        fixture.detectChanges();

        nativeChips = fixture.debugElement
          .queryAll(By.css('mat-chip'))
          .map(chip => chip.nativeElement);
        chips = fixture.componentInstance.chips;
      });

      it('should take an initial view value with reactive forms', () => {
        fixture.componentInstance.control = new FormControl(['pizza-1']);
        fixture.detectChanges();

        const array = chips.toArray();

        expect(array[1].selected).withContext('Expect pizza-1 chip to be selected').toBeTruthy();

        dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
        fixture.detectChanges();

        expect(array[1].selected)
          .withContext('Expect chip to be not selected after toggle selected')
          .toBeFalsy();
      });

      it('should set the view value from the form', () => {
        const chipList = fixture.componentInstance.chipList;
        const array = chips.toArray();

        expect(chipList.value).withContext('Expect chip list to have no initial value').toBeFalsy();

        fixture.componentInstance.control.setValue(['pizza-1']);
        fixture.detectChanges();

        expect(array[1].selected).withContext('Expect chip to be selected').toBeTruthy();
      });

      it('should update the form value when the view changes', () => {
        expect(fixture.componentInstance.control.value)
          .withContext(`Expected the control's value to be empty initially.`)
          .toEqual(null);

        dispatchKeyboardEvent(nativeChips[0], 'keydown', SPACE);
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value)
          .withContext(`Expected control's value to be set to the new option.`)
          .toEqual(['steak-0']);
      });

      it('should clear the selection when a nonexistent option value is selected', () => {
        const array = chips.toArray();

        fixture.componentInstance.control.setValue(['pizza-1']);
        fixture.detectChanges();

        expect(array[1].selected)
          .withContext(`Expected chip with the value to be selected.`)
          .toBeTruthy();

        fixture.componentInstance.control.setValue(['gibberish']);

        fixture.detectChanges();

        expect(array[1].selected)
          .withContext(`Expected chip with the old value not to be selected.`)
          .toBeFalsy();
      });

      it('should clear the selection when the control is reset', () => {
        const array = chips.toArray();

        fixture.componentInstance.control.setValue(['pizza-1']);
        fixture.detectChanges();

        fixture.componentInstance.control.reset();
        fixture.detectChanges();

        expect(array[1].selected)
          .withContext(`Expected chip with the old value not to be selected.`)
          .toBeFalsy();
      });
    });

    it(
      'should keep the disabled state in sync if the form group is swapped and ' +
        'disabled at the same time',
      fakeAsync(() => {
        fixture = createComponent(ChipListInsideDynamicFormGroup);
        fixture.detectChanges();
        const instance = fixture.componentInstance;
        const list: MatLegacyChipList = instance.chipList;

        expect(list.disabled).toBe(false);
        expect(list.chips.toArray().every(chip => chip.disabled)).toBe(false);

        instance.assignGroup(true);
        fixture.detectChanges();

        expect(list.disabled).toBe(true);
        expect(list.chips.toArray().every(chip => chip.disabled)).toBe(true);
      }),
    );
  });

  describe('chip list with chip input', () => {
    let nativeChips: HTMLElement[];

    beforeEach(() => {
      fixture = createComponent(InputChipList);
      fixture.detectChanges();

      nativeChips = fixture.debugElement
        .queryAll(By.css('mat-chip'))
        .map(chip => chip.nativeElement);
    });

    it('should take an initial view value with reactive forms', () => {
      fixture.componentInstance.control = new FormControl(['pizza-1']);
      fixture.detectChanges();

      const array = fixture.componentInstance.chips.toArray();

      expect(array[1].selected).withContext('Expect pizza-1 chip to be selected').toBeTruthy();

      dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
      fixture.detectChanges();

      expect(array[1].selected)
        .withContext('Expect chip to be not selected after toggle selected')
        .toBeFalsy();
    });

    it('should set the view value from the form', () => {
      const array = fixture.componentInstance.chips.toArray();

      expect(array[1].selected).withContext('Expect chip to not be selected').toBeFalsy();

      fixture.componentInstance.control.setValue(['pizza-1']);
      fixture.detectChanges();

      expect(array[1].selected).withContext('Expect chip to be selected').toBeTruthy();
    });

    it('should update the form value when the view changes', () => {
      expect(fixture.componentInstance.control.value)
        .withContext(`Expected the control's value to be empty initially.`)
        .toEqual(null);

      dispatchKeyboardEvent(nativeChips[0], 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value)
        .withContext(`Expected control's value to be set to the new option.`)
        .toEqual(['steak-0']);
    });

    it('should clear the selection when a nonexistent option value is selected', () => {
      const array = fixture.componentInstance.chips.toArray();

      fixture.componentInstance.control.setValue(['pizza-1']);
      fixture.detectChanges();

      expect(array[1].selected)
        .withContext(`Expected chip with the value to be selected.`)
        .toBeTruthy();

      fixture.componentInstance.control.setValue(['gibberish']);

      fixture.detectChanges();

      expect(array[1].selected)
        .withContext(`Expected chip with the old value not to be selected.`)
        .toBeFalsy();
    });

    it('should clear the selection when the control is reset', () => {
      const array = fixture.componentInstance.chips.toArray();

      fixture.componentInstance.control.setValue(['pizza-1']);
      fixture.detectChanges();

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      expect(array[1].selected)
        .withContext(`Expected chip with the old value not to be selected.`)
        .toBeFalsy();
    });

    it('should set the control to touched when the chip list is touched', fakeAsync(() => {
      expect(fixture.componentInstance.control.touched)
        .withContext('Expected the control to start off as untouched.')
        .toBe(false);

      const nativeChipList = fixture.debugElement.query(By.css('.mat-chip-list'))!.nativeElement;

      dispatchFakeEvent(nativeChipList, 'blur');
      tick();

      expect(fixture.componentInstance.control.touched)
        .withContext('Expected the control to be touched.')
        .toBe(true);
    }));

    it('should not set touched when a disabled chip list is touched', () => {
      expect(fixture.componentInstance.control.touched)
        .withContext('Expected the control to start off as untouched.')
        .toBe(false);

      fixture.componentInstance.control.disable();
      const nativeChipList = fixture.debugElement.query(By.css('.mat-chip-list'))!.nativeElement;
      dispatchFakeEvent(nativeChipList, 'blur');

      expect(fixture.componentInstance.control.touched)
        .withContext('Expected the control to stay untouched.')
        .toBe(false);
    });

    it("should set the control to dirty when the chip list's value changes in the DOM", () => {
      expect(fixture.componentInstance.control.dirty)
        .withContext(`Expected control to start out pristine.`)
        .toEqual(false);

      dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.control.dirty)
        .withContext(`Expected control to be dirty after value was changed by user.`)
        .toEqual(true);
    });

    it('should not set the control to dirty when the value changes programmatically', () => {
      expect(fixture.componentInstance.control.dirty)
        .withContext(`Expected control to start out pristine.`)
        .toEqual(false);

      fixture.componentInstance.control.setValue(['pizza-1']);

      expect(fixture.componentInstance.control.dirty)
        .withContext(`Expected control to stay pristine after programmatic change.`)
        .toEqual(false);
    });

    it('should set an asterisk after the placeholder if the control is required', () => {
      let requiredMarker = fixture.debugElement.query(By.css('.mat-form-field-required-marker'))!;
      expect(requiredMarker)
        .withContext(`Expected placeholder not to have an asterisk, as control was not required.`)
        .toBeNull();

      fixture.componentInstance.isRequired = true;
      fixture.detectChanges();

      requiredMarker = fixture.debugElement.query(By.css('.mat-form-field-required-marker'))!;
      expect(requiredMarker)
        .not.withContext(`Expected placeholder to have an asterisk, as control was required.`)
        .toBeNull();
    });

    it('should keep focus on the input after adding the first chip', fakeAsync(() => {
      const nativeInput = fixture.nativeElement.querySelector('input');
      const chipEls = Array.from<HTMLElement>(
        fixture.nativeElement.querySelectorAll('.mat-chip'),
      ).reverse();

      // Remove the chips via backspace to simulate the user removing them.
      chipEls.forEach(chip => {
        chip.focus();
        dispatchKeyboardEvent(chip, 'keydown', BACKSPACE);
        fixture.detectChanges();
        tick();
      });

      nativeInput.focus();
      expect(fixture.componentInstance.foods)
        .withContext('Expected all chips to be removed.')
        .toEqual([]);
      expect(document.activeElement).withContext('Expected input to be focused.').toBe(nativeInput);

      typeInElement(nativeInput, '123');
      fixture.detectChanges();
      dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
      fixture.detectChanges();
      tick();

      expect(document.activeElement)
        .withContext('Expected input to remain focused.')
        .toBe(nativeInput);
    }));

    it('should set aria-invalid if the form field is invalid', () => {
      fixture.componentInstance.control = new FormControl(undefined, [Validators.required]);
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      expect(input.getAttribute('aria-invalid')).toBe('true');

      fixture.componentInstance.chips.first.selectViaInteraction();
      fixture.detectChanges();

      expect(input.getAttribute('aria-invalid')).toBe('false');
    });

    describe('keyboard behavior', () => {
      let nativeInput: HTMLInputElement;

      const expectNoItemFocused = () => expect(manager.activeItemIndex).toBe(-1);
      const expectLastItemFocused = () => expect(manager.activeItemIndex).toEqual(chips.length - 1);

      beforeEach(() => {
        chipListDebugElement = fixture.debugElement.query(By.directive(MatLegacyChipList))!;
        chipListInstance = chipListDebugElement.componentInstance;
        chips = chipListInstance.chips;
        manager = fixture.componentInstance.chipList._keyManager;
        nativeInput = fixture.nativeElement.querySelector('input');
        nativeInput.focus();
        expectNoItemFocused();
      });

      describe('when the input has focus', () => {
        it('should not focus the last chip when pressing DELETE', () => {
          dispatchKeyboardEvent(nativeInput, 'keydown', DELETE);
          expectNoItemFocused();
        });

        it('should focus the last chip when pressing BACKSPACE when input is empty', () => {
          dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
          expectLastItemFocused();
        });

        it(
          'should not focus the last chip when pressing BACKSPACE after changing input, ' +
            'until BACKSPACE is released and pressed again',
          () => {
            // Change the input
            dispatchKeyboardEvent(nativeInput, 'keydown', A);

            // It shouldn't focus until backspace is released and pressed again
            dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
            dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
            dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
            expectNoItemFocused();

            // Still not focused
            dispatchKeyboardEvent(nativeInput, 'keyup', BACKSPACE);
            expectNoItemFocused();

            // Only now should it focus the last element
            dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
            expectLastItemFocused();
          },
        );

        it('should focus last chip after pressing BACKSPACE after creating a chip', () => {
          // Create a chip
          typeInElement(nativeInput, '123');
          dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);

          expectNoItemFocused();

          dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
          expectLastItemFocused();
        });
      });
    });
  });

  describe('error messages', () => {
    let errorTestComponent: ChipListWithFormErrorMessages;
    let containerEl: HTMLElement;
    let chipListEl: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(ChipListWithFormErrorMessages);
      fixture.detectChanges();
      errorTestComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
      chipListEl = fixture.debugElement.query(By.css('mat-chip-list'))!.nativeElement;
    });

    it('should not show any errors if the user has not interacted', () => {
      expect(errorTestComponent.formControl.untouched)
        .withContext('Expected untouched form control')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);
      expect(chipListEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "false".')
        .toBe('false');
    });

    it('should display an error message when the list is touched and invalid', fakeAsync(() => {
      expect(errorTestComponent.formControl.invalid)
        .withContext('Expected form control to be invalid')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);

      errorTestComponent.formControl.markAsTouched();
      fixture.detectChanges();
      tick();

      expect(containerEl.classList)
        .withContext('Expected container to have the invalid CSS class.')
        .toContain('mat-form-field-invalid');
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected one error message to have been rendered.')
        .toBe(1);
      expect(chipListEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "true".')
        .toBe('true');
    }));

    it('should display an error message when the parent form is submitted', fakeAsync(() => {
      expect(errorTestComponent.form.submitted)
        .withContext('Expected form not to have been submitted')
        .toBe(false);
      expect(errorTestComponent.formControl.invalid)
        .withContext('Expected form control to be invalid')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);

      dispatchFakeEvent(fixture.debugElement.query(By.css('form'))!.nativeElement, 'submit');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(errorTestComponent.form.submitted)
          .withContext('Expected form to have been submitted')
          .toBe(true);
        expect(containerEl.classList)
          .withContext('Expected container to have the invalid CSS class.')
          .toContain('mat-form-field-invalid');
        expect(containerEl.querySelectorAll('mat-error').length)
          .withContext('Expected one error message to have been rendered.')
          .toBe(1);
        expect(chipListEl.getAttribute('aria-invalid'))
          .withContext('Expected aria-invalid to be set to "true".')
          .toBe('true');
      });
    }));

    it('should hide the errors and show the hints once the chip list becomes valid', fakeAsync(() => {
      errorTestComponent.formControl.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(containerEl.classList)
          .withContext('Expected container to have the invalid CSS class.')
          .toContain('mat-form-field-invalid');
        expect(containerEl.querySelectorAll('mat-error').length)
          .withContext('Expected one error message to have been rendered.')
          .toBe(1);
        expect(containerEl.querySelectorAll('mat-hint').length)
          .withContext('Expected no hints to be shown.')
          .toBe(0);

        errorTestComponent.formControl.setValue('something');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(containerEl.classList).not.toContain(
            'mat-form-field-invalid',
            'Expected container not to have the invalid class when valid.',
          );
          expect(containerEl.querySelectorAll('mat-error').length)
            .withContext('Expected no error messages when the input is valid.')
            .toBe(0);
          expect(containerEl.querySelectorAll('mat-hint').length)
            .withContext('Expected one hint to be shown once the input is valid.')
            .toBe(1);
        });
      });
    }));

    it('should set the proper aria-live attribute on the error messages', () => {
      errorTestComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelector('mat-error')!.getAttribute('aria-live')).toBe('polite');
    });

    it('sets the aria-describedby to reference errors when in error state', () => {
      const hintId = fixture.debugElement
        .query(By.css('.mat-hint'))!
        .nativeElement.getAttribute('id');
      let describedBy = chipListEl.getAttribute('aria-describedby');

      expect(hintId).withContext('hint should be shown').toBeTruthy();
      expect(describedBy).toBe(hintId);

      fixture.componentInstance.formControl.markAsTouched();
      fixture.detectChanges();

      const errorIds = fixture.debugElement
        .queryAll(By.css('.mat-error'))
        .map(el => el.nativeElement.getAttribute('id'))
        .join(' ');
      describedBy = chipListEl.getAttribute('aria-describedby');

      expect(errorIds).withContext('errors should be shown').toBeTruthy();
      expect(describedBy).toBe(errorIds);
    });
  });

  it('should preselect chip as selected inside an OnPush component', fakeAsync(() => {
    fixture = createComponent(PreselectedChipInsideOnPush);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mat-chip').classList)
      .withContext('Expected first chip to be selected.')
      .toContain('mat-chip-selected');
  }));

  it('should not throw when accessing the selected value too early in single selection mode', fakeAsync(() => {
    fixture = createComponent(StandardChipList);
    const chipList = fixture.debugElement.query(By.directive(MatLegacyChipList)).componentInstance;
    expect(() => chipList.selected).not.toThrow();
  }));

  it('should not throw when accessing the selected value too early in multi selection mode', fakeAsync(() => {
    fixture = createComponent(StandardChipList);
    const chipList = fixture.debugElement.query(By.directive(MatLegacyChipList)).componentInstance;
    chipList.multiple = true;
    expect(() => chipList.selected).not.toThrow();
  }));

  function createComponent<T>(
    component: Type<T>,
    providers: Provider[] = [],
    animationsModule:
      | Type<NoopAnimationsModule>
      | Type<BrowserAnimationsModule> = NoopAnimationsModule,
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatLegacyChipsModule,
        MatLegacyFormFieldModule,
        MatLegacyInputModule,
        animationsModule,
      ],
      declarations: [component],
      providers: [{provide: NgZone, useFactory: () => (zone = new MockNgZone())}, ...providers],
    }).compileComponents();

    return TestBed.createComponent<T>(component);
  }

  function setupStandardList(direction: Direction = 'ltr') {
    dirChange = new Subject();
    fixture = createComponent(StandardChipList, [
      {
        provide: Directionality,
        useFactory: () => ({
          value: direction.toLowerCase(),
          change: dirChange,
        }),
      },
    ]);
    fixture.detectChanges();

    chipListDebugElement = fixture.debugElement.query(By.directive(MatLegacyChipList))!;
    chipListNativeElement = chipListDebugElement.nativeElement;
    chipListInstance = chipListDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipListInstance.chips;
  }

  function setupInputList() {
    fixture = createComponent(FormFieldChipList);
    fixture.detectChanges();

    chipListDebugElement = fixture.debugElement.query(By.directive(MatLegacyChipList))!;
    chipListNativeElement = chipListDebugElement.nativeElement;
    chipListInstance = chipListDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipListInstance.chips;
  }
});

@Component({
  template: `
    <mat-chip-list [tabIndex]="tabIndex" [selectable]="selectable">
      <mat-chip *ngFor="let i of chips" (select)="chipSelect(i)" (deselect)="chipDeselect(i)">
        {{name}} {{i + 1}}
      </mat-chip>
    </mat-chip-list>`,
})
class StandardChipList {
  name: string = 'Test';
  selectable: boolean = true;
  chipSelect: (index?: number) => void = () => {};
  chipDeselect: (index?: number) => void = () => {};
  tabIndex: number = 0;
  chips = [0, 1, 2, 3, 4];
}

@Component({
  template: `
    <mat-form-field>
      <mat-label>Add a chip</mat-label>
      <mat-chip-list #chipList>
        <mat-chip *ngFor="let chip of chips" (removed)="remove(chip)">{{chip}}</mat-chip>
      </mat-chip-list>
      <input name="test" [matChipInputFor]="chipList"/>
    </mat-form-field>
  `,
})
class FormFieldChipList {
  chips = ['Chip 0', 'Chip 1', 'Chip 2'];

  remove(chip: string) {
    const index = this.chips.indexOf(chip);

    if (index > -1) {
      this.chips.splice(index, 1);
    }
  }
}

@Component({
  selector: 'basic-chip-list',
  template: `
    <mat-form-field>
      <mat-chip-list placeholder="Food" [formControl]="control"
        [tabIndex]="tabIndexOverride" [selectable]="selectable">
        <mat-chip *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
          {{ food.viewValue }}
        </mat-chip>
      </mat-chip-list>
    </mat-form-field>
  `,
})
class BasicChipList {
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
  control = new FormControl<string | null>(null);
  tabIndexOverride: number;
  selectable: boolean;

  @ViewChild(MatLegacyChipList) chipList: MatLegacyChipList;
  @ViewChildren(MatLegacyChip) chips: QueryList<MatLegacyChip>;
}

@Component({
  selector: 'multi-selection-chip-list',
  template: `
    <mat-form-field>
      <mat-chip-list [multiple]="true" placeholder="Food" [formControl]="control"
        [required]="isRequired"
        [tabIndex]="tabIndexOverride" [selectable]="selectable">
        <mat-chip *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
          {{ food.viewValue }}
        </mat-chip>
      </mat-chip-list>
    </mat-form-field>
  `,
})
class MultiSelectionChipList {
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
  control = new FormControl<string[] | null>(null);
  isRequired: boolean;
  tabIndexOverride: number;
  selectable: boolean;

  @ViewChild(MatLegacyChipList) chipList: MatLegacyChipList;
  @ViewChildren(MatLegacyChip) chips: QueryList<MatLegacyChip>;
}

@Component({
  selector: 'input-chip-list',
  template: `
    <mat-form-field>
      <mat-chip-list [multiple]="true"
                    placeholder="Food" [formControl]="control" [required]="isRequired" #chipList1>
        <mat-chip *ngFor="let food of foods" [value]="food.value" (removed)="remove(food)">
          {{ food.viewValue }}
        </mat-chip>
      </mat-chip-list>

      <input placeholder="New food..."
          [matChipInputFor]="chipList1"
          [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
          [matChipInputAddOnBlur]="addOnBlur"
          (matChipInputTokenEnd)="add($event)"
      />
    </mat-form-field>
  `,
})
class InputChipList {
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
  control = new FormControl<string[] | null>(null);

  separatorKeyCodes = [ENTER, SPACE];
  addOnBlur: boolean = true;
  isRequired: boolean;

  add(event: MatLegacyChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our foods
    if (value) {
      this.foods.push({
        value: `${value.toLowerCase()}-${this.foods.length}`,
        viewValue: value,
      });
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(food: any): void {
    const index = this.foods.indexOf(food);

    if (index > -1) {
      this.foods.splice(index, 1);
    }
  }

  @ViewChild(MatLegacyChipList) chipList: MatLegacyChipList;
  @ViewChildren(MatLegacyChip) chips: QueryList<MatLegacyChip>;
}

@Component({
  template: `
    <mat-form-field>
      <mat-chip-list [formControl]="control">
        <mat-chip *ngFor="let food of foods" [value]="food.value">{{ food.viewValue }}</mat-chip>
      </mat-chip-list>
    </mat-form-field>
  `,
})
class FalsyValueChipList {
  foods: any[] = [
    {value: 0, viewValue: 'Steak'},
    {value: 1, viewValue: 'Pizza'},
  ];
  control = new FormControl<number[] | null>(null);
  @ViewChildren(MatLegacyChip) chips: QueryList<MatLegacyChip>;
}

@Component({
  template: `
    <mat-chip-list>
      <mat-chip *ngFor="let food of foods" [value]="food.value" [selected]="food.selected">
        {{ food.viewValue }}
      </mat-chip>
    </mat-chip-list>
  `,
})
class SelectedChipList {
  foods: any[] = [
    {value: 0, viewValue: 'Steak', selected: true},
    {value: 1, viewValue: 'Pizza', selected: false},
    {value: 2, viewValue: 'Pasta', selected: true},
  ];
  @ViewChildren(MatLegacyChip) chips: QueryList<MatLegacyChip>;
  @ViewChild(MatLegacyChipList, {static: false}) chipList: MatLegacyChipList;
}

@Component({
  template: `
<form #form="ngForm" novalidate>
  <mat-form-field>
    <mat-chip-list [formControl]="formControl">
      <mat-chip *ngFor="let food of foods" [value]="food.value" [selected]="food.selected">
      {{food.viewValue}}
      </mat-chip>
    </mat-chip-list>
    <mat-hint>Please select a chip, or type to add a new chip</mat-hint>
    <mat-error>Should have value</mat-error>
  </mat-form-field>
</form>
  `,
})
class ChipListWithFormErrorMessages {
  foods: any[] = [
    {value: 0, viewValue: 'Steak', selected: true},
    {value: 1, viewValue: 'Pizza', selected: false},
    {value: 2, viewValue: 'Pasta', selected: true},
  ];
  @ViewChildren(MatLegacyChip) chips: QueryList<MatLegacyChip>;

  @ViewChild('form') form: NgForm;
  formControl = new FormControl('', Validators.required);
}

@Component({
  template: `
    <mat-chip-list>
      <mat-chip *ngFor="let i of numbers" (removed)="remove(i)">{{i}}</mat-chip>
    </mat-chip-list>`,
  animations: [
    // For the case we're testing this animation doesn't
    // have to be used anywhere, it just has to be defined.
    trigger('dummyAnimation', [
      transition(':leave', [style({opacity: 0}), animate('500ms', style({opacity: 1}))]),
    ]),
  ],
})
class StandardChipListWithAnimations {
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
      <mat-chip-list>
        <mat-chip [value]="i" (removed)="removeChip($event)" *ngFor="let i of chips">
          Chip {{i + 1}}
          <span matChipRemove>Remove</span>
        </mat-chip>
      </mat-chip-list>
    </mat-form-field>
  `,
})
class ChipListWithRemove {
  chips = [0, 1, 2, 3, 4];

  removeChip(event: MatLegacyChipEvent) {
    this.chips.splice(event.chip.value, 1);
  }
}

@Component({
  template: `
    <mat-form-field>
      <mat-chip-list [formControl]="control">
        <mat-chip>Pizza</mat-chip>
        <mat-chip>Pasta</mat-chip>
      </mat-chip-list>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PreselectedChipInsideOnPush {
  control = new FormControl('Pizza');
}

@Component({
  template: `
    <form [formGroup]="form">
      <mat-form-field>
        <mat-chip-list formControlName="control">
          <mat-chip>Pizza</mat-chip>
          <mat-chip>Pasta</mat-chip>
        </mat-chip-list>
      </mat-form-field>
    </form>
  `,
})
class ChipListInsideDynamicFormGroup {
  @ViewChild(MatLegacyChipList) chipList: MatLegacyChipList;
  form: FormGroup;

  constructor(private _formBuilder: FormBuilder) {
    this.assignGroup(false);
  }

  assignGroup(isDisabled: boolean) {
    this.form = this._formBuilder.group({
      control: {value: [], disabled: isDisabled},
    });
  }
}
