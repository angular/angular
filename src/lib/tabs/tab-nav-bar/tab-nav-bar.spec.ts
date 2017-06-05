import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MdTabsModule} from '../index';
import {MdTabNavBar} from './tab-nav-bar';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ViewportRuler} from '../../core/overlay/position/viewport-ruler';
import {FakeViewportRuler} from '../../core/overlay/position/fake-viewport-ruler';
import {dispatchFakeEvent, dispatchMouseEvent} from '../../core/testing/dispatch-events';
import {Dir, LayoutDirection} from '../../core/rtl/dir';
import {Subject} from 'rxjs/Subject';


describe('MdTabNavBar', () => {
  let dir: LayoutDirection = 'ltr';
  let dirChange = new Subject();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTabsModule],
      declarations: [
        SimpleTabNavBarTestApp,
        TabLinkWithNgIf,
      ],
      providers: [
        {provide: Dir, useFactory: () => {
          return {value: dir,  dirChange: dirChange.asObservable()};
        }},
        {provide: ViewportRuler, useClass: FakeViewportRuler},
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
      fixture.detectChanges();
    });

    it('should change active index on click', () => {
      // select the second link
      let tabLink = fixture.debugElement.queryAll(By.css('a'))[1];
      tabLink.nativeElement.click();
      expect(fixture.componentInstance.activeIndex).toBe(1);

      // select the third link
      tabLink = fixture.debugElement.queryAll(By.css('a'))[2];
      tabLink.nativeElement.click();
      expect(fixture.componentInstance.activeIndex).toBe(2);
    });

    it('should re-align the ink bar when the direction changes', () => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'alignToElement');

      dirChange.next();
      fixture.detectChanges();

      expect(inkBar.alignToElement).toHaveBeenCalled();
    });

    it('should re-align the ink bar when the tabs list change', () => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'alignToElement');

      fixture.componentInstance.tabs = [1, 2, 3, 4];
      fixture.detectChanges();

      expect(inkBar.alignToElement).toHaveBeenCalled();
    });

    it('should re-align the ink bar when the tab labels change the width', done => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      const spy = spyOn(inkBar, 'alignToElement').and.callFake(() => {
        expect(spy.calls.any()).toBe(true);
        done();
      });

      fixture.componentInstance.label = 'label change';
      fixture.detectChanges();

      expect(spy.calls.any()).toBe(false);
    });

    it('should re-align the ink bar when the window is resized', fakeAsync(() => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'alignToElement');

      dispatchFakeEvent(window, 'resize');
      tick(10);
      fixture.detectChanges();

      expect(inkBar.alignToElement).toHaveBeenCalled();
    }));
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
      <a md-tab-link
         *ngFor="let tab of tabs; let index = index"
         [active]="activeIndex === index"
         (click)="activeIndex = index">
        Tab link {{label}}
      </a>
    </nav>
  `
})
class SimpleTabNavBarTestApp {
  @ViewChild(MdTabNavBar) tabNavBar: MdTabNavBar;

  label = '';
  tabs = [0, 1, 2];

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
