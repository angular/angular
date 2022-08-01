import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Component, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CdkListbox, CdkListboxModule, CdkOption, ListboxValueChangeEvent} from './index';
import {dispatchKeyboardEvent, dispatchMouseEvent} from '../../cdk/testing/private';
import {
  A,
  B,
  DOWN_ARROW,
  END,
  HOME,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

async function setupComponent<T, O = string>(component: Type<T>, imports: any[] = []) {
  await TestBed.configureTestingModule({
    imports: [CdkListboxModule, ...imports],
    declarations: [component],
  }).compileComponents();
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  const listboxDebugEl = fixture.debugElement.query(By.directive(CdkListbox));
  const optionDebugEls = fixture.debugElement.queryAll(By.directive(CdkOption));

  return {
    fixture,
    testComponent: fixture.componentInstance,
    listbox: listboxDebugEl.injector.get<CdkListbox<O>>(CdkListbox),
    listboxEl: listboxDebugEl.nativeElement as HTMLElement,
    options: optionDebugEls.map(el => el.injector.get<CdkOption<O>>(CdkOption)),
    optionEls: optionDebugEls.map(el => el.nativeElement as HTMLElement),
  };
}

describe('CdkOption and CdkListbox', () => {
  describe('id', () => {
    it('should generate unique ids', async () => {
      const {listbox, listboxEl, options, optionEls} = await setupComponent(ListboxWithOptions);
      const optionIds = new Set(optionEls.map(option => option.id));
      expect(optionIds.size).toBe(options.length);
      for (let i = 0; i < options.length; i++) {
        expect(options[i].id).toBe(optionEls[i].id);
        expect(options[i].id).toMatch(/cdk-option-\d+/);
      }
      expect(listbox.id).toEqual(listboxEl.id);
      expect(listbox.id).toMatch(/cdk-listbox-\d+/);
    });

    it('should not overwrite user given ids', async () => {
      const {testComponent, fixture, listboxEl, optionEls} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.listboxId = 'my-listbox';
      testComponent.appleId = 'my-apple';
      fixture.detectChanges();
      expect(listboxEl.id).toBe('my-listbox');
      expect(optionEls[0].id).toBe('my-apple');
    });
  });

  describe('tabindex', () => {
    it('should use tabindex=0 for focusable elements, tabindex=-1 for non-focusable elements', async () => {
      const {fixture, listbox, listboxEl, optionEls} = await setupComponent(ListboxWithOptions);
      expect(listboxEl.getAttribute('tabindex')).toBe('0');
      expect(optionEls[0].getAttribute('tabindex')).toBe('-1');

      listbox.focus();
      fixture.detectChanges();

      expect(listboxEl.getAttribute('tabindex')).toBe('-1');
      expect(optionEls[0].getAttribute('tabindex')).toBe('0');
    });

    it('should respect user given tabindex for focusable elements', async () => {
      const {testComponent, fixture, listbox, listboxEl, optionEls} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.listboxTabindex = 10;
      testComponent.appleTabindex = 20;
      fixture.detectChanges();

      expect(listboxEl.getAttribute('tabindex')).toBe('10');
      expect(optionEls[0].getAttribute('tabindex')).toBe('-1');

      listbox.focus();
      fixture.detectChanges();

      expect(listboxEl.getAttribute('tabindex')).toBe('-1');
      expect(optionEls[0].getAttribute('tabindex')).toBe('20');
    });

    it('should use listbox tabindex for focusable options', async () => {
      const {testComponent, fixture, listbox, optionEls} = await setupComponent(ListboxWithOptions);
      testComponent.listboxTabindex = 10;
      fixture.detectChanges();

      expect(optionEls[0].getAttribute('tabindex')).toBe('-1');

      listbox.focus();
      fixture.detectChanges();

      expect(optionEls[0].getAttribute('tabindex')).toBe('10');
    });
  });

  describe('selection', () => {
    it('should be empty initially', async () => {
      const {fixture, listbox, options, optionEls} = await setupComponent(ListboxWithOptions);
      expect(listbox.value).toEqual([]);
      for (let i = 0; i < options.length; i++) {
        expect(options[i].isSelected()).toBeFalse();
        expect(optionEls[i].hasAttribute('aria-selected')).toBeFalse();
      }
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should update when selection is changed programmatically', async () => {
      const {fixture, listbox, options, optionEls} = await setupComponent(ListboxWithOptions);
      options[1].select();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);
      expect(options[1].isSelected()).toBeTrue();
      expect(optionEls[1].getAttribute('aria-selected')).toBe('true');
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should update on option clicked', async () => {
      const {fixture, listbox, options, optionEls} = await setupComponent(ListboxWithOptions);
      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
      expect(options[0].isSelected()).toBeTrue();
      expect(optionEls[0].getAttribute('aria-selected')).toBe('true');
      expect(fixture.componentInstance.changedOption?.id).toBe(options[0].id);
    });

    it('should select and deselect range on option SHIFT + click', async () => {
      const {testComponent, fixture, listbox, optionEls} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      dispatchMouseEvent(
        optionEls[1],
        'click',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {shift: true},
      );
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);

      dispatchMouseEvent(
        optionEls[3],
        'click',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {shift: true},
      );
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange', 'banana', 'peach']);

      dispatchMouseEvent(
        optionEls[2],
        'click',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {shift: true},
      );
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);
    });

    it('should update on option activated via keyboard', async () => {
      const {fixture, listbox, listboxEl, options, optionEls} = await setupComponent(
        ListboxWithOptions,
      );
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE);
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
      expect(options[0].isSelected()).toBeTrue();
      expect(optionEls[0].getAttribute('aria-selected')).toBe('true');
      expect(fixture.componentInstance.changedOption?.id).toBe(options[0].id);
    });

    it('should deselect previously selected option in single-select listbox', async () => {
      const {fixture, listbox, options, optionEls} = await setupComponent(ListboxWithOptions);
      dispatchMouseEvent(optionEls[0], 'click');
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
      expect(options[0].isSelected()).toBeTrue();

      dispatchMouseEvent(optionEls[2], 'click');
      fixture.detectChanges();

      expect(listbox.value).toEqual(['banana']);
      expect(options[0].isSelected()).toBeFalse();
    });

    it('should select all options programmatically in multi-select listbox', async () => {
      const {testComponent, fixture, listbox} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      listbox.setAllSelected(true);
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'orange', 'banana', 'peach']);
    });

    it('should add to selection in multi-select listbox', async () => {
      const {testComponent, fixture, listbox, options, optionEls} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.isMultiselectable = true;
      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
      expect(options[0].isSelected()).toBeTrue();

      optionEls[2].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'banana']);
      expect(options[0].isSelected()).toBeTrue();
    });

    it('should deselect all options when switching to single-selection with invalid selection', async () => {
      const {testComponent, fixture, listbox} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();
      listbox.setAllSelected(true);
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'orange', 'banana', 'peach']);

      testComponent.isMultiselectable = false;
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
    });

    it('should preserve selection when switching to single-selection with valid selection', async () => {
      const {testComponent, fixture, listbox, optionEls} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();
      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);

      testComponent.isMultiselectable = false;
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
    });

    it('should allow programmatically toggling options', async () => {
      const {testComponent, fixture, listbox, options} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      options[0].toggle();
      listbox.toggle(options[1]);
      fixture.detectChanges();

      expect(options[0].isSelected()).toBeTrue();
      expect(options[1].isSelected()).toBeTrue();

      options[0].toggle();
      listbox.toggle(options[1]);
      fixture.detectChanges();

      expect(options[0].isSelected()).toBeFalse();
      expect(options[1].isSelected()).toBeFalse();
    });

    it('should allow programmatically selecting and deselecting options', async () => {
      const {testComponent, fixture, listbox, options} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      options[0].select();
      listbox.select(options[1]);
      fixture.detectChanges();

      expect(options[0].isSelected()).toBeTrue();
      expect(options[1].isSelected()).toBeTrue();

      options[0].deselect();
      listbox.deselect(options[1]);
      fixture.detectChanges();

      expect(options[0].isSelected()).toBeFalse();
      expect(options[1].isSelected()).toBeFalse();
    });

    it('should allow binding to listbox value', async () => {
      const {testComponent, fixture, listbox, options} = await setupComponent(
        ListboxWithBoundValue,
      );
      expect(listbox.value).toEqual(['banana']);
      expect(options[2].isSelected()).toBeTrue();

      testComponent.value = ['orange'];
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);
      expect(options[1].isSelected()).toBeTrue();
    });
  });

  describe('disabled state', () => {
    it('should be able to toggle listbox disabled state', async () => {
      const {fixture, testComponent, listbox, listboxEl, options, optionEls} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.isListboxDisabled = true;
      fixture.detectChanges();

      expect(listbox.disabled).toBeTrue();
      expect(listboxEl.getAttribute('aria-disabled')).toBe('true');

      for (let i = 0; i < options.length; i++) {
        expect(options[i].disabled).toBeTrue();
        expect(optionEls[i].getAttribute('aria-disabled')).toBe('true');
      }
    });

    it('should toggle option disabled state', async () => {
      const {fixture, testComponent, options, optionEls} = await setupComponent(ListboxWithOptions);
      testComponent.isAppleDisabled = true;
      fixture.detectChanges();

      expect(options[0].disabled).toBeTrue();
      expect(optionEls[0].getAttribute('aria-disabled')).toBe('true');
    });

    it('should not change selection on click of a disabled option', async () => {
      const {fixture, testComponent, listbox, optionEls} = await setupComponent(ListboxWithOptions);
      testComponent.isAppleDisabled = true;
      fixture.detectChanges();

      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not change selection on click in a disabled listbox', async () => {
      const {fixture, testComponent, listbox, optionEls} = await setupComponent(ListboxWithOptions);
      testComponent.isListboxDisabled = true;
      fixture.detectChanges();

      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not change selection on keyboard activation in a disabled listbox', async () => {
      const {fixture, testComponent, listbox, listboxEl} = await setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      testComponent.isListboxDisabled = true;
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE);
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not change selection on click of a disabled option', async () => {
      const {fixture, testComponent, listbox, listboxEl} = await setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      testComponent.isAppleDisabled = true;
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE);
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not handle type ahead on a disabled listbox', async (...args: unknown[]) => {
      const {fixture, testComponent, listboxEl, options} = await setupComponent(ListboxWithOptions);
      await fakeAsync(() => {
        testComponent.isListboxDisabled = true;
        fixture.detectChanges();

        dispatchKeyboardEvent(listboxEl, 'keydown', B);
        fixture.detectChanges();
        tick(200);

        for (let option of options) {
          expect(option.isActive()).toBeFalse();
        }
      })(args);
    });

    it('should skip disabled options when navigating with arrow keys', async () => {
      const {testComponent, fixture, listbox, listboxEl, options} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.isOrangeDisabled = true;
      listbox.focus();
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[2].isActive()).toBeTrue();
    });

    it('should not skip disabled options when navigating with arrow keys when skipping is turned off', async () => {
      const {testComponent, fixture, listbox, listboxEl, options} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.navigationSkipsDisabled = false;
      testComponent.isOrangeDisabled = true;
      listbox.focus();
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[1].isActive()).toBeTrue();
    });

    it('should not select disabled options with CONTROL + A', async () => {
      const {testComponent, fixture, listbox, listboxEl} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      testComponent.isOrangeDisabled = true;
      fixture.detectChanges();

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', A, undefined, {control: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'banana', 'peach']);
    });
  });

  describe('compare with', () => {
    it('should allow custom function to compare option values', async () => {
      const {fixture, listbox, options} = await setupComponent<
        ListboxWithObjectValues,
        {name: string}
      >(ListboxWithObjectValues, [CommonModule]);
      listbox.value = [{name: 'Banana'}];
      fixture.detectChanges();

      expect(options[2].isSelected()).toBeTrue();

      listbox.value = [{name: 'Orange', extraStuff: true} as any];
      fixture.detectChanges();

      expect(options[1].isSelected()).toBeTrue();
    });
  });

  describe('keyboard navigation', () => {
    it('should update active item on arrow key presses', async () => {
      const {fixture, listbox, listboxEl, options} = await setupComponent(ListboxWithOptions);
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[1].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();
    });

    it('should update active option on home and end key press', async () => {
      const {fixture, listbox, listboxEl, options, optionEls} = await setupComponent(
        ListboxWithOptions,
      );
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', END);
      fixture.detectChanges();

      expect(options[options.length - 1].isActive()).toBeTrue();
      expect(optionEls[options.length - 1].classList).toContain('cdk-option-active');

      dispatchKeyboardEvent(listboxEl, 'keydown', HOME);
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();
      expect(optionEls[0].classList).toContain('cdk-option-active');
    });

    it('should change active item using type ahead', async (...args: unknown[]) => {
      const {fixture, listbox, listboxEl, options} = await setupComponent(ListboxWithOptions);
      await fakeAsync(() => {
        listbox.focus();
        fixture.detectChanges();

        dispatchKeyboardEvent(listboxEl, 'keydown', B);
        fixture.detectChanges();
        tick(200);

        expect(options[2].isActive()).toBeTrue();
      })(args);
    });

    it('should allow custom type ahead label', async (...args: unknown[]) => {
      const {fixture, listbox, listboxEl, options} = await setupComponent(
        ListboxWithCustomTypeahead,
      );
      await fakeAsync(() => {
        listbox.focus();
        fixture.detectChanges();

        dispatchKeyboardEvent(listboxEl, 'keydown', B);
        fixture.detectChanges();
        tick(200);

        expect(options[2].isActive()).toBeTrue();
      })(args);
    });

    it('should focus and toggle the next item when pressing SHIFT + DOWN_ARROW', async () => {
      const {fixture, listbox, listboxEl, options} = await setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW, undefined, {shift: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);
      expect(fixture.componentInstance.changedOption?.id).toBe(options[1].id);
    });

    it('should update active item on arrow key presses in horizontal mode', async () => {
      const {testComponent, fixture, listbox, listboxEl, options} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.orientation = 'horizontal';
      fixture.detectChanges();

      expect(listboxEl.getAttribute('aria-orientation')).toBe('horizontal');

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(options[1].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();
    });

    it('should select and deselect all option with CONTROL + A', async () => {
      const {testComponent, fixture, listbox, listboxEl} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', A, undefined, {control: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'orange', 'banana', 'peach']);

      dispatchKeyboardEvent(listboxEl, 'keydown', A, undefined, {control: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
    });

    it('should select and deselect range with CONTROL + SPACE', async () => {
      const {testComponent, fixture, listbox, listboxEl} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE, undefined, {shift: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE, undefined, {shift: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange', 'banana', 'peach']);

      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE, undefined, {shift: true});

      expect(listbox.value).toEqual(['orange']);
    });

    it('should select and deselect range with CONTROL + SHIFT + HOME', async () => {
      const {testComponent, fixture, listbox, listboxEl} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      listbox.focus();
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', HOME, undefined, {control: true, shift: true});

      expect(listbox.value).toEqual(['apple', 'orange', 'banana']);

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', HOME, undefined, {control: true, shift: true});

      expect(listbox.value).toEqual([]);
    });

    it('should select and deselect range with CONTROL + SHIFT + END', async () => {
      const {testComponent, fixture, listbox, listboxEl} = await setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      listbox.focus();
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', END, undefined, {control: true, shift: true});

      expect(listbox.value).toEqual(['orange', 'banana', 'peach']);

      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', END, undefined, {control: true, shift: true});

      expect(listbox.value).toEqual([]);
    });

    it('should wrap navigation when wrapping is enabled', async () => {
      const {fixture, listbox, listboxEl, options} = await setupComponent(ListboxWithOptions);
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', END);
      fixture.detectChanges();

      expect(options[options.length - 1].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();
    });

    it('should not wrap navigation when wrapping is not enabled', async () => {
      const {testComponent, fixture, listbox, listboxEl, options} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.navigationWraps = false;
      fixture.detectChanges();

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', END);
      fixture.detectChanges();

      expect(options[options.length - 1].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[options.length - 1].isActive()).toBeTrue();
    });
  });

  describe('with roving tabindex', () => {
    it('should shift focus on keyboard navigation', async () => {
      const {fixture, listbox, listboxEl, optionEls} = await setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(optionEls[0]);
      expect(listboxEl.hasAttribute('aria-activedescendant')).toBeFalse();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(document.activeElement).toBe(optionEls[1]);
      expect(listboxEl.hasAttribute('aria-activedescendant')).toBeFalse();
    });

    it('should focus first option on listbox focus', async () => {
      const {fixture, listbox, optionEls} = await setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(optionEls[0]);
    });

    it('should focus listbox if no focusable options available', async () => {
      const {fixture, listbox, listboxEl} = await setupComponent(ListboxWithNoOptions);

      listbox.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(listboxEl);
    });
  });

  describe('with aria-activedescendant', () => {
    it('should update active descendant on keyboard navigation', async () => {
      const {testComponent, fixture, listbox, listboxEl, optionEls} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.isActiveDescendant = true;
      fixture.detectChanges();
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxEl.getAttribute('aria-activedescendant')).toBe(optionEls[0].id);
      expect(document.activeElement).toBe(listboxEl);

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxEl.getAttribute('aria-activedescendant')).toBe(optionEls[1].id);
      expect(document.activeElement).toBe(listboxEl);
    });

    it('should not activate an option on listbox focus', async () => {
      const {testComponent, fixture, listbox, options} = await setupComponent(ListboxWithOptions);
      testComponent.isActiveDescendant = true;
      fixture.detectChanges();
      listbox.focus();
      fixture.detectChanges();

      for (let option of options) {
        expect(option.isActive()).toBeFalse();
      }
    });

    it('should focus listbox and make option active on option focus', async () => {
      const {testComponent, fixture, listboxEl, options, optionEls} = await setupComponent(
        ListboxWithOptions,
      );
      testComponent.isActiveDescendant = true;
      fixture.detectChanges();
      optionEls[2].focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(listboxEl);
      expect(options[2].isActive()).toBeTrue();
    });
  });

  describe('with FormControl', () => {
    it('should reflect disabled state of the FormControl', async () => {
      const {testComponent, fixture, listbox} = await setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(listbox.disabled).toBeTrue();
    });

    it('should update when FormControl value changes', async () => {
      const {testComponent, fixture, options} = await setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.formControl.setValue(['banana']);
      fixture.detectChanges();

      expect(options[2].isSelected()).toBeTrue();
    });

    it('should update FormControl when selection changes', async () => {
      const {testComponent, fixture, optionEls} = await setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      const spy = jasmine.createSpy();
      const subscription = testComponent.formControl.valueChanges.subscribe(spy);
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();

      optionEls[1].click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(['orange']);
      subscription.unsubscribe();
    });

    it('should update multi-select listbox when FormControl value changes', async () => {
      const {testComponent, fixture, options} = await setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();
      testComponent.formControl.setValue(['orange', 'banana']);
      fixture.detectChanges();

      expect(options[1].isSelected()).toBeTrue();
      expect(options[2].isSelected()).toBeTrue();
    });

    it('should update FormControl when multi-selection listbox changes', async () => {
      const {testComponent, fixture, optionEls} = await setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.isMultiselectable = true;
      fixture.detectChanges();
      const spy = jasmine.createSpy();
      const subscription = testComponent.formControl.valueChanges.subscribe(spy);
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();

      optionEls[1].click();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(['orange']);

      optionEls[2].click();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(['orange', 'banana']);
      subscription.unsubscribe();
    });

    it('should have FormControl error when multiple values selected in single-select listbox', async () => {
      const {testComponent, fixture} = await setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.formControl.setValue(['orange', 'banana']);
      fixture.detectChanges();

      expect(testComponent.formControl.hasError('cdkListboxUnexpectedMultipleValues')).toBeTrue();
      expect(testComponent.formControl.hasError('cdkListboxUnexpectedOptionValues')).toBeFalse();
    });

    it('should have FormControl error when non-option value selected', async () => {
      const {testComponent, fixture} = await setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.isMultiselectable = true;
      testComponent.formControl.setValue(['orange', 'dragonfruit', 'mango']);
      fixture.detectChanges();

      expect(testComponent.formControl.hasError('cdkListboxUnexpectedOptionValues')).toBeTrue();
      expect(testComponent.formControl.hasError('cdkListboxUnexpectedMultipleValues')).toBeFalse();
      expect(testComponent.formControl.errors?.['cdkListboxUnexpectedOptionValues']).toEqual({
        'values': ['dragonfruit', 'mango'],
      });
    });

    it('should have multiple FormControl errors when multiple non-option values selected in single-select listbox', async () => {
      const {testComponent, fixture} = await setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.formControl.setValue(['dragonfruit', 'mango']);
      fixture.detectChanges();

      expect(testComponent.formControl.hasError('cdkListboxUnexpectedOptionValues')).toBeTrue();
      expect(testComponent.formControl.hasError('cdkListboxUnexpectedMultipleValues')).toBeTrue();
      expect(testComponent.formControl.errors?.['cdkListboxUnexpectedOptionValues']).toEqual({
        'values': ['dragonfruit', 'mango'],
      });
    });
  });
});

@Component({
  template: `
    <div cdkListbox
         [id]="listboxId"
         [tabindex]="listboxTabindex"
         [cdkListboxMultiple]="isMultiselectable"
         [cdkListboxDisabled]="isListboxDisabled"
         [cdkListboxUseActiveDescendant]="isActiveDescendant"
         [cdkListboxOrientation]="orientation"
         [cdkListboxNavigationWrapDisabled]="!navigationWraps"
         [cdkListboxNavigatesDisabledOptions]="!navigationSkipsDisabled"
         (cdkListboxValueChange)="onSelectionChange($event)">
      <div cdkOption="apple"
           [cdkOptionDisabled]="isAppleDisabled"
           [id]="appleId"
           [tabindex]="appleTabindex">
        Apple
      </div>
      <div cdkOption="orange" [cdkOptionDisabled]="isOrangeDisabled">Orange
      </div>
      <div cdkOption="banana">Banana</div>
      <div cdkOption="peach">Peach</div>
    </div>
  `,
})
class ListboxWithOptions {
  changedOption: CdkOption | null;
  isListboxDisabled = false;
  isAppleDisabled = false;
  isOrangeDisabled = false;
  isMultiselectable = false;
  isActiveDescendant = false;
  navigationWraps = true;
  navigationSkipsDisabled = true;
  listboxId: string;
  listboxTabindex: number;
  appleId: string;
  appleTabindex: number;
  orientation: 'horizontal' | 'vertical' = 'vertical';

  onSelectionChange(event: ListboxValueChangeEvent<unknown>) {
    this.changedOption = event.option;
  }
}

@Component({
  template: `<div cdkListbox></div>`,
})
class ListboxWithNoOptions {}

@Component({
  template: `
    <div cdkListbox
         [formControl]="formControl"
         [cdkListboxMultiple]="isMultiselectable"
         [cdkListboxUseActiveDescendant]="isActiveDescendant">
      <div cdkOption="apple">Apple</div>
      <div cdkOption="orange">Orange</div>
      <div cdkOption="banana">Banana</div>
      <div cdkOption="peach">Peach</div>
    </div>
  `,
})
class ListboxWithFormControl {
  formControl = new FormControl();
  isMultiselectable = false;
  isActiveDescendant = false;
}

@Component({
  template: `
    <ul cdkListbox>
      <li cdkOption="apple" cdkOptionTypeaheadLabel="apple">🍎</li>
      <li cdkOption="orange" cdkOptionTypeaheadLabel="orange">🍊</li>
      <li cdkOption="banana" cdkOptionTypeaheadLabel="banana">🍌</li>
      <li cdkOption="peach" cdkOptionTypeaheadLabel="peach">🍑</li>
    </ul>
  `,
})
class ListboxWithCustomTypeahead {}

@Component({
  template: `
    <div cdkListbox
         [cdkListboxValue]="value">
      <div cdkOption="apple">Apple</div>
      <div cdkOption="orange">Orange</div>
      <div cdkOption="banana">Banana</div>
      <div cdkOption="peach">Peach</div>
    </div>
  `,
})
class ListboxWithBoundValue {
  value = ['banana'];
}

@Component({
  template: `
    <div cdkListbox [cdkListboxCompareWith]="fruitCompare">
      <div *ngFor="let fruit of fruits" [cdkOption]="fruit">{{fruit.name}}</div>
    </div>
  `,
})
class ListboxWithObjectValues {
  fruits = [{name: 'Apple'}, {name: 'Orange'}, {name: 'Banana'}, {name: 'Peach'}];

  fruitCompare = (a: {name: string}, b: {name: string}) => a.name === b.name;
}
