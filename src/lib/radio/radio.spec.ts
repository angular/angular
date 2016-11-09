import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {NgControl, FormsModule} from '@angular/forms';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdRadioGroup, MdRadioButton, MdRadioChange, MdRadioModule} from './radio';


describe('MdRadio', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdRadioModule.forRoot(), FormsModule],
      declarations: [
        RadiosInsideRadioGroup,
        RadioGroupWithNgModel,
        StandaloneRadioButtons,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('inside of a group', () => {
    let fixture: ComponentFixture<RadiosInsideRadioGroup>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let radioDebugElements: DebugElement[];
    let radioNativeElements: HTMLElement[];
    let radioLabelElements: HTMLLabelElement[];
    let groupInstance: MdRadioGroup;
    let radioInstances: MdRadioButton[];
    let testComponent: RadiosInsideRadioGroup;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(RadiosInsideRadioGroup);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MdRadioGroup));
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get(MdRadioGroup);

      radioDebugElements = fixture.debugElement.queryAll(By.directive(MdRadioButton));
      radioNativeElements = radioDebugElements.map(debugEl => debugEl.nativeElement);
      radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);

      radioLabelElements = radioDebugElements
        .map(debugEl => debugEl.query(By.css('label')).nativeElement);
    }));

    it('should set individual radio names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let radio of radioInstances) {
        expect(radio.name).toBe(groupInstance.name);
      }
    });

    it('should disable click interaction when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      radioLabelElements[0].click();
      expect(radioInstances[0].checked).toBe(false);
    });

    it('should set alignment based on the group alignment', () => {
      testComponent.alignment = 'end';
      fixture.detectChanges();

      for (let radio of radioInstances) {
        expect(radio.align).toBe('end');
      }

      testComponent.alignment = 'start';
      fixture.detectChanges();

      for (let radio of radioInstances) {
        expect(radio.align).toBe('start');
      }
    });

    it('should disable each individual radio when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      for (let radio of radioInstances) {
        expect(radio.disabled).toBe(true);
      }
    });

    it('should update the group value when one of the radios changes', () => {
      expect(groupInstance.value).toBeFalsy();

      radioInstances[0].checked = true;
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
    });

    it('should update the group and radios when one of the radios is clicked', () => {
      expect(groupInstance.value).toBeFalsy();

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
      expect(radioInstances[0].checked).toBe(true);
      expect(radioInstances[1].checked).toBe(false);

      radioLabelElements[1].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('water');
      expect(groupInstance.selected).toBe(radioInstances[1]);
      expect(radioInstances[0].checked).toBe(false);
      expect(radioInstances[1].checked).toBe(true);
    });

    it('should check a radio upon interaction with the underlying native radio button', () => {
      let nativeRadioInput = <HTMLElement> radioNativeElements[0].querySelector('input');

      nativeRadioInput.click();
      fixture.detectChanges();

      expect(radioInstances[0].checked).toBe(true);
      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
    });

    it('should emit a change event from radio buttons', () => {
      expect(radioInstances[0].checked).toBe(false);

      let spies = radioInstances
        .map((value, index) => jasmine.createSpy(`onChangeSpy ${index}`));

      spies.forEach((spy, index) => radioInstances[index].change.subscribe(spy));

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(spies[0]).toHaveBeenCalled();

      radioLabelElements[1].click();
      fixture.detectChanges();

      // To match the native radio button behavior, the change event shouldn't
      // be triggered when the radio got unselected.
      expect(spies[0]).toHaveBeenCalledTimes(1);
      expect(spies[1]).toHaveBeenCalledTimes(1);
    });

    it(`should not emit a change event from the radio group when change group value 
        programmatically`, () => {
      expect(groupInstance.value).toBeFalsy();

      let changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledTimes(1);

      groupInstance.value = 'water';
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    // TODO(jelbourn): test this in an e2e test with *real* focus, rather than faking
    // a focus / blur event.
    it('should focus individual radio buttons', () => {
      let nativeRadioInput = <HTMLElement> radioNativeElements[0].querySelector('input');

      expect(nativeRadioInput.classList).not.toContain('md-radio-focused');

      dispatchEvent('focus', nativeRadioInput);
      fixture.detectChanges();

      expect(radioNativeElements[0].classList).toContain('md-radio-focused');

      dispatchEvent('blur', nativeRadioInput);
      fixture.detectChanges();

      expect(radioNativeElements[0].classList).not.toContain('md-radio-focused');
    });

    it('should update the group and radios when updating the group value', () => {
      expect(groupInstance.value).toBeFalsy();

      testComponent.groupValue = 'fire';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
      expect(radioInstances[0].checked).toBe(true);
      expect(radioInstances[1].checked).toBe(false);

      testComponent.groupValue = 'water';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('water');
      expect(groupInstance.selected).toBe(radioInstances[1]);
      expect(radioInstances[0].checked).toBe(false);
      expect(radioInstances[1].checked).toBe(true);
    });

    it('should deselect all of the checkboxes when the group value is cleared', () => {
      radioInstances[0].checked = true;

      expect(groupInstance.value).toBeTruthy();

      groupInstance.value = null;

      expect(radioInstances.every(radio => !radio.checked)).toBe(true);
    });

    it('should not have a ripple on disabled radio buttons', () => {
      let rippleElement = radioNativeElements[0].querySelector('[md-ripple]');
      expect(rippleElement).toBeTruthy('Expected an enabled radio button to have a ripple');

      radioInstances[0].disabled = true;
      fixture.detectChanges();

      rippleElement = radioNativeElements[0].querySelector('[md-ripple]');
      expect(rippleElement).toBeFalsy('Expected a disabled radio button not to have a ripple');
    });

    it('should remove ripple if md-ripple-disabled input is set', async(() => {
      fixture.detectChanges();
      for (let radioNativeElement of radioNativeElements)
      {
        expect(radioNativeElement.querySelectorAll('[md-ripple]').length)
          .toBe(1, 'Expect [md-ripple] in radio buttons');
      }

      testComponent.disableRipple = true;
      fixture.detectChanges();
      for (let radioNativeElement of radioNativeElements)
      {
        expect(radioNativeElement.querySelectorAll('[md-ripple]').length)
          .toBe(0, 'Expect no [md-ripple] in radio buttons');
      }
    }));

    it(`should update the group's selected radio to null when unchecking that radio 
        programmatically`, () => {
      let changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);
      radioInstances[0].checked = true;

      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBeTruthy();

      radioInstances[0].checked = false;

      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBeFalsy();
      expect(radioInstances.every(radio => !radio.checked)).toBe(true);
      expect(groupInstance.selected).toBeNull();
    });

    it('should not fire a change event from the group when a radio checked state changes', () => {
      let changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);
      radioInstances[0].checked = true;

      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBeTruthy();
      expect(groupInstance.value).toBe('fire');

      radioInstances[1].checked = true;

      fixture.detectChanges();

      expect(groupInstance.value).toBe('water');
      expect(changeSpy).not.toHaveBeenCalled();
    });
  });

  describe('group with ngModel', () => {
    let fixture: ComponentFixture<RadioGroupWithNgModel>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let radioDebugElements: DebugElement[];
    let innerRadios: DebugElement[];
    let radioLabelElements: HTMLLabelElement[];
    let groupInstance: MdRadioGroup;
    let radioInstances: MdRadioButton[];
    let testComponent: RadioGroupWithNgModel;
    let groupNgControl: NgControl;

    beforeEach(() => {
      fixture = TestBed.createComponent(RadioGroupWithNgModel);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MdRadioGroup));
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get(MdRadioGroup);
      groupNgControl = groupDebugElement.injector.get(NgControl);

      radioDebugElements = fixture.debugElement.queryAll(By.directive(MdRadioButton));
      radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);
      innerRadios = fixture.debugElement.queryAll(By.css('input[type="radio"]'));

      radioLabelElements = radioDebugElements
        .map(debugEl => debugEl.query(By.css('label')).nativeElement);
    });

    it('should set individual radio names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let radio of radioInstances) {
        expect(radio.name).toBe(groupInstance.name);
      }

      groupInstance.name = 'new name';
      for (let radio of radioInstances) {
        expect(radio.name).toBe(groupInstance.name);
      }
    });

    it('should check the corresponding radio button on group value change', () => {
      expect(groupInstance.value).toBeFalsy();
      for (let radio of radioInstances) {
        expect(radio.checked).toBeFalsy();
      }

      groupInstance.value = 'vanilla';
      for (let radio of radioInstances) {
        expect(radio.checked).toBe(groupInstance.value === radio.value);
      }
      expect(groupInstance.selected.value).toBe(groupInstance.value);
    });

    it('should have the correct control state initially and after interaction', () => {
      // The control should start off valid, pristine, and untouched.
      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(true);
      expect(groupNgControl.touched).toBe(false);

      // After changing the value programmatically, the control should stay pristine
      // but remain untouched.
      radioInstances[1].checked = true;
      fixture.detectChanges();

      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(true);
      expect(groupNgControl.touched).toBe(false);

      // After a user interaction occurs (such as a click), the control should become dirty and
      // now also be touched.
      radioLabelElements[2].click();
      fixture.detectChanges();

      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(false);
      expect(groupNgControl.touched).toBe(true);
    });

    it('should write to the radio button based on ngModel', fakeAsync(() => {
      testComponent.modelValue = 'chocolate';
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(innerRadios[1].nativeElement.checked).toBe(true);
    }));

    it('should update the ngModel value when selecting a radio button', () => {
      dispatchEvent('change', innerRadios[1].nativeElement);
      fixture.detectChanges();
      expect(testComponent.modelValue).toBe('chocolate');
    });

    it('should update the model before firing change event', () => {
      expect(testComponent.modelValue).toBeUndefined();
      expect(testComponent.lastEvent).toBeUndefined();

      dispatchEvent('change', innerRadios[1].nativeElement);
      fixture.detectChanges();
      expect(testComponent.lastEvent.value).toBe('chocolate');

      dispatchEvent('change', innerRadios[0].nativeElement);
      fixture.detectChanges();
      expect(testComponent.lastEvent.value).toBe('vanilla');
    });
  });

  describe('as standalone', () => {
    let fixture: ComponentFixture<StandaloneRadioButtons>;
    let radioDebugElements: DebugElement[];
    let seasonRadioInstances: MdRadioButton[];
    let weatherRadioInstances: MdRadioButton[];
    let fruitRadioInstances: MdRadioButton[];
    let fruitRadioNativeInputs: HTMLElement[];
    let testComponent: StandaloneRadioButtons;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandaloneRadioButtons);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      radioDebugElements = fixture.debugElement.queryAll(By.directive(MdRadioButton));
      seasonRadioInstances = radioDebugElements
          .filter(debugEl => debugEl.componentInstance.name == 'season')
          .map(debugEl => debugEl.componentInstance);
      weatherRadioInstances = radioDebugElements
          .filter(debugEl => debugEl.componentInstance.name == 'weather')
          .map(debugEl => debugEl.componentInstance);
      fruitRadioInstances = radioDebugElements
          .filter(debugEl => debugEl.componentInstance.name == 'fruit')
          .map(debugEl => debugEl.componentInstance);

      let fruitRadioNativeElements = radioDebugElements
          .filter(debugEl => debugEl.componentInstance.name == 'fruit')
          .map(debugEl => debugEl.nativeElement);

      fruitRadioNativeInputs = [];
      for (let element of fruitRadioNativeElements) {
        fruitRadioNativeInputs.push(<HTMLElement> element.querySelector('input'));
      }
    });

    it('should uniquely select radios by a name', () => {
      seasonRadioInstances[0].checked = true;
      weatherRadioInstances[1].checked = true;

      fixture.detectChanges();
      expect(seasonRadioInstances[0].checked).toBe(true);
      expect(seasonRadioInstances[1].checked).toBe(false);
      expect(seasonRadioInstances[2].checked).toBe(false);
      expect(weatherRadioInstances[0].checked).toBe(false);
      expect(weatherRadioInstances[1].checked).toBe(true);
      expect(weatherRadioInstances[2].checked).toBe(false);

      seasonRadioInstances[1].checked = true;
      fixture.detectChanges();
      expect(seasonRadioInstances[0].checked).toBe(false);
      expect(seasonRadioInstances[1].checked).toBe(true);
      expect(seasonRadioInstances[2].checked).toBe(false);
      expect(weatherRadioInstances[0].checked).toBe(false);
      expect(weatherRadioInstances[1].checked).toBe(true);
      expect(weatherRadioInstances[2].checked).toBe(false);

      weatherRadioInstances[2].checked = true;
      expect(seasonRadioInstances[0].checked).toBe(false);
      expect(seasonRadioInstances[1].checked).toBe(true);
      expect(seasonRadioInstances[2].checked).toBe(false);
      expect(weatherRadioInstances[0].checked).toBe(false);
      expect(weatherRadioInstances[1].checked).toBe(false);
      expect(weatherRadioInstances[2].checked).toBe(true);
    });

    it('should add aria-label attribute to the underlying input element if defined', () => {
      expect(fruitRadioNativeInputs[0].getAttribute('aria-label')).toBe('Banana');
    });

    it('should not add aria-label attribute if not defined', () => {
      expect(fruitRadioNativeInputs[1].hasAttribute('aria-label')).toBeFalsy();
    });

    it('should change aria-label attribute if property is changed at runtime', () => {
      expect(fruitRadioNativeInputs[0].getAttribute('aria-label')).toBe('Banana');

      fruitRadioInstances[0].ariaLabel = 'Pineapple';
      fixture.detectChanges();

      expect(fruitRadioNativeInputs[0].getAttribute('aria-label')).toBe('Pineapple');
    });

    it('should add aria-labelledby attribute to the underlying input element if defined', () => {
      expect(fruitRadioNativeInputs[0].getAttribute('aria-labelledby')).toBe('xyz');
    });

    it('should not add aria-labelledby attribute if not defined', () => {
      expect(fruitRadioNativeInputs[1].hasAttribute('aria-labelledby')).toBeFalsy();
    });

    it('should change aria-labelledby attribute if property is changed at runtime', () => {
      expect(fruitRadioNativeInputs[0].getAttribute('aria-labelledby')).toBe('xyz');

      fruitRadioInstances[0].ariaLabelledby = 'uvw';
      fixture.detectChanges();

      expect(fruitRadioNativeInputs[0].getAttribute('aria-labelledby')).toBe('uvw');
    });
  });
});


@Component({
  template: `
  <md-radio-group [disabled]="isGroupDisabled"
                  [align]="alignment"
                  [value]="groupValue"
                  name="test-name">
    <md-radio-button value="fire" [disableRipple]="disableRipple">Charmander</md-radio-button>
    <md-radio-button value="water" [disableRipple]="disableRipple">Squirtle</md-radio-button>
    <md-radio-button value="leaf" [disableRipple]="disableRipple">Bulbasaur</md-radio-button>
  </md-radio-group>
  `
})
class RadiosInsideRadioGroup {
  alignment: string;
  isGroupDisabled: boolean = false;
  groupValue: string = null;
  disableRipple: boolean = false;
}


@Component({
  template: `
    <md-radio-button name="season" value="spring">Spring</md-radio-button>
    <md-radio-button name="season" value="summer">Summer</md-radio-button>
    <md-radio-button name="season" value="autum">Autumn</md-radio-button>
    
    <md-radio-button name="weather" value="warm">Spring</md-radio-button>
    <md-radio-button name="weather" value="hot">Summer</md-radio-button>
    <md-radio-button name="weather" value="cool">Autumn</md-radio-button>
    
    <span id="xyz">Baby Banana</span>
    <md-radio-button name="fruit" value="banana" aria-label="Banana" aria-labelledby="xyz">
    </md-radio-button>
    <md-radio-button name="fruit" value="raspberry">Raspberry</md-radio-button>
  `
})
class StandaloneRadioButtons { }


@Component({
  template: `
  <md-radio-group [(ngModel)]="modelValue" (change)="lastEvent = $event">
    <md-radio-button *ngFor="let option of options" [value]="option.value">
      {{option.label}}
    </md-radio-button>
  </md-radio-group>
  `
})
class RadioGroupWithNgModel {
  modelValue: string;
  options = [
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Strawberry', value: 'strawberry'},
  ];
  lastEvent: MdRadioChange;
}

// TODO(jelbourn): remove everything below when Angular supports faking events.

/**
 * Dispatches an event from an element.
 * @param eventName Name of the event
 * @param element The element from which the event will be dispatched.
 */
function dispatchEvent(eventName: string, element: HTMLElement): void {
  let event  = document.createEvent('Event');
  event.initEvent(eventName, true, true);
  element.dispatchEvent(event);
}
