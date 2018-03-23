import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectComponent, Option } from './select.component';

const options = [
  { title: 'Option A', value: 'option-a' },
  { title: 'Option B', value: 'option-b' }
];

let host: HostComponent;
let fixture: ComponentFixture<HostComponent>;
let element: DebugElement;

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
  });

  describe('(initially)', () => {
    it('should show the button and no options', () => {
      expect(getButton()).toBeDefined();
      expect(getOptionContainer()).toEqual(null);
    });
  });

  describe('button', () => {
    it('should display the label if provided', () => {
      expect(getButton().textContent!.trim()).toEqual('');
      host.label = 'Label:';
      fixture.detectChanges();
      expect(getButton().textContent!.trim()).toEqual('Label:');
    });

    it('should contain a symbol `<span>` if hasSymbol is true', () => {
      expect(getButton().querySelector('span')).toEqual(null);
      host.showSymbol = true;
      fixture.detectChanges();
      const span = getButton().querySelector('span');
      expect(span).not.toEqual(null);
      expect(span!.className).toContain('symbol');
    });

    it('should display the selected option, if there is one', () => {
      host.showSymbol = true;
      host.selected = options[0];
      fixture.detectChanges();
      expect(getButton().textContent).toContain(options[0].title);
      expect(getButton().querySelector('span')!.className).toContain(options[0].value);
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
  });

  describe('options list', () => {
    beforeEach(() => {
      host.options = options;
      host.showSymbol = true;
      getButton().click(); // ensure the the options are visible
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
      expect(getButton().querySelector('span')!.className).toContain(options[0].value);
    });

    it('should select the current option when enter is pressed', () => {
      const e = new KeyboardEvent('keydown', {bubbles: true, cancelable: true, key: 'Enter'});
      getOptions()[0].dispatchEvent(e);
      fixture.detectChanges();
      expect(host.onChange).toHaveBeenCalledWith({ option: options[0], index: 0 });
      expect(getButton().textContent).toContain(options[0].title);
      expect(getButton().querySelector('span')!.className).toContain(options[0].value);
    });

    it('should select the current option when space is pressed', () => {
      const e = new KeyboardEvent('keydown', {bubbles: true, cancelable: true, key: ' '});
      getOptions()[0].dispatchEvent(e);
      fixture.detectChanges();
      expect(host.onChange).toHaveBeenCalledWith({ option: options[0], index: 0 });
      expect(getButton().textContent).toContain(options[0].title);
      expect(getButton().querySelector('span')!.className).toContain(options[0].value);
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

    it('should hide if the escape button is pressed', () => {
      const e = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' });
      document.dispatchEvent(e);
      fixture.detectChanges();
      expect(getOptionContainer()).toEqual(null);
    });
  });
});



@Component({
  template: `
    <aio-select (change)="onChange($event)"
              [options]="options"
              [selected]="selected"
              [label]="label"
              [showSymbol]="showSymbol">
    </aio-select>`
})
class HostComponent {
  onChange = jasmine.createSpy('onChange');
  options: Option[];
  selected: Option;
  label: string;
  showSymbol: boolean;
}

function getButton(): HTMLButtonElement {
  return element.query(By.css('button')).nativeElement;
}

function getOptionContainer(): HTMLUListElement|null {
  const de = element.query(By.css('ul'));
  return de && de.nativeElement;
}

function getOptions(): HTMLLIElement[] {
  return element.queryAll(By.css('li')).map(de => de.nativeElement);
}
