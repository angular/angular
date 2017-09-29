import {DOWN_ARROW, SPACE, UP_ARROW} from '@angular/cdk/keycodes';
import {Platform} from '@angular/cdk/platform';
import {createKeyboardEvent, dispatchFakeEvent} from '@angular/cdk/testing';
import {Component, DebugElement} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatListModule, MatListOption, MatSelectionList} from './index';


describe('MatSelectionList', () => {
  describe('with list option', () => {
    let fixture: ComponentFixture<SelectionListWithListOptions>;
    let listOption: DebugElement[];
    let listItemEl: DebugElement;
    let selectionList: DebugElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption
        ],
      });

      TestBed.compileComponents();
    }));


    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithListOptions);
      fixture.detectChanges();

      listOption = fixture.debugElement.queryAll(By.directive(MatListOption));
      listItemEl = fixture.debugElement.query(By.css('.mat-list-item'));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
    }));

    it('should add and remove focus class on focus/blur', () => {
      // Use the second list item, because the first one is always disabled.
      const listItem = listOption[1].nativeElement;

      expect(listItem.classList).not.toContain('mat-list-item-focus');

      dispatchFakeEvent(listItem, 'focus');
      fixture.detectChanges();
      expect(listItem.className).toContain('mat-list-item-focus');

      dispatchFakeEvent(listItem, 'blur');
      fixture.detectChanges();
      expect(listItem.className).not.toContain('mat-list-item-focus');
    });

    it('should be able to set a value on a list option', () => {
      const optionValues = ['inbox', 'starred', 'sent-mail', 'drafts'];

      optionValues.forEach((optionValue, index) => {
        expect(listOption[index].componentInstance.value).toBe(optionValue);
      });
    });

    it('should be able to dispatch one selected item', () => {
      let testListItem = listOption[2].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOption[2].nativeElement.getAttribute('aria-selected')).toBe('false');

      testListItem.toggle();
      fixture.detectChanges();

      expect(listOption[2].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOption[2].nativeElement.getAttribute('aria-disabled')).toBe('false');
      expect(selectList.selected.length).toBe(1);
    });

    it('should be able to dispatch multiple selected items', () => {
      let testListItem = listOption[2].injector.get<MatListOption>(MatListOption);
      let testListItem2 = listOption[1].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOption[2].nativeElement.getAttribute('aria-selected')).toBe('false');
      expect(listOption[1].nativeElement.getAttribute('aria-selected')).toBe('false');

      testListItem.toggle();
      fixture.detectChanges();

      testListItem2.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(2);
      expect(listOption[2].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOption[1].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOption[1].nativeElement.getAttribute('aria-disabled')).toBe('false');
      expect(listOption[2].nativeElement.getAttribute('aria-disabled')).toBe('false');
    });

    it('should be able to deselect an option', () => {
      let testListItem = listOption[2].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      testListItem.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);

      testListItem.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });

    it('should not allow selection of disabled items', () => {
      let testListItem = listOption[0].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOption[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      testListItem._handleClick();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });

    it('should be able to un-disable disabled items', () => {
      let testListItem = listOption[0].injector.get<MatListOption>(MatListOption);

      expect(listOption[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      testListItem.disabled = false;
      fixture.detectChanges();

      expect(listOption[0].nativeElement.getAttribute('aria-disabled')).toBe('false');
    });

    it('should be able to use keyboard select with SPACE', () => {
      let testListItem = listOption[1].nativeElement as HTMLElement;
      let SPACE_EVENT: KeyboardEvent =
        createKeyboardEvent('keydown', SPACE, testListItem);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;
      expect(selectList.selected.length).toBe(0);

      dispatchFakeEvent(testListItem, 'focus');
      selectionList.componentInstance._keydown(SPACE_EVENT);

      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);
    });

    it('should restore focus if active option is destroyed', () => {
      const manager = selectionList.componentInstance._keyManager;

      listOption[3].componentInstance._handleFocus();

      expect(manager.activeItemIndex).toBe(3);

      fixture.componentInstance.showLastOption = false;
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(2);
    });

    it('should focus previous item when press UP ARROW', () => {
      let testListItem = listOption[2].nativeElement as HTMLElement;
      let UP_EVENT: KeyboardEvent =
        createKeyboardEvent('keydown', UP_ARROW, testListItem);
      let manager = selectionList.componentInstance._keyManager;

      dispatchFakeEvent(listOption[2].nativeElement, 'focus');
      expect(manager.activeItemIndex).toEqual(2);

      selectionList.componentInstance._keydown(UP_EVENT);

      fixture.detectChanges();

      expect(manager.activeItemIndex).toEqual(1);
    });

    it('should focus next item when press DOWN ARROW', () => {
      let testListItem = listOption[2].nativeElement as HTMLElement;
      let DOWN_EVENT: KeyboardEvent =
        createKeyboardEvent('keydown', DOWN_ARROW, testListItem);
      let manager = selectionList.componentInstance._keyManager;

      dispatchFakeEvent(listOption[2].nativeElement, 'focus');
      expect(manager.activeItemIndex).toEqual(2);

      selectionList.componentInstance._keydown(DOWN_EVENT);

      fixture.detectChanges();

      expect(manager.activeItemIndex).toEqual(3);
    });

    it('should be able to select all options', () => {
      const list: MatSelectionList = selectionList.componentInstance;

      expect(list.options.toArray().every(option => option.selected)).toBe(false);

      list.selectAll();
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(true);
    });

    it('should be able to deselect all options', () => {
      const list: MatSelectionList = selectionList.componentInstance;

      list.options.forEach(option => option.toggle());
      expect(list.options.toArray().every(option => option.selected)).toBe(true);

      list.deselectAll();
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(false);
    });
  });

  describe('with list option selected', () => {
    let fixture: ComponentFixture<SelectionListWithSelectedOption>;
    let listItemEl: DebugElement;
    let selectionList: DebugElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [SelectionListWithSelectedOption],
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithSelectedOption);
      listItemEl = fixture.debugElement.query(By.directive(MatListOption));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
      fixture.detectChanges();
    }));

    it('should set its initial selected state in the selectedOptions', () => {
      let optionEl = listItemEl.injector.get(MatListOption);
      let selectedOptions = selectionList.componentInstance.selectedOptions;
      expect(selectedOptions.isSelected(optionEl)).toBeTruthy();
    });
  });

  describe('with single option', () => {
    let fixture: ComponentFixture<SelectionListWithOnlyOneOption>;
    let listOption: DebugElement;
    let listItemEl: DebugElement;
    let selectionList: DebugElement;
    let platform: Platform;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption
        ],
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithOnlyOneOption);
      listOption = fixture.debugElement.query(By.directive(MatListOption));
      listItemEl = fixture.debugElement.query(By.css('.mat-list-item'));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
      fixture.detectChanges();
    }));

    beforeEach(inject([Platform], (p: Platform) => {
      platform = p;
    }));

    it('should be focused when focus on nativeElements', () => {
      listOption.nativeElement.focus();
      fixture.detectChanges();

      expect(listItemEl.nativeElement).toBe(document.activeElement);
      if (platform.SAFARI || platform.FIREFOX) {
        expect(listItemEl.nativeElement.className).toContain('mat-list-item-focus');
      }

      listOption.nativeElement.blur();
      fixture.detectChanges();

      expect(listItemEl.nativeElement.className).not.toContain('mat-list-item-focus');
    });
  });

  describe('with option disabled', () => {
    let fixture: ComponentFixture<SelectionListWithDisabledOption>;
    let listOptionEl: HTMLElement;
    let listOption: MatListOption;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [SelectionListWithDisabledOption]
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithDisabledOption);

      const listOptionDebug = fixture.debugElement.query(By.directive(MatListOption));

      listOption = listOptionDebug.componentInstance;
      listOptionEl = listOptionDebug.nativeElement;

      fixture.detectChanges();
    }));

    it('should disable ripples for disabled option', () => {
      expect(listOption._isRippleDisabled())
        .toBe(false, 'Expected ripples to be enabled by default');

      fixture.componentInstance.disableItem = true;
      fixture.detectChanges();

      expect(listOption._isRippleDisabled())
        .toBe(true, 'Expected ripples to be disabled if option is disabled');
    });

    it('should apply the "mat-list-item-disabled" class properly', () => {
      expect(listOptionEl.classList).not.toContain('mat-list-item-disabled');

      fixture.componentInstance.disableItem = true;
      fixture.detectChanges();

      expect(listOptionEl.classList).toContain('mat-list-item-disabled');
    });
  });

  describe('with list disabled', () => {
    let fixture: ComponentFixture<SelectionListWithListDisabled>;
    let listOption: DebugElement[];
    let listItemEl: DebugElement;
    let selectionList: DebugElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption
        ],
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithListDisabled);
      listOption = fixture.debugElement.queryAll(By.directive(MatListOption));
      listItemEl = fixture.debugElement.query(By.css('.mat-list-item'));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
      fixture.detectChanges();
    }));

    it('should not allow selection on disabled selection-list', () => {
      let testListItem = listOption[2].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      testListItem._handleClick();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });
  });

  describe('with checkbox position after', () => {
    let fixture: ComponentFixture<SelectionListWithCheckboxPositionAfter>;
    let listOption: DebugElement[];
    let listItemEl: DebugElement;
    let selectionList: DebugElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption
        ],
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithCheckboxPositionAfter);
      listOption = fixture.debugElement.queryAll(By.directive(MatListOption));
      listItemEl = fixture.debugElement.query(By.css('.mat-list-item'));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
      fixture.detectChanges();
    }));

    it('should be able to customize checkbox position', () => {
      let listItemContent = fixture.debugElement.query(By.css('.mat-list-item-content'));
      expect(listItemContent.nativeElement.classList).toContain('mat-list-item-content-reverse');
    });
  });
});


@Component({template: `
  <mat-selection-list id="selection-list-1">
    <mat-list-option checkboxPosition="before" disabled="true" value="inbox">
      Inbox (disabled selection-option)
    </mat-list-option>
    <mat-list-option id="testSelect" checkboxPosition="before" class="test-native-focus"
                    value="starred">
      Starred
    </mat-list-option>
    <mat-list-option checkboxPosition="before" value="sent-mail">
      Sent Mail
    </mat-list-option>
    <mat-list-option checkboxPosition="before" value="drafts" *ngIf="showLastOption">
      Drafts
    </mat-list-option>
  </mat-selection-list>`})
class SelectionListWithListOptions {
  showLastOption: boolean = true;
}

@Component({template: `
  <mat-selection-list id = "selection-list-2">
    <mat-list-option checkboxPosition = "after">
      Inbox (disabled selection-option)
    </mat-list-option>
    <mat-list-option id = "testSelect" checkboxPosition = "after">
      Starred
    </mat-list-option>
    <mat-list-option checkboxPosition = "after">
      Sent Mail
    </mat-list-option>
    <mat-list-option checkboxPosition = "after">
      Drafts
    </mat-list-option>
  </mat-selection-list>`})
class SelectionListWithCheckboxPositionAfter {
}

@Component({template: `
  <mat-selection-list id = "selection-list-3" [disabled] = true>
    <mat-list-option checkboxPosition = "after">
      Inbox (disabled selection-option)
    </mat-list-option>
    <mat-list-option id = "testSelect" checkboxPosition = "after">
      Starred
    </mat-list-option>
    <mat-list-option checkboxPosition = "after">
      Sent Mail
    </mat-list-option>
    <mat-list-option checkboxPosition = "after">
      Drafts
    </mat-list-option>
  </mat-selection-list>`})
class SelectionListWithListDisabled {
}

@Component({template: `
  <mat-selection-list>
    <mat-list-option [disabled]="disableItem">Item</mat-list-option>
  </mat-selection-list>
  `})
class SelectionListWithDisabledOption {
  disableItem: boolean = false;
}

@Component({template: `
  <mat-selection-list>
    <mat-list-option [selected]="true">Item</mat-list-option>
  </mat-selection-list>`})
class SelectionListWithSelectedOption {
}

@Component({template: `
  <mat-selection-list id = "selection-list-4">
    <mat-list-option checkboxPosition = "after" class="test-focus" id="123">
      Inbox
    </mat-list-option>
  </mat-selection-list>`})
class SelectionListWithOnlyOneOption {
}
