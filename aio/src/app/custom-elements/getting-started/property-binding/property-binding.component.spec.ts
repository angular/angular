import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyBindingComponent } from './property-binding.component';
import { ContainerModule } from '../container/container.module';
import { createCustomEvent } from '../../../../testing/dom-utils';

describe('Getting Started Property Binding Component', () => {
  let component: PropertyBindingComponent;
  let fixture: ComponentFixture<PropertyBindingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ContainerModule ],
      declarations: [ PropertyBindingComponent ]
    });

    fixture = TestBed.createComponent(PropertyBindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the image title on input change', () => {
    const text = 'Hello Angular';
    const compiled = fixture.debugElement.nativeElement;
    const input: HTMLInputElement = compiled.querySelector('input');

    input.value = text;
    input.dispatchEvent(createCustomEvent(document, 'input', ''));

    fixture.detectChanges();

    expect(component.imageTitle).toBe(text);
  });

  it('should display the image title', () => {
    const compiled = fixture.debugElement.nativeElement;
    const image: HTMLImageElement = compiled.querySelector('img');

    expect(image.getAttribute('title')).toContain('Angular Logo');
  });

});
