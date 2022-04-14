import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CdkListbox, CdkListboxModule, CdkOption, ListboxSelectionChangeEvent} from './index';
import {
  createKeyboardEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
} from '../../cdk/testing/private';
import {A, DOWN_ARROW, END, HOME, SPACE} from '@angular/cdk/keycodes';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CdkCombobox, CdkComboboxModule} from '@angular/cdk-experimental/combobox';

describe('CdkOption and CdkListbox', () => {
  describe('selection state change', () => {
    let fixture: ComponentFixture<ListboxWithOptions>;

    let testComponent: ListboxWithOptions;

    let listbox: DebugElement;
    let listboxInstance: CdkListbox<unknown>;
    let listboxElement: HTMLElement;

    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: HTMLElement[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [ListboxWithOptions],
      }).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ListboxWithOptions);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox<unknown>>(CdkListbox);
      listboxElement = listbox.nativeElement;

      options = fixture.debugElement.queryAll(By.directive(CdkOption));
      optionInstances = options.map(o => o.injector.get<CdkOption>(CdkOption));
      optionElements = options.map(o => o.nativeElement);
    }));

    it('should generate a unique optionId for each option', () => {
      let optionIds: string[] = [];
      for (const instance of optionInstances) {
        expect(optionIds.indexOf(instance.id)).toBe(-1);
        optionIds.push(instance.id);

        expect(instance.id).toMatch(/cdk-option-\d+/);
      }
    });

    it('should have set the selected input of the options to null by default', () => {
      for (const option of optionElements) {
        expect(option.hasAttribute('aria-selected')).toBeFalse();
      }
    });

    it('should update aria-selected when selected is changed programmatically', () => {
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      optionInstances[1].selected = true;
      fixture.detectChanges();

      expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
    });

    it('should update selected option on click event', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(fixture.componentInstance.changedOption).toBeDefined();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[0].id);
    });

    it('should update selected option on space or enter key press', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      listboxInstance.setActiveOption(optionInstances[0]);
      dispatchKeyboardEvent(listboxElement, 'keydown', SPACE);
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(fixture.componentInstance.changedOption).toBeDefined();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[0].id);
    });

    it('should update active option on home and end key press', () => {
      listboxInstance.setActiveOption(optionInstances[1]);
      fixture.detectChanges();

      expect(listboxInstance._listKeyManager.activeItem).toBe(optionInstances[1]);

      dispatchKeyboardEvent(listboxElement, 'keydown', HOME);
      fixture.detectChanges();

      expect(listboxInstance._listKeyManager.activeItem).toBe(optionInstances[0]);

      dispatchKeyboardEvent(listboxElement, 'keydown', END);
      fixture.detectChanges();

      expect(listboxInstance._listKeyManager.activeItem).toBe(optionInstances[3]);
    });

    it('should be able to toggle listbox disabled state', () => {
      expect(listboxInstance.disabled).toBeFalse();
      expect(listboxElement.getAttribute('aria-disabled')).toBe('false');

      testComponent.isListboxDisabled = true;
      fixture.detectChanges();

      expect(listboxInstance.disabled).toBeTrue();
      expect(listboxElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should toggle option disabled state', () => {
      expect(optionInstances[0].disabled).toBeFalse();
      expect(optionElements[0].getAttribute('aria-disabled')).toBe('false');

      testComponent.isPurpleDisabled = true;
      fixture.detectChanges();

      expect(optionInstances[0].disabled).toBeTrue();
      expect(optionElements[0].getAttribute('aria-disabled')).toBe('true');
    });

    it('should toggle option aria-disabled state on listbox disabled state change', () => {
      optionInstances[0].disabled = true;
      fixture.detectChanges();

      expect(listboxInstance.disabled).toBeFalse();
      expect(optionInstances[0].disabled).toBeTrue();
      expect(optionElements[0].hasAttribute('tabindex')).toBeFalse();
      expect(optionElements[1].getAttribute('aria-disabled')).toBe('false');
      expect(optionElements[1].getAttribute('tabindex')).toBe('-1');

      testComponent.isListboxDisabled = true;
      fixture.detectChanges();

      expect(listboxInstance.disabled).toBeTrue();
      expect(optionInstances[0].disabled).toBeTrue();
      expect(optionElements[0].hasAttribute('tabindex')).toBeFalse();
      expect(optionElements[1].getAttribute('aria-disabled')).toBe('true');
      expect(optionElements[1].hasAttribute('tabindex')).toBeFalse();
    });

    it('should not toggle selected on click of a disabled option', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      testComponent.isPurpleDisabled = true;
      fixture.detectChanges();
      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not toggle selected on click in a disabled listbox', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      testComponent.isListboxDisabled = true;
      fixture.detectChanges();
      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should change active item using type ahead', fakeAsync(() => {
      expect(listboxInstance._listKeyManager.activeItem).toBeNull();
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(-1);

      dispatchKeyboardEvent(listboxElement, 'keydown', A);
      fixture.detectChanges();
      tick(200);

      expect(listboxInstance._listKeyManager.activeItem).toEqual(optionInstances[2]);
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(2);
    }));

    it('should not handle space or enter on a disabled listbox', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);

      expect(selectedOptions.length).toBe(0);
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      listboxInstance.setActiveOption(optionInstances[0]);
      testComponent.isListboxDisabled = true;
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxElement, 'keydown', SPACE);
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(0);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not handle type ahead on a disabled listbox', fakeAsync(() => {
      expect(listboxInstance._listKeyManager.activeItem).toBeNull();
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(-1);

      testComponent.isListboxDisabled = true;
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxElement, 'keydown', A);
      fixture.detectChanges();
      tick(200);

      expect(listboxInstance._listKeyManager.activeItem).toBeNull();
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(-1);
    }));

    it('should not select a disabled option using space or enter', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);

      expect(selectedOptions.length).toBe(0);
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      listboxInstance.setActiveOption(optionInstances[0]);
      testComponent.isPurpleDisabled = true;
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxElement, 'keydown', SPACE);
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(0);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should update active item upon arrow key presses', () => {
      expect(listboxInstance._listKeyManager.activeItem).toBeNull();
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(-1);

      dispatchKeyboardEvent(listboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxInstance._listKeyManager.activeItem).toEqual(optionInstances[0]);
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(0);

      dispatchKeyboardEvent(listboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxInstance._listKeyManager.activeItem).toEqual(optionInstances[1]);
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(1);
    });

    it('should skip disabled options when navigating with arrow keys', () => {
      expect(listboxInstance._listKeyManager.activeItem).toBeNull();
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(-1);

      testComponent.isSolarDisabled = true;
      dispatchKeyboardEvent(listboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxInstance._listKeyManager.activeItem).toEqual(optionInstances[0]);
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(0);

      dispatchKeyboardEvent(listboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxInstance._listKeyManager.activeItem).toEqual(optionInstances[2]);
      expect(listboxInstance._listKeyManager.activeItemIndex).toBe(2);
    });

    it('should update selected option on click event', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(fixture.componentInstance.changedOption).toBeDefined();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[0].id);
    });

    it('should focus and toggle the next item when pressing SHIFT + DOWN_ARROW', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);
      const downKeyEvent = createKeyboardEvent('keydown', DOWN_ARROW, undefined, {shift: true});

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      listboxInstance.setActiveOption(optionInstances[0]);
      listboxInstance._keydown(downKeyEvent);
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[1].selected).toBeTrue();
      expect(fixture.componentInstance.changedOption).toBeDefined();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[1].id);
    });
  });

  describe('with multiple selection', () => {
    let fixture: ComponentFixture<ListboxMultiselect>;

    let testComponent: ListboxMultiselect;
    let listbox: DebugElement;
    let listboxInstance: CdkListbox<unknown>;

    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: HTMLElement[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [ListboxMultiselect],
      }).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ListboxMultiselect);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox<unknown>>(CdkListbox);

      options = fixture.debugElement.queryAll(By.directive(CdkOption));
      optionInstances = options.map(o => o.injector.get<CdkOption>(CdkOption));
      optionElements = options.map(o => o.nativeElement);
    }));

    it('should select all options using the select all method', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      listboxInstance.setAllSelected(true);
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(4);

      for (const option of optionElements) {
        expect(option.getAttribute('aria-selected')).toBe('true');
      }

      expect(fixture.componentInstance.changedOption).toBeDefined();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[3].id);
    });

    it('should deselect previously selected when multiple is false', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[0].id);

      dispatchMouseEvent(optionElements[2], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[2].selected).toBeTrue();

      /** Expect first option to be most recently changed because it was deselected. */
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[0].id);
    });

    it('should allow multiple selection when multiple is true', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);
      testComponent.isMultiselectable = true;

      expect(selectedOptions.length).toBe(0);
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[0].id);

      dispatchMouseEvent(optionElements[2], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(2);
      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[2].selected).toBeTrue();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[2].id);
    });

    it('should deselect all options when multiple switches to false', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);
      testComponent.isMultiselectable = true;

      expect(selectedOptions.length).toBe(0);
      expect(fixture.componentInstance.changedOption).toBeUndefined();

      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[0].id);

      testComponent.isMultiselectable = false;
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[0].selected).toBeFalse();
      expect(fixture.componentInstance.changedOption.id).toBe(optionInstances[0].id);
    });
  });

  describe('with aria active descendant', () => {
    let fixture: ComponentFixture<ListboxActiveDescendant>;

    let testComponent: ListboxActiveDescendant;

    let listbox: DebugElement;
    let listboxInstance: CdkListbox<unknown>;
    let listboxElement: HTMLElement;

    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: HTMLElement[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [ListboxActiveDescendant],
      }).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ListboxActiveDescendant);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox<unknown>>(CdkListbox);
      listboxElement = listbox.nativeElement;

      options = fixture.debugElement.queryAll(By.directive(CdkOption));
      optionInstances = options.map(o => o.injector.get<CdkOption>(CdkOption));
      optionElements = options.map(o => o.nativeElement);
    }));

    it('should update aria active descendant when enabled', () => {
      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeFalse();

      listboxInstance.setActiveOption(optionInstances[0]);
      fixture.detectChanges();

      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeTrue();
      expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[0].id);

      listboxInstance.setActiveOption(optionInstances[2]);
      fixture.detectChanges();

      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeTrue();
      expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[2].id);
    });

    it('should update aria active descendant via arrow keys', () => {
      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeFalse();

      dispatchKeyboardEvent(listboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeTrue();
      expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[0].id);

      dispatchKeyboardEvent(listboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeTrue();
      expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[1].id);
    });

    it('should place focus on options and not set active descendant', () => {
      testComponent.isActiveDescendant = false;
      fixture.detectChanges();

      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeFalse();

      dispatchKeyboardEvent(listboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeFalse();
      expect(document.activeElement).toEqual(optionElements[0]);
      dispatchKeyboardEvent(listboxElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxElement.hasAttribute('aria-activedescendant')).toBeFalse();
      expect(document.activeElement).toEqual(optionElements[1]);
    });
  });

  describe('with control value accessor implemented', () => {
    let fixture: ComponentFixture<ListboxControlValueAccessor>;
    let testComponent: ListboxControlValueAccessor;

    let listbox: DebugElement;
    let listboxInstance: CdkListbox<string>;

    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: HTMLElement[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule, FormsModule, ReactiveFormsModule],
        declarations: [ListboxControlValueAccessor],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ListboxControlValueAccessor);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox<string>>(CdkListbox);

      options = fixture.debugElement.queryAll(By.directive(CdkOption));
      optionInstances = options.map(o => o.injector.get<CdkOption>(CdkOption));
      optionElements = options.map(o => o.nativeElement);
    });

    it('should be able to set the disabled state via setDisabledState', () => {
      expect(listboxInstance.disabled)
        .withContext('Expected the selection list to be enabled.')
        .toBe(false);
      expect(optionInstances.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);

      listboxInstance.setDisabledState(true);
      fixture.detectChanges();

      expect(listboxInstance.disabled)
        .withContext('Expected the selection list to be disabled.')
        .toBe(true);
      for (const option of optionElements) {
        expect(option.getAttribute('aria-disabled')).toBe('true');
      }
    });

    it('should be able to select options via writeValue', () => {
      expect(optionInstances.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);

      listboxInstance.writeValue('arc');
      fixture.detectChanges();

      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionElements[1].hasAttribute('aria-selected')).toBeFalse();
      expect(optionElements[3].hasAttribute('aria-selected')).toBeFalse();

      expect(optionInstances[2].selected).toBeTrue();
      expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
    });

    it('should be select multiple options by their values', () => {
      expect(optionInstances.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);

      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      listboxInstance.writeValue(['arc', 'stasis']);
      fixture.detectChanges();

      const selectedValues = listboxInstance.getSelectedValues();
      expect(selectedValues.length).toBe(2);
      expect(selectedValues[0]).toBe('arc');
      expect(selectedValues[1]).toBe('stasis');

      expect(optionElements[0].hasAttribute('aria-selected')).toBeFalse();
      expect(optionElements[1].hasAttribute('aria-selected')).toBeFalse();

      expect(optionInstances[2].selected).toBeTrue();
      expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[3].selected).toBeTrue();
      expect(optionElements[3].getAttribute('aria-selected')).toBe('true');
    });

    it('should be able to disable options from the control', () => {
      expect(testComponent.listbox.disabled).toBeFalse();
      expect(optionInstances.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);

      testComponent.form.disable();
      fixture.detectChanges();

      expect(testComponent.listbox.disabled).toBeTrue();
      for (const option of optionElements) {
        expect(option.getAttribute('aria-disabled')).toBe('true');
      }
    });

    it('should be able to toggle disabled state after form control is disabled', () => {
      expect(testComponent.listbox.disabled).toBeFalse();
      expect(optionInstances.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);

      testComponent.form.disable();
      fixture.detectChanges();

      expect(testComponent.listbox.disabled).toBeTrue();
      for (const option of optionElements) {
        expect(option.getAttribute('aria-disabled')).toBe('true');
      }

      listboxInstance.disabled = false;
      fixture.detectChanges();

      expect(testComponent.listbox.disabled).toBeFalse();
      expect(optionInstances.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);
    });

    it('should be able to select options via setting the value in form control', () => {
      expect(optionInstances.every(option => option.selected)).toBeFalse();

      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      testComponent.form.setValue(['purple', 'arc']);
      fixture.detectChanges();

      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(optionInstances[2].selected).toBeTrue();

      testComponent.form.setValue(null);
      fixture.detectChanges();

      expect(optionInstances.every(option => option.selected)).toBeFalse();
    });

    it('should only select the first matching option if multiple is not enabled', () => {
      expect(optionInstances.every(option => option.selected)).toBeFalse();

      testComponent.form.setValue(['solar', 'arc']);
      fixture.detectChanges();

      expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
      expect(optionElements[2].hasAttribute('aria-selected')).toBeFalse();
      expect(optionInstances[1].selected).toBeTrue();
      expect(optionInstances[2].selected).toBeFalse();
    });

    it('should deselect an option selected via form control once its value changes', () => {
      const option = optionInstances[1];
      const element = optionElements[1];

      testComponent.form.setValue(['solar']);
      fixture.detectChanges();

      expect(element.getAttribute('aria-selected')).toBe('true');
      expect(option.selected).toBeTrue();

      option.value = 'new-value';
      fixture.detectChanges();

      expect(element.hasAttribute('aria-selected')).toBeFalse();
      expect(option.selected).toBeFalse();
    });

    it('should maintain the form control on listbox destruction', function () {
      testComponent.form.setValue(['solar']);
      fixture.detectChanges();

      expect(testComponent.form.value).toEqual(['solar']);

      testComponent.showListbox = false;
      fixture.detectChanges();

      expect(testComponent.form.value).toEqual(['solar']);
    });
  });

  describe('inside a combobox', () => {
    let fixture: ComponentFixture<ListboxInsideCombobox>;
    let testComponent: ListboxInsideCombobox;

    let listbox: DebugElement;
    let listboxInstance: CdkListbox<unknown>;
    let listboxElement: HTMLElement;

    let combobox: DebugElement;
    let comboboxInstance: CdkCombobox<string>;
    let comboboxElement: HTMLElement;

    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: HTMLElement[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule, CdkComboboxModule],
        declarations: [ListboxInsideCombobox],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ListboxInsideCombobox);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      combobox = fixture.debugElement.query(By.directive(CdkCombobox));
      comboboxInstance = combobox.injector.get<CdkCombobox<string>>(CdkCombobox);
      comboboxElement = combobox.nativeElement;
    });

    it('should update combobox value on selection of an option', () => {
      expect(comboboxInstance.value).toBeUndefined();
      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox<unknown>>(CdkListbox);

      options = fixture.debugElement.queryAll(By.directive(CdkOption));
      optionInstances = options.map(o => o.injector.get<CdkOption>(CdkOption));
      optionElements = options.map(o => o.nativeElement);

      expect(comboboxInstance.isOpen()).toBeTrue();

      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();
      expect(comboboxInstance.value).toBe('purple');
    });

    it('should update combobox value on selection via keyboard', () => {
      expect(comboboxInstance.value).toBeUndefined();
      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox<unknown>>(CdkListbox);
      listboxElement = listbox.nativeElement;

      options = fixture.debugElement.queryAll(By.directive(CdkOption));
      optionInstances = options.map(o => o.injector.get<CdkOption>(CdkOption));
      optionElements = options.map(o => o.nativeElement);

      expect(comboboxInstance.isOpen()).toBeTrue();

      listboxInstance.setActiveOption(optionInstances[1]);
      dispatchKeyboardEvent(listboxElement, 'keydown', SPACE);
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();
      expect(comboboxInstance.value).toBe('solar');
    });

    it('should not close panel if listbox is in multiple mode', () => {
      expect(comboboxInstance.value).toBeUndefined();
      expect(comboboxInstance.isOpen()).toBeFalse();

      dispatchMouseEvent(comboboxElement, 'click');
      fixture.detectChanges();

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox<unknown>>(CdkListbox);
      listboxElement = listbox.nativeElement;

      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      options = fixture.debugElement.queryAll(By.directive(CdkOption));
      optionInstances = options.map(o => o.injector.get<CdkOption>(CdkOption));
      optionElements = options.map(o => o.nativeElement);

      expect(comboboxInstance.isOpen()).toBeTrue();

      listboxInstance.setActiveOption(optionInstances[1]);
      dispatchKeyboardEvent(listboxElement, 'keydown', SPACE);
      testComponent.combobox.updateAndClose(testComponent.listbox.getSelectedValues());
      fixture.detectChanges();

      expect(comboboxInstance.isOpen()).toBeFalse();
      expect(comboboxInstance.value).toEqual(['solar']);
    });
  });
});

@Component({
  template: `
    <div cdkListbox
         [disabled]="isListboxDisabled"
         (selectionChange)="onSelectionChange($event)">
      <div cdkOption
          [disabled]="isPurpleDisabled">
        Purple
      </div>
      <div cdkOption
           [disabled]="isSolarDisabled">
        Solar
      </div>
      <div cdkOption>Arc</div>
      <div cdkOption>Stasis</div>
    </div>`,
})
class ListboxWithOptions {
  changedOption: CdkOption;
  isListboxDisabled: boolean = false;
  isPurpleDisabled: boolean = false;
  isSolarDisabled: boolean = false;

  onSelectionChange(event: ListboxSelectionChangeEvent<unknown>) {
    this.changedOption = event.option;
  }
}

@Component({
  template: `
    <div cdkListbox
         [multiple]="isMultiselectable"
         (selectionChange)="onSelectionChange($event)">
      <div cdkOption>Purple</div>
      <div cdkOption>Solar</div>
      <div cdkOption>Arc</div>
      <div cdkOption>Stasis</div>
    </div>`,
})
class ListboxMultiselect {
  changedOption: CdkOption;
  isMultiselectable: boolean = false;

  onSelectionChange(event: ListboxSelectionChangeEvent<unknown>) {
    this.changedOption = event.option;
  }
}

@Component({
  template: `
    <div cdkListbox
         [useActiveDescendant]="isActiveDescendant">
      <div cdkOption>Purple</div>
      <div cdkOption>Solar</div>
      <div cdkOption>Arc</div>
      <div cdkOption>Stasis</div>
    </div>`,
})
class ListboxActiveDescendant {
  changedOption: CdkOption;
  isActiveDescendant: boolean = true;
  focusedOption: string;

  onSelectionChange(event: ListboxSelectionChangeEvent<unknown>) {
    this.changedOption = event.option;
  }

  onFocus(option: string) {
    this.focusedOption = option;
  }
}

@Component({
  template: `
    <select cdkListbox
         [disabled]="isDisabled"
         [multiple]="isMultiselectable"
         (selectionChange)="onSelectionChange($event)"
         [formControl]="form"
         *ngIf="showListbox"   ngDefaultControl>
      <option cdkOption [value]="'purple'">Purple</option>
      <option cdkOption [value]="'solar'">Solar</option>
      <option cdkOption [value]="'arc'">Arc</option>
      <option cdkOption [value]="'stasis'">Stasis</option>
    </select>`,
})
class ListboxControlValueAccessor {
  form = new FormControl<string[]>([]);
  changedOption: CdkOption<string>;
  isDisabled: boolean = false;
  isMultiselectable: boolean = false;
  showListbox: boolean = true;
  @ViewChild(CdkListbox) listbox: CdkListbox<string>;

  onSelectionChange(event: ListboxSelectionChangeEvent<string>) {
    this.changedOption = event.option;
  }
}

@Component({
  template: `
    <button cdkCombobox #toggleCombobox class="example-combobox"
            [cdkComboboxTriggerFor]="panel"
            [openActions]="'click'">
      No Value
    </button>

    <ng-template #panel>
      <select cdkListbox
              [disabled]="isDisabled"
              [multiple]="isMultiselectable"
              (selectionChange)="onSelectionChange($event)">
        <option cdkOption [value]="'purple'">Purple</option>
        <option cdkOption [value]="'solar'">Solar</option>
        <option cdkOption [value]="'arc'">Arc</option>
        <option cdkOption [value]="'stasis'">Stasis</option>
      </select>
    </ng-template>
  `,
})
class ListboxInsideCombobox {
  changedOption: CdkOption<string>;
  isDisabled: boolean = false;
  isMultiselectable: boolean = false;
  @ViewChild(CdkListbox) listbox: CdkListbox<string>;
  @ViewChild(CdkCombobox) combobox: CdkCombobox;

  onSelectionChange(event: ListboxSelectionChangeEvent<string>) {
    this.changedOption = event.option;
  }
}
