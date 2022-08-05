import {animate, style, transition, trigger} from '@angular/animations';
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
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  MockNgZone,
  patchElementFocus,
  typeInElement,
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
import {FormControl, FormsModule, NgForm, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatChipEvent, MatChipGrid, MatChipInputEvent, MatChipRow, MatChipsModule} from './index';

describe('MDC-based MatChipGrid', () => {
  let chipGridDebugElement: DebugElement;
  let chipGridNativeElement: HTMLElement;
  let chipGridInstance: MatChipGrid;
  let chips: QueryList<MatChipRow>;
  let zone: MockNgZone;
  let testComponent: StandardChipGrid;
  let directionality: {value: Direction; change: EventEmitter<Direction>};
  let primaryActions: NodeListOf<HTMLElement>;

  const expectNoCellFocused = () => {
    expect(Array.from(primaryActions)).not.toContain(document.activeElement as HTMLElement);
  };

  const expectLastCellFocused = () => {
    expect(document.activeElement).toBe(primaryActions[primaryActions.length - 1]);
  };

  describe('StandardChipGrid', () => {
    describe('basic behaviors', () => {
      let fixture: ComponentFixture<StandardChipGrid>;

      beforeEach(() => {
        fixture = createComponent(StandardChipGrid);
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

      it('should not set a role on the grid when the list is empty', () => {
        testComponent.chips = [];
        fixture.detectChanges();

        expect(chipGridNativeElement.hasAttribute('role')).toBe(false);
      });

      it('should be able to set a custom role', () => {
        testComponent.role = 'listbox';
        fixture.detectChanges();

        expect(chipGridNativeElement.getAttribute('role')).toBe('listbox');
      });
    });

    describe('focus behaviors', () => {
      let fixture:
        | ComponentFixture<StandardChipGrid>
        | ComponentFixture<StandardChipGridWithAnimations>;

      beforeEach(() => {
        fixture = createComponent(StandardChipGrid);
      });

      it('should focus the first chip on focus', () => {
        chipGridInstance.focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(primaryActions[0]);
      });

      it('should focus the primary action when calling the `focus` method', () => {
        chips.last.focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(primaryActions[primaryActions.length - 1]);
      });

      it('should not be able to become focused when disabled', () => {
        expect(chipGridInstance.focused)
          .withContext('Expected grid to not be focused.')
          .toBe(false);

        chipGridInstance.disabled = true;
        fixture.detectChanges();

        chipGridInstance.focus();
        fixture.detectChanges();

        expect(chipGridInstance.focused)
          .withContext('Expected grid to continue not to be focused')
          .toBe(false);
      });

      it('should remove the tabindex from the grid if it is disabled', () => {
        expect(chipGridNativeElement.getAttribute('tabindex')).toBe('0');

        chipGridInstance.disabled = true;
        fixture.detectChanges();

        expect(chipGridNativeElement.getAttribute('tabindex')).toBe('-1');
      });

      describe('on chip destroy', () => {
        it('should focus the next item', () => {
          const midItem = chips.get(2)!;

          // Focus the middle item
          midItem.focus();

          // Destroy the middle item
          testComponent.chips.splice(2, 1);
          fixture.detectChanges();

          // It focuses the 4th item
          expect(document.activeElement).toBe(primaryActions[3]);
        });

        it('should focus the previous item', () => {
          // Focus the last item
          chips.last.focus();

          // Destroy the last item
          testComponent.chips.pop();
          fixture.detectChanges();

          // It focuses the next-to-last item
          expect(document.activeElement).toBe(primaryActions[primaryActions.length - 2]);
        });

        it('should not focus if chip grid is not focused', fakeAsync(() => {
          const midItem = chips.get(2)!;

          // Focus and blur the middle item
          midItem.focus();
          (document.activeElement as HTMLElement).blur();
          tick();
          zone.simulateZoneExit();

          // Destroy the middle item
          testComponent.chips.splice(2, 1);
          fixture.detectChanges();
          flush();

          // Should not have focus
          expect(chipGridNativeElement.contains(document.activeElement)).toBe(false);
        }));

        it('should focus the grid if the last focused item is removed', () => {
          testComponent.chips = [0];

          spyOn(chipGridInstance, 'focus');
          patchElementFocus(chips.last.primaryAction!._elementRef.nativeElement);
          chips.last.focus();

          testComponent.chips.pop();
          fixture.detectChanges();

          expect(chipGridInstance.focus).toHaveBeenCalled();
        });

        it('should move focus to the last chip when the focused chip was deleted inside a component with animations', fakeAsync(() => {
          fixture.destroy();
          TestBed.resetTestingModule();

          fixture = createComponent(StandardChipGridWithAnimations, BrowserAnimationsModule);

          patchElementFocus(chips.last.primaryAction!._elementRef.nativeElement);
          chips.last.focus();
          fixture.detectChanges();

          dispatchKeyboardEvent(chips.last._elementRef.nativeElement, 'keydown', BACKSPACE);
          fixture.detectChanges();
          tick(500);

          expect(document.activeElement).toBe(primaryActions[primaryActions.length - 2]);
        }));
      });

      it('should have a focus indicator', () => {
        const focusIndicators = chipGridNativeElement.querySelectorAll(
          '.mat-mdc-chip-primary-focus-indicator',
        );
        expect(focusIndicators.length).toBeGreaterThan(0);
        expect(focusIndicators.length).toBe(chips.length);
      });
    });

    describe('keyboard behavior', () => {
      describe('LTR (default)', () => {
        let fixture: ComponentFixture<ChipGridWithRemove>;
        let trailingActions: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
          fixture = createComponent(ChipGridWithRemove);
          flush();
          trailingActions = chipGridNativeElement.querySelectorAll(
            '.mdc-evolution-chip__action--trailing',
          );
        }));

        it('should focus previous column when press LEFT ARROW', () => {
          const lastIndex = primaryActions.length - 1;

          // Focus the first column of the last chip in the array
          chips.last.focus();
          expect(document.activeElement).toBe(primaryActions[lastIndex]);

          // Press the LEFT arrow
          dispatchKeyboardEvent(primaryActions[lastIndex], 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          // It focuses the last column of the previous chip
          expect(document.activeElement).toBe(trailingActions[lastIndex - 1]);
        });

        it('should focus next column when press RIGHT ARROW', () => {
          // Focus the first column of the first chip in the array
          chips.first.focus();
          expect(document.activeElement).toBe(primaryActions[0]);

          // Press the RIGHT arrow
          dispatchKeyboardEvent(primaryActions[0], 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          // It focuses the next column of the chip
          expect(document.activeElement).toBe(trailingActions[0]);
        });

        it('should not handle arrow key events from non-chip elements', () => {
          const previousActiveElement = document.activeElement;

          dispatchKeyboardEvent(chipGridNativeElement, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          expect(document.activeElement)
            .withContext('Expected focused item not to have changed.')
            .toBe(previousActiveElement);
        });
      });

      describe('RTL', () => {
        let fixture: ComponentFixture<StandardChipGrid>;

        beforeEach(() => {
          fixture = createComponent(StandardChipGrid, undefined, 'rtl');
        });

        it('should focus previous column when press RIGHT ARROW', () => {
          const lastIndex = primaryActions.length - 1;

          // Focus the first column of the last chip in the array
          chips.last.focus();
          expect(document.activeElement).toBe(primaryActions[lastIndex]);

          // Press the RIGHT arrow
          dispatchKeyboardEvent(primaryActions[lastIndex], 'keydown', RIGHT_ARROW);
          fixture.detectChanges();

          // It focuses the last column of the previous chip
          expect(document.activeElement).toBe(primaryActions[lastIndex - 1]);
        });

        it('should focus next column when press LEFT ARROW', () => {
          // Focus the first column of the first chip in the array
          chips.first.focus();
          expect(document.activeElement).toBe(primaryActions[0]);

          // Press the LEFT arrow
          dispatchKeyboardEvent(primaryActions[0], 'keydown', LEFT_ARROW);
          fixture.detectChanges();

          // It focuses the next column of the chip
          expect(document.activeElement).toBe(primaryActions[1]);
        });

        it('should allow focus to escape when tabbing away', fakeAsync(() => {
          let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
          let firstNativeChip = nativeChips[0] as HTMLElement;

          dispatchKeyboardEvent(firstNativeChip, 'keydown', TAB);

          expect(chipGridInstance.tabIndex)
            .withContext('Expected tabIndex to be set to -1 temporarily.')
            .toBe(-1);

          flush();

          expect(chipGridInstance.tabIndex)
            .withContext('Expected tabIndex to be reset back to 0')
            .toBe(0);
        }));

        it(`should use user defined tabIndex`, fakeAsync(() => {
          chipGridInstance.tabIndex = 4;
          fixture.detectChanges();

          expect(chipGridInstance.tabIndex)
            .withContext('Expected tabIndex to be set to user defined value 4.')
            .toBe(4);

          let nativeChips = chipGridNativeElement.querySelectorAll('mat-chip-row');
          let firstNativeChip = nativeChips[0] as HTMLElement;

          dispatchKeyboardEvent(firstNativeChip, 'keydown', TAB);
          expect(chipGridInstance.tabIndex)
            .withContext('Expected tabIndex to be set to -1 temporarily.')
            .toBe(-1);

          flush();

          expect(chipGridInstance.tabIndex)
            .withContext('Expected tabIndex to be reset back to 4')
            .toBe(4);
        }));
      });

      describe('keydown behavior', () => {
        let fixture: ComponentFixture<StandardChipGrid>;

        beforeEach(() => {
          fixture = createComponent(StandardChipGrid);
        });

        it('should account for the direction changing', () => {
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

        it('should move focus to the first chip when pressing HOME', () => {
          chips.last.focus();
          expect(document.activeElement).toBe(primaryActions[4]);

          const event = dispatchKeyboardEvent(primaryActions[4], 'keydown', HOME);
          fixture.detectChanges();

          expect(event.defaultPrevented).toBe(true);
          expect(document.activeElement).toBe(primaryActions[0]);
        });

        it('should move focus to the last chip when pressing END', () => {
          chips.first.focus();
          expect(document.activeElement).toBe(primaryActions[0]);

          const event = dispatchKeyboardEvent(primaryActions[0], 'keydown', END);
          fixture.detectChanges();

          expect(event.defaultPrevented).toBe(true);
          expect(document.activeElement).toBe(primaryActions[4]);
        });

        it('should ignore all non-tab navigation keyboard events from an editing chip', fakeAsync(() => {
          testComponent.editable = true;
          fixture.detectChanges();

          chips.first.focus();
          expect(document.activeElement).toBe(primaryActions[0]);

          dispatchKeyboardEvent(document.activeElement!, 'keydown', ENTER);
          fixture.detectChanges();
          flush();

          const previousActiveElement = document.activeElement;
          const keysToIgnore = [HOME, END, LEFT_ARROW, RIGHT_ARROW];

          for (const key of keysToIgnore) {
            dispatchKeyboardEvent(document.activeElement!, 'keydown', key);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(previousActiveElement);
          }
        }));
      });
    });
  });

  describe('FormFieldChipGrid', () => {
    let fixture: ComponentFixture<FormFieldChipGrid>;

    beforeEach(() => {
      fixture = createComponent(FormFieldChipGrid);
    });

    describe('keyboard behavior', () => {
      it('should maintain focus if the active chip is deleted', () => {
        const secondChip = fixture.nativeElement.querySelectorAll('.mat-mdc-chip')[1];
        const secondChipAction = secondChip.querySelector('.mdc-evolution-chip__action--primary');

        secondChipAction.focus();
        fixture.detectChanges();

        expect(chipGridInstance._chips.toArray().findIndex(chip => chip._hasFocus())).toBe(1);

        dispatchKeyboardEvent(secondChip, 'keydown', DELETE);
        fixture.detectChanges();

        expect(chipGridInstance._chips.toArray().findIndex(chip => chip._hasFocus())).toBe(1);
      });

      describe('when the input has focus', () => {
        it('should not focus the last chip when press DELETE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');

          // Focus the input
          nativeInput.focus();
          expectNoCellFocused();

          // Press the DELETE key
          dispatchKeyboardEvent(nativeInput, 'keydown', DELETE);
          fixture.detectChanges();

          // It doesn't focus the last chip
          expectNoCellFocused();
        });

        it('should focus the last chip when press BACKSPACE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');

          // Focus the input
          nativeInput.focus();
          expectNoCellFocused();

          // Press the BACKSPACE key
          dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
          fixture.detectChanges();

          // It focuses the last chip
          expectLastCellFocused();
        });

        it('should not focus the last chip when pressing BACKSPACE on a non-empty input', () => {
          const nativeInput = fixture.nativeElement.querySelector('input');
          nativeInput.value = 'hello';
          nativeInput.focus();
          fixture.detectChanges();

          expectNoCellFocused();

          dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
          fixture.detectChanges();

          expectNoCellFocused();
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
    let fixture: ComponentFixture<ChipGridWithRemove>;
    let trailingActions: NodeListOf<HTMLElement>;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(ChipGridWithRemove);
      flush();
      trailingActions = chipGridNativeElement.querySelectorAll(
        '.mdc-evolution-chip__action--trailing',
      );
    }));

    it('should properly focus next item if chip is removed through click', fakeAsync(() => {
      const chip = chips.get(2)!;
      chip.focus();
      fixture.detectChanges();

      // Destroy the third focused chip by dispatching a bubbling click event on the
      // associated chip remove element.
      trailingActions[2].click();
      fixture.detectChanges();
      flush();

      expect(document.activeElement).toBe(primaryActions[3]);
    }));
  });

  describe('chip grid with chip input', () => {
    let fixture: ComponentFixture<InputChipGrid>;
    let nativeChips: HTMLElement[];
    let nativeInput: HTMLInputElement;
    let nativeChipGrid: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(InputChipGrid);

      nativeChips = fixture.debugElement
        .queryAll(By.css('mat-chip-row'))
        .map(chip => chip.nativeElement);

      nativeChipGrid = fixture.debugElement.query(By.css('mat-chip-grid'))!.nativeElement;
      nativeInput = fixture.nativeElement.querySelector('input');
    });

    it('should take an initial view value with reactive forms', () => {
      fixture.componentInstance.control = new FormControl('[pizza-1]');
      fixture.detectChanges();

      expect(fixture.componentInstance.chipGrid.value).toEqual('[pizza-1]');
    });

    it('should set the view value from the form', () => {
      const chipGrid = fixture.componentInstance.chipGrid;

      expect(chipGrid.value).withContext('Expect chip grid to have no initial value').toBeFalsy();

      fixture.componentInstance.control.setValue('[pizza-1]');
      fixture.detectChanges();

      expect(chipGrid.value).toEqual('[pizza-1]');
    });

    it('should update the form value when the view changes', fakeAsync(() => {
      expect(fixture.componentInstance.control.value)
        .withContext(`Expected the control's value to be empty initially.`)
        .toEqual(null);

      nativeInput.focus();

      typeInElement(nativeInput, '123');
      fixture.detectChanges();
      dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
      fixture.detectChanges();
      flush();

      dispatchFakeEvent(nativeInput, 'blur');
      flush();

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
        .withContext('Expected the control to start off as untouched.')
        .toBe(false);

      dispatchFakeEvent(nativeChipGrid, 'blur');
      tick();

      expect(fixture.componentInstance.control.touched)
        .withContext('Expected the control to be touched.')
        .toBe(true);
    }));

    it('should not set touched when a disabled chip grid is touched', fakeAsync(() => {
      expect(fixture.componentInstance.control.touched)
        .withContext('Expected the control to start off as untouched.')
        .toBe(false);

      fixture.componentInstance.control.disable();
      dispatchFakeEvent(nativeChipGrid, 'blur');
      tick();

      expect(fixture.componentInstance.control.touched)
        .withContext('Expected the control to stay untouched.')
        .toBe(false);
    }));

    it("should set the control to dirty when the chip grid's value changes in the DOM", fakeAsync(() => {
      expect(fixture.componentInstance.control.dirty)
        .withContext(`Expected control to start out pristine.`)
        .toEqual(false);

      nativeInput.focus();

      typeInElement(nativeInput, '123');
      fixture.detectChanges();
      dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
      fixture.detectChanges();
      flush();

      dispatchFakeEvent(nativeInput, 'blur');
      flush();

      expect(fixture.componentInstance.control.dirty)
        .withContext(`Expected control to be dirty after value was changed by user.`)
        .toEqual(true);
    }));

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
      let requiredMarker = fixture.debugElement.query(
        By.css('.mat-mdc-form-field-required-marker'),
      )!;
      expect(requiredMarker)
        .withContext(`Expected placeholder not to have an asterisk, as control was not required.`)
        .toBeNull();

      fixture.componentInstance.chipGrid.required = true;
      fixture.detectChanges();

      requiredMarker = fixture.debugElement.query(By.css('.mat-mdc-form-field-required-marker'))!;
      expect(requiredMarker)
        .not.withContext(`Expected placeholder to have an asterisk, as control was required.`)
        .toBeNull();
    });

    it('should mark the component as required if the control has a required validator', () => {
      fixture.destroy();
      fixture = TestBed.createComponent(InputChipGrid);
      fixture.componentInstance.control = new FormControl('', [Validators.required]);
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('.mat-mdc-form-field-required-marker'),
      ).toBeTruthy();
    });

    it('should blur the form field when the active chip is blurred', fakeAsync(() => {
      const formField: HTMLElement = fixture.nativeElement.querySelector('.mat-mdc-form-field');
      const firstAction = nativeChips[0].querySelector('.mat-mdc-chip-action') as HTMLElement;

      patchElementFocus(firstAction);
      firstAction.focus();
      fixture.detectChanges();

      expect(formField.classList).toContain('mat-focused');

      firstAction.blur();
      fixture.detectChanges();
      fixture.detectChanges();
      zone.simulateZoneExit();
      fixture.detectChanges();
      flush();

      expect(formField.classList).not.toContain('mat-focused');
    }));

    it('should keep focus on the input after adding the first chip', fakeAsync(() => {
      const chipEls = Array.from<HTMLElement>(
        fixture.nativeElement.querySelectorAll('mat-chip-row'),
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

    it('should set aria-invalid if the form field is invalid', fakeAsync(() => {
      fixture.componentInstance.control = new FormControl('', [Validators.required]);
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      expect(input.getAttribute('aria-invalid')).toBe('true');

      typeInElement(input, '123');
      fixture.detectChanges();
      dispatchKeyboardEvent(input, 'keydown', ENTER);
      fixture.detectChanges();
      flush();

      dispatchFakeEvent(input, 'blur');
      flush();

      fixture.detectChanges();
      expect(input.getAttribute('aria-invalid')).toBe('false');
    }));

    describe('when the input has focus', () => {
      beforeEach(() => {
        nativeInput.focus();
        expectNoCellFocused();
      });

      it('should not focus the last chip when pressing DELETE', () => {
        dispatchKeyboardEvent(nativeInput, 'keydown', DELETE);
        expectNoCellFocused();
      });

      it('should focus the last chip when pressing BACKSPACE when input is empty', () => {
        dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
        expectLastCellFocused();
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
          expectNoCellFocused();

          // Still not focused
          dispatchKeyboardEvent(nativeInput, 'keyup', BACKSPACE);
          expectNoCellFocused();

          // Only now should it focus the last element
          dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
          expectLastCellFocused();
        },
      );

      it('should focus last chip after pressing BACKSPACE after creating a chip', () => {
        // Create a chip
        typeInElement(nativeInput, '123');
        dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);

        expectNoCellFocused();

        dispatchKeyboardEvent(nativeInput, 'keydown', BACKSPACE);
        expectLastCellFocused();
      });
    });
  });

  describe('error messages', () => {
    let fixture: ComponentFixture<ChipGridWithFormErrorMessages>;
    let errorTestComponent: ChipGridWithFormErrorMessages;
    let containerEl: HTMLElement;
    let chipGridEl: HTMLElement;
    let inputEl: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(ChipGridWithFormErrorMessages);
      flush();
      fixture.detectChanges();

      errorTestComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('mat-form-field'))!.nativeElement;
      chipGridEl = fixture.debugElement.query(By.css('mat-chip-grid'))!.nativeElement;
      inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
    }));

    it('should not show any errors if the user has not interacted', () => {
      expect(errorTestComponent.formControl.untouched)
        .withContext('Expected untouched form control')
        .toBe(true);
      expect(containerEl.querySelectorAll('mat-error').length)
        .withContext('Expected no error message')
        .toBe(0);
      expect(chipGridEl.getAttribute('aria-invalid'))
        .withContext('Expected aria-invalid to be set to "false".')
        .toBe('false');
    });

    it('should display an error message when the grid is touched and invalid', fakeAsync(() => {
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
      expect(chipGridEl.getAttribute('aria-invalid'))
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
      flush();
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
        expect(chipGridEl.getAttribute('aria-invalid'))
          .withContext('Expected aria-invalid to be set to "true".')
          .toBe('true');
      });
      flush();
    }));

    it('should hide the errors and show the hints once the chip grid becomes valid', fakeAsync(() => {
      errorTestComponent.formControl.markAsTouched();
      flush();
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
        flush();
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

        flush();
      });
    }));

    it('should set the proper aria-live attribute on the error messages', () => {
      errorTestComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelector('mat-error')!.getAttribute('aria-live')).toBe('polite');
    });

    it('sets the aria-describedby on the input to reference errors when in error state', fakeAsync(() => {
      let hintId = fixture.debugElement
        .query(By.css('.mat-mdc-form-field-hint'))!
        .nativeElement.getAttribute('id');
      let describedBy = inputEl.getAttribute('aria-describedby');

      expect(hintId).withContext('hint should be shown').toBeTruthy();
      expect(describedBy).toBe(hintId);

      fixture.componentInstance.formControl.markAsTouched();
      fixture.detectChanges();

      // Flush the describedby timer and detect changes caused by it.
      flush();
      fixture.detectChanges();

      let errorIds = fixture.debugElement
        .queryAll(By.css('.mat-mdc-form-field-error'))
        .map(el => el.nativeElement.getAttribute('id'))
        .join(' ');
      let errorDescribedBy = inputEl.getAttribute('aria-describedby');

      expect(errorIds).withContext('errors should be shown').toBeTruthy();
      expect(errorDescribedBy).toBe(errorIds);
    }));
  });

  function createComponent<T>(
    component: Type<T>,
    animationsModule:
      | Type<NoopAnimationsModule>
      | Type<BrowserAnimationsModule> = NoopAnimationsModule,
    direction: Direction = 'ltr',
  ): ComponentFixture<T> {
    directionality = {
      value: direction,
      change: new EventEmitter<Direction>(),
    } as Directionality;

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
        {provide: NgZone, useFactory: () => (zone = new MockNgZone())},
        {provide: Directionality, useValue: directionality},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent<T>(component);
    fixture.detectChanges();

    chipGridDebugElement = fixture.debugElement.query(By.directive(MatChipGrid))!;
    chipGridNativeElement = chipGridDebugElement.nativeElement;
    chipGridInstance = chipGridDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipGridInstance._chips;
    primaryActions = chipGridNativeElement.querySelectorAll<HTMLElement>(
      '.mdc-evolution-chip__action--primary',
    );

    return fixture;
  }
});

@Component({
  template: `
    <mat-chip-grid [tabIndex]="tabIndex" [role]="role" #chipGrid>
      <mat-chip-row *ngFor="let i of chips"
                    [editable]="editable">
        {{name}} {{i + 1}}
      </mat-chip-row>
    </mat-chip-grid>
    <input name="test" [matChipInputFor]="chipGrid"/>`,
})
class StandardChipGrid {
  name: string = 'Test';
  tabIndex: number = 0;
  chips = [0, 1, 2, 3, 4];
  editable = false;
  role: string | null = null;
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
  `,
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
      <mat-label>New food...</mat-label>
      <mat-chip-grid #chipGrid placeholder="Food" [formControl]="control">
        <mat-chip-row *ngFor="let food of foods" [value]="food.value" (removed)="remove(food)">
          {{ food.viewValue }}
        </mat-chip-row>
      </mat-chip-grid>
      <input
          [matChipInputFor]="chipGrid"
          [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
          [matChipInputAddOnBlur]="addOnBlur"
          (matChipInputTokenEnd)="add($event)"/>
    </mat-form-field>
  `,
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
  control = new FormControl<string | null>(null);

  separatorKeyCodes = [ENTER, SPACE];
  addOnBlur: boolean = true;

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our foods
    if (value) {
      this.foods.push({
        value: `${value.toLowerCase()}-${this.foods.length}`,
        viewValue: value,
      });
    }

    // Reset the input value
    event.chipInput!.clear();
  }

  remove(food: any): void {
    const index = this.foods.indexOf(food);

    if (index > -1) {
      this.foods.splice(index, 1);
    }
  }

  @ViewChild(MatChipGrid) chipGrid: MatChipGrid;
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
  `,
})
class ChipGridWithFormErrorMessages {
  foods: any[] = [
    {value: 0, viewValue: 'Steak'},
    {value: 1, viewValue: 'Pizza'},
    {value: 2, viewValue: 'Pasta'},
  ];
  @ViewChildren(MatChipRow) chips: QueryList<MatChipRow>;

  @ViewChild('form') form: NgForm;
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
      transition(':leave', [style({opacity: 0}), animate('500ms', style({opacity: 1}))]),
    ]),
  ],
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
  `,
})
class ChipGridWithRemove {
  chips = [0, 1, 2, 3, 4];

  removeChip(event: MatChipEvent) {
    this.chips.splice(event.chip.value, 1);
  }
}
