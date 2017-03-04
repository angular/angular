import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MdTabsModule} from '../index';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ViewportRuler} from '../../core/overlay/position/viewport-ruler';
import {FakeViewportRuler} from '../../core/overlay/position/fake-viewport-ruler';
import {dispatchMouseEvent} from '../../core/testing/dispatch-events';


describe('MdTabNavBar', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTabsModule.forRoot()],
      declarations: [
        SimpleTabNavBarTestApp,
        TabLinkWithNgIf,
      ],
      providers: [
        {provide: ViewportRuler, useClass: FakeViewportRuler},
      ]
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

  it('should clean up the ripple event handlers on destroy', () => {
    let fixture: ComponentFixture<TabLinkWithNgIf> = TestBed.createComponent(TabLinkWithNgIf);
    fixture.detectChanges();

    let link = fixture.debugElement.nativeElement.querySelector('.mat-tab-link');

    fixture.componentInstance.isDestroyed = true;
    fixture.detectChanges();

    dispatchMouseEvent(link, 'mousedown');

    expect(link.querySelector('.mat-ripple-element'))
      .toBeFalsy('Expected no ripple to be created when ripple target is destroyed.');
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

@Component({
  template: `
    <nav md-tab-nav-bar>
      <a md-tab-link *ngIf="!isDestroyed">Link</a>
    </nav>
  `
})
class TabLinkWithNgIf {
  isDestroyed = false;
}
