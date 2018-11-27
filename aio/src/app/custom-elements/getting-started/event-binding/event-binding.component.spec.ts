import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerModule } from '../container/container.module';
import { EventBindingComponent } from './event-binding.component';
import { createCustomEvent } from '../../../../testing/dom-utils';

describe('Getting Started Event Binding Component', () => {
  let component: EventBindingComponent;
  let fixture: ComponentFixture<EventBindingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ContainerModule ],
      declarations: [ EventBindingComponent ]
    });

    fixture = TestBed.createComponent(EventBindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(window, 'alert');
  });

  it('should update the name property on input change', () => {
    const text = 'Hello Angular';
    const compiled = fixture.debugElement.nativeElement;
    const input: HTMLInputElement = compiled.querySelector('input');


    input.value = text;
    input.dispatchEvent(createCustomEvent(document, 'input', ''));

    fixture.detectChanges();

    expect(component.name).toBe(text);
  });

  it('should display an alert when the button is clicked', () => {
    const compiled = fixture.debugElement.nativeElement;
    const button: HTMLButtonElement = compiled.querySelector('button');

    button.click();

    expect(window.alert).toHaveBeenCalledWith('Hello, Angular!');
  });
});
