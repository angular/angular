// #docregion
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { createNewEvent } from '../../shared/utils';
import { TemplateNameComponent } from './name.component';

// #docregion tests
describe('Template Name Component', () => {
// #enddocregion tests
  let component: TemplateNameComponent;
  let fixture: ComponentFixture<TemplateNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TemplateNameComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

// #docregion tests
  it('should update the value in the control', fakeAsync(() => {
    // update the component instance variable
    component.name = 'Nancy';

    // run change detection
    fixture.detectChanges();

    // advance after change detection cycle
    tick();

    // query the element
    const input = fixture.nativeElement.querySelector('input');

    expect(input.value).toBe('Nancy');
  }));

  it('should update the value of the input field', fakeAsync(() => {
    // update component instance variable
    component.name = 'Nancy';

    // run change detection
    fixture.detectChanges();

    // advance after change detection cycle
    tick();

    // query the element
    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toEqual('Nancy');

    // update the form field value
    input.value = 'Smith';

    // Use utility function to create custom event, then dispatch on the input
    const event = createNewEvent('input');
    input.dispatchEvent(event);

    // advance after change detection cycle
    tick();

    expect(component.name).toEqual('Smith');
  }));
});
// #enddocregion
