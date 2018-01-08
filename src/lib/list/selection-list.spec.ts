import {DOWN_ARROW, SPACE, ENTER, UP_ARROW, HOME, END} from '@angular/cdk/keycodes';
import {Platform} from '@angular/cdk/platform';
import {
  createKeyboardEvent,
  dispatchFakeEvent,
  dispatchEvent,
  dispatchKeyboardEvent,
} from '@angular/cdk/testing';
import {Component, DebugElement} from '@angular/core';
import {async, ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  MatListModule,
  MatListOption,
  MatListOptionChange,
  MatSelectionList,
  MatSelectionListChange
} from './index';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';

describe('MatSelectionList without forms', () => {
  describe('with list option', () => {
    let fixture: ComponentFixture<SelectionListWithListOptions>;
    let listOptions: DebugElement[];
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

      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption));
      listItemEl = fixture.debugElement.query(By.css('.mat-list-item'));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
    }));

    it('should add and remove focus class on focus/blur', () => {
      // Use the second list item, because the first one is always disabled.
      const listItem = listOptions[1].nativeElement;

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
        expect(listOptions[index].componentInstance.value).toBe(optionValue);
      });
    });

    it('should not emit a selectionChange event if an option changed programmatically', () => {
      spyOn(fixture.componentInstance, 'onValueChange');

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

      listOptions[2].componentInstance.toggle();
      fixture.detectChanges();

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);
    });

    it('should emit a selectionChange event if an option got clicked', () => {
      spyOn(fixture.componentInstance, 'onValueChange');

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

      dispatchFakeEvent(listOptions[2].nativeElement, 'click');
      fixture.detectChanges();

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(1);
    });

    it('should emit a deprecated selectionChange event on the list option that got clicked', () => {
      const optionInstance = listOptions[2].componentInstance as MatListOption;
      let lastChangeEvent: MatListOptionChange | null = null;

      optionInstance.selectionChange.subscribe(ev => lastChangeEvent = ev);

      expect(lastChangeEvent).toBeNull();

      dispatchFakeEvent(listOptions[2].nativeElement, 'click');
      fixture.detectChanges();

      expect(lastChangeEvent).not.toBeNull();
      expect(lastChangeEvent!.source).toBe(optionInstance);
      expect(lastChangeEvent!.selected).toBe(true);
    });

    it('should be able to dispatch one selected item', () => {
      let testListItem = listOptions[2].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('false');

      testListItem.toggle();
      fixture.detectChanges();

      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOptions[2].nativeElement.getAttribute('aria-disabled')).toBe('false');
      expect(selectList.selected.length).toBe(1);
    });

    it('should be able to dispatch multiple selected items', () => {
      let testListItem = listOptions[2].injector.get<MatListOption>(MatListOption);
      let testListItem2 = listOptions[1].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('false');
      expect(listOptions[1].nativeElement.getAttribute('aria-selected')).toBe('false');

      testListItem.toggle();
      fixture.detectChanges();

      testListItem2.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(2);
      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOptions[1].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOptions[1].nativeElement.getAttribute('aria-disabled')).toBe('false');
      expect(listOptions[2].nativeElement.getAttribute('aria-disabled')).toBe('false');
    });

    it('should be able to deselect an option', () => {
      let testListItem = listOptions[2].injector.get<MatListOption>(MatListOption);
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
      let testListItem = listOptions[0].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      testListItem._handleClick();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });

    it('should be able to un-disable disabled items', () => {
      let testListItem = listOptions[0].injector.get<MatListOption>(MatListOption);

      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      testListItem.disabled = false;
      fixture.detectChanges();

      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('false');
    });

    it('should be able to use keyboard select with SPACE', () => {
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE, testListItem);
      const selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;
      expect(selectList.selected.length).toBe(0);

      dispatchFakeEvent(testListItem, 'focus');
      selectionList.componentInstance._keydown(SPACE_EVENT);

      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);
      expect(SPACE_EVENT.defaultPrevented).toBe(true);
    });

    it('should be able to select an item using ENTER', () => {
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const ENTER_EVENT: KeyboardEvent = createKeyboardEvent('keydown', ENTER, testListItem);
      const selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;
      expect(selectList.selected.length).toBe(0);

      dispatchFakeEvent(testListItem, 'focus');
      selectionList.componentInstance._keydown(ENTER_EVENT);

      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);
      expect(ENTER_EVENT.defaultPrevented).toBe(true);
    });

    it('should restore focus if active option is destroyed', () => {
      const manager = selectionList.componentInstance._keyManager;

      listOptions[3].componentInstance._handleFocus();

      expect(manager.activeItemIndex).toBe(3);

      fixture.componentInstance.showLastOption = false;
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(2);
    });

    it('should focus previous item when press UP ARROW', () => {
      let testListItem = listOptions[2].nativeElement as HTMLElement;
      let UP_EVENT: KeyboardEvent =
        createKeyboardEvent('keydown', UP_ARROW, testListItem);
      let manager = selectionList.componentInstance._keyManager;

      dispatchFakeEvent(listOptions[2].nativeElement, 'focus');
      expect(manager.activeItemIndex).toEqual(2);

      selectionList.componentInstance._keydown(UP_EVENT);

      fixture.detectChanges();

      expect(manager.activeItemIndex).toEqual(1);
    });

    it('should focus next item when press DOWN ARROW', () => {
      let testListItem = listOptions[2].nativeElement as HTMLElement;
      let DOWN_EVENT: KeyboardEvent =
        createKeyboardEvent('keydown', DOWN_ARROW, testListItem);
      let manager = selectionList.componentInstance._keyManager;

      dispatchFakeEvent(listOptions[2].nativeElement, 'focus');
      expect(manager.activeItemIndex).toEqual(2);

      selectionList.componentInstance._keydown(DOWN_EVENT);

      fixture.detectChanges();

      expect(manager.activeItemIndex).toEqual(3);
    });

    it('should focus the first non-disabled item when pressing HOME', () => {
      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', HOME);
      fixture.detectChanges();

      // Note that the first item is disabled so we expect the second one to be focused.
      expect(manager.activeItemIndex).toBe(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should focus the last item when pressing END', () => {
      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', END);
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(3);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should be able to jump focus down to an item by typing', fakeAsync(() => {
      const listEl = selectionList.nativeElement;
      const manager = selectionList.componentInstance._keyManager;

      expect(manager.activeItemIndex).toBe(-1);

      dispatchEvent(listEl, createKeyboardEvent('keydown', 83, undefined, 's'));
      fixture.detectChanges();
      tick(200);

      expect(manager.activeItemIndex).toBe(1);

      dispatchEvent(listEl, createKeyboardEvent('keydown', 68, undefined, 'd'));
      fixture.detectChanges();
      tick(200);

      expect(manager.activeItemIndex).toBe(3);
    }));

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

    it('should update the list value when an item is selected programmatically', () => {
      const list: MatSelectionList = selectionList.componentInstance;

      expect(list.selectedOptions.isEmpty()).toBe(true);

      listOptions[0].componentInstance.selected = true;
      listOptions[2].componentInstance.selected = true;
      fixture.detectChanges();

      expect(list.selectedOptions.isEmpty()).toBe(false);
      expect(list.selectedOptions.isSelected(listOptions[0].componentInstance)).toBe(true);
      expect(list.selectedOptions.isSelected(listOptions[2].componentInstance)).toBe(true);
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

  describe('with tabindex', () => {

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithTabindexAttr,
          SelectionListWithTabindexBinding,
        ]
      });

      TestBed.compileComponents();
    }));

    it('should properly handle native tabindex attribute', () => {
      const fixture = TestBed.createComponent(SelectionListWithTabindexAttr);
      const selectionList = fixture.debugElement.query(By.directive(MatSelectionList));

      expect(selectionList.componentInstance.tabIndex)
        .toBe(5, 'Expected the selection-list tabindex to be set to the attribute value.');
    });

    it('should support changing the tabIndex through binding', () => {
      const fixture = TestBed.createComponent(SelectionListWithTabindexBinding);
      const selectionList = fixture.debugElement.query(By.directive(MatSelectionList));

      expect(selectionList.componentInstance.tabIndex)
        .toBe(0, 'Expected the tabIndex to be set to "0" by default.');

      fixture.componentInstance.tabIndex = 3;
      fixture.detectChanges();

      expect(selectionList.componentInstance.tabIndex)
        .toBe(3, 'Expected the tabIndex to updated through binding.');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(selectionList.componentInstance.tabIndex)
        .toBe(-1, 'Expected the tabIndex to be set to "-1" if selection list is disabled.');
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
      dispatchFakeEvent(listOption.nativeElement, 'focus');
      fixture.detectChanges();

      expect(listItemEl.nativeElement.className).toContain('mat-list-item-focus');

      dispatchFakeEvent(listOption.nativeElement, 'blur');
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

describe('MatSelectionList with forms', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatListModule, FormsModule, ReactiveFormsModule],
      declarations: [
        SelectionListWithModel,
        SelectionListWithFormControl,
        SelectionListWithPreselectedOption,
        SelectionListWithPreselectedOptionAndModel
      ]
    });

    TestBed.compileComponents();
  }));

  describe('and ngModel', () => {
    let fixture: ComponentFixture<SelectionListWithModel>;
    let selectionListDebug: DebugElement;
    let selectionList: MatSelectionList;
    let listOptions: MatListOption[];
    let ngModel: NgModel;

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectionListWithModel);
      fixture.detectChanges();

      selectionListDebug = fixture.debugElement.query(By.directive(MatSelectionList));
      selectionList = selectionListDebug.componentInstance;
      ngModel = selectionListDebug.injector.get<NgModel>(NgModel);
      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);
    });

    it('should update the model if an option got selected programmatically', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(0, 'Expected no options to be selected by default');

      listOptions[0].toggle();
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(1, 'Expected first list option to be selected');
    }));

    it('should update the model if an option got clicked', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(0, 'Expected no options to be selected by default');

      dispatchFakeEvent(listOptions[0]._getHostElement(), 'click');
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(1, 'Expected first list option to be selected');
    }));

    it('should update the options if a model value is set', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(0, 'Expected no options to be selected by default');

      fixture.componentInstance.selectedOptions = ['opt3'];
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(1, 'Expected first list option to be selected');
    }));

    it('should set the selection-list to touched on blur', fakeAsync(() => {
      expect(ngModel.touched)
        .toBe(false, 'Expected the selection-list to be untouched by default.');

      dispatchFakeEvent(selectionListDebug.nativeElement, 'blur');
      fixture.detectChanges();

      tick();

      expect(ngModel.touched).toBe(true, 'Expected the selection-list to be touched after blur');
    }));

    it('should be pristine by default', fakeAsync(() => {
      fixture = TestBed.createComponent(SelectionListWithModel);
      fixture.componentInstance.selectedOptions = ['opt2'];
      fixture.detectChanges();

      ngModel =
        fixture.debugElement.query(By.directive(MatSelectionList)).injector.get<NgModel>(NgModel);
      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      // Flush the initial tick to ensure that every action from the ControlValueAccessor
      // happened before the actual test starts.
      tick();

      expect(ngModel.pristine)
        .toBe(true, 'Expected the selection-list to be pristine by default.');

      listOptions[1].toggle();
      fixture.detectChanges();

      tick();

      expect(ngModel.pristine)
        .toBe(false, 'Expected the selection-list to be dirty after state change.');
    }));

    it('should remove a selected option from the value on destroy', fakeAsync(() => {
      listOptions[1].selected = true;
      listOptions[2].selected = true;

      fixture.detectChanges();

      expect(fixture.componentInstance.selectedOptions).toEqual(['opt2', 'opt3']);

      fixture.componentInstance.renderLastOption = false;
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
    }));

  });

  describe('and formControl', () => {
    let fixture: ComponentFixture<SelectionListWithFormControl>;
    let selectionListDebug: DebugElement;
    let selectionList: MatSelectionList;
    let listOptions: MatListOption[];

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectionListWithFormControl);
      fixture.detectChanges();

      selectionListDebug = fixture.debugElement.query(By.directive(MatSelectionList));
      selectionList = selectionListDebug.componentInstance;
      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);
    });

    it('should be able to disable options from the control', () => {
      expect(listOptions.every(option => !option.disabled))
        .toBe(true, 'Expected every list option to be enabled.');

      fixture.componentInstance.formControl.disable();
      fixture.detectChanges();

      expect(listOptions.every(option => option.disabled))
        .toBe(true, 'Expected every list option to be disabled.');
    });

    it('should be able to set the value through the form control', () => {
      expect(listOptions.every(option => !option.selected))
        .toBe(true, 'Expected every list option to be unselected.');

      fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
      fixture.detectChanges();

      expect(listOptions[1].selected).toBe(true, 'Expected second option to be selected.');
      expect(listOptions[2].selected).toBe(true, 'Expected third option to be selected.');

      fixture.componentInstance.formControl.setValue(null);
      fixture.detectChanges();

      expect(listOptions.every(option => !option.selected))
        .toBe(true, 'Expected every list option to be unselected.');
    });

    it('should mark options as selected when the value is set before they are initialized', () => {
      fixture.destroy();
      fixture = TestBed.createComponent(SelectionListWithFormControl);
      selectionListDebug = fixture.debugElement.query(By.directive(MatSelectionList));
      selectionList = selectionListDebug.componentInstance;

      fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
      fixture.detectChanges();

      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      expect(listOptions[1].selected).toBe(true, 'Expected second option to be selected.');
      expect(listOptions[2].selected).toBe(true, 'Expected third option to be selected.');
    });
  });

  describe('preselected values', () => {
    it('should add preselected options to the model value', fakeAsync(() => {
      const fixture = TestBed.createComponent(SelectionListWithPreselectedOption);
      const listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
          .map(optionDebugEl => optionDebugEl.componentInstance);

      fixture.detectChanges();
      tick();

      expect(listOptions[1].selected).toBe(true);
      expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
    }));

    it('should handle preselected option both through the model and the view', fakeAsync(() => {
      const fixture = TestBed.createComponent(SelectionListWithPreselectedOptionAndModel);
      const listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
          .map(optionDebugEl => optionDebugEl.componentInstance);

      fixture.detectChanges();
      tick();

      expect(listOptions[0].selected).toBe(true);
      expect(listOptions[1].selected).toBe(true);
      expect(fixture.componentInstance.selectedOptions).toEqual(['opt1', 'opt2']);
    }));

  });
});


@Component({template: `
  <mat-selection-list id="selection-list-1" (selectionChange)="onValueChange($event)">
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

  onValueChange(_change: MatSelectionListChange) {}
}

@Component({template: `
  <mat-selection-list id="selection-list-2">
    <mat-list-option checkboxPosition="after">
      Inbox (disabled selection-option)
    </mat-list-option>
    <mat-list-option id="testSelect" checkboxPosition="after">
      Starred
    </mat-list-option>
    <mat-list-option checkboxPosition="after">
      Sent Mail
    </mat-list-option>
    <mat-list-option checkboxPosition="after">
      Drafts
    </mat-list-option>
  </mat-selection-list>`})
class SelectionListWithCheckboxPositionAfter {
}

@Component({template: `
  <mat-selection-list id="selection-list-3" [disabled]=true>
    <mat-list-option checkboxPosition="after">
      Inbox (disabled selection-option)
    </mat-list-option>
    <mat-list-option id="testSelect" checkboxPosition="after">
      Starred
    </mat-list-option>
    <mat-list-option checkboxPosition="after">
      Sent Mail
    </mat-list-option>
    <mat-list-option checkboxPosition="after">
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
  <mat-selection-list id="selection-list-4">
    <mat-list-option checkboxPosition="after" class="test-focus" id="123">
      Inbox
    </mat-list-option>
  </mat-selection-list>`})
class SelectionListWithOnlyOneOption {
}

@Component({
  template: `<mat-selection-list tabindex="5"></mat-selection-list>`
})
class SelectionListWithTabindexAttr {}

@Component({
  template: `<mat-selection-list [tabIndex]="tabIndex" [disabled]="disabled"></mat-selection-list>`
})
class SelectionListWithTabindexBinding {
  tabIndex: number;
  disabled: boolean;
}

@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2">Option 2</mat-list-option>
      <mat-list-option value="opt3" *ngIf="renderLastOption">Option 3</mat-list-option>
    </mat-selection-list>`
})
class SelectionListWithModel {
  selectedOptions: string[] = [];
  renderLastOption = true;
}

@Component({
  template: `
    <mat-selection-list [formControl]="formControl">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2">Option 2</mat-list-option>
      <mat-list-option value="opt3">Option 3</mat-list-option>
    </mat-selection-list>
  `
})
class SelectionListWithFormControl {
  formControl = new FormControl();
}


@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2" selected>Option 2</mat-list-option>
    </mat-selection-list>`
})
class SelectionListWithPreselectedOption {
  selectedOptions: string[];
}


@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2" selected>Option 2</mat-list-option>
    </mat-selection-list>`
})
class SelectionListWithPreselectedOptionAndModel {
  selectedOptions = ['opt1'];
}
