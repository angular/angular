import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement, QueryList} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdChip, MdChipList, MdChipsModule} from './index';
import {ListKeyManager} from '../core/a11y/list-key-manager';

describe('MdChipList', () => {
  let fixture: ComponentFixture<any>;
  let chipListDebugElement: DebugElement;
  let chipListNativeElement: HTMLElement;
  let chipListInstance: MdChipList;
  let testComponent: StaticChipList;
  let items: QueryList<MdChip>;
  let manager: ListKeyManager;

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
  });

  describe('basic behaviors', () => {
    it('adds the `md-chip-list` class', () => {
      expect(chipListNativeElement.classList).toContain('md-chip-list');
    });
  });

  describe('focus behaviors', () => {
    beforeEach(() => {
      items = chipListInstance.chips;
      manager = chipListInstance._keyManager;
    });

    it('watches for chip focus', () => {
      let array = items.toArray();
      let lastIndex = array.length - 1;
      let lastItem = array[lastIndex];

      lastItem.focus();
      fixture.detectChanges();

      expect(manager.focusedItemIndex).toBe(lastIndex);
    });

    describe('on chip destroy', () => {
      it('focuses the next item', () => {
        let array = items.toArray();
        let midItem = array[2];

        // Focus the middle item
        midItem.focus();

        // Destroy the middle item
        testComponent.remove = 2;
        fixture.detectChanges();

        // It focuses the 4th item (now at index 2)
        expect(manager.focusedItemIndex).toEqual(2);
      });

      it('focuses the previous item', () => {
        let array = items.toArray();
        let lastIndex = array.length - 1;
        let lastItem = array[lastIndex];

        // Focus the last item
        lastItem.focus();

        // Destroy the last item
        testComponent.remove = lastIndex;
        fixture.detectChanges();

        // It focuses the next-to-last item
        expect(manager.focusedItemIndex).toEqual(lastIndex - 1);
      });
    });
  });

});

@Component({
  template: `
    <md-chip-list>
      <div *ngIf="remove != 0"><md-chip>{{name}} 1</md-chip></div>
      <div *ngIf="remove != 1"><md-chip>{{name}} 2</md-chip></div>
      <div *ngIf="remove != 2"><md-chip>{{name}} 3</md-chip></div>
      <div *ngIf="remove != 3"><md-chip>{{name}} 4</md-chip></div>
      <div *ngIf="remove != 4"><md-chip>{{name}} 5</md-chip></div>
    </md-chip-list>
  `
})
class StaticChipList {
  name: 'Test';
  remove: Number;
}
