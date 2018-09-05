// #docregion
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { ReactiveNameComponent } from './name.component';
import { createNewEvent } from '../../shared/utils';

// #docregion tests
describe('Reactive Name Component', () => {
// #enddocregion tests
  let component: ReactiveNameComponent;
  let fixture: ComponentFixture<ReactiveNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ReactiveNameComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactiveNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

// #docregion tests
  it('should update the value in the control', () => {
    // update the control value
    component.name.setValue('Nancy');

    // query the element
    const input = fixture.nativeElement.querySelector('input');

    // check its value
    expect(input.value).toBe('Nancy');
  });

  it('should update the value of the input field', () => {
    // update the control value
    component.name.setValue('Nancy');

    // query the element
    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toEqual('Nancy');

    // update the form field value
    input.value = 'Smith';

    // Use utility function to create custom event, then dispatch on the input
    const event = createNewEvent('input');
    input.dispatchEvent(event);

    expect(fixture.componentInstance.name.value).toEqual('Smith');
  });
});
// #enddocregion
