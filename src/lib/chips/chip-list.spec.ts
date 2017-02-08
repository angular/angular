import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement, QueryList} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdChip, MdChipList, MdChipsModule} from './index';
import {FocusKeyManager} from '../core/a11y/focus-key-manager';
import {FakeEvent} from '../core/a11y/list-key-manager.spec';
import {SPACE, LEFT_ARROW, RIGHT_ARROW} from '../core/keyboard/keycodes';

class FakeKeyboardEvent extends FakeEvent {
  constructor(keyCode: number, protected target: HTMLElement) {
    super(keyCode);

    this.target = target;
  }
}

describe('MdChipList', () => {
  let fixture: ComponentFixture<any>;
  let chipListDebugElement: DebugElement;
  let chipListNativeElement: HTMLElement;
  let chipListInstance: MdChipList;
  let testComponent: StaticChipList;
  let chips: QueryList<MdChip>;
  let manager: FocusKeyManager;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdChipsModule.forRoot()],
      declarations: [
        StaticChipList
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticChipList);
    fixture.detectChanges();

    chipListDebugElement = fixture.debugElement.query(By.directive(MdChipList));
    chipListNativeElement = chipListDebugElement.nativeElement;
    chipListInstance = chipListDebugElement.componentInstance;
    testComponent = fixture.debugElement.componentInstance;
    chips = chipListInstance.chips;
  });

  describe('basic behaviors', () => {
    it('adds the `md-chip-list` class', () => {
      expect(chipListNativeElement.classList).toContain('mat-chip-list');
    });
  });

  describe('focus behaviors', () => {
    beforeEach(() => {
      manager = chipListInstance._keyManager;
    });

    it('focuses the first chip on focus', () => {
      chipListInstance.focus();
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(0);
    });

    it('watches for chip focus', () => {
      let array = chips.toArray();
      let lastIndex = array.length - 1;
      let lastItem = array[lastIndex];

      lastItem.focus();
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(lastIndex);
    });

    describe('on chip destroy', () => {
      it('focuses the next item', () => {
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

      it('focuses the previous item', () => {
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
    beforeEach(() => {
      manager = chipListInstance._keyManager;
    });

    it('left arrow focuses previous item', () => {
      let nativeChips = chipListNativeElement.querySelectorAll('md-chip');
      let lastNativeChip = nativeChips[nativeChips.length - 1] as HTMLElement;

      let LEFT_EVENT = new FakeKeyboardEvent(LEFT_ARROW, lastNativeChip) as any;
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

    it('right arrow focuses next item', () => {
      let nativeChips = chipListNativeElement.querySelectorAll('md-chip');
      let firstNativeChip = nativeChips[0] as HTMLElement;

      let RIGHT_EVENT: KeyboardEvent = new FakeKeyboardEvent(RIGHT_ARROW, firstNativeChip) as any;
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

    describe('when selectable is true', () => {
      beforeEach(() => {
        testComponent.selectable = true;
        fixture.detectChanges();
      });

      it('SPACE selects/deselects the currently focused chip', () => {
        let nativeChips = chipListNativeElement.querySelectorAll('md-chip');
        let firstNativeChip = nativeChips[0] as HTMLElement;

        let SPACE_EVENT: KeyboardEvent = new FakeKeyboardEvent(SPACE, firstNativeChip) as any;
        let firstChip: MdChip = chips.toArray()[0];

        spyOn(testComponent, 'chipSelect');
        spyOn(testComponent, 'chipDeselect');

        // Make sure we have the first chip focused
        chipListInstance.focus();

        // Use the spacebar to select the chip
        chipListInstance._keydown(SPACE_EVENT);
        fixture.detectChanges();

        expect(firstChip.selected).toBeTruthy();
        expect(testComponent.chipSelect).toHaveBeenCalledTimes(1);
        expect(testComponent.chipSelect).toHaveBeenCalledWith(0);

        // Use the spacebar to deselect the chip
        chipListInstance._keydown(SPACE_EVENT);
        fixture.detectChanges();

        expect(firstChip.selected).toBeFalsy();
        expect(testComponent.chipDeselect).toHaveBeenCalledTimes(1);
        expect(testComponent.chipDeselect).toHaveBeenCalledWith(0);
      });
    });

    describe('when selectable is false', () => {
      beforeEach(() => {
        testComponent.selectable = false;
        fixture.detectChanges();
      });

      it('SPACE ignores selection', () => {
        let SPACE_EVENT: KeyboardEvent = new FakeEvent(SPACE) as KeyboardEvent;
        let firstChip: MdChip = chips.toArray()[0];

        spyOn(testComponent, 'chipSelect');

        // Make sure we have the first chip focused
        chipListInstance.focus();

        // Use the spacebar to attempt to select the chip
        chipListInstance._keydown(SPACE_EVENT);
        fixture.detectChanges();

        expect(firstChip.selected).toBeFalsy();
        expect(testComponent.chipSelect).not.toHaveBeenCalled();
      });
    });

  });

});

@Component({
  template: `
    <md-chip-list [selectable]="selectable">
      <div *ngFor="let i of [0,1,2,3,4]">
       <div *ngIf="remove != i">
          <md-chip (select)="chipSelect(i)" (deselect)="chipDeselect(i)">
            {{name}} {{i + 1}}
          </md-chip>
        </div>
      </div>
    </md-chip-list>`
})
class StaticChipList {
  name: string = 'Test';
  selectable: boolean = true;
  remove: Number;

  chipSelect(index: Number) {
  }

  chipDeselect(index: Number) {
  }
}
