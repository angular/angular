import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {Component, OnDestroy, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdAutocompleteModule, MdAutocompleteTrigger} from './index';
import {OverlayContainer} from '../core/overlay/overlay-container';
import {MdInputModule} from '../input/index';
import {Dir, LayoutDirection} from '../core/rtl/dir';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

describe('MdAutocomplete', () => {
  let overlayContainerElement: HTMLElement;
  let dir: LayoutDirection;

  beforeEach(async(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [
          MdAutocompleteModule.forRoot(), MdInputModule.forRoot(), ReactiveFormsModule
      ],
      declarations: [SimpleAutocomplete],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          document.body.appendChild(overlayContainerElement);

          // remove body padding to keep consistent cross-browser
          document.body.style.padding = '0';
          document.body.style.margin = '0';

          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return {value: dir};
        }},
      ]
    });

    TestBed.compileComponents();
  }));

  describe('panel toggling', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should open the panel when the input is focused', () => {
      expect(fixture.componentInstance.trigger.panelOpen).toBe(false);
      dispatchEvent('focus', input);
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to read open when input is focused.`);
      expect(overlayContainerElement.textContent)
          .toContain('Alabama', `Expected panel to display when input is focused.`);
      expect(overlayContainerElement.textContent)
          .toContain('California', `Expected panel to display when input is focused.`);
    });

    it('should open the panel programmatically', () => {
      expect(fixture.componentInstance.trigger.panelOpen).toBe(false);
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
          .toBe(true, `Expected panel state to read open when opened programmatically.`);
      expect(overlayContainerElement.textContent)
          .toContain('Alabama', `Expected panel to display when opened programmatically.`);
      expect(overlayContainerElement.textContent)
          .toContain('California', `Expected panel to display when opened programmatically.`);
    });

    it('should close the panel when a click occurs outside it', async(() => {
      dispatchEvent('focus', input);
      fixture.detectChanges();

      const backdrop =
          overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected clicking outside the panel to set its state to closed.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected clicking outside the panel to close the panel.`);
      });
    }));

    it('should close the panel when an option is clicked', async(() => {
      dispatchEvent('focus', input);
      fixture.detectChanges();

      const option = overlayContainerElement.querySelector('md-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected clicking an option to set the panel state to closed.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected clicking an option to close the panel.`);
      });
    }));

    it('should close the panel when a newly filtered option is clicked', async(() => {
      dispatchEvent('focus', input);
      fixture.detectChanges();

      // Filter down the option list to a subset of original options ('Alabama', 'California')
      input.value = 'al';
      dispatchEvent('input', input);
      fixture.detectChanges();

      let options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[0].click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected clicking a filtered option to set the panel state to closed.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected clicking a filtered option to close the panel.`);

        dispatchEvent('focus', input);
        fixture.detectChanges();

        // Changing value from 'Alabama' to 'al' to re-populate the option list,
        // ensuring that 'California' is created new.
        input.value = 'al';
        dispatchEvent('input', input);
        fixture.detectChanges();

        options =
            overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
        options[1].click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(fixture.componentInstance.trigger.panelOpen)
              .toBe(false, `Expected clicking a new option to set the panel state to closed.`);
          expect(overlayContainerElement.textContent)
              .toEqual('', `Expected clicking a new option to close the panel.`);
        });

      });
    }));

    it('should close the panel programmatically', async(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.trigger.panelOpen)
            .toBe(false, `Expected closing programmatically to set the panel state to closed.`);
        expect(overlayContainerElement.textContent)
            .toEqual('', `Expected closing programmatically to close the panel.`);
      });
    }));

  });

  it('should have the correct text direction in RTL', () => {
    dir = 'rtl';

    const fixture = TestBed.createComponent(SimpleAutocomplete);
    fixture.detectChanges();

    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane');
    expect(overlayPane.getAttribute('dir')).toEqual('rtl');

  });

  describe('forms integration', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('should fill the text field when an option is selected', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(input.value)
          .toContain('California', `Expected text field to be filled with selected value.`);
    });

    it('should mark the autocomplete control as dirty when an option is selected', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to start out pristine.`);

      const options =
          overlayContainerElement.querySelectorAll('md-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(true, `Expected control to become dirty when an option was selected.`);
    });

    it('should not mark the control dirty when the value is set programmatically', () => {
      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to start out pristine.`);

      fixture.componentInstance.stateCtrl.setValue('AL');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
          .toBe(false, `Expected control to stay pristine if value is set programmatically.`);
    });

  });

});

@Component({
  template: `
    <md-input-container>
      <input mdInput placeholder="State" [mdAutocomplete]="auto" [formControl]="stateCtrl">
    </md-input-container>
  
    <md-autocomplete #auto="mdAutocomplete">
      <md-option *ngFor="let state of filteredStates" [value]="state.name">
        {{ state.name }} ({{ state.code }}) 
      </md-option>
    </md-autocomplete>
  `
})
class SimpleAutocomplete implements OnDestroy {
  stateCtrl = new FormControl();
  filteredStates: any[];
  valueSub: Subscription;

  @ViewChild(MdAutocompleteTrigger) trigger: MdAutocompleteTrigger;

  states = [
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ];

  constructor() {
    this.filteredStates = this.states;
    this.valueSub = this.stateCtrl.valueChanges.subscribe(val => {
      this.filteredStates = val ? this.states.filter((s) => s.name.match(new RegExp(val, 'gi')))
                                : this.states;
    });
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }

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


