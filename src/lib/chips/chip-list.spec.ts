import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {Component, DebugElement, QueryList} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MdChipList, MdChipsModule} from './index';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {createKeyboardEvent} from '@angular/cdk/testing';

import {MdInputModule} from '../input/index';
import {LEFT_ARROW, RIGHT_ARROW, BACKSPACE, DELETE, TAB} from '../core/keyboard/keycodes';
import {Directionality} from '../core';
import {MdFormFieldModule} from '../form-field/index';
import {MdChip} from './chip';

describe('MdChipList', () => {
  let fixture: ComponentFixture<any>;
  let chipListDebugElement: DebugElement;
  let chipListNativeElement: HTMLElement;
  let chipListInstance: MdChipList;
  let testComponent: StandardChipList;
  let chips: QueryList<any>;
  let manager: FocusKeyManager<MdChip>;
  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdChipsModule, MdFormFieldModule, MdInputModule, NoopAnimationsModule],
      declarations: [
        StandardChipList, FormFieldChipList
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
          let nativeChips = chipListNativeElement.querySelectorAll('md-chip');
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
          let nativeChips = chipListNativeElement.querySelectorAll('md-chip');
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
          let nativeChips = chipListNativeElement.querySelectorAll('md-chip');
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
          let nativeChips = chipListNativeElement.querySelectorAll('md-chip');
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

        it('should focus the last chip when press DELETE', () => {
          let nativeInput = fixture.nativeElement.querySelector('input');
          let DELETE_EVENT: KeyboardEvent =
              createKeyboardEvent('keydown', DELETE, nativeInput);

          // Focus the input
          nativeInput.focus();
          expect(manager.activeItemIndex).toBe(-1);

          // Press the DELETE key
          chipListInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          // It focuses the last chip
          expect(manager.activeItemIndex).toEqual(chips.length - 1);
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

  function setupStandardList() {
    fixture = TestBed.createComponent(StandardChipList);
    fixture.detectChanges();

    chipListDebugElement = fixture.debugElement.query(By.directive(MdChipList));
    chipListNativeElement = chipListDebugElement.nativeElement;
    chipListInstance = chipListDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipListInstance.chips;
  }

  function setupInputList() {
    fixture = TestBed.createComponent(FormFieldChipList);
    fixture.detectChanges();

    chipListDebugElement = fixture.debugElement.query(By.directive(MdChipList));
    chipListNativeElement = chipListDebugElement.nativeElement;
    chipListInstance = chipListDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipListInstance.chips;
  }

});

@Component({
  template: `
    <md-chip-list [tabIndex]="tabIndex">
      <div *ngFor="let i of [0,1,2,3,4]">
       <div *ngIf="remove != i">
          <md-chip (select)="chipSelect(i)" (deselect)="chipDeselect(i)">
            {{name}} {{i + 1}}
          </md-chip>
        </div>
      </div>
    </md-chip-list>`
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
    <md-form-field>
      <md-chip-list #chipList>
        <md-chip>Chip 1</md-chip>
        <md-chip>Chip 1</md-chip>
        <md-chip>Chip 1</md-chip>
      </md-chip-list>
      <input mdInput name="test" [mdChipInputFor]="chipList"/>
    </md-form-field>
  `
})
class FormFieldChipList {
}
