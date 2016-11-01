import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Component, DebugElement, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MdSelectModule} from './index';
import {OverlayContainer} from '../core/overlay/overlay-container';
import {MdSelect} from './select';
import {MdOption} from './option';
import {Dir} from '../core/rtl/dir';

describe('MdSelect', () => {
  let overlayContainerElement: HTMLElement;
  let dir: {value: string};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSelectModule.forRoot()],
      declarations: [BasicSelect],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return dir = { value: 'ltr' };
        }}
      ]
    });

    TestBed.compileComponents();
  }));

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
      fixture.componentInstance.foods.push({viewValue: 'Pasta'});
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
        expect(fixture.componentInstance.select._getPanelState()).toEqual('showing-ltr');
      });

      it('should use the rtl panel state when the dir is rtl', () => {
        dir.value = 'rtl';

        trigger.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.select._getPanelState()).toEqual('showing-rtl');
      });

  });

  describe('accessibility', () => {
    let fixture: ComponentFixture<BasicSelect>;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicSelect);
      fixture.detectChanges();
    });

    describe('for select', () => {
      let select: DebugElement;

      beforeEach(() => {
        select = fixture.debugElement.query(By.css('md-select'));
      });

      it('should set the role of the select to listbox', () => {
        expect(select.nativeElement.getAttribute('role')).toEqual('listbox');
      });

      it('should set the aria label of the select to the placeholder', () => {
        expect(select.nativeElement.getAttribute('aria-label')).toEqual('Food');
      });

      it('should set the tabindex of the select to 0', () => {
        expect(select.nativeElement.getAttribute('tabindex')).toEqual('0');
      });

    });

    describe('for options', () => {
      let trigger: HTMLElement;

      beforeEach(() => {
        trigger = fixture.debugElement.query(By.css('.md-select-trigger')).nativeElement;
        trigger.click();
        fixture.detectChanges();
      });

      it('should set the role of md-option to option', () => {
        const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
        expect(option.getAttribute('role')).toEqual('option');
      });

      it('should set aria-selected on each option', () => {
        const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
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

      it('should set the tabindex of each option to 0', () => {
        const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        expect(options[0].getAttribute('tabindex')).toEqual('0');
        expect(options[1].getAttribute('tabindex')).toEqual('0');
        expect(options[2].getAttribute('tabindex')).toEqual('0');
      });

    });

  });

});

@Component({
  selector: 'basic-select',
  template: `
    <md-select placeholder="Food">
      <md-option *ngFor="let food of foods">{{ food.viewValue }}</md-option>
    </md-select>
  `
})
class BasicSelect {
  foods = [
    { viewValue: 'Steak' },
    { viewValue: 'Pizza' },
    { viewValue: 'Tacos' },
  ];

  @ViewChild(MdSelect) select: MdSelect;
  @ViewChildren(MdOption) options: QueryList<MdOption>;

}
