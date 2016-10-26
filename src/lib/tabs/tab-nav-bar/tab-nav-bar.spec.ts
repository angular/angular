import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MdTabsModule} from '../tabs';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';


describe('MdTabNavBar', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTabsModule.forRoot()],
      declarations: [
        SimpleTabNavBarTestApp
      ],
    });

    TestBed.compileComponents();
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    });

    it('should change active index on click', () => {
      let component = fixture.debugElement.componentInstance;

      // select the second link
      let tabLink = fixture.debugElement.queryAll(By.css('a'))[1];
      tabLink.nativeElement.click();
      expect(component.activeIndex).toBe(1);

      // select the third link
      tabLink = fixture.debugElement.queryAll(By.css('a'))[2];
      tabLink.nativeElement.click();
      expect(component.activeIndex).toBe(2);
    });
  });
});

@Component({
  selector: 'test-app',
  template: `
    <nav md-tab-nav-bar>
      <a md-tab-link [active]="activeIndex === 0" (click)="activeIndex = 0">Tab One</a>
      <a md-tab-link [active]="activeIndex === 1" (click)="activeIndex = 1">Tab Two</a>
      <a md-tab-link [active]="activeIndex === 2" (click)="activeIndex = 2">Tab Three</a>
    </nav>
  `
})
class SimpleTabNavBarTestApp {
  activeIndex = 0;
}
