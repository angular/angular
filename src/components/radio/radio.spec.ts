import {
  it,
  describe,
  beforeEach,
  beforeEachProviders,
  inject,
  async,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {FORM_DIRECTIVES, NgControl} from '@angular/common';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, DebugElement, provide} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MD_RADIO_DIRECTIVES, MdRadioGroup, MdRadioButton, MdRadioChange} from './radio';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';


describe('MdRadio', () => {
  let builder: TestComponentBuilder;
  let dispatcher: MdUniqueSelectionDispatcher;

  beforeEachProviders(() => [
    provide(MdUniqueSelectionDispatcher, {useFactory: () => {
      dispatcher = new MdUniqueSelectionDispatcher();
      return dispatcher;
    }})
  ]);

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('inside of a group', () => {
    let fixture: ComponentFixture<RadiosInsideRadioGroup>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let radioDebugElements: DebugElement[];
    let radioNativeElements: HTMLElement[];
    let groupInstance: MdRadioGroup;
    let radioInstances: MdRadioButton[];
    let testComponent: RadiosInsideRadioGroup;

    beforeEach(async(() => {
      builder.createAsync(RadiosInsideRadioGroup).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdRadioGroup));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdRadioGroup);

        radioDebugElements = fixture.debugElement.queryAll(By.directive(MdRadioButton));
        radioNativeElements = radioDebugElements.map(debugEl => debugEl.nativeElement);
        radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);
      });
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

      radioNativeElements[0].click();
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

      radioNativeElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
      expect(radioInstances[0].checked).toBe(true);
      expect(radioInstances[1].checked).toBe(false);

      radioNativeElements[1].click();
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

    it('should emit a change event from radio buttons', fakeAsync(() => {
      expect(radioInstances[0].checked).toBe(false);

      let changeSpy = jasmine.createSpy('radio change listener');
      radioInstances[0].change.subscribe(changeSpy);

      radioInstances[0].checked = true;
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      radioInstances[0].checked = false;
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should emit a change event from the radio group', fakeAsync(() => {
      expect(groupInstance.value).toBeFalsy();

      let changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);

      groupInstance.value = 'fire';
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      groupInstance.value = 'water';
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    // TODO(jelbourn): test this in an e2e test with *real* focus, rather than faking
    // a focus / blur event.
    it('should focus individual radio buttons', () => {
      let nativeRadioInput = <HTMLElement> radioNativeElements[0].querySelector('input');

      expect(nativeRadioInput.classList).not.toContain('md-radio-focused');

      dispatchFocusChangeEvent('focus', nativeRadioInput);
      fixture.detectChanges();

      expect(radioNativeElements[0].classList).toContain('md-radio-focused');

      dispatchFocusChangeEvent('blur', nativeRadioInput);
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
  });

  describe('group with ngModel', () => {
    let fixture: ComponentFixture<RadioGroupWithNgModel>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let radioDebugElements: DebugElement[];
    let radioNativeElements: HTMLElement[];
    let groupInstance: MdRadioGroup;
    let radioInstances: MdRadioButton[];
    let testComponent: RadioGroupWithNgModel;
    let groupNgControl: NgControl;

    beforeEach(async(() => {
      builder.createAsync(RadioGroupWithNgModel).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdRadioGroup));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdRadioGroup);
        groupNgControl = groupDebugElement.injector.get(NgControl);

        radioDebugElements = fixture.debugElement.queryAll(By.directive(MdRadioButton));
        radioNativeElements = radioDebugElements.map(debugEl => debugEl.nativeElement);
        radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);
      });
    }));

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

    it('should have the correct ngControl state initially and after interaction', fakeAsync(() => {
      // The control should start off valid, pristine, and untouched.
      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(true);
      expect(groupNgControl.touched).toBe(false);

      // After changing the value programmatically, the control should become dirty (not pristine),
      // but remain untouched.
      radioInstances[1].checked = true;
      fixture.detectChanges();
      tick();

      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(false);
      expect(groupNgControl.touched).toBe(false);

      // After a user interaction occurs (such as a click), the control should remain dirty and
      // now also be touched.
      radioNativeElements[2].click();
      fixture.detectChanges();
      tick();

      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(false);
      expect(groupNgControl.touched).toBe(true);
    }));

    it('should update the ngModel value when selecting a radio button', fakeAsync(() => {
      radioInstances[1].checked = true;
      fixture.detectChanges();

      tick();

      expect(testComponent.modelValue).toBe('chocolate');
    }));
  });

  describe('group with ngModel and change event', () => {
    let fixture: ComponentFixture<RadioGroupWithNgModel>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let radioDebugElements: DebugElement[];
    let radioNativeElements: HTMLElement[];
    let groupInstance: MdRadioGroup;
    let radioInstances: MdRadioButton[];
    let testComponent: RadioGroupWithNgModel;
    let groupNgControl: NgControl;

    beforeEach(async(() => {
      builder.createAsync(RadioGroupWithNgModel).then(f => {
        fixture = f;

        testComponent = fixture.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdRadioGroup));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdRadioGroup);
        groupNgControl = groupDebugElement.injector.get(NgControl);

        radioDebugElements = fixture.debugElement.queryAll(By.directive(MdRadioButton));
        radioNativeElements = radioDebugElements.map(debugEl => debugEl.nativeElement);
        radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);

        fixture.detectChanges();
      });
    }));

    it('should update the model before firing change event', fakeAsync(() => {
      expect(testComponent.modelValue).toBeUndefined();
      expect(testComponent.lastEvent).toBeUndefined();

      groupInstance.value = 'chocolate';
      fixture.detectChanges();

      tick();
      expect(testComponent.modelValue).toBe('chocolate');
      expect(testComponent.lastEvent.value).toBe('chocolate');
    }));
  });

  describe('as standalone', () => {
    let fixture: ComponentFixture<StandaloneRadioButtons>;
    let radioDebugElements: DebugElement[];
    let seasonRadioInstances: MdRadioButton[];
    let weatherRadioInstances: MdRadioButton[];
    let fruitRadioInstances: MdRadioButton[];
    let fruitRadioNativeInputs: HTMLElement[];
    let testComponent: StandaloneRadioButtons;

    beforeEach(async(() => {
      builder.createAsync(StandaloneRadioButtons).then(f => {
        let fruitRadioNativeElements: HTMLElement[];

        fixture = f;
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

        fruitRadioNativeElements = radioDebugElements
            .filter(debugEl => debugEl.componentInstance.name == 'fruit')
            .map(debugEl => debugEl.nativeElement);

        fruitRadioNativeInputs = [];
        for (let element of fruitRadioNativeElements) {
          fruitRadioNativeInputs.push(<HTMLElement> element.querySelector('input'));
        }
      });
    }));

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
  directives: [MD_RADIO_DIRECTIVES],
  template: `
  <md-radio-group [disabled]="isGroupDisabled"
                  [align]="alignment"
                  [value]="groupValue"
                  name="test-name">
    <md-radio-button value="fire">Charmander</md-radio-button>
    <md-radio-button value="water">Squirtle</md-radio-button>
    <md-radio-button value="leaf">Bulbasaur</md-radio-button>
  </md-radio-group>
  `
})
class RadiosInsideRadioGroup {
  alignment: string;
  isGroupDisabled: boolean = false;
  groupValue: string = null;
}


@Component({
  directives: [MD_RADIO_DIRECTIVES],
  template: `
    <md-radio-button name="season" value="spring">Spring</md-radio-button>
    <md-radio-button name="season" value="summer">Summer</md-radio-button>
    <md-radio-button name="season" value="autum">Autumn</md-radio-button>
    
    <md-radio-button name="weather" value="warm">Spring</md-radio-button>
    <md-radio-button name="weather" value="hot">Summer</md-radio-button>
    <md-radio-button name="weather" value="cool">Autumn</md-radio-button>
    
    <span id="xyz">Baby Banana<span>
    <md-radio-button name="fruit" value="banana" aria-label="Banana" aria-labelledby="xyz">
    </md-radio-button>
    <md-radio-button name="fruit" value="raspberry">Raspberry</md-radio-button>
  `
})
class StandaloneRadioButtons { }


@Component({
  directives: [MD_RADIO_DIRECTIVES, FORM_DIRECTIVES],
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

// TODO(jelbourn): remove eveything below when Angular supports faking events.

/**
 * Dispatches a focus change event from an element.
 * @param eventName Name of the event, either 'focus' or 'blur'.
 * @param element The element from which the event will be dispatched.
 */
function dispatchFocusChangeEvent(eventName: string, element: HTMLElement): void {
  let event  = document.createEvent('Event');
  event.initEvent(eventName, true, true);
  element.dispatchEvent(event);
}
