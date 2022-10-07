import {Direction, Directionality} from '@angular/cdk/bidi';
import {END, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE, TAB} from '@angular/cdk/keycodes';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  MockNgZone,
  patchElementFocus,
} from '@angular/cdk/testing/private';
import {
  Component,
  DebugElement,
  NgZone,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
  EventEmitter,
} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MatChipListbox, MatChipOption, MatChipsModule} from './index';

describe('MDC-based MatChipListbox', () => {
  let fixture: ComponentFixture<any>;
  let chipListboxDebugElement: DebugElement;
  let chipListboxNativeElement: HTMLElement;
  let chipListboxInstance: MatChipListbox;
  let testComponent: StandardChipListbox;
  let chips: QueryList<MatChipOption>;
  let zone: MockNgZone;
  let directionality: {value: Direction; change: EventEmitter<Direction>};
  let primaryActions: NodeListOf<HTMLElement>;

  describe('StandardChipList', () => {
    describe('basic behaviors', () => {
      beforeEach(() => {
        createComponent(StandardChipListbox);
      });

      it('should add the `mat-mdc-chip-set` class', () => {
        expect(chipListboxNativeElement.classList).toContain('mat-mdc-chip-set');
      });

      it('should not have the aria-selected attribute when it is not selectable', fakeAsync(() => {
        testComponent.selectable = false;
        fixture.detectChanges();
        tick();

        const chipsValid = chips
          .toArray()
          .every(
            chip =>
              !chip.selectable && !chip._elementRef.nativeElement.hasAttribute('aria-selected'),
          );

        expect(chipsValid).toBe(true);
      }));

      it('should toggle the chips disabled state based on whether it is disabled', () => {
        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

        chipListboxInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

        chipListboxInstance.disabled = false;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);
      });

      it('should disable a chip that is added after the listbox became disabled', fakeAsync(() => {
        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

        chipListboxInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

        fixture.componentInstance.chips.push(5, 6);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);
      }));

      it('should not set a role on the grid when the list is empty', () => {
        testComponent.chips = [];
        fixture.detectChanges();

        expect(chipListboxNativeElement.hasAttribute('role')).toBe(false);
      });

      it('should be able to set a custom role', () => {
        testComponent.role = 'grid';
        fixture.detectChanges();

        expect(chipListboxNativeElement.getAttribute('role')).toBe('grid');
      });

      it('should not set aria-required when it does not have a role', () => {
        testComponent.chips = [];
        fixture.detectChanges();

        expect(chipListboxNativeElement.hasAttribute('role')).toBe(false);
        expect(chipListboxNativeElement.hasAttribute('aria-required')).toBe(false);
      });
    });

    describe('with selected chips', () => {
      beforeEach(() => {
        fixture = createComponent(SelectedChipListbox);
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
        expect(chipListboxNativeElement.getAttribute('role')).toBe('listbox');
      });

      it('should not have role when empty', () => {
        fixture.componentInstance.foods = [];
        fixture.detectChanges();

        expect(chipListboxNativeElement.getAttribute('role'))
          .withContext('Expect no role attribute')
          .toBeNull();
      });
    });

    describe('focus behaviors', () => {
      beforeEach(() => {
        createComponent(StandardChipListbox);
      });

      it('should focus the first chip on focus', () => {
        chipListboxInstance.focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(primaryActions[0]);
      });

      it('should focus the primary action when calling the `focus` method', () => {
        chips.last.focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(primaryActions[primaryActions.length - 1]);
      });

      it('should not be able to become focused when disabled', () => {
        expect(chipListboxInstance.focused)
          .withContext('Expected listbox to not be focused.')
          .toBe(false);

        chipListboxInstance.disabled = true;
        fixture.detectChanges();

        chipListboxInstance.focus();
        fixture.detectChanges();

        expect(chipListboxInstance.focused)
          .withContext('Expected listbox to continue not to be focused')
          .toBe(false);
      });

      it('should remove the tabindex from the listbox if it is disabled', () => {
        expect(chipListboxNativeElement.getAttribute('tabindex')).toBe('0');

        chipListboxInstance.disabled = true;
        fixture.detectChanges();

        expect(chipListboxNativeElement.getAttribute('tabindex')).toBe('-1');
      });

      describe('on chip destroy', () => {
        it('should focus the next item', () => {
          const midItem = chips.get(2)!;

          // Focus the middle item
          patchElementFocus(midItem.primaryAction!._elementRef.nativeElement);
          midItem.focus();

          // Destroy the middle item
          testComponent.chips.splice(2, 1);
          fixture.detectChanges();

          // It focuses the 4th item
          expect(document.activeElement).toBe(primaryActions[3]);
        });

        it('should focus the previous item', () => {
          // Focus the last item
          patchElementFocus(chips.last.primaryAction!._elementRef.nativeElement);
          chips.last.focus();

          // Destroy the last item
          testComponent.chips.pop();
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(document.activeElement).toBe(primaryActions[primaryActions.length - 2]);
        });

        it('should not focus if chip listbox is not focused', fakeAsync(() => {
          const midItem = chips.get(2)!;

          // Focus and blur the middle item
          midItem.focus();
          (document.activeElement as HTMLElement).blur();
          tick();
          zone.simulateZoneExit();

          // Destroy the middle item
          testComponent.chips.splice(2, 1);
          fixture.detectChanges();
          tick();

          // Should not have focus
          expect(chipListboxNativeElement.contains(document.activeElement)).toBe(false);
        }));

        it('should focus the listbox if the last focused item is removed', fakeAsync(() => {
          testComponent.chips = [0];
          fixture.detectChanges();

          spyOn(chipListboxInstance, 'focus');
          patchElementFocus(chips.last.primaryAction!._elementRef.nativeElement);
          chips.last.focus();

          testComponent.chips.pop();
          fixture.detectChanges();

          expect(chipListboxInstance.focus).toHaveBeenCalled();
        }));
      });
    });

    describe('keyboard behavior', () => {
      describe('LTR (default)', () => {
        beforeEach(() => {
          createComponent(StandardChipListbox);
        });

        it('should focus previous item when press LEFT ARROW', () => {
          const lastIndex = primaryActions.length - 1;

          // Focus the last item in the array
          chips.last.focus();
          expect(document.activeElement).toBe(primaryActions[lastIndex]);

          // Press the LEFT arrow
          dispatchKeyboardEvent(primaryActions[lastIndex], 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(document.activeElement).toBe(primaryActions[lastIndex - 1]);
        });

        it('should focus next item when press RIGHT ARROW', () => {
          // Focus the last item in the array
          chips.first.focus();
          expect(document.activeElement).toBe(primaryActions[0]);

          // Press the RIGHT arrow
          dispatchKeyboardEvent(primaryActions[0], 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(document.activeElement).toBe(primaryActions[1]);
        });

        it('should not handle arrow key events from non-chip elements', () => {
          const previousActiveElement = document.activeElement;

          dispatchKeyboardEvent(chipListboxNativeElement, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(document.activeElement)
            .withContext('Expected focused item not to have changed.')
            .toBe(previousActiveElement);
        });

        it('should focus the first item when pressing HOME', () => {
          const lastAction = primaryActions[primaryActions.length - 1];
          chips.last.focus();
          expect(document.activeElement).toBe(lastAction);

          const event = dispatchKeyboardEvent(lastAction, 'keydown', HOME);
          fixture.detectChanges();

          expect(document.activeElement).toBe(primaryActions[0]);
          expect(event.defaultPrevented).toBe(true);
        });

        it('should focus the last item when pressing END', () => {
          chips.first.focus();
          expect(document.activeElement).toBe(primaryActions[0]);

          const event = dispatchKeyboardEvent(primaryActions[0], 'keydown', END);
          fixture.detectChanges();

          expect(document.activeElement).toBe(primaryActions[primaryActions.length - 1]);
          expect(event.defaultPrevented).toBe(true);
        });
      });

      describe('RTL', () => {
        beforeEach(() => {
          createComponent(StandardChipListbox, 'rtl');
        });

        it('should focus previous item when press RIGHT ARROW', () => {
          const lastIndex = primaryActions.length - 1;

          // Focus the last item in the array
          chips.last.focus();
          expect(document.activeElement).toBe(primaryActions[lastIndex]);

          // Press the RIGHT arrow
          dispatchKeyboardEvent(primaryActions[lastIndex], 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(document.activeElement).toBe(primaryActions[lastIndex - 1]);
        });

        it('should focus next item when press LEFT ARROW', () => {
          // Focus the last item in the array
          chips.first.focus();
          expect(document.activeElement).toBe(primaryActions[0]);

          // Press the LEFT arrow
          dispatchKeyboardEvent(primaryActions[0], 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(document.activeElement).toBe(primaryActions[1]);
        });

        it('should allow focus to escape when tabbing away', fakeAsync(() => {
          dispatchKeyboardEvent(chipListboxNativeElement, 'keydown', TAB);

          expect(chipListboxInstance.tabIndex)
            .withContext('Expected tabIndex to be set to -1 temporarily.')
            .toBe(-1);

          flush();

          expect(chipListboxInstance.tabIndex)
            .withContext('Expected tabIndex to be reset back to 0')
            .toBe(0);
        }));

        it('should use user defined tabIndex', fakeAsync(() => {
          chipListboxInstance.tabIndex = 4;

          fixture.detectChanges();

          expect(chipListboxInstance.tabIndex)
            .withContext('Expected tabIndex to be set to user defined value 4.')
            .toBe(4);

          dispatchKeyboardEvent(chipListboxNativeElement, 'keydown', TAB);

          expect(chipListboxInstance.tabIndex)
            .withContext('Expected tabIndex to be set to -1 temporarily.')
            .toBe(-1);

          flush();

          expect(chipListboxInstance.tabIndex)
            .withContext('Expected tabIndex to be reset back to 4')
            .toBe(4);
        }));
      });

      it('should account for the direction changing', () => {
        createComponent(StandardChipListbox);

        chips.first.focus();
        expect(document.activeElement).toBe(primaryActions[0]);

        dispatchKeyboardEvent(primaryActions[0], 'keydown', RIGHT_ARROW);
        fixture.detectChanges();

        expect(document.activeElement).toBe(primaryActions[1]);

        directionality.value = 'rtl';
        directionality.change.next('rtl');
        fixture.detectChanges();

        dispatchKeyboardEvent(primaryActions[1], 'keydown', RIGHT_ARROW);
        fixture.detectChanges();

        expect(document.activeElement).toBe(primaryActions[0]);
      });
    });

    describe('selection logic', () => {
      it('should remove selection if chip has been removed', fakeAsync(() => {
        fixture = createComponent(BasicChipListbox);
        const instanceChips = fixture.componentInstance.chips;
        const chipListbox = fixture.componentInstance.chipListbox;
        dispatchKeyboardEvent(primaryActions[0], 'keydown', SPACE);
        fixture.detectChanges();

        expect(instanceChips.first.selected)
          .withContext('Expected first option to be selected.')
          .toBe(true);
        expect(chipListbox.selected)
          .withContext('Expected first option to be selected.')
          .toBe(chips.first);

        fixture.componentInstance.foods = [];
        fixture.detectChanges();
        tick();

        expect(chipListbox.selected)
          .withContext('Expected selection to be removed when option no longer exists.')
          .toBe(undefined);
      }));

      it('should select an option that was added after initialization', () => {
        fixture = createComponent(BasicChipListbox);
        fixture.componentInstance.foods.push({viewValue: 'Potatoes', value: 'potatoes-8'});
        fixture.detectChanges();

        primaryActions = chipListboxNativeElement.querySelectorAll<HTMLElement>(
          '.mdc-evolution-chip__action--primary',
        );

        dispatchKeyboardEvent(primaryActions[8], 'keydown', SPACE);
        fixture.detectChanges();

        expect(fixture.componentInstance.chipListbox.value)
          .withContext('Expect value contain the value of the last option')
          .toContain('potatoes-8');
        expect(fixture.componentInstance.chips.last.selected)
          .withContext('Expect last option selected')
          .toBeTruthy();
      });

      it('should not select disabled chips', () => {
        fixture = createComponent(BasicChipListbox);
        const array = chips.toArray();
        dispatchKeyboardEvent(primaryActions[2], 'keydown', SPACE);
        fixture.detectChanges();

        expect(fixture.componentInstance.chipListbox.value)
          .withContext('Expect value to be undefined')
          .toBeUndefined();
        expect(array[2].selected).withContext('Expect disabled chip not selected').toBeFalsy();
        expect(fixture.componentInstance.chipListbox.selected)
          .withContext('Expect no selected chips')
          .toBeUndefined();
      });

      it('should not select when is not selectable', fakeAsync(() => {
        const falsyFixture = createComponent(FalsyBasicChipListbox);
        falsyFixture.detectChanges();
        tick();
        falsyFixture.detectChanges();

        const chipListboxElement = falsyFixture.debugElement.query(By.directive(MatChipListbox))!;
        const _chips = chipListboxElement.componentInstance._chips;
        const nativeChips = (
          chipListboxElement.nativeElement as HTMLElement
        ).querySelectorAll<HTMLElement>('.mdc-evolution-chip__action--primary');

        expect(_chips.first.selected)
          .withContext('Expected first option not to be selected')
          .toBe(false);

        dispatchKeyboardEvent(nativeChips[0], 'keydown', SPACE);
        falsyFixture.detectChanges();
        flush();

        expect(_chips.first.selected)
          .withContext('Expected first option not to be selected.')
          .toBe(false);
      }));

      it('should set `aria-selected` based on the selection state in single selection mode', fakeAsync(() => {
        const getAriaSelected = () =>
          Array.from(primaryActions).map(action => action.getAttribute('aria-selected'));

        fixture = createComponent(BasicChipListbox);
        // Use a shorter list so we can keep the assertions smaller
        fixture.componentInstance.foods = [
          {value: 'steak-0', viewValue: 'Steak'},
          {value: 'pizza-1', viewValue: 'Pizza'},
          {value: 'tacos-2', viewValue: 'Tacos'},
        ];
        fixture.componentInstance.selectable = true;
        fixture.detectChanges();

        primaryActions = chipListboxNativeElement.querySelectorAll<HTMLElement>(
          '.mdc-evolution-chip__action--primary',
        );

        expect(getAriaSelected()).toEqual(['false', 'false', 'false']);

        primaryActions[1].click();
        fixture.detectChanges();
        expect(getAriaSelected()).toEqual(['false', 'true', 'false']);

        primaryActions[2].click();
        fixture.detectChanges();
        expect(getAriaSelected()).toEqual(['false', 'false', 'true']);

        primaryActions[0].click();
        fixture.detectChanges();
        expect(getAriaSelected()).toEqual(['true', 'false', 'false']);
      }));

      it('should set `aria-selected` based on the selection state in multi-selection mode', fakeAsync(() => {
        const getAriaSelected = () =>
          Array.from(primaryActions).map(action => action.getAttribute('aria-selected'));

        fixture = createComponent(MultiSelectionChipListbox);
        fixture.detectChanges();

        // Use a shorter list so we can keep the assertions smaller
        fixture.componentInstance.foods = [
          {value: 'steak-0', viewValue: 'Steak'},
          {value: 'pizza-1', viewValue: 'Pizza'},
          {value: 'tacos-2', viewValue: 'Tacos'},
        ];
        fixture.componentInstance.selectable = true;
        fixture.detectChanges();

        primaryActions = chipListboxNativeElement.querySelectorAll<HTMLElement>(
          '.mdc-evolution-chip__action--primary',
        );

        expect(getAriaSelected()).toEqual(['false', 'false', 'false']);

        primaryActions[1].click();
        fixture.detectChanges();
        expect(getAriaSelected()).toEqual(['false', 'true', 'false']);

        primaryActions[2].click();
        fixture.detectChanges();
        expect(getAriaSelected()).toEqual(['false', 'true', 'true']);

        primaryActions[0].click();
        fixture.detectChanges();
        expect(getAriaSelected()).toEqual(['true', 'true', 'true']);

        primaryActions[1].click();
        fixture.detectChanges();
        expect(getAriaSelected()).toEqual(['true', 'false', 'true']);
      }));
    });

    describe('chip list with chip input', () => {
      describe('single selection', () => {
        beforeEach(() => {
          fixture = createComponent(BasicChipListbox);
        });

        it('should take an initial view value with reactive forms', fakeAsync(() => {
          fixture.componentInstance.control = new FormControl('pizza-1');
          fixture.detectChanges();
          tick();
          const array = chips.toArray();

          expect(array[1].selected).withContext('Expect pizza-1 chip to be selected').toBeTruthy();

          dispatchKeyboardEvent(primaryActions[1], 'keydown', SPACE);
          fixture.detectChanges();
          flush();

          expect(array[1].selected)
            .withContext('Expect chip to be not selected after toggle selected')
            .toBeFalsy();
        }));

        it('should set the view value from the form', () => {
          const chipListbox = fixture.componentInstance.chipListbox;
          const array = chips.toArray();

          expect(chipListbox.value)
            .withContext('Expect chip listbox to have no initial value')
            .toBeFalsy();

          fixture.componentInstance.control.setValue('pizza-1');
          fixture.detectChanges();

          expect(array[1].selected).withContext('Expect chip to be selected').toBeTruthy();
        });

        it('should update the form value when the view changes', fakeAsync(() => {
          expect(fixture.componentInstance.control.value)
            .withContext(`Expected the control's value to be empty initially.`)
            .toEqual(null);

          dispatchKeyboardEvent(primaryActions[0], 'keydown', SPACE);
          fixture.detectChanges();
          flush();

          expect(fixture.componentInstance.control.value)
            .withContext(`Expected control's value to be set to the new option.`)
            .toEqual('steak-0');
        }));

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

        it('should set the control to touched when the chip listbox is touched', fakeAsync(() => {
          expect(fixture.componentInstance.control.touched)
            .withContext('Expected the control to start off as untouched.')
            .toBe(false);

          const nativeChipListbox = fixture.debugElement.query(
            By.css('mat-chip-listbox'),
          )!.nativeElement;
          dispatchFakeEvent(nativeChipListbox, 'blur');
          tick();

          expect(fixture.componentInstance.control.touched)
            .withContext('Expected the control to be touched.')
            .toBe(true);
        }));

        it('should not set touched when a disabled chip listbox is touched', fakeAsync(() => {
          expect(fixture.componentInstance.control.touched)
            .withContext('Expected the control to start off as untouched.')
            .toBe(false);

          fixture.componentInstance.control.disable();
          const nativeChipListbox = fixture.debugElement.query(
            By.css('mat-chip-listbox'),
          )!.nativeElement;
          dispatchFakeEvent(nativeChipListbox, 'blur');
          tick();

          expect(fixture.componentInstance.control.touched)
            .withContext('Expected the control to stay untouched.')
            .toBe(false);
        }));

        it("should set the control to dirty when the chip listbox's value changes in the DOM", () => {
          expect(fixture.componentInstance.control.dirty)
            .withContext(`Expected control to start out pristine.`)
            .toEqual(false);

          dispatchKeyboardEvent(primaryActions[1], 'keydown', SPACE);
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

        it('should be able to programmatically select a falsy option', () => {
          fixture.destroy();
          TestBed.resetTestingModule();

          const falsyFixture = createComponent(FalsyValueChipListbox);
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
      });

      describe('multiple selection', () => {
        beforeEach(() => {
          fixture = createComponent(MultiSelectionChipListbox);
          chips = fixture.componentInstance.chips;
        });

        it('should take an initial view value with reactive forms', () => {
          fixture.componentInstance.control = new FormControl(['pizza-1']);
          fixture.detectChanges();

          const array = chips.toArray();

          expect(array[1].selected).withContext('Expect pizza-1 chip to be selected').toBeTruthy();

          dispatchKeyboardEvent(primaryActions[1], 'keydown', SPACE);
          fixture.detectChanges();

          expect(array[1].selected)
            .withContext('Expect chip to be not selected after toggle selected')
            .toBeFalsy();
        });

        it('should set the view value from the form', () => {
          const chipListbox = fixture.componentInstance.chipListbox;
          const array = chips.toArray();

          expect(chipListbox.value)
            .withContext('Expect chip listbox to have no initial value')
            .toBeFalsy();

          fixture.componentInstance.control.setValue(['pizza-1']);
          fixture.detectChanges();

          expect(array[1].selected).withContext('Expect chip to be selected').toBeTruthy();
        });

        it('should update the form value when the view changes', () => {
          expect(fixture.componentInstance.control.value)
            .withContext(`Expected the control's value to be empty initially.`)
            .toEqual(null);

          dispatchKeyboardEvent(primaryActions[0], 'keydown', SPACE);
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
    });
  });

  function createComponent<T>(
    component: Type<T>,
    direction: Direction = 'ltr',
  ): ComponentFixture<T> {
    directionality = {
      value: direction,
      change: new EventEmitter(),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MatChipsModule],
      declarations: [component],
      providers: [
        {provide: NgZone, useFactory: () => (zone = new MockNgZone())},
        {provide: Directionality, useValue: directionality},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent<T>(component);
    fixture.detectChanges();

    chipListboxDebugElement = fixture.debugElement.query(By.directive(MatChipListbox))!;
    chipListboxNativeElement = chipListboxDebugElement.nativeElement;
    chipListboxInstance = chipListboxDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipListboxInstance._chips;
    primaryActions = chipListboxNativeElement.querySelectorAll<HTMLElement>(
      '.mdc-evolution-chip__action--primary',
    );

    return fixture;
  }
});

@Component({
  template: `
    <mat-chip-listbox [tabIndex]="tabIndex" [selectable]="selectable" [role]="role">
      <mat-chip-option *ngFor="let i of chips" (select)="chipSelect(i)"
        (deselect)="chipDeselect(i)">
        {{name}} {{i + 1}}
      </mat-chip-option>
    </mat-chip-listbox>`,
})
class StandardChipListbox {
  name: string = 'Test';
  selectable: boolean = true;
  chipSelect: (index?: number) => void = () => {};
  chipDeselect: (index?: number) => void = () => {};
  tabIndex: number = 0;
  chips = [0, 1, 2, 3, 4];
  role: string | null = null;
}

@Component({
  template: `
      <mat-chip-listbox [formControl]="control" [required]="isRequired"
        [tabIndex]="tabIndexOverride" [selectable]="selectable">
        <mat-chip-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
          {{ food.viewValue }}
        </mat-chip-option>
      </mat-chip-listbox>
  `,
})
class BasicChipListbox {
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
  isRequired: boolean;
  tabIndexOverride: number;
  selectable: boolean;

  @ViewChild(MatChipListbox) chipListbox: MatChipListbox;
  @ViewChildren(MatChipOption) chips: QueryList<MatChipOption>;
}

@Component({
  template: `
      <mat-chip-listbox [multiple]="true" [formControl]="control"
        [required]="isRequired"
        [tabIndex]="tabIndexOverride" [selectable]="selectable">
        <mat-chip-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
          {{ food.viewValue }}
        </mat-chip-option>
      </mat-chip-listbox>
  `,
})
class MultiSelectionChipListbox {
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
  isRequired: boolean;
  tabIndexOverride: number;
  selectable: boolean;

  @ViewChild(MatChipListbox) chipListbox: MatChipListbox;
  @ViewChildren(MatChipOption) chips: QueryList<MatChipOption>;
}

@Component({
  template: `
      <mat-chip-listbox [formControl]="control">
        <mat-chip-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </mat-chip-option>
      </mat-chip-listbox>
  `,
})
class FalsyValueChipListbox {
  foods: any[] = [
    {value: 0, viewValue: 'Steak'},
    {value: 1, viewValue: 'Pizza'},
  ];
  control = new FormControl([] as number[]);
  @ViewChildren(MatChipOption) chips: QueryList<MatChipOption>;
}

@Component({
  template: `
    <mat-chip-listbox>
        <mat-chip-option *ngFor="let food of foods" [value]="food.value" [selected]="food.selected">
            {{ food.viewValue }}
        </mat-chip-option>
    </mat-chip-listbox>
  `,
})
class SelectedChipListbox {
  foods: any[] = [
    {value: 0, viewValue: 'Steak', selected: true},
    {value: 1, viewValue: 'Pizza', selected: false},
    {value: 2, viewValue: 'Pasta', selected: true},
  ];
  @ViewChildren(MatChipOption) chips: QueryList<MatChipOption>;
}

@Component({
  template: `
      <mat-chip-listbox [formControl]="control" [required]="isRequired"
        [tabIndex]="tabIndexOverride" [selectable]="selectable">
        <mat-chip-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
          {{ food.viewValue }}
        </mat-chip-option>
      </mat-chip-listbox>
  `,
})
class FalsyBasicChipListbox {
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
  isRequired: boolean;
  tabIndexOverride: number;
  selectable: boolean = false;

  @ViewChild(MatChipListbox) chipListbox: MatChipListbox;
  @ViewChildren(MatChipOption) chips: QueryList<MatChipOption>;
}
