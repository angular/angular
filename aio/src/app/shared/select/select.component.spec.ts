import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectComponent, Option } from './select.component';

const options = [
  { title: 'Option A', value: 'option-a' },
  { title: 'Option B', value: 'option-b' },
  { title: 'Option C', value: 'option-c' },
];

let host: HostComponent;
let fixture: ComponentFixture<HostComponent>;
let element: DebugElement;
let component: SelectComponent;

describe('SelectComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectComponent, HostComponent ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    element = fixture.debugElement.query(By.directive(SelectComponent));
    component = element.componentInstance;
  });

  describe('(initially)', () => {
    it('should show the button and no options', () => {
      expect(getButton()).toBeDefined();
      expect(getOptionContainer()).toEqual(null);
    });
  });

  describe('button', () => {
    it('should display the label if provided', () => {
      expect(getButton().textContent?.trim()).toEqual('');
      host.label = 'Label:';
      fixture.detectChanges();
      expect(getButton().textContent?.trim()).toEqual('Label:');
    });

    it('should contain a symbol if hasSymbol is true', () => {
      expect(getButtonSymbol()).toEqual(null);
      host.showSymbol = true;
      fixture.detectChanges();
      expect(getButtonSymbol()).not.toEqual(null);
    });

    it('should display the selected option, if there is one', () => {
      host.showSymbol = true;
      host.selected = options[0];
      fixture.detectChanges();
      expect(getButton().textContent).toContain(options[0].title);
      expect(getButtonSymbol()?.className).toContain(options[0].value);
    });

    it('should toggle the visibility of the options list when clicked', () => {
      host.options = options;
      getButton().click();
      fixture.detectChanges();
      expect(getOptionContainer()).not.toEqual(null);
      getButton().click();
      fixture.detectChanges();
      expect(getOptionContainer()).toEqual(null);
    });

    it('should be disabled if the component is disabled', () => {
      host.options = options;
      fixture.detectChanges();
      expect(component.disabled).toBeFalsy();
      expect(getButton().classList).not.toContain('disabled');

      host.disabled = true;
      fixture.detectChanges();
      expect(component.disabled).toBeTruthy();
      expect(getButton().classList).toContain('disabled');
    });

    it('should not toggle the visibility of the options list if disabled', () => {
      host.options = options;
      host.disabled = true;

      fixture.detectChanges();
      getButton().click();
      fixture.detectChanges();
      expect(getOptionContainer()).toEqual(null);
    });
  });

  describe('options list', () => {
    beforeEach(() => {
      host.options = options;
      host.showSymbol = true;
      getButton().click(); // ensure the options are visible
      fixture.detectChanges();
    });

    it('should show the corresponding title of each option', () => {
      getOptions().forEach((li, index) => {
        expect(li.textContent).toContain(options[index].title);
      });
    });

    it('should select the option that is clicked', () => {
      getOptions()[0].click();
      fixture.detectChanges();
      expect(host.onChange).toHaveBeenCalledWith({ option: options[0], index: 0 });
      expect(getButton().textContent).toContain(options[0].title);
      expect(getButtonSymbol()?.className).toContain(options[0].value);
    });

    it('should hide when an option is clicked', () => {
      getOptions()[0].click();
      fixture.detectChanges();
      expect(getOptionContainer()).toEqual(null);
    });

    it('should hide when there is a click that is not on the option list', () => {
      fixture.nativeElement.click();
      fixture.detectChanges();
      expect(getOptionContainer()).toEqual(null);
    });
  });

  describe('keyboard navigation', () => {
    const openOptions = () => {
      component.showOptions = true;
      fixture.detectChanges();
    };

    const pressKey = (key: string) => {
      const debugBtnElement = fixture.debugElement.query(By.css('.form-select-button'));
      debugBtnElement.triggerEventHandler('keydown', { bubbles: true, cancelable: true, key, preventDefault(){} });
      fixture.detectChanges();
    };

    const printKey = (key: string) => key === ' ' ? "' '" : key;

    ['ArrowDown', 'ArrowUp', 'Enter', 'Space', ' '].forEach(key =>
      it(`should open the options list when the ${printKey(key)} key is pressed`, () => {
        expect(getOptionContainer()).toBeFalsy();
        pressKey(key);
        expect(getOptionContainer()).toBeTruthy();
      })
    );

    ['Escape', 'Tab'].forEach(key =>
      it(`should close the options list when the ${printKey(key)} key is pressed`, () => {
        host.options = options;
        openOptions();
        expect(getOptionContainer()).toBeTruthy();
        pressKey(key);
        expect(getOptionContainer()).toBeFalsy();
      })
    );

    ['Enter', 'Space', ' '].forEach(key =>
      it(`should select the current option when the ${printKey(key)} key is pressed`, () => {
        component.currentOptionIdx = 0;
        host.showSymbol = true;
        host.options = options;
        openOptions();
        expect(getButton().textContent).not.toContain(options[0].title);
        expect(getButtonSymbol()?.className).not.toContain(options[0].value);
        pressKey(key);
        expect(host.onChange).toHaveBeenCalledWith({ option: options[0], index: 0 });
        expect(getButton().textContent).toContain(options[0].title);
        expect(getButtonSymbol()?.className).toContain(options[0].value);
      })
    );

    it('should move to the next option when the ArrowDown key is pressed', () => {
      component.currentOptionIdx = 1;
      host.options = options;
      openOptions();
      pressKey('ArrowDown');
      expect(component.currentOptionIdx).toEqual(2);
      expect(getCurrentOption().textContent).toEqual('Option C');
    });

    it('should move to the previous option when the ArrowUp key is pressed', () => {
      component.currentOptionIdx = 1;
      host.options = options;
      openOptions();
      pressKey('ArrowUp');
      expect(component.currentOptionIdx).toEqual(0);
      expect(getCurrentOption().textContent).toEqual('Option A');
    });

    it('should do nothing when the ArrowDown key is pressed and the current option is the last', () => {
      component.currentOptionIdx = 2;
      host.options = options;
      openOptions();
      pressKey('ArrowDown');
      expect(component.currentOptionIdx).toEqual(2);
      expect(getCurrentOption().textContent).toEqual('Option C');
      expect(getOptionContainer()).toBeTruthy();
    });

    it('should do nothing when the ArrowUp key is pressed and the current option is the first', () => {
      component.currentOptionIdx = 0;
      host.options = options;
      openOptions();
      pressKey('ArrowUp');
      expect(component.currentOptionIdx).toEqual(0);
      expect(getCurrentOption().textContent).toEqual('Option A');
      expect(getOptionContainer()).toBeTruthy();
    });
  });
});



@Component({
  template: `
    <aio-select (change)="onChange($event)"
              [options]="options"
              [selected]="selected"
              [label]="label"
              [showSymbol]="showSymbol"
              [disabled]="disabled">
    </aio-select>`
})
class HostComponent {
  onChange = jasmine.createSpy('onChange');
  options: Option[];
  selected: Option;
  label = '';
  showSymbol = false;
  disabled = false;
}

function getButton(): HTMLButtonElement {
  return element.query(By.css('.form-select-button')).nativeElement;
}

function getButtonSymbol(): HTMLElement | null {
  return getButton().querySelector('.symbol');
}

function getOptionContainer(): HTMLUListElement|null {
  const de = element.query(By.css('ul'));
  return de && de.nativeElement;
}

function getOptions(): HTMLLIElement[] {
  return element.queryAll(By.css('li')).map(de => de.nativeElement);
}

function getCurrentOption(): HTMLElement {
  return element.query(By.css('[role=option].current')).nativeElement;
}
