import {
    it,
    beforeEach,
    inject,
    async,
    fakeAsync,
    flushMicrotasks
} from '@angular/core/testing';
import {FORM_DIRECTIVES, NgModel, NgControl} from '@angular/common';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdCheckbox} from './checkbox';
import {PromiseCompleter} from '../../core/async/promise-completer';



describe('MdCheckbox', () => {
  let builder: TestComponentBuilder;
  let fixture: ComponentFixture<any>;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('basic behaviors', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MdCheckbox;
    let testComponent: SingleCheckbox;

    beforeEach(async(() => {
      builder.createAsync(SingleCheckbox).then(f => {
        fixture = f;
        fixture.detectChanges();

        checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
        checkboxNativeElement = checkboxDebugElement.nativeElement;
        checkboxInstance = checkboxDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;
      });
    }));

    it('should add and remove the checked state', () => {
      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('md-checkbox-checked');
      expect(checkboxNativeElement.getAttribute('aria-checked')).toBe('false');

      testComponent.isChecked = true;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxNativeElement.classList).toContain('md-checkbox-checked');
      expect(checkboxNativeElement.getAttribute('aria-checked')).toBe('true');

      testComponent.isChecked = false;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('md-checkbox-checked');
      expect(checkboxNativeElement.getAttribute('aria-checked')).toBe('false');
    });

    it('should add and remove indeterminate state', () => {
      expect(checkboxNativeElement.classList).not.toContain('md-checkbox-checked');
      expect(checkboxNativeElement.getAttribute('aria-checked')).toBe('false');

      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).toContain('md-checkbox-indeterminate');
      expect(checkboxNativeElement.getAttribute('aria-checked')).toBe('mixed');

      testComponent.isIndeterminate = false;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).not.toContain('md-checkbox-indeterminate');
      expect(checkboxNativeElement.getAttribute('aria-checked')).toBe('false');
    });

    it('should toggle checked state on click', () => {
      expect(checkboxInstance.checked).toBe(false);

      checkboxNativeElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);

      checkboxNativeElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
    });

    it('should change from indeterminate to checked on click', () => {
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      checkboxNativeElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxInstance.indeterminate).toBe(false);

      checkboxNativeElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxInstance.indeterminate).toBe(false);
    });

    it('should add and remove disabled state', () => {
      expect(checkboxInstance.disabled).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('md-checkbox-disabled');
      expect(checkboxNativeElement.tabIndex).toBe(0);

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(true);
      expect(checkboxNativeElement.classList).toContain('md-checkbox-disabled');
      expect(checkboxNativeElement.hasAttribute('tabindex')).toBe(false);

      testComponent.isDisabled = false;
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('md-checkbox-disabled');
      expect(checkboxNativeElement.tabIndex).toBe(0);
    });

    it('should not toggle `checked` state upon interation while disabled', () => {
      testComponent.isDisabled = true;
      fixture.detectChanges();

      checkboxNativeElement.click();
      expect(checkboxInstance.checked).toBe(false);
    });

    it('should overwrite indeterminate state when checked is re-set', () => {
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      testComponent.isChecked = true;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxInstance.indeterminate).toBe(false);
    });

    it('should preserve the user-provided id', () => {
      expect(checkboxNativeElement.id).toBe('simple-check');
    });

    it('should create a label element with its own unique id for aria-labelledby', () => {
      let labelElement = checkboxNativeElement.querySelector('label');
      expect(labelElement.id).toBeTruthy();
      expect(labelElement.id).not.toBe(checkboxNativeElement.id);
      expect(checkboxNativeElement.getAttribute('aria-labelledby')).toBe(labelElement.id);
    });

    it('should project the checkbox content into the label element', () => {
      let labelElement = checkboxNativeElement.querySelector('label');

      expect(labelElement.textContent.trim()).toBe('Simple checkbox');
    });

    it('should mark the host element with role="checkbox"', () => {
      expect(checkboxNativeElement.getAttribute('role')).toBe('checkbox');
    });

    it('should make the host element a tab stop', () => {
      expect(checkboxNativeElement.tabIndex).toBe(0);
    });

    it('should add a css class to end-align the checkbox', () => {
      testComponent.alignment = 'end';
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).toContain('md-checkbox-align-end');
    });

    it('should emit a change event when the `checked` value changes', () => {
      // TODO(jelbourn): this *should* work with async(), but fixture.whenStable currently doesn't
      // know to look at pending macro tasks.
      // See https://github.com/angular/angular/issues/8389
      // As a short-term solution, use a promise (which jasmine knows how to understand).
      let promiseCompleter = new PromiseCompleter();
      checkboxInstance.change.subscribe(() => {
        promiseCompleter.resolve();
      });

      testComponent.isChecked = true;
      fixture.detectChanges();

      return promiseCompleter.promise;
    });

    it('should stop propagation of interaction events when disabed', () => {
      testComponent.isDisabled = true;
      fixture.detectChanges();

      checkboxNativeElement.click();
      fixture.detectChanges();

      expect(testComponent.parentElementClicked).toBe(false);
    });

    it('should not scroll when pressing space on the checkbox', () => {
      let keyboardEvent = dispatchKeyboardEvent('keydown', checkboxNativeElement, ' ');
      fixture.detectChanges();

      expect(keyboardEvent.preventDefault).toHaveBeenCalled();
    });

    it('should toggle the checked state when pressing space', () => {
      dispatchKeyboardEvent('keyup', checkboxNativeElement, ' ');
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);

      dispatchKeyboardEvent('keyup', checkboxNativeElement, ' ');
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
    });

    it('should not toggle the checked state when pressing space if disabled', () => {
      testComponent.isDisabled = true;
      fixture.detectChanges();

      dispatchKeyboardEvent('keyup', checkboxNativeElement, ' ');
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(testComponent.parentElementKeyedUp).toBe(false);
    });

    describe('state transition css classes', () => {
      it('should transition unchecked -> checked -> unchecked', () => {
        testComponent.isChecked = true;
        fixture.detectChanges();
        expect(checkboxNativeElement.classList).toContain('md-checkbox-anim-unchecked-checked');

        testComponent.isChecked = false;
        fixture.detectChanges();
        expect(checkboxNativeElement.classList).not.toContain('md-checkbox-anim-unchecked-checked');
        expect(checkboxNativeElement.classList).toContain('md-checkbox-anim-checked-unchecked');
      });

      it('should transition unchecked -> indeterminate -> unchecked', () => {
        testComponent.isIndeterminate = true;
        fixture.detectChanges();

        expect(checkboxNativeElement.classList)
            .toContain('md-checkbox-anim-unchecked-indeterminate');

        testComponent.isIndeterminate = false;
        fixture.detectChanges();

        expect(checkboxNativeElement.classList)
            .not.toContain('md-checkbox-anim-unchecked-indeterminate');
        expect(checkboxNativeElement.classList)
            .toContain('md-checkbox-anim-indeterminate-unchecked');
      });

      it('should transition indeterminate -> checked', () => {
        testComponent.isIndeterminate = true;
        fixture.detectChanges();

        testComponent.isChecked = true;
        fixture.detectChanges();

        expect(checkboxNativeElement.classList).not.toContain(
            'md-checkbox-anim-unchecked-indeterminate');
        expect(checkboxNativeElement.classList).toContain('md-checkbox-anim-indeterminate-checked');
      });

      it('should not apply transition classes when there is no state change', () => {
        testComponent.isChecked = checkboxInstance.checked;
        fixture.detectChanges();
        expect(checkboxNativeElement).not.toMatch(/^md\-checkbox\-anim/g);

        testComponent.isIndeterminate = checkboxInstance.indeterminate;
        expect(checkboxNativeElement).not.toMatch(/^md\-checkbox\-anim/g);
      });

      it('should not initially have any transition classes', () => {
        expect(checkboxNativeElement).not.toMatch(/^md\-checkbox\-anim/g);
      });
    });
  });

  describe('with provided aria-label ', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;

    it('should use the provided aria-label', async(() => {
      builder.createAsync(CheckboxWithAriaLabel).then(f => {
        fixture = f;
        checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
        checkboxNativeElement = checkboxDebugElement.nativeElement;

        expect(checkboxNativeElement.getAttribute('aria-label')).toBe('Super effective');
      });
    }));
  });

  describe('with provided tabIndex', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let testComponent: CheckboxWithTabIndex;

    beforeEach(async(() => {
      builder.createAsync(CheckboxWithTabIndex).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;
        checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
        checkboxNativeElement = checkboxDebugElement.nativeElement;
      });
    }));

    it('should preserve any given tabIndex', async(() => {
      expect(checkboxNativeElement.tabIndex).toBe(7);
    }));

    it('should preserve given tabIndex when the checkbox is disabled then enabled', () => {
      testComponent.isDisabled = true;
      fixture.detectChanges();

      testComponent.customTabIndex = 13;
      fixture.detectChanges();

      testComponent.isDisabled = false;
      fixture.detectChanges();

      expect(checkboxNativeElement.tabIndex).toBe(13);
    });
  });

  describe('with multiple checkboxes', () => {
    beforeEach(async(() => {
      builder.createAsync(MultipleCheckboxes).then(f => {
        fixture = f;
        fixture.detectChanges();
      });
    }));

    it('should assign a unique id to each checkbox', () => {
      let [firstId, secondId] =
          fixture.debugElement.queryAll(By.directive(MdCheckbox))
          .map(debugElement => debugElement.nativeElement.id);

      expect(firstId).toBeTruthy();
      expect(secondId).toBeTruthy();
      expect(firstId).not.toEqual(secondId);
    });
  });

  describe('with ngModel and ngControl', () => {
    beforeEach(async(() => {
      builder.createAsync(CheckboxWithFormDirectives).then(f => {
        f.detectChanges();
        fixture = f;
      });
    }));

    it('should be in pristine, untouched, and valid states initially', fakeAsync(() => {
      flushMicrotasks();

      let checkboxElement = fixture.debugElement.query(By.directive(MdCheckbox));
      let ngControl = <NgControl> checkboxElement.injector.get(NgControl);

      expect(ngControl.valid).toBe(true);
      expect(ngControl.pristine).toBe(true);
      expect(ngControl.touched).toBe(false);

      // TODO(jelbourn): test that `touched` and `pristine` state are modified appropriately.
      // This is currently blocked on issues with async() and fakeAsync().
    }));
  });

});


/** Simple component for testing a single checkbox. */
@Component({
  directives: [MdCheckbox],
  template: `
  <div (click)="parentElementClicked = true" (keyup)="parentElementKeyedUp = true">    
    <md-checkbox 
        id="simple-check"
        [align]="alignment"
        [checked]="isChecked" 
        [indeterminate]="isIndeterminate" 
        [disabled]="isDisabled"
        (change)="changeCount = changeCount + 1">
      Simple checkbox
    </md-checkbox>
  </div>`
})
class SingleCheckbox {
  alignment: string = 'start';
  isChecked: boolean = false;
  isIndeterminate: boolean = false;
  isDisabled: boolean = false;
  parentElementClicked: boolean = false;
  parentElementKeyedUp: boolean = false;
  lastKeydownEvent: Event = null;
}

/** Simple component for testing an MdCheckbox with ngModel and ngControl. */
@Component({
  directives: [MdCheckbox, FORM_DIRECTIVES, NgModel],
  template: `
    <form>
      <md-checkbox ngControl="cb" [(ngModel)]="isGood">Be good</md-checkbox>
    </form>
  `,
})
class CheckboxWithFormDirectives {
  isGood: boolean = false;
}

/** Simple test component with multiple checkboxes. */
@Component(({
  directives: [MdCheckbox],
  template: `
    <md-checkbox>Option 1</md-checkbox>
    <md-checkbox>Option 2</md-checkbox>
  `
}))
class MultipleCheckboxes { }


/** Simple test component with tabIndex */
@Component({
  directives: [MdCheckbox],
  template: `
    <md-checkbox [tabindex]="customTabIndex" [disabled]="isDisabled">
    </md-checkbox>`,
})
class CheckboxWithTabIndex {
  customTabIndex: number = 7;
  isDisabled: boolean = false;
}

/** Simple test component with an aria-label set. */
@Component({
  directives: [MdCheckbox],
  template: `<md-checkbox aria-label="Super effective"></md-checkbox>`
})
class CheckboxWithAriaLabel { }

// TODO(jelbourn): remove eveything below when Angular supports faking events.


var BROWSER_SUPPORTS_EVENT_CONSTRUCTORS: boolean = (function() {
  // See: https://github.com/rauschma/event_constructors_check/blob/gh-pages/index.html#L39
  try {
    return new Event('submit', { bubbles: false }).bubbles === false &&
           new Event('submit', { bubbles: true }).bubbles === true;
  } catch (e) {
    return false;
  }
})();


/**
 * Dispatches a keyboard event from an element.
 * @param eventName The name of the event to dispatch, such as "keydown".
 * @param element The element from which the event will be dispatched.
 * @param key The key tied to the KeyboardEvent.
 * @returns The artifically created keyboard event.
 */
function dispatchKeyboardEvent(eventName: string, element: HTMLElement, key: string): Event {
  let keyboardEvent: Event;
  if (BROWSER_SUPPORTS_EVENT_CONSTRUCTORS) {
    keyboardEvent = new KeyboardEvent(eventName);
  } else {
    keyboardEvent = document.createEvent('Event');
    keyboardEvent.initEvent(eventName, true, true);
  }

  // Hack DOM Level 3 Events "key" prop into keyboard event.
  Object.defineProperty(keyboardEvent, 'key', {
    value: key,
    enumerable: false,
    writable: false,
    configurable: true,
  });

  // Using spyOn seems to be the *only* way to determine if preventDefault is called, since it
  // seems that `defaultPrevented` does not get set with the technique.
  spyOn(keyboardEvent, 'preventDefault').and.callThrough();

  element.dispatchEvent(keyboardEvent);
  return keyboardEvent;
}

