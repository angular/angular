import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Component, DebugElement, QueryList, ViewChild, ViewChildren} from '@angular/core';
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
      declarations: [BasicSelect, NgModelSelect, ManySelects, NgIfSelect],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div') as HTMLElement;
          overlayContainerElement.classList.add('cdk-overlay-container');

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

      const backdrop =
          overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

      backdrop.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(overlayContainerElement.textContent).toEqual('');
        expect(fixture.componentInstance.select.panelOpen).toBe(false);
      });
    }));

    it('should set the width of the overlay based on the trigger', async(() => {
      trigger.style.width = '200px';

      fixture.whenStable().then(() => {
        trigger.click();
        fixture.detectChanges();
        const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect(pane.style.minWidth).toBe('200px');
      });
    }));

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
      // must wait for initial writeValue promise to finish
      fixture.whenStable().then(() => {
        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        // must wait for animation to finish
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(fixture.componentInstance.select._keyManager.focusedItemIndex).toEqual(1);
        });
      });
    }));

    it('should select an option that was added after initialization', () => {
      fixture.componentInstance.foods.push({viewValue: 'Potatoes', value: 'potatoes-8'});
      trigger.click();
      fixture.detectChanges();

      const options =
        overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[8].click();
      fixture.detectChanges();

      expect(trigger.textContent).toContain('Potatoes');
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
    });

    it('should take an initial view value with reactive forms', () => {
      fixture.componentInstance.control = new FormControl('pizza-1');
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.md-select-value'));
      expect(value.nativeElement.textContent)
          .toContain('Pizza', `Expected trigger to be populated by the control's initial value.`);

      trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
      trigger.click();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .toContain('md-selected',
              `Expected option with the control's initial value to be selected.`);
    });

    beforeEach(() => {
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

    it('should clear the selection when a nonexistent option value is selected', () => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      fixture.componentInstance.control.setValue('gibberish');
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.md-select-value'));
      expect(value).toBe(null, `Expected trigger to be cleared when option value is not found.`);
      expect(trigger.textContent)
          .not.toContain('Pizza', `Expected trigger to be cleared when option value is not found.`);

      trigger.click();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .not.toContain('md-selected', `Expected option with the old value not to be selected.`);
    });


    it('should clear the selection when the control is reset', () => {
      fixture.componentInstance.control.setValue('pizza-1');
      fixture.detectChanges();

      fixture.componentInstance.control.reset();
      fixture.detectChanges();

      const value = fixture.debugElement.query(By.css('.md-select-value'));
      expect(value).toBe(null, `Expected trigger to be cleared when option value is not found.`);
      expect(trigger.textContent)
          .not.toContain('Pizza', `Expected trigger to be cleared when option value is not found.`);

      trigger.click();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      expect(options[1].classList)
          .not.toContain('md-selected', `Expected option with the old value not to be selected.`);
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
        overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
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

      it('should float the placeholder when the panel is open and unselected', () => {
        expect(fixture.componentInstance.select._placeholderState)
            .toEqual('', 'Expected placeholder to initially have a normal position.');

        trigger.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.select._placeholderState)
            .toEqual('floating-ltr', 'Expected placeholder to animate up to floating position.');

        const backdrop =
          overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
        backdrop.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.select._placeholderState)
            .toEqual('', 'Expected placeholder to animate back down to normal position.');
      });

      it('should float the placeholder without animation when value is set', () => {
        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        const placeholderEl =
            fixture.debugElement.query(By.css('.md-select-placeholder')).nativeElement;

        expect(placeholderEl.classList)
            .toContain('md-floating-placeholder', 'Expected placeholder to display as floating.');
        expect(fixture.componentInstance.select._placeholderState)
            .toEqual('', 'Expected animation state to be empty to avoid animation.');
      });

      it('should use the floating-rtl state when the dir is rtl', () => {
        dir.value = 'rtl';

        trigger.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.select._placeholderState).toEqual('floating-rtl');
      });

  });

  describe('positioning', () => {
    let fixture: ComponentFixture<BasicSelect>;
    let trigger: HTMLElement;
    let select: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
      select = fixture.debugElement.query(By.css('md-select')).nativeElement;
    });

    /**
     * Asserts that the given option is aligned with the trigger.
     * @param index The index of the option.
     */
    function checkTriggerAlignedWithOption(index: number): void {
      const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane');
      const triggerTop = trigger.getBoundingClientRect().top;
      const overlayTop = overlayPane.getBoundingClientRect().top;
      const options = overlayPane.querySelectorAll('md-option');
      const optionTop = options[index].getBoundingClientRect().top;

      // The option text should align with the trigger text. Because each option is 18px
      // larger in height than the trigger, the option needs to be adjusted up 9 pixels.
      expect(optionTop.toFixed(2))
          .toEqual((triggerTop - 9).toFixed(2), `Expected trigger to align with option ${index}.`);

      // For the animation to start at the option's center, its origin must be the distance
      // from the top of the overlay to the option top + half the option height (48/2 = 24).
      const expectedOrigin = optionTop - overlayTop + 24;
      expect(fixture.componentInstance.select._transformOrigin)
          .toContain(`${expectedOrigin}px`,
              `Expected panel animation to originate in the center of option ${index}.`);
    }

    describe('ample space to open', () => {

      beforeEach(() => {
        // these styles are necessary because we are first testing the overlay's position
        // if there is room for it to open to its full extent in either direction.
        select.style.marginTop = '300px';
        select.style.marginLeft = '20px';
        select.style.marginRight = '20px';
      });

      it('should align the first option with the trigger text if no option is selected', () => {
        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .md-select-panel');

        // The panel should be scrolled to 0 because centering the option is not possible.
        expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);

        checkTriggerAlignedWithOption(0);
      });

      it('should align a selected option too high to be centered with the trigger text', () => {
        // Select the second option, because it can't be scrolled any further downward
        fixture.componentInstance.control.setValue('pizza-1');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .md-select-panel');

        // The panel should be scrolled to 0 because centering the option is not possible.
        expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);

        checkTriggerAlignedWithOption(1);
      });

      it('should align a selected option in the middle with the trigger text', () => {
        // Select the fifth option, which has enough space to scroll to the center
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .md-select-panel');

        // The selected option should be scrolled to the center of the panel.
        // This will be its original offset from the scrollTop - half the panel height + half the
        // option height. 4 (index) * 48 (option height) = 192px offset from scrollTop
        // 192 - 256/2 + 48/2 = 88px
        expect(scrollContainer.scrollTop)
            .toEqual(88, `Expected overlay panel to be scrolled to center the selected option.`);

        checkTriggerAlignedWithOption(4);
      });

      it('should align a selected option at the scroll max with the trigger text', () => {
        // Select the last option in the list
        fixture.componentInstance.control.setValue('sushi-7');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .md-select-panel');

        // The selected option should be scrolled to the max scroll position.
        // This will be the height of the scrollContainer - the panel height.
        // 8 options * 48px = 384 scrollContainer height, 384 - 256 = 128px max scroll
        expect(scrollContainer.scrollTop)
            .toEqual(128, `Expected overlay panel to be scrolled to its maximum position.`);

        checkTriggerAlignedWithOption(7);
      });

    });

    describe('limited space to open vertically', () => {

      beforeEach(() => {
        select.style.marginLeft = '20px';
        select.style.marginRight = '20px';
      });

      it('should adjust position of centered option if there is little space above', () => {
        // Push the select to a position with not quite enough space on the top to open
        // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
        select.style.marginTop = '85px';

        // Select an option in the middle of the list
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .md-select-panel');

        // Scroll should adjust by the difference between the top space available (85px + 8px
        // viewport padding = 77px) and the height of the panel above the option (113px).
        // 113px - 77px = 36px difference + original scrollTop 88px = 124px
        expect(scrollContainer.scrollTop)
            .toEqual(124, `Expected panel to adjust scroll position to fit in viewport.`);

        checkTriggerAlignedWithOption(4);
      });

      it('should adjust position of centered option if there is little space below', () => {
        // Push the select to a position with not quite enough space on the bottom to open
        // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
        select.style.marginTop = '600px';

        // Select an option in the middle of the list
        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const scrollContainer = document.querySelector('.cdk-overlay-pane .md-select-panel');

        // Scroll should adjust by the difference between the bottom space available
        // (686px - 600px margin - 30px trigger height = 56px - 8px padding = 48px)
        // and the height of the panel below the option (113px).
        // 113px - 48px = 75px difference. Original scrollTop 88px - 75px = 23px
        expect(scrollContainer.scrollTop)
            .toEqual(23, `Expected panel to adjust scroll position to fit in viewport.`);

        checkTriggerAlignedWithOption(4);
      });

      it('should fall back to "above" positioning if scroll adjustment will not help', () => {
        // Push the select to a position with not enough space on the bottom to open
        select.style.marginTop = '600px';
        fixture.detectChanges();

        // Select an option that cannot be scrolled any farther upward
        fixture.componentInstance.control.setValue('coke-0');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const overlayPane = document.querySelector('.cdk-overlay-pane');
        const triggerBottom = trigger.getBoundingClientRect().bottom;
        const overlayBottom = overlayPane.getBoundingClientRect().bottom;
        const scrollContainer = overlayPane.querySelector('.md-select-panel');

        // Expect no scroll to be attempted
        expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);

        expect(overlayBottom.toFixed(2))
            .toEqual(triggerBottom.toFixed(2),
                `Expected trigger bottom to align with overlay bottom.`);

        expect(fixture.componentInstance.select._transformOrigin)
            .toContain(`bottom`, `Expected panel animation to originate at the bottom.`);
      });

      it('should fall back to "below" positioning if scroll adjustment will not help', () => {
        // Push the select to a position with not enough space on the top to open
        select.style.marginTop = '85px';

        // Select an option that cannot be scrolled any farther downward
        fixture.componentInstance.control.setValue('sushi-7');
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        const overlayPane = document.querySelector('.cdk-overlay-pane');
        const triggerTop = trigger.getBoundingClientRect().top;
        const overlayTop = overlayPane.getBoundingClientRect().top;
        const scrollContainer = overlayPane.querySelector('.md-select-panel');

        // Expect scroll to remain at the max scroll position
        expect(scrollContainer.scrollTop).toEqual(128, `Expected panel to be at max scroll.`);

        expect(overlayTop.toFixed(2))
            .toEqual(triggerTop.toFixed(2), `Expected trigger top to align with overlay top.`);

        expect(fixture.componentInstance.select._transformOrigin)
            .toContain(`top`, `Expected panel animation to originate at the top.`);
      });

    });

    describe('when scrolled', () => {

      // Need to set the scrollTop two different ways to support
      // both Chrome and Firefox.
      function setScrollTop(num: number) {
        document.body.scrollTop = num;
        document.documentElement.scrollTop = num;
      }

      beforeEach(() => {
        // Make the div above the select very tall, so the page will scroll
        fixture.componentInstance.heightAbove = 2000;

        // Give the select enough horizontal space to open
        select.style.marginLeft = '20px';
        select.style.marginRight = '20px';
      });

      afterEach(() => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      });

      it('should align the first option properly when scrolled', () => {
        // Give the select enough space to open
        fixture.componentInstance.heightBelow = 400;
        fixture.detectChanges();

        // Scroll the select into view
        setScrollTop(1700);

        trigger.click();
        fixture.detectChanges();

        checkTriggerAlignedWithOption(0);
      });


      it('should align a centered option properly when scrolled', () => {
        // Give the select enough space to open
        fixture.componentInstance.heightBelow = 400;
        fixture.detectChanges();

        fixture.componentInstance.control.setValue('chips-4');
        fixture.detectChanges();

        // Scroll the select into view
        setScrollTop(1700);

        trigger.click();
        fixture.detectChanges();

        checkTriggerAlignedWithOption(4);
      });

      it('should fall back to "above" positioning properly when scrolled', () => {
        // Give the select insufficient space to open below the trigger
        fixture.componentInstance.heightBelow = 100;
        fixture.detectChanges();

        // Scroll the select into view
        setScrollTop(1400);

        trigger.click();
        fixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane');
        const triggerBottom = trigger.getBoundingClientRect().bottom;
        const overlayBottom = overlayPane.getBoundingClientRect().bottom;

        expect(overlayBottom.toFixed(2))
            .toEqual(triggerBottom.toFixed(2),
                `Expected trigger bottom to align with overlay bottom.`);
      });

      it('should fall back to "below" positioning properly when scrolled', () => {
        // Give plenty of space for the select to open below the trigger
        fixture.componentInstance.heightBelow = 650;
        fixture.detectChanges();

        // Select an option too low in the list to fit in limited space above
        fixture.componentInstance.control.setValue('sushi-7');
        fixture.detectChanges();

        // Scroll the select so that it has insufficient space to open above the trigger
        setScrollTop(1950);

        trigger.click();
        fixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane');
        const triggerTop = trigger.getBoundingClientRect().top;
        const overlayTop = overlayPane.getBoundingClientRect().top;

        expect(overlayTop.toFixed(2))
            .toEqual(triggerTop.toFixed(2), `Expected trigger top to align with overlay top.`);
      });
    });

    describe('x-axis positioning', () => {

      beforeEach(() => {
        select.style.marginLeft = '20px';
        select.style.marginRight = '20px';
      });

      it('should align the trigger and the selected option on the x-axis in ltr', () => {
        trigger.click();
        fixture.detectChanges();

        const triggerLeft = trigger.getBoundingClientRect().left;
        const firstOptionLeft =
            document.querySelector('.cdk-overlay-pane md-option').getBoundingClientRect().left;

        // Each option is 32px wider than the trigger, so it must be adjusted 16px
        // to ensure the text overlaps correctly.
        expect(firstOptionLeft.toFixed(2))
            .toEqual((triggerLeft - 16).toFixed(2),
                `Expected trigger to align with the selected option on the x-axis in LTR.`);
      });

      it('should align the trigger and the selected option on the x-axis in rtl', () => {
        dir.value = 'rtl';

        trigger.click();
        fixture.detectChanges();

        const triggerRight = trigger.getBoundingClientRect().right;
        const firstOptionRight =
            document.querySelector('.cdk-overlay-pane md-option').getBoundingClientRect().right;

        // Each option is 32px wider than the trigger, so it must be adjusted 16px
        // to ensure the text overlaps correctly.
        expect(firstOptionRight.toFixed(2))
            .toEqual((triggerRight + 16).toFixed(2),
                `Expected trigger to align with the selected option on the x-axis in RTL.`);
      });
    });

  });

  describe('accessibility', () => {

    describe('for select', () => {
      let fixture: ComponentFixture<BasicSelect>;
      let select: HTMLElement;

      beforeEach(() => {
        fixture = TestBed.createComponent(BasicSelect);
        fixture.detectChanges();
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
      let fixture: ComponentFixture<BasicSelect>;
      let trigger: HTMLElement;
      let options: NodeListOf<HTMLElement>;

      beforeEach(() => {
        fixture = TestBed.createComponent(BasicSelect);
        fixture.detectChanges();
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

    describe('aria-owns', () => {
      let fixture: ComponentFixture<ManySelects>;
      let triggers: DebugElement[];
      let options: NodeListOf<HTMLElement>;

      beforeEach(() => {
        fixture = TestBed.createComponent(ManySelects);
        fixture.detectChanges();
        triggers = fixture.debugElement.queryAll(By.css('.md-select-trigger'));

        triggers[0].nativeElement.click();
        fixture.detectChanges();

        options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      });

      it('should set aria-owns properly', async(() => {
        const selects = fixture.debugElement.queryAll(By.css('md-select'));

        expect(selects[0].nativeElement.getAttribute('aria-owns'))
            .toContain(options[0].id, `Expected aria-owns to contain IDs of its child options.`);
        expect(selects[0].nativeElement.getAttribute('aria-owns'))
            .toContain(options[1].id, `Expected aria-owns to contain IDs of its child options.`);

        const backdrop =
            overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
        backdrop.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          triggers[1].nativeElement.click();

          fixture.detectChanges();
          options =
              overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
          expect(selects[1].nativeElement.getAttribute('aria-owns'))
              .toContain(options[0].id, `Expected aria-owns to contain IDs of its child options.`);
          expect(selects[1].nativeElement.getAttribute('aria-owns'))
              .toContain(options[1].id, `Expected aria-owns to contain IDs of its child options.`);
        });

      }));

      it('should set the option id properly', async(() => {
        let firstOptionID = options[0].id;

        expect(options[0].id)
            .toContain('md-select-option', `Expected option ID to have the correct prefix.`);
        expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);

        const backdrop =
            overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
        backdrop.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          triggers[1].nativeElement.click();

          fixture.detectChanges();
          options =
              overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
          expect(options[0].id)
              .toContain('md-select-option', `Expected option ID to have the correct prefix.`);
          expect(options[0].id).not.toEqual(firstOptionID, `Expected option IDs to be unique.`);
          expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);
        });

      }));

    });

  });

  describe('special cases', () => {

    it('should handle nesting in an ngIf', async(() => {
      const fixture = TestBed.createComponent(NgIfSelect);
      fixture.detectChanges();

      fixture.componentInstance.isShowing = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
      trigger.style.width = '300px';

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const value = fixture.debugElement.query(By.css('.md-select-value'));
        expect(value.nativeElement.textContent)
            .toContain('Pizza', `Expected trigger to be populated by the control's initial value.`);

        trigger.click();
        fixture.detectChanges();

        const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect(pane.style.minWidth).toEqual('300px');

        expect(fixture.componentInstance.select.panelOpen).toBe(true);
        expect(overlayContainerElement.textContent).toContain('Steak');
        expect(overlayContainerElement.textContent).toContain('Pizza');
        expect(overlayContainerElement.textContent).toContain('Tacos');
      });
    }));

  });

});

@Component({
  selector: 'basic-select',
  template: `
    <div [style.height.px]="heightAbove"></div>
    <md-select placeholder="Food" [formControl]="control" [required]="isRequired">
      <md-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
        {{ food.viewValue }}
      </md-option>
    </md-select>
    <div [style.height.px]="heightBelow"></div>
  `
})
class BasicSelect {
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
    { value: 'sandwich-3', viewValue: 'Sandwich' },
    { value: 'chips-4', viewValue: 'Chips' },
    { value: 'eggs-5', viewValue: 'Eggs' },
    { value: 'pasta-6', viewValue: 'Pasta' },
    { value: 'sushi-7', viewValue: 'Sushi' },
  ];
  control = new FormControl();
  isRequired: boolean;
  heightAbove = 0;
  heightBelow = 0;

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

@Component({
  selector: 'many-selects',
  template: `
    <md-select placeholder="First">
      <md-option value="one">one</md-option>
      <md-option value="two">two</md-option>
    </md-select>
    <md-select placeholder="Second">
      <md-option value="three">three</md-option>
      <md-option value="four">four</md-option>
    </md-select>
  `
})
class ManySelects {}

@Component({
  selector: 'ng-if-select',
  template: `
    <div *ngIf="isShowing">
      <md-select placeholder="Food I want to eat right now" [formControl]="control">
        <md-option *ngFor="let food of foods" [value]="food.value">
          {{ food.viewValue }}
        </md-option>
      </md-select>
    </div>
  `

})
class NgIfSelect {
  isShowing = false;
  foods: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos'}
  ];
  control = new FormControl('pizza-1');

  @ViewChild(MdSelect) select: MdSelect;
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
