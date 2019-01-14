import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterpolationComponent } from './interpolation.component';
import { ContainerModule } from '../container/container.module';
import { createCustomEvent } from '../../../../testing/dom-utils';

describe('Getting Started Interpolation Component', () => {
  let component: InterpolationComponent;
  let fixture: ComponentFixture<InterpolationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ContainerModule ],
      declarations: [ InterpolationComponent ]
    });

    fixture = TestBed.createComponent(InterpolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should update the siteName property on input change', () => {
    const text = 'Hello Angular';
    const compiled = fixture.debugElement.nativeElement;
    const input: HTMLInputElement = compiled.querySelector('input');

    input.value = text;
    input.dispatchEvent(createCustomEvent(document, 'input', ''));

    fixture.detectChanges();

    expect(component.siteName).toBe(text);
  });

  it('should display the siteName', () => {
    const compiled = fixture.debugElement.nativeElement;
    const header: HTMLHeadingElement = compiled.querySelector('h1');

    expect(header.textContent).toContain('My Store');
  });
});
