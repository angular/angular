import {FocusKeyManager} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {BACKSPACE, DELETE, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, TAB} from '@angular/cdk/keycodes';
import {createKeyboardEvent, dispatchFakeEvent, dispatchKeyboardEvent} from '@angular/cdk/testing';
import {Component, DebugElement, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormControl, FormsModule, NgForm, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from '../input/index';
import {MatChip} from './chip';
import {MatChipInputEvent} from './chip-input';
import {MatChipList, MatChipsModule} from './index';


describe('MatChipList', () => {
  let fixture: ComponentFixture<any>;
  let chipListDebugElement: DebugElement;
  let chipListNativeElement: HTMLElement;
  let chipListInstance: MatChipList;
  let testComponent: StandardChipList;
  let chips: QueryList<any>;
  let manager: FocusKeyManager<MatChip>;
  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule
      ],
      declarations: [
        ChipListWithFormErrorMessages,
        StandardChipList,
        FormFieldChipList,
        BasicChipList,
        InputChipList,
        MultiSelectionChipList,
        FalsyValueChipList,
        SelectedChipList
      ],
      providers: [{
        provide: Directionality, useFactory: () => {
          return {value: dir.toLowerCase()};
        }
      }]
    });

    TestBed.compileComponents();
  }));

  describe('StandardChipList', () => {
    describe('basic behaviors', () => {
      beforeEach(async(() => {
        setupStandardList();
      }));

      it('should add the `mat-chip-list` class', () => {
        expect(chipListNativeElement.classList).toContain('mat-chip-list');
      });
    });

    describe('with selected chips', () => {
      beforeEach(async(() => {
        fixture = TestBed.createComponent(SelectedChipList);
        fixture.detectChanges();
        chipListDebugElement = fixture.debugElement.query(By.directive(MatChipList));
        chipListNativeElement = chipListDebugElement.nativeElement;
      }));

      it('should not override chips selected', () => {
        const instanceChips = fixture.componentInstance.chips.toArray();

        expect(instanceChips[0].selected).toBe(true, 'Expected first option to be selected.');
        expect(instanceChips[1].selected).toBe(false, 'Expected second option to be not selected.');
        expect(instanceChips[2].selected).toBe(true, 'Expected third option to be selected.');
      });

      it('should have role listbox', () => {
        expect(chipListNativeElement.getAttribute('role')).toBe('listbox');
      });

      it('should not have role when empty', () => {
        fixture.componentInstance.foods = [];
        fixture.detectChanges();

        expect(chipListNativeElement.getAttribute('role')).toBeNull('Expect no role attribute');
      });
    });

    describe('focus behaviors', () => {
      beforeEach(async(() => {
        setupStandardList();
        manager = chipListInstance._keyManager;
      }));

      it('should focus the first chip on focus', () => {
        chipListInstance.focus();
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(0);
      });

      it('should watch for chip focus', () => {
        let array = chips.toArray();
        let lastIndex = array.length - 1;
        let lastItem = array[lastIndex];
        lastItem.focus();
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(lastIndex);
      });

      it('should watch for chip focus', () => {
        let array = chips.toArray();
        let lastIndex = array.length - 1;
        let lastItem = array[lastIndex];

        lastItem.focus();
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(lastIndex);
      });

      describe('on chip destroy', () => {
        it('should focus the next item', () => {
          let array = chips.toArray();
          let midItem = array[2];

          // Focus the middle item
          midItem.focus();

          // Destroy the middle item
          testComponent.remove = 2;
          fixture.detectChanges();

          // It focuses the 4th item (now at index 2)
          expect(manager.activeItemIndex).toEqual(2);
        });


        it('should focus the previous item', () => {
          let array = chips.toArray();
          let lastIndex = array.length - 1;
          let lastItem = array[lastIndex];

          // Focus the last item
          lastItem.focus();

          // Destroy the last item
          testComponent.remove = lastIndex;
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(lastIndex - 1);
        });
      });
    });

    describe('keyboard behavior', () => {
      describe('LTR (default)', () => {
        beforeEach(async(() => {
          dir = 'ltr';
          setupStandardList();
          manager = chipListInstance._keyManager;
        }));

        it('should focus previous item when press LEFT ARROW', () => {
          let nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          let lastNativeChip = nativeChips[nativeChips.length - 1] as HTMLElement;

          let LEFT_EVENT = createKeyboardEvent('keydown', LEFT_ARROW, lastNativeChip);
          let array = chips.toArray();
          let lastIndex = array.length - 1;
          let lastItem = array[lastIndex];

          // Focus the last item in the array
          lastItem.focus();
          expect(manager.activeItemIndex).toEqual(lastIndex);

          // Press the LEFT arrow
          chipListInstance._keydown(LEFT_EVENT);
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(lastIndex - 1);
        });

        it('should focus next item when press RIGHT ARROW', () => {
          let nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          let firstNativeChip = nativeChips[0] as HTMLElement;

          let RIGHT_EVENT: KeyboardEvent =
            createKeyboardEvent('keydown', RIGHT_ARROW, firstNativeChip);
          let array = chips.toArray();
          let firstItem = array[0];

          // Focus the last item in the array
          firstItem.focus();
          expect(manager.activeItemIndex).toEqual(0);

          // Press the RIGHT arrow
          chipListInstance._keydown(RIGHT_EVENT);
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(1);
        });

      });

      describe('RTL', () => {
        beforeEach(async(() => {
          dir = 'rtl';
          setupStandardList();
          manager = chipListInstance._keyManager;
        }));

        it('should focus previous item when press RIGHT ARROW', () => {
          let nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          let lastNativeChip = nativeChips[nativeChips.length - 1] as HTMLElement;

          let RIGHT_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', RIGHT_ARROW, lastNativeChip);
          let array = chips.toArray();
          let lastIndex = array.length - 1;
          let lastItem = array[lastIndex];

          // Focus the last item in the array
          lastItem.focus();
          expect(manager.activeItemIndex).toEqual(lastIndex);

          // Press the RIGHT arrow
          chipListInstance._keydown(RIGHT_EVENT);
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(lastIndex - 1);
        });

        it('should focus next item when press LEFT ARROW', () => {
          let nativeChips = chipListNativeElement.querySelectorAll('mat-chip');
          let firstNativeChip = nativeChips[0] as HTMLElement;

          let LEFT_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', LEFT_ARROW, firstNativeChip);
          let array = chips.toArray();
          let firstItem = array[0];

          // Focus the last item in the array
          firstItem.focus();
          expect(manager.activeItemIndex).toEqual(0);

          // Press the LEFT arrow
          chipListInstance._keydown(LEFT_EVENT);
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(manager.activeItemIndex).toEqual(1);
        });

        it('should allow focus to escape when tabbing away', fakeAsync(() => {
          chipListInstance._keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

          expect(chipListInstance._tabIndex)
            .toBe(-1, 'Expected tabIndex to be set to -1 temporarily.');

          tick();

          expect(chipListInstance._tabIndex).toBe(0, 'Expected tabIndex to be reset back to 0');
        }));

        it(`should use user defined tabIndex`, fakeAsync(() => {
          chipListInstance.tabIndex = 4;

          fixture.detectChanges();

          expect(chipListInstance._tabIndex)
            .toBe(4, 'Expected tabIndex to be set to user defined value 4.');

          chipListInstance._keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

          expect(chipListInstance._tabIndex)
            .toBe(-1, 'Expected tabIndex to be set to -1 temporarily.');

          tick();

          expect(chipListInstance._tabIndex).toBe(4, 'Expected tabIndex to be reset back to 4');
        }));
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

      describe('when the input has focus', () => {

        it('should not focus the last chip when press DELETE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');
          let DELETE_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', DELETE, nativeInput);

          // Focus the input
          nativeInput.focus();
          expect(manager.activeItemIndex).toBe(-1);

          // Press the DELETE key
          chipListInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          // It doesn't focus the last chip
          expect(manager.activeItemIndex).toEqual(-1);
        });

        it('should focus the last chip when press BACKSPACE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');
          let BACKSPACE_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', BACKSPACE, nativeInput);

          // Focus the input
          nativeInput.focus();
          expect(manager.activeItemIndex).toBe(-1);

          // Press the BACKSPACE key
          chipListInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          // It focuses the last chip
          expect(manager.activeItemIndex).toEqual(chips.length - 1);
        });

      });
    });

    it('should complete the stateChanges stream on destroy', () => {
      const spy = jasmine.createSpy('stateChanges complete');
      const subscription = chipListInstance.stateChanges.subscribe(undefined, undefined, spy);

      fixture.destroy();
      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    });

  });

  describe('selection logic', () => {
    let formField: HTMLElement;
    let nativeChips: HTMLElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicChipList);
      fixture.detectChanges();

      formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
      nativeChips = fixture.debugElement.queryAll(By.css('mat-chip'))
          .map((chip) => chip.nativeElement);


      chipListDebugElement = fixture.debugElement.query(By.directive(MatChipList));
      chipListInstance = chipListDebugElement.componentInstance;
      chips = chipListInstance.chips;

    });

    it('should float placeholder if chip is selected', () => {
      expect(formField.classList.contains('mat-form-field-should-float'))
        .toBe(true, 'placeholder should be floating');
    });

    it('should remove selection if chip has been removed', async(() => {
      const instanceChips = fixture.componentInstance.chips;
      const chipList = fixture.componentInstance.chipList;
      const firstChip = nativeChips[0];
      dispatchKeyboardEvent(firstChip, 'keydown', SPACE);
      fixture.detectChanges();

      expect(instanceChips.first.selected).toBe(true, 'Expected first option to be selected.');
      expect(chipList.selected).toBe(chips.first, 'Expected first option to be selected.');

      fixture.componentInstance.foods = [];
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(chipList.selected)
          .toBe(undefined, 'Expected selection to be removed when option no longer exists.');
      });
    }));


    it('should select an option that was added after initialization', () => {
      fixture.componentInstance.foods.push({viewValue: 'Potatoes', value: 'potatoes-8'});
      fixture.detectChanges();

      nativeChips = fixture.debugElement.queryAll(By.css('mat-chip'))
        .map((chip) => chip.nativeElement);
      const lastChip = nativeChips[8];
      dispatchKeyboardEvent(lastChip, 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.chipList.value)
        .toContain('potatoes-8', 'Expect value contain the value of the last option');
      expect(fixture.componentInstance.chips.last.selected)
        .toBeTruthy('Expect last option selected');
    });

    it('should not select disabled chips', () => {
      const array = chips.toArray();
      const disabledChip = nativeChips[2];
      dispatchKeyboardEvent(disabledChip, 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.chipList.value)
        .toBeUndefined('Expect value to be undefined');
      expect(array[2].selected).toBeFalsy('Expect disabled chip not selected');
      expect(fixture.componentInstance.chipList.selected)
        .toBeUndefined('Expect no selected chips');
    });

  });

  describe('forms integration', () => {
    let formField: HTMLElement;
    let nativeChips: HTMLElement[];

    describe('single selection', () => {
      beforeEach(() => {
        fixture = TestBed.createComponent(BasicChipList);
        fixture.detectChanges();

        formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
        nativeChips = fixture.debugElement.queryAll(By.css('mat-chip'))
          .map((chip) => chip.nativeElement);
        chips = fixture.componentInstance.chips;
      });

      it('should take an initial view value with reactive forms', () => {
        fixture.componentInstance.control = new FormControl('pizza-1');
        fixture.detectChanges();

        const array = chips.toArray();

        expect(array[1].selected).toBeTruthy('Expect pizza-1 chip to be selected');

        dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
        fixture.detectChanges();

        expect(array[1].selected).toBeFalsy('Expect chip to be not selected after toggle selected');
      });

      it('should set the view value from the form', () => {
        const chipList = fixture.componentInstance.chipList;
        const array = chips.toArray();

        expect(chipList.value).toBeFalsy('Expect chip list to have no initial value');

        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        expect(array[1].selected).toBeTruthy('Expect chip to be selected');
      });

      it('should update the form value when the view changes', () => {

        expect(fixture.componentInstance.control.value)
          .toEqual(null, `Expected the control's value to be empty initially.`);

        dispatchKeyboardEvent(nativeChips[0], 'keydown', SPACE);
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value)
          .toEqual('steak-0', `Expected control's value to be set to the new option.`);
      });

      it('should clear the selection when a nonexistent option value is selected', () => {
        const array = chips.toArray();

        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        expect(array[1].selected)
          .toBeTruthy(`Expected chip with the value to be selected.`);

        fixture.componentInstance.control.setValue('gibberish');

        fixture.detectChanges();

        expect(array[1].selected)
          .toBeFalsy(`Expected chip with the old value not to be selected.`);
      });


      it('should clear the selection when the control is reset', () => {
        const array = chips.toArray();

        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        fixture.componentInstance.control.reset();
        fixture.detectChanges();

        expect(array[1].selected)
          .toBeFalsy(`Expected chip with the old value not to be selected.`);
      });

      it('should set the control to touched when the chip list is touched', () => {
        expect(fixture.componentInstance.control.touched)
          .toBe(false, 'Expected the control to start off as untouched.');

        const nativeChipList = fixture.debugElement.query(By.css('.mat-chip-list')).nativeElement;
        dispatchFakeEvent(nativeChipList, 'blur');

        expect(fixture.componentInstance.control.touched)
          .toBe(true, 'Expected the control to be touched.');
      });

      it('should not set touched when a disabled chip list is touched', () => {
        expect(fixture.componentInstance.control.touched)
          .toBe(false, 'Expected the control to start off as untouched.');

        fixture.componentInstance.control.disable();
        const nativeChipList = fixture.debugElement.query(By.css('.mat-chip-list')).nativeElement;
        dispatchFakeEvent(nativeChipList, 'blur');

        expect(fixture.componentInstance.control.touched)
          .toBe(false, 'Expected the control to stay untouched.');
      });

      it('should set the control to dirty when the chip list\'s value changes in the DOM', () => {
        expect(fixture.componentInstance.control.dirty)
          .toEqual(false, `Expected control to start out pristine.`);

        dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
        fixture.detectChanges();

        expect(fixture.componentInstance.control.dirty)
          .toEqual(true, `Expected control to be dirty after value was changed by user.`);
      });

      it('should not set the control to dirty when the value changes programmatically', () => {
        expect(fixture.componentInstance.control.dirty)
          .toEqual(false, `Expected control to start out pristine.`);

        fixture.componentInstance.control.setValue('pizza-1');

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

      it('should be able to programmatically select a falsy option', () => {
        fixture.destroy();

        const falsyFixture = TestBed.createComponent(FalsyValueChipList);
        falsyFixture.detectChanges();

        falsyFixture.componentInstance.control.setValue([0]);
        falsyFixture.detectChanges();
        falsyFixture.detectChanges();

        expect(falsyFixture.componentInstance.chips.first.selected)
          .toBe(true, 'Expected first option to be selected');
      });

      it('should not focus the active chip when the value is set programmatically', () => {
        const chipArray = fixture.componentInstance.chips.toArray();

        spyOn(chipArray[4], 'focus').and.callThrough();

        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        expect(chipArray[4].focus).not.toHaveBeenCalled();
      });
    });

    describe('multiple selection', () => {
      beforeEach(() => {
        fixture = TestBed.createComponent(MultiSelectionChipList);
        fixture.detectChanges();

        formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
        nativeChips = fixture.debugElement.queryAll(By.css('mat-chip'))
          .map((chip) => chip.nativeElement);
        chips = fixture.componentInstance.chips;
      });

      it('should take an initial view value with reactive forms', () => {
        fixture.componentInstance.control = new FormControl(['pizza-1']);
        fixture.detectChanges();

        const array = chips.toArray();

        expect(array[1].selected).toBeTruthy('Expect pizza-1 chip to be selected');

        dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
        fixture.detectChanges();

        expect(array[1].selected).toBeFalsy('Expect chip to be not selected after toggle selected');
      });

      it('should set the view value from the form', () => {
        const chipList = fixture.componentInstance.chipList;
        const array = chips.toArray();

        expect(chipList.value).toBeFalsy('Expect chip list to have no initial value');

        fixture.componentInstance.control.setValue(['pizza-1']);
        fixture.detectChanges();

        expect(array[1].selected).toBeTruthy('Expect chip to be selected');
      });

      it('should update the form value when the view changes', () => {

        expect(fixture.componentInstance.control.value)
          .toEqual(null, `Expected the control's value to be empty initially.`);

        dispatchKeyboardEvent(nativeChips[0], 'keydown', SPACE);
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value)
          .toEqual(['steak-0'], `Expected control's value to be set to the new option.`);
      });

      it('should clear the selection when a nonexistent option value is selected', () => {
        const array = chips.toArray();

        fixture.componentInstance.control.setValue(['pizza-1']);
        fixture.detectChanges();

        expect(array[1].selected)
          .toBeTruthy(`Expected chip with the value to be selected.`);

        fixture.componentInstance.control.setValue(['gibberish']);

        fixture.detectChanges();

        expect(array[1].selected)
          .toBeFalsy(`Expected chip with the old value not to be selected.`);
      });


      it('should clear the selection when the control is reset', () => {
        const array = chips.toArray();

        fixture.componentInstance.control.setValue(['pizza-1']);
        fixture.detectChanges();

        fixture.componentInstance.control.reset();
        fixture.detectChanges();

        expect(array[1].selected)
          .toBeFalsy(`Expected chip with the old value not to be selected.`);
      });
    });
  });

  describe('chip list with chip input', () => {
    let formField: HTMLElement;
    let nativeChips: HTMLElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(InputChipList);
      fixture.detectChanges();

      formField = fixture.debugElement.query(By.css('.mat-form-field')).nativeElement;
      nativeChips = fixture.debugElement.queryAll(By.css('mat-chip'))
        .map((chip) => chip.nativeElement);
    });

    it('should take an initial view value with reactive forms', () => {
      fixture.componentInstance.control = new FormControl(['pizza-1']);
      fixture.detectChanges();

      const array = fixture.componentInstance.chips.toArray();

      expect(array[1].selected).toBeTruthy('Expect pizza-1 chip to be selected');

      dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
      fixture.detectChanges();

      expect(array[1].selected).toBeFalsy('Expect chip to be not selected after toggle selected');
    });

    it('should set the view value from the form', () => {
      const array = fixture.componentInstance.chips.toArray();

      expect(array[1].selected).toBeFalsy('Expect chip to not be selected');

      fixture.componentInstance.control.setValue(['pizza-1']);
      fixture.detectChanges();

      expect(array[1].selected).toBeTruthy('Expect chip to be selected');
    });

    it('should update the form value when the view changes', () => {

      expect(fixture.componentInstance.control.value)
        .toEqual(null, `Expected the control's value to be empty initially.`);

      dispatchKeyboardEvent(nativeChips[0], 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value)
        .toEqual(['steak-0'], `Expected control's value to be set to the new option.`);
    });

    it('should clear the selection when a nonexistent option value is selected', () => {
      const array = fixture.componentInstance.chips.toArray();

      fixture.componentInstance.control.setValue(['pizza-1']);
      fixture.detectChanges();

      expect(array[1].selected)
        .toBeTruthy(`Expected chip with the value to be selected.`);

      fixture.componentInstance.control.setValue(['gibberish']);

      fixture.detectChanges();

      expect(array[1].selected)
        .toBeFalsy(`Expected chip with the old value not to be selected.`);
    });


    it('should clear the selection when the control is reset', () => {
      const array = fixture.componentInstance.chips.toArray();

      fixture.componentInstance.control.setValue(['pizza-1']);
      fixture.detectChanges();

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      expect(array[1].selected)
        .toBeFalsy(`Expected chip with the old value not to be selected.`);
    });

    it('should set the control to touched when the chip list is touched', async(() => {
      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to start off as untouched.');

      const nativeChipList = fixture.debugElement.query(By.css('.mat-chip-list')).nativeElement;

      dispatchFakeEvent(nativeChipList, 'blur');

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.control.touched)
          .toBe(true, 'Expected the control to be touched.');
      });
    }));

    it('should not set touched when a disabled chip list is touched', () => {
      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to start off as untouched.');

      fixture.componentInstance.control.disable();
      const nativeChipList = fixture.debugElement.query(By.css('.mat-chip-list')).nativeElement;
      dispatchFakeEvent(nativeChipList, 'blur');

      expect(fixture.componentInstance.control.touched)
        .toBe(false, 'Expected the control to stay untouched.');
    });

    it('should set the control to dirty when the chip list\'s value changes in the DOM', () => {
      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to start out pristine.`);

      dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.control.dirty)
        .toEqual(true, `Expected control to be dirty after value was changed by user.`);
    });

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

    describe('keyboard behavior', () => {
      beforeEach(() => {
        fixture = TestBed.createComponent(InputChipList);
        fixture.detectChanges();
        chipListDebugElement = fixture.debugElement.query(By.directive(MatChipList));
        chipListInstance = chipListDebugElement.componentInstance;
        chips = chipListInstance.chips;
        manager = fixture.componentInstance.chipList._keyManager;
      });

      describe('when the input has focus', () => {

        it('should not focus the last chip when press DELETE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');
          let DELETE_EVENT: KeyboardEvent =
            createKeyboardEvent('keydown', DELETE, nativeInput);

          // Focus the input
          nativeInput.focus();
          expect(manager.activeItemIndex).toBe(-1);

          // Press the DELETE key
          chipListInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          // It doesn't focus the last chip
          expect(manager.activeItemIndex).toEqual(-1);
        });

        it('should focus the last chip when press BACKSPACE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');
          let BACKSPACE_EVENT: KeyboardEvent =
            createKeyboardEvent('keydown', BACKSPACE, nativeInput);

          // Focus the input
          nativeInput.focus();
          expect(manager.activeItemIndex).toBe(-1);

          // Press the BACKSPACE key
          chipListInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          // It focuses the last chip
          expect(manager.activeItemIndex).toEqual(chips.length - 1);
        });

      });
    });
  });

  describe('error messages', () => {
    let errorTestComponent: ChipListWithFormErrorMessages;
    let containerEl: HTMLElement;
    let chipListEl: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ChipListWithFormErrorMessages);
      fixture.detectChanges();
      errorTestComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('mat-form-field')).nativeElement;
      chipListEl = fixture.debugElement.query(By.css('mat-chip-list')).nativeElement;
    });

    it('should not show any errors if the user has not interacted', () => {
      expect(errorTestComponent.formControl.untouched)
        .toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('mat-error').length).toBe(0, 'Expected no error message');
      expect(chipListEl.getAttribute('aria-invalid'))
        .toBe('false', 'Expected aria-invalid to be set to "false".');
    });

    it('should display an error message when the chip list is touched and invalid', async(() => {
      expect(errorTestComponent.formControl.invalid)
        .toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('mat-error').length)
        .toBe(0, 'Expected no error message');

      errorTestComponent.formControl.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(containerEl.classList)
          .toContain('mat-form-field-invalid', 'Expected container to have the invalid CSS class.');
        expect(containerEl.querySelectorAll('mat-error').length)
          .toBe(1, 'Expected one error message to have been rendered.');
        expect(chipListEl.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to "true".');
      });
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
        expect(chipListEl.getAttribute('aria-invalid'))
          .toBe('true', 'Expected aria-invalid to be set to "true".');
      });
    }));

    it('should hide the errors and show the hints once the chip list becomes valid',
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
      let describedBy = chipListEl.getAttribute('aria-describedby');

      expect(hintId).toBeTruthy('hint should be shown');
      expect(describedBy).toBe(hintId);

      fixture.componentInstance.formControl.markAsTouched();
      fixture.detectChanges();

      let errorIds = fixture.debugElement.queryAll(By.css('.mat-error'))
        .map(el => el.nativeElement.getAttribute('id')).join(' ');
      describedBy = chipListEl.getAttribute('aria-describedby');

      expect(errorIds).toBeTruthy('errors should be shown');
      expect(describedBy).toBe(errorIds);
    });
  });

  function setupStandardList() {
    fixture = TestBed.createComponent(StandardChipList);
    fixture.detectChanges();

    chipListDebugElement = fixture.debugElement.query(By.directive(MatChipList));
    chipListNativeElement = chipListDebugElement.nativeElement;
    chipListInstance = chipListDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipListInstance.chips;
  }

  function setupInputList() {
    fixture = TestBed.createComponent(FormFieldChipList);
    fixture.detectChanges();

    chipListDebugElement = fixture.debugElement.query(By.directive(MatChipList));
    chipListNativeElement = chipListDebugElement.nativeElement;
    chipListInstance = chipListDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipListInstance.chips;
  }

});

@Component({
  template: `
    <mat-chip-list [tabIndex]="tabIndex">
      <div *ngFor="let i of [0,1,2,3,4]">
       <div *ngIf="remove != i">
          <mat-chip (select)="chipSelect(i)" (deselect)="chipDeselect(i)">
            {{name}} {{i + 1}}
          </mat-chip>
        </div>
      </div>
    </mat-chip-list>`
})
class StandardChipList {
  name: string = 'Test';
  selectable: boolean = true;
  remove: number;
  chipSelect: (index?: number) => void = () => {};
  chipDeselect: (index?: number) => void = () => {};
  tabIndex: number = 0;
}

@Component({
  template: `
    <mat-form-field>
      <mat-chip-list #chipList>
        <mat-chip>Chip 1</mat-chip>
        <mat-chip>Chip 1</mat-chip>
        <mat-chip>Chip 1</mat-chip>
      </mat-chip-list>
      <input matInput name="test" [matChipInputFor]="chipList"/>
    </mat-form-field>
  `
})
class FormFieldChipList {
}


@Component({
  selector: 'basic-chip-list',
  template: `
    <mat-form-field>
      <mat-chip-list placeholder="Food" [formControl]="control" [required]="isRequired"
        [tabIndex]="tabIndexOverride" [selectable]="selectable">
        <mat-chip *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
          {{ food.viewValue }}
        </mat-chip>
      </mat-chip-list>
    </mat-form-field>
  `
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
  control = new FormControl();
  isRequired: boolean;
  tabIndexOverride: number;
  selectable: boolean;

  @ViewChild(MatChipList) chipList: MatChipList;
  @ViewChildren(MatChip) chips: QueryList<MatChip>;
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
  `
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
  control = new FormControl();
  isRequired: boolean;
  tabIndexOverride: number;
  selectable: boolean;

  @ViewChild(MatChipList) chipList: MatChipList;
  @ViewChildren(MatChip) chips: QueryList<MatChip>;
}

@Component({
  selector: 'input-chip-list',
  template: `
    <mat-form-field>
      <mat-chip-list [multiple]="true"
                    placeholder="Food" [formControl]="control" [required]="isRequired" #chipList1>
        <mat-chip *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-chip>
      </mat-chip-list>
      <input placeholder="New food..."
          [matChipInputFor]="chipList1"
          [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
          [matChipInputAddOnBlur]="addOnBlur"
          (matChipInputTokenEnd)="add($event)" />/>
    </mat-form-field>
  `
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

  @ViewChild(MatChipList) chipList: MatChipList;
  @ViewChildren(MatChip) chips: QueryList<MatChip>;
}

@Component({
  template: `
    <mat-form-field>
      <mat-chip-list [formControl]="control">
        <mat-chip *ngFor="let food of foods" [value]="food.value">{{ food.viewValue }}</mat-chip>
      </mat-chip-list>
    </mat-form-field>
  `
})
class FalsyValueChipList {
  foods: any[] = [
    {value: 0, viewValue: 'Steak'},
    {value: 1, viewValue: 'Pizza'},
  ];
  control = new FormControl();
  @ViewChildren(MatChip) chips: QueryList<MatChip>;
}

@Component({
  template: `
    <mat-chip-list>
        <mat-chip *ngFor="let food of foods" [value]="food.value" [selected]="food.selected">
            {{ food.viewValue }}
        </mat-chip>
    </mat-chip-list>
  `
})
class SelectedChipList {
  foods: any[] = [
    {value: 0, viewValue: 'Steak', selected: true},
    {value: 1, viewValue: 'Pizza', selected: false},
    {value: 2, viewValue: 'Pasta', selected: true},
  ];
  @ViewChildren(MatChip) chips: QueryList<MatChip>;
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
  `
})
class ChipListWithFormErrorMessages {
  foods: any[] = [
    {value: 0, viewValue: 'Steak', selected: true},
    {value: 1, viewValue: 'Pizza', selected: false},
    {value: 2, viewValue: 'Pasta', selected: true},
  ];
  @ViewChildren(MatChip) chips: QueryList<MatChip>;

  @ViewChild('form') form: NgForm;
  formControl = new FormControl('', Validators.required);
}
