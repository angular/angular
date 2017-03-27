import { NO_ERRORS_SCHEMA }          from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By }                        from '@angular/platform-browser';

import { AboutComponent }     from './about.component';
import { HighlightDirective } from './shared/highlight.directive';

let fixture: ComponentFixture<AboutComponent>;

describe('AboutComponent (highlightDirective)', () => {
  // #docregion tests
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [ AboutComponent, HighlightDirective],
      schemas:      [ NO_ERRORS_SCHEMA ]
    })
    .createComponent(AboutComponent);
    fixture.detectChanges(); // initial binding
  });

  it('should have skyblue <h2>', () => {
    const de = fixture.debugElement.query(By.css('h2'));
    const bgColor = de.nativeElement.style.backgroundColor;
    expect(bgColor).toBe('skyblue');
  });
  // #enddocregion tests
});
