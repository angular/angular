import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MdSelectModule} from './index';
import {OverlayContainer} from '../core/overlay/overlay-container';
import {MdSelect} from './select';
import {MdOption} from './option';
import {Dir} from '../core/rtl/dir';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';

describe('MdSelect', () => {
  let overlayContainerElement: HTMLElement;
  let dir: {value: string};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSelectModule.forRoot(), ReactiveFormsModule, FormsModule],
      declarations: [BasicSelect, NgModelSelect],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');

          // add fixed positioning to match real overlay container styles
          overlayContainerElement.style.position = 'fixed';
          overlayContainerElement.style.top = '0';
          overlayContainerElement.style.left = '0';
          document.body.appendChild(overlayContainerElement);

          // remove body padding to keep consistent cross-browser
          document.body.style.padding = '0';
          document.body.style.margin = '0';

          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return dir = { value: 'ltr' };
        }},
        {provide: ViewportRuler, useClass: FakeViewportRuler}
      ]
    });

    TestBed.compileComponents();
  }));

  afterEach(() => {
    document.body.removeChild(overlayContainerElement);
  });

  describe('overlay panel', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
    });

    it('should open the panel when trigger is clicked', () => {
      trigger.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.select.panelOpen).toBe(true);
      expect(overlayContainerElement.textContent).toContain('Steak');
      expect(overlayContainerElement.textContent).toContain('Pizza');
      expect(overlayContainerElement.textContent).toContain('Tacos');
    });

    it('should close the panel when an item is clicked', async(() => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent).toEqual('');
        expect(fixture.componentInstance.select.panelOpen).toBe(false);
      });
    }));

    it('should close the panel when a click occurs outside the panel', async(() => {
      trigger.click();
      fixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector('.md-overlay-backdrop') as HTMLElement;
      backdrop.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent).toEqual('');
        expect(fixture.componentInstance.select.panelOpen).toBe(false);
      });
    }));

    it('should set the width of the overlay based on the trigger', () => {
      trigger.style.width = '200px';
      trigger.click();
      fixture.detectChanges();

      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.width).toBe('200px');
    });

  });

  describe('selection logic', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
    });

    it('should display placeholder if no option is selected', () => {
      expect(trigger.textContent.trim()).toEqual('Food');
    });

    it('should focus the first option if no option is selected', async(() => {
      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.select._keyManager.focusedItemIndex).toEqual(0);
      });
    }));

    it('should select an option when it is clicked', () => {
      trigger.click();
      fixture.detectChanges();

      let option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      expect(option.classList).toContain('md-selected');
      expect(fixture.componentInstance.options.first.selected).toBe(true);
      expect(fixture.componentInstance.select.selected)
        .toBe(fixture.componentInstance.options.first);
    });

    it('should deselect other options when one is selected', () => {
      trigger.click();
      fixture.detectChanges();

      let options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;

      options[0].click();
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList).not.toContain('md-selected');
      expect(options[2].classList).not.toContain('md-selected');

      const optionInstances = fixture.componentInstance.options.toArray();
      expect(optionInstances[1].selected).toBe(false);
      expect(optionInstances[2].selected).toBe(false);
    });

    it('should display the selected option in the trigger', () => {
      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.md-select-value')).nativeElement;
      const placeholder =
        fixture.debugElement.query(By.css('.md-select-placeholder')).nativeElement;

      expect(placeholder.textContent).toContain('Food');
      expect(value.textContent).toContain('Steak');
      expect(trigger.textContent).toContain('Food');
      expect(trigger.textContent).toContain('Steak');
    });

    it('should focus the selected option if an option is selected', async(() => {
      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.select._keyManager.focusedItemIndex).toEqual(1);
      });
    }));

    it('should select an option that was added after initialization', () => {
      fixture.componentInstance.foods.push({viewValue: 'Pasta', value: 'pasta-3'});
      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[3].click();
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Pasta');
      expect(fixture.componentInstance.select.selected)
        .toBe(fixture.componentInstance.options.last);
    });

    it('should not select disabled options', () => {
      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[2].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.select.panelOpen).toBe(true);
      expect(options[2].classList).not.toContain('md-selected');
      expect(fixture.componentInstance.select.selected).not.toBeDefined();
    });

  });

  describe('forms integration', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
    });

    it('should set the view value from the form', () => {
      let value = fixture.debugElement.query(By.css('.md-select-value'));
      expect(value).toBeNull('Expected trigger to start with empty value.');

      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      value = fixture.debugElement.query(By.css('.md-select-value'));
      expect(value.nativeElement.textContent)
        .toContain('Pizza', `Expected trigger to be populated by the control's new value.`);

      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
        .toContain('md-selected', `Expected option with the control's new value to be selected.`);
    });

    it('should update the form value when the view changes', () => {
      expect(fixture.componentInstance.control.value)
        .toEqual(null, `Expected the control's value to be null initially.`);

      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.value)
        .toEqual('steak-0', `Expected control's value to be set to the new option.`);
    });

    it('should set the control to touched when the select is touched', () => {
      expect(fixture.componentInstance.control.touched)
        .toEqual(false, `Expected the control to start off as untouched.`);

      trigger.click();
      dispatchEvent('blur', trigger);
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched)
        .toEqual(false, `Expected the control to stay untouched when menu opened.`);

      const backdrop =
        overlayContainerElement.querySelector('.md-overlay-backdrop') as HTMLElement;
      backdrop.click();
      dispatchEvent('blur', trigger);
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched)
        .toEqual(true, `Expected the control to be touched as soon as focus left the select.`);
    });

    it('should set the control to dirty when the select\'s value changes in the DOM', () => {
      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to start out pristine.`);

      trigger.click();
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.control.dirty)
        .toEqual(true, `Expected control to be dirty after value was changed by user.`);
    });

    it('should not set the control to dirty when the value changes programmatically', () => {
      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to start out pristine.`);

      fixture.componentInstance.control.setValue('pizza-1');

      expect(fixture.componentInstance.control.dirty)
        .toEqual(false, `Expected control to stay pristine after programmatic change.`);
    });


    it('should set an asterisk after the placeholder if the control is required', () => {
      const placeholder =
        fixture.debugElement.query(By.css('.md-select-placeholder')).nativeElement;
      const initialContent =  getComputedStyle(placeholder, '::after').getPropertyValue('content');

      // must support both default cases to work in all browsers in Saucelabs
      expect(initialContent === 'none' || initialContent === '')
        .toBe(true, `Expected placeholder not to have an asterisk, as control was not required.`);

      fixture.componentInstance.isRequired = true;
      fixture.detectChanges();
      expect(getComputedStyle(placeholder, '::after').getPropertyValue('content'))
        .toContain('*', `Expected placeholder to have an asterisk, as control was required.`);
    });

  });

  describe('disabled behavior', () => {

    it('should disable itself when control is disabled programmatically', () => {
      const fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      fixture.componentInstance.control.disable();
      fixture.detectChanges();
      let trigger =
        fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
      expect(getComputedStyle(trigger).getPropertyValue('cursor'))
        .toEqual('default', `Expected cursor to be default arrow on disabled control.`);

      trigger.click();
      fixture.detectChanges();

      expect(overlayContainerElement.textContent)
        .toEqual('', `Expected select panel to stay closed.`);
      expect(fixture.componentInstance.select.panelOpen)
        .toBe(false, `Expected select panelOpen property to stay false.`);

      fixture.componentInstance.control.enable();
      fixture.detectChanges();
      expect(getComputedStyle(trigger).getPropertyValue('cursor'))
        .toEqual('pointer', `Expected cursor to be a pointer on enabled control.`);

      trigger.click();
      fixture.detectChanges();

      expect(overlayContainerElement.textContent)
        .toContain('Steak', `Expected select panel to open normally on re-enabled control`);
      expect(fixture.componentInstance.select.panelOpen)
        .toBe(true, `Expected select panelOpen property to become true.`);
    });

    it('should disable itself when control is disabled using the property', async(() => {
      const fixture = TestBed.createComponent(NgModelSelect);
      fixture.detectChanges();

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let trigger =
          fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
        expect(getComputedStyle(trigger).getPropertyValue('cursor'))
          .toEqual('default', `Expected cursor to be default arrow on disabled control.`);

        trigger.click();
        fixture.detectChanges();

        expect(overlayContainerElement.textContent)
          .toEqual('', `Expected select panel to stay closed.`);
        expect(fixture.componentInstance.select.panelOpen)
          .toBe(false, `Expected select panelOpen property to stay false.`);

        fixture.componentInstance.isDisabled = false;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(getComputedStyle(trigger).getPropertyValue('cursor'))
            .toEqual('pointer', `Expected cursor to be a pointer on enabled control.`);

          trigger.click();
          fixture.detectChanges();

          expect(overlayContainerElement.textContent)
            .toContain('Steak', `Expected select panel to open normally on re-enabled control`);
          expect(fixture.componentInstance.select.panelOpen)
            .toBe(true, `Expected select panelOpen property to become true.`);
        });
      });
    }));

  });

  describe('animations', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();

      trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
    });

      it('should float the placeholder when the panel is open', () => {
        expect(fixture.componentInstance.select._getPlaceholderState()).toEqual('normal');

        trigger.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.select._getPlaceholderState()).toEqual('floating-ltr');

        const backdrop =
          overlayContainerElement.querySelector('.md-overlay-backdrop') as HTMLElement;
        backdrop.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.select._getPlaceholderState()).toEqual('normal');
      });

      it('should float the placeholder when there is a selection', () => {
        trigger.click();
        fixture.detectChanges();

        const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
        option.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.select._getPlaceholderState()).toEqual('floating-ltr');
      });

      it('should use the floating-rtl state when the dir is rtl', () => {
        dir.value = 'rtl';

        trigger.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.select._getPlaceholderState()).toEqual('floating-rtl');
      });

      it('should use the ltr panel state when the dir is ltr', () => {
        dir.value = 'ltr';

        trigger.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.select._getPanelState()).toEqual('top-ltr');
      });

      it('should use the rtl panel state when the dir is rtl', () => {
        dir.value = 'rtl';

        trigger.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.select._getPanelState()).toEqual('top-rtl');
      });

  });

  describe('positioning', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
    });

    it('should open below the trigger if the panel will fit', () => {
      trigger.click();
      fixture.detectChanges();

      const overlayPane = overlayContainerElement.children[0] as HTMLElement;
      const overlayRect = overlayPane.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      // when the select panel opens below the trigger, the tops of the trigger and the overlay
      // should be aligned.
      expect(overlayRect.top.toFixed(2))
          .toEqual(triggerRect.top.toFixed(2), `Expected panel to open below by default.`);

      // animation should match the position
      expect(fixture.componentInstance.select._getPanelState())
          .toEqual('top-ltr', `Expected panel animation values to match the position.`);
      expect(fixture.componentInstance.select._transformOrigin)
          .toBe('top', `Expected panel animation to originate at the top.`);
    });

    it('should open above the trigger if there is not space below for the panel', () => {
      // Push trigger to the bottom part of viewport, so it doesn't have space to open
      // in its default position below the trigger.
      trigger.style.position = 'relative';
      trigger.style.top = '650px';

      trigger.click();
      fixture.detectChanges();

      const overlayPane = overlayContainerElement.children[0] as HTMLElement;
      const overlayRect = overlayPane.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      // In "above" position, the bottom edges of the overlay and the origin are aligned.
      // To find the overlay top, subtract the panel height from the origin's bottom edge.
      const expectedTop = triggerRect.bottom - overlayRect.height;
      expect(overlayRect.top.toFixed(2))
          .toEqual(expectedTop.toFixed(2),
              `Expected panel to open above the trigger if below wouldn't fit.`);

      // animation should match the position
      expect(fixture.componentInstance.select._getPanelState())
          .toEqual('bottom-ltr', `Expected panel animation values to match the position.`);
      expect(fixture.componentInstance.select._transformOrigin)
          .toBe('bottom', `Expected panel animation to originate at the bottom.`);
    });

  });

  describe('accessibility', () => {
    let fixture: ComponentFixture<BasicSelect>;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();
    });

    describe('for select', () => {
      let select: HTMLElement;

      beforeEach(() => {
        select = fixture.debugElement.query(By.css('md-select')).nativeElement;
      });

      it('should set the role of the select to listbox', () => {
        expect(select.getAttribute('role')).toEqual('listbox');
      });

      it('should set the aria label of the select to the placeholder', () => {
        expect(select.getAttribute('aria-label')).toEqual('Food');
      });

      it('should set the tabindex of the select to 0', () => {
        expect(select.getAttribute('tabindex')).toEqual('0');
      });

      it('should set aria-required for required selects', () => {
        expect(select.getAttribute('aria-required'))
          .toEqual('false', `Expected aria-required attr to be false for normal selects.`);

        fixture.componentInstance.isRequired = true;
        fixture.detectChanges();

        expect(select.getAttribute('aria-required'))
          .toEqual('true', `Expected aria-required attr to be true for required selects.`);
      });

      it('should set aria-invalid for selects that are invalid', () => {
        expect(select.getAttribute('aria-invalid'))
          .toEqual('false', `Expected aria-invalid attr to be false for valid selects.`);

        fixture.componentInstance.isRequired = true;
        fixture.detectChanges();

        expect(select.getAttribute('aria-invalid'))
          .toEqual('true', `Expected aria-invalid attr to be true for invalid selects.`);
      });

      it('should set aria-disabled for disabled selects', () => {
        expect(select.getAttribute('aria-disabled')).toEqual('false');

        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        expect(select.getAttribute('aria-disabled')).toEqual('true');
      });

      it('should set the tabindex of the select to -1 if disabled', () => {
        fixture.componentInstance.control.disable();
        fixture.detectChanges();
        expect(select.getAttribute('tabindex')).toEqual('-1');

        fixture.componentInstance.control.enable();
        fixture.detectChanges();
        expect(select.getAttribute('tabindex')).toEqual('0');
      });


    });

    describe('for options', () => {
      let trigger: HTMLElement;
      let options: NodeListOf<HTMLElement>;

      beforeEach(() => {
        trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
        trigger.click();
        fixture.detectChanges();

        options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      });

      it('should set the role of md-option to option', () => {
        expect(options[0].getAttribute('role')).toEqual('option');
        expect(options[1].getAttribute('role')).toEqual('option');
        expect(options[2].getAttribute('role')).toEqual('option');
      });

      it('should set aria-selected on each option', () => {
        expect(options[0].getAttribute('aria-selected')).toEqual('false');
        expect(options[1].getAttribute('aria-selected')).toEqual('false');
        expect(options[2].getAttribute('aria-selected')).toEqual('false');

        options[1].click();
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        expect(options[0].getAttribute('aria-selected')).toEqual('false');
        expect(options[1].getAttribute('aria-selected')).toEqual('true');
        expect(options[2].getAttribute('aria-selected')).toEqual('false');
      });

      it('should set the tabindex of each option according to disabled state', () => {
        expect(options[0].getAttribute('tabindex')).toEqual('0');
        expect(options[1].getAttribute('tabindex')).toEqual('0');
        expect(options[2].getAttribute('tabindex')).toEqual('-1');
      });

      it('should set aria-disabled for disabled options', () => {
        expect(options[0].getAttribute('aria-disabled')).toEqual('false');
        expect(options[1].getAttribute('aria-disabled')).toEqual('false');
        expect(options[2].getAttribute('aria-disabled')).toEqual('true');

        fixture.componentInstance.foods[2]['disabled'] = false;
        fixture.detectChanges();

        expect(options[0].getAttribute('aria-disabled')).toEqual('false');
        expect(options[1].getAttribute('aria-disabled')).toEqual('false');
        expect(options[2].getAttribute('aria-disabled')).toEqual('false');
      });

    });

  });

});

@Component({
  selector: 'basic-select',
  template: `
    <md-select placeholder="Food" [formControl]="control" [required]="isRequired">
      <md-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
        {{ food.viewValue }}
      </md-option>
    </md-select>
  `
})
class BasicSelect {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
  ];
  control = new FormControl();
  isRequired: boolean;

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;
}

@Component({
  selector: 'ng-model-select',
  template: `
    <md-select placeholder="Food" ngModel [disabled]="isDisabled">
      <md-option *ngFor="let food of foods" [value]="food.value">{{ food.viewValue }}</md-option>
    </md-select>
  `
})
class NgModelSelect {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  isDisabled: boolean;

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;
}


/**
 * TODO: Move this to core testing utility until Angular has event faking
 * support.
 *
 * Dispatches an event from an element.
 * @param eventName Name of the event
 * @param element The element from which the event will be dispatched.
 */
function dispatchEvent(eventName: string, element: HTMLElement): void {
  let event  = document.createEvent('Event');
  event.initEvent(eventName, true, true);
  element.dispatchEvent(event);
}

class FakeViewportRuler {
  getViewportRect() {
    return {
      left: 0, top: 0, width: 1014, height: 686, bottom: 686, right: 1014
    };
  }

  getViewportScrollPosition() {
    return {top: 0, left: 0};
  }
}
