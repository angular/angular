import {
  ComponentFixture,
  async,
  TestBed, tick, fakeAsync,
} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  CdkOption,
  CdkListboxModule, ListboxSelectionChangeEvent, CdkListbox
} from './index';
import {
  createKeyboardEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent
} from '@angular/cdk/testing/private';
import {A, DOWN_ARROW, END, HOME, SPACE} from '@angular/cdk/keycodes';

describe('CdkOption', () => {

  describe('selection state change', () => {
    let fixture: ComponentFixture<ListboxWithOptions>;

    let testComponent: ListboxWithOptions;

    let listbox: DebugElement;
    let listboxInstance: CdkListbox;
    let listboxElement: HTMLElement;

    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: HTMLElement[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [ListboxWithOptions],
      }).compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(ListboxWithOptions);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox>(CdkListbox);
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
      const downKeyEvent =
        createKeyboardEvent('keydown', DOWN_ARROW, undefined, {shift: true});

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
    let listboxInstance: CdkListbox;

    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: HTMLElement[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [ListboxMultiselect],
      }).compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(ListboxMultiselect);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox>(CdkListbox);

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
    let listboxInstance: CdkListbox;
    let listboxElement: HTMLElement;

    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: HTMLElement[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [ListboxActiveDescendant],
      }).compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(ListboxActiveDescendant);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox>(CdkListbox);
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
    </div>`
})
class ListboxWithOptions {
  changedOption: CdkOption;
  isListboxDisabled: boolean = false;
  isPurpleDisabled: boolean = false;
  isSolarDisabled: boolean = false;

  onSelectionChange(event: ListboxSelectionChangeEvent) {
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
    </div>`
})
class ListboxMultiselect {
  changedOption: CdkOption;
  isMultiselectable: boolean = false;

  onSelectionChange(event: ListboxSelectionChangeEvent) {
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
    </div>`
})
class ListboxActiveDescendant {
  changedOption: CdkOption;
  isActiveDescendant: boolean = true;
  focusedOption: string;

  onSelectionChange(event: ListboxSelectionChangeEvent) {
    this.changedOption = event.option;
  }

  onFocus(option: string) {
    this.focusedOption = option;
  }
}
