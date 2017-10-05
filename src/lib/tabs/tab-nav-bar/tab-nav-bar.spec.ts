import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent, dispatchMouseEvent} from '@angular/cdk/testing';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {Subject} from 'rxjs/Subject';
import {MatTabNav, MatTabsModule, MatTabLink} from '../index';


describe('MatTabNavBar', () => {
  let dir: Direction = 'ltr';
  let dirChange = new Subject();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTabsModule],
      declarations: [
        SimpleTabNavBarTestApp,
        TabLinkWithNgIf,
      ],
      providers: [
        {provide: Directionality, useFactory: () => ({
          value: dir,
          change: dirChange.asObservable()
        })},
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

    it('should add the active class if active', () => {
      let tabLink1 = fixture.debugElement.queryAll(By.css('a'))[0];
      let tabLink2 = fixture.debugElement.queryAll(By.css('a'))[1];
      const tabLinkElements = fixture.debugElement.queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      tabLink1.nativeElement.click();
      fixture.detectChanges();
      expect(tabLinkElements[0].classList.contains('mat-tab-label-active')).toBeTruthy();
      expect(tabLinkElements[1].classList.contains('mat-tab-label-active')).toBeFalsy();

      tabLink2.nativeElement.click();
      fixture.detectChanges();
      expect(tabLinkElements[0].classList.contains('mat-tab-label-active')).toBeFalsy();
      expect(tabLinkElements[1].classList.contains('mat-tab-label-active')).toBeTruthy();

    });

    it('should add the disabled class if disabled', () => {
      const tabLinkElements = fixture.debugElement.queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      expect(tabLinkElements.every(tabLinkEl => !tabLinkEl.classList.contains('mat-tab-disabled')))
        .toBe(true, 'Expected every tab link to not have the disabled class initially');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLinkEl => tabLinkEl.classList.contains('mat-tab-disabled')))
        .toBe(true, 'Expected every tab link to have the disabled class if set through binding');
    });

    it('should update aria-disabled if disabled', () => {
      const tabLinkElements = fixture.debugElement.queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      expect(tabLinkElements.every(tabLink => tabLink.getAttribute('aria-disabled') === 'false'))
        .toBe(true, 'Expected aria-disabled to be set to "false" by default.');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLink => tabLink.getAttribute('aria-disabled') === 'true'))
        .toBe(true, 'Expected aria-disabled to be set to "true" if link is disabled.');
    });

    it('should update the disableRipple property on each tab link', () => {
      const tabLinkElements = fixture.debugElement.queryAll(By.directive(MatTabLink))
        .map(tabLinkDebug => tabLinkDebug.componentInstance) as MatTabLink[];

      expect(tabLinkElements.every(tabLink => !tabLink.disableRipple))
        .toBe(true, 'Expected every tab link to have ripples enabled');

      fixture.componentInstance.disableRipple = true;
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLink => tabLink.disableRipple))
        .toBe(true, 'Expected every tab link to have ripples disabled');
    });

    it('should update the tabindex if links are disabled', () => {
      const tabLinkElements = fixture.debugElement.queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      expect(tabLinkElements.every(tabLink => tabLink.tabIndex === 0))
        .toBe(true, 'Expected element to be keyboard focusable by default');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLink => tabLink.tabIndex === -1))
        .toBe(true, 'Expected element to no longer be keyboard focusable if disabled.');
    });

    it('should show ripples for tab links', () => {
      const tabLink = fixture.debugElement.nativeElement.querySelector('.mat-tab-link');

      dispatchMouseEvent(tabLink, 'mousedown');
      dispatchMouseEvent(tabLink, 'mouseup');

      expect(tabLink.querySelectorAll('.mat-ripple-element').length)
        .toBe(1, 'Expected one ripple to show up if user clicks on tab link.');
    });

    it('should be able to disable ripples on a tab link', () => {
      const tabLinkDebug = fixture.debugElement.query(By.css('a'));
      const tabLinkElement = tabLinkDebug.nativeElement;
      const tabLinkInstance = tabLinkDebug.injector.get(MatTabLink);

      tabLinkInstance.disableRipple = true;

      dispatchMouseEvent(tabLinkElement, 'mousedown');
      dispatchMouseEvent(tabLinkElement, 'mouseup');

      expect(tabLinkElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripple to show up if ripples are disabled.');
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
      tick(150);
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
    <nav mat-tab-nav-bar [disableRipple]="disableRipple">
      <a mat-tab-link
         *ngFor="let tab of tabs; let index = index"
         [active]="activeIndex === index"
         [disabled]="disabled"
         (click)="activeIndex = index">
        Tab link {{label}}
      </a>
    </nav>
  `
})
class SimpleTabNavBarTestApp {
  @ViewChild(MatTabNav) tabNavBar: MatTabNav;

  label = '';
  disabled: boolean = false;
  disableRipple: boolean = false;
  tabs = [0, 1, 2];

  activeIndex = 0;
}

@Component({
  template: `
    <nav mat-tab-nav-bar>
      <a mat-tab-link *ngIf="!isDestroyed">Link</a>
    </nav>
  `
})
class TabLinkWithNgIf {
  isDestroyed = false;
}
