import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about.component';
import { HighlightDirective } from '../shared/highlight.directive';

let fixture: ComponentFixture<AboutComponent>;

describe('AboutComponent (highlightDirective)', () => {
  // #docregion tests
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [ AboutComponent, HighlightDirective ],
      schemas:      [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .createComponent(AboutComponent);
    fixture.detectChanges(); // initial binding
  });

  it('should have skyblue <h2>', () => {
    const h2: HTMLElement = fixture.nativeElement.querySelector('h2');
    const bgColor = h2.style.backgroundColor;
    expect(bgColor).toBe('skyblue');
  });
  // #enddocregion tests
});
