import {provideHttpClient} from '@angular/common/http';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {UserService} from '../model';
import {TwainService} from '../twain/twain.service';
import {AboutComponent} from './about.component';
let fixture;
describe('AboutComponent (highlightDirective)', () => {
  // #docregion tests
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideHttpClient(), TwainService, UserService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).createComponent(AboutComponent);
    fixture.detectChanges(); // initial binding
  });
  it('should have skyblue <h2>', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    const bgColor = h2.style.backgroundColor;
    expect(bgColor).toBe('skyblue');
  });
  // #enddocregion tests
});
//# sourceMappingURL=about.component.spec.js.map
