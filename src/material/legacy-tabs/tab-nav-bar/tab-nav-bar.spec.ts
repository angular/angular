import {SPACE} from '@angular/cdk/keycodes';
import {waitForAsync, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Component, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
} from '../../../cdk/testing/private';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {Subject} from 'rxjs';
import {MatLegacyTabLink, MatLegacyTabNav, MatLegacyTabsModule} from '../index';

describe('MatTabNavBar', () => {
  let dir: Direction = 'ltr';
  let dirChange = new Subject();
  let globalRippleOptions: RippleGlobalOptions;

  beforeEach(waitForAsync(() => {
    globalRippleOptions = {};

    TestBed.configureTestingModule({
      imports: [MatLegacyTabsModule],
      declarations: [
        SimpleTabNavBarTestApp,
        TabLinkWithNgIf,
        TabBarWithoutPanelWithTabIndexBinding,
        TabBarWithoutPanelWithNativeTabindexAttr,
        TabBarWithInactiveTabsOnInit,
        TabBarWithoutPanel,
      ],
      providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useFactory: () => globalRippleOptions},
        {provide: Directionality, useFactory: () => ({value: dir, change: dirChange})},
      ],
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
      const tabLink1 = fixture.debugElement.queryAll(By.css('a'))[0];
      const tabLink2 = fixture.debugElement.queryAll(By.css('a'))[1];
      const tabLinkElements = fixture.debugElement
        .queryAll(By.css('a'))
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
      const tabLinkElements = fixture.debugElement
        .queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      expect(tabLinkElements.every(tabLinkEl => !tabLinkEl.classList.contains('mat-tab-disabled')))
        .withContext('Expected every tab link to not have the disabled class initially')
        .toBe(true);

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLinkEl => tabLinkEl.classList.contains('mat-tab-disabled')))
        .withContext('Expected every tab link to have the disabled class if set through binding')
        .toBe(true);
    });

    it('should update aria-disabled if disabled', () => {
      const tabLinkElements = fixture.debugElement
        .queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      expect(tabLinkElements.every(tabLink => tabLink.getAttribute('aria-disabled') === 'false'))
        .withContext('Expected aria-disabled to be set to "false" by default.')
        .toBe(true);

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLink => tabLink.getAttribute('aria-disabled') === 'true'))
        .withContext('Expected aria-disabled to be set to "true" if link is disabled.')
        .toBe(true);
    });

    it('should update the tabindex if links are disabled', () => {
      const tabLinkElements = fixture.debugElement
        .queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      expect(tabLinkElements.map(tabLink => tabLink.tabIndex))
        .withContext('Expected first element to be keyboard focusable by default')
        .toEqual([0, -1, -1]);

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLink => tabLink.tabIndex === -1))
        .withContext('Expected element to no longer be keyboard focusable if disabled.')
        .toBe(true);
    });

    it('should mark disabled links', () => {
      const tabLinkElement = fixture.debugElement.query(By.css('a'))!.nativeElement;

      expect(tabLinkElement.classList).not.toContain('mat-tab-disabled');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(tabLinkElement.classList).toContain('mat-tab-disabled');
    });

    it('should re-align the ink bar when the direction changes', fakeAsync(() => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'alignToElement');

      dirChange.next();
      tick();
      fixture.detectChanges();

      expect(inkBar.alignToElement).toHaveBeenCalled();
    }));

    it('should re-align the ink bar when the tabs list change', fakeAsync(() => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'alignToElement');

      fixture.componentInstance.tabs = [1, 2, 3, 4];
      fixture.detectChanges();
      tick();

      expect(inkBar.alignToElement).toHaveBeenCalled();
    }));

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

    it('should hide the ink bar when all the links are inactive', () => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'hide');

      fixture.componentInstance.tabLinks.forEach(link => (link.active = false));
      fixture.detectChanges();

      expect(inkBar.hide).toHaveBeenCalled();
    });

    it('should update the focusIndex when a tab receives focus directly', () => {
      const thirdLink = fixture.debugElement.queryAll(By.css('a'))[2];
      dispatchFakeEvent(thirdLink.nativeElement, 'focus');
      fixture.detectChanges();

      expect(fixture.componentInstance.tabNavBar.focusIndex).toBe(2);
    });
  });

  it('should hide the ink bar if no tabs are active on init', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarWithInactiveTabsOnInit);
    fixture.detectChanges();
    tick(20); // Angular turns rAF calls into 16.6ms timeouts in tests.
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mat-ink-bar').style.visibility).toBe('hidden');
  }));

  it('should clean up the ripple event handlers on destroy', () => {
    const fixture: ComponentFixture<TabLinkWithNgIf> = TestBed.createComponent(TabLinkWithNgIf);
    fixture.detectChanges();

    const link = fixture.debugElement.nativeElement.querySelector('.mat-tab-link');

    fixture.componentInstance.isDestroyed = true;
    fixture.detectChanges();

    dispatchMouseEvent(link, 'mousedown');

    expect(link.querySelector('.mat-ripple-element'))
      .withContext('Expected no ripple to be created when ripple target is destroyed.')
      .toBeFalsy();
  });

  it('should select the proper tab, if the tabs come in after init', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    const instance = fixture.componentInstance;

    instance.tabs = [];
    instance.activeIndex = 1;
    fixture.detectChanges();

    expect(instance.tabNavBar.selectedIndex).toBe(-1);

    instance.tabs = [0, 1, 2];
    fixture.detectChanges();

    expect(instance.tabNavBar.selectedIndex).toBe(1);
  });

  it('should have the proper roles', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabBar = fixture.nativeElement.querySelector('.mat-tab-nav-bar')!;
    expect(tabBar.getAttribute('role')).toBe('tablist');

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
    expect(tabLinks[0].getAttribute('role')).toBe('tab');
    expect(tabLinks[1].getAttribute('role')).toBe('tab');
    expect(tabLinks[2].getAttribute('role')).toBe('tab');

    const tabPanel = fixture.nativeElement.querySelector('.mat-tab-nav-panel')!;
    expect(tabPanel.getAttribute('role')).toBe('tabpanel');
  });

  it('should manage tabindex properly', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
    expect(tabLinks[0].tabIndex).toBe(0);
    expect(tabLinks[1].tabIndex).toBe(-1);
    expect(tabLinks[2].tabIndex).toBe(-1);

    tabLinks[1].click();
    fixture.detectChanges();

    expect(tabLinks[0].tabIndex).toBe(-1);
    expect(tabLinks[1].tabIndex).toBe(0);
    expect(tabLinks[2].tabIndex).toBe(-1);
  });

  it('should setup aria-controls properly', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
    expect(tabLinks[0].getAttribute('aria-controls')).toBe('tab-panel');
    expect(tabLinks[1].getAttribute('aria-controls')).toBe('tab-panel');
    expect(tabLinks[2].getAttribute('aria-controls')).toBe('tab-panel');
  });

  it('should not manage aria-current', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
    expect(tabLinks[0].getAttribute('aria-current')).toBe(null);
    expect(tabLinks[1].getAttribute('aria-current')).toBe(null);
    expect(tabLinks[2].getAttribute('aria-current')).toBe(null);
  });

  it('should manage aria-selected properly', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
    expect(tabLinks[0].getAttribute('aria-selected')).toBe('true');
    expect(tabLinks[1].getAttribute('aria-selected')).toBe('false');
    expect(tabLinks[2].getAttribute('aria-selected')).toBe('false');

    tabLinks[1].click();
    fixture.detectChanges();

    expect(tabLinks[0].getAttribute('aria-selected')).toBe('false');
    expect(tabLinks[1].getAttribute('aria-selected')).toBe('true');
    expect(tabLinks[2].getAttribute('aria-selected')).toBe('false');
  });

  it('should activate a link when space is pressed', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
    expect(tabLinks[1].classList.contains('mat-tab-label-active')).toBe(false);

    dispatchKeyboardEvent(tabLinks[1], 'keydown', SPACE);
    fixture.detectChanges();

    expect(tabLinks[1].classList.contains('mat-tab-label-active')).toBe(true);
  });

  describe('ripples', () => {
    let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
      fixture.detectChanges();
    });

    it('should be disabled on all tab links when they are disabled on the nav bar', () => {
      expect(fixture.componentInstance.tabLinks.toArray().every(tabLink => !tabLink.rippleDisabled))
        .withContext('Expected every tab link to have ripples enabled')
        .toBe(true);

      fixture.componentInstance.disableRippleOnBar = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabLinks.toArray().every(tabLink => tabLink.rippleDisabled))
        .withContext('Expected every tab link to have ripples disabled')
        .toBe(true);
    });

    it('should have the `disableRipple` from the tab take precedence over the nav bar', () => {
      const firstTab = fixture.componentInstance.tabLinks.first;

      expect(firstTab.rippleDisabled)
        .withContext('Expected ripples to be enabled on first tab')
        .toBe(false);

      firstTab.disableRipple = true;
      fixture.componentInstance.disableRippleOnBar = false;
      fixture.detectChanges();

      expect(firstTab.rippleDisabled)
        .withContext('Expected ripples to be disabled on first tab')
        .toBe(true);
    });

    it('should show up for tab link elements on mousedown', () => {
      const tabLink = fixture.debugElement.nativeElement.querySelector('.mat-tab-link');

      dispatchMouseEvent(tabLink, 'mousedown');
      dispatchMouseEvent(tabLink, 'mouseup');

      expect(tabLink.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected one ripple to show up if user clicks on tab link.')
        .toBe(1);
    });

    it('should be able to disable ripples on an individual tab link', () => {
      const tabLinkDebug = fixture.debugElement.query(By.css('a'))!;
      const tabLinkElement = tabLinkDebug.nativeElement;
      const tabLinkInstance = tabLinkDebug.injector.get<MatLegacyTabLink>(MatLegacyTabLink);

      tabLinkInstance.disableRipple = true;

      dispatchMouseEvent(tabLinkElement, 'mousedown');
      dispatchMouseEvent(tabLinkElement, 'mouseup');

      expect(tabLinkElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripple to show up if ripples are disabled.')
        .toBe(0);
    });

    it('should be able to disable ripples through global options at runtime', () => {
      expect(fixture.componentInstance.tabLinks.toArray().every(tabLink => !tabLink.rippleDisabled))
        .withContext('Expected every tab link to have ripples enabled')
        .toBe(true);

      globalRippleOptions.disabled = true;

      expect(fixture.componentInstance.tabLinks.toArray().every(tabLink => tabLink.rippleDisabled))
        .withContext('Expected every tab link to have ripples disabled')
        .toBe(true);
    });

    it('should have a focus indicator', () => {
      const tabLinkNativeElements = [
        ...fixture.debugElement.nativeElement.querySelectorAll('.mat-tab-link'),
      ];

      expect(
        tabLinkNativeElements.every(element => element.classList.contains('mat-focus-indicator')),
      ).toBe(true);
    });
  });

  // We expect users to use `mat-tab-nav-bar` with a `[tabPanel]` input and associated
  // `mat-tab-nav-panel`. However, if they don't provide a `[tabPanel]`, then we fallback to a
  // the link / navigation landmark pattern. These tests validate this fallback behavior.
  describe('without panel', () => {
    it('should have no explicit roles', () => {
      const fixture = TestBed.createComponent(TabBarWithoutPanel);
      fixture.detectChanges();

      const tabBar = fixture.nativeElement.querySelector('.mat-tab-nav-bar')!;
      expect(tabBar.getAttribute('role')).toBe(null);

      const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
      expect(tabLinks[0].getAttribute('role')).toBe(null);
      expect(tabLinks[1].getAttribute('role')).toBe(null);
      expect(tabLinks[2].getAttribute('role')).toBe(null);
    });

    it('should not setup aria-controls', () => {
      const fixture = TestBed.createComponent(TabBarWithoutPanel);
      fixture.detectChanges();

      const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
      expect(tabLinks[0].getAttribute('aria-controls')).toBe(null);
      expect(tabLinks[1].getAttribute('aria-controls')).toBe(null);
      expect(tabLinks[2].getAttribute('aria-controls')).toBe(null);
    });

    it('should not manage aria-selected', () => {
      const fixture = TestBed.createComponent(TabBarWithoutPanel);
      fixture.detectChanges();

      const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
      expect(tabLinks[0].getAttribute('aria-selected')).toBe(null);
      expect(tabLinks[1].getAttribute('aria-selected')).toBe(null);
      expect(tabLinks[2].getAttribute('aria-selected')).toBe(null);
    });

    it('should not activate a link when space is pressed', () => {
      const fixture = TestBed.createComponent(TabBarWithoutPanel);
      fixture.detectChanges();

      const tabLinks = fixture.nativeElement.querySelectorAll('.mat-tab-link');
      expect(tabLinks[1].classList.contains('mat-tab-label-active')).toBe(false);

      dispatchKeyboardEvent(tabLinks[1], 'keydown', SPACE);
      fixture.detectChanges();

      expect(tabLinks[1].classList.contains('mat-tab-label-active')).toBe(false);
    });

    it('should manage aria-current', () => {
      const fixture = TestBed.createComponent(TabBarWithoutPanel);
      fixture.detectChanges();

      const [tabLink1, tabLink2] = fixture.nativeElement.querySelectorAll('.mat-tab-link');

      tabLink1.click();
      fixture.detectChanges();
      expect(tabLink1.getAttribute('aria-current')).toEqual('page');
      expect(tabLink2.hasAttribute('aria-current')).toEqual(false);

      tabLink2.click();
      fixture.detectChanges();
      expect(tabLink1.hasAttribute('aria-current')).toEqual(false);
      expect(tabLink2.getAttribute('aria-current')).toEqual('page');
    });

    it('should support the native tabindex attribute', () => {
      const fixture = TestBed.createComponent(TabBarWithoutPanelWithNativeTabindexAttr);
      fixture.detectChanges();

      const tabLink = fixture.debugElement
        .query(By.directive(MatLegacyTabLink))!
        .injector.get<MatLegacyTabLink>(MatLegacyTabLink);

      expect(tabLink.tabIndex)
        .withContext('Expected the tabIndex to be set from the native tabindex attribute.')
        .toBe(5);
    });

    it('should support binding to the tabIndex', () => {
      const fixture = TestBed.createComponent(TabBarWithoutPanelWithTabIndexBinding);
      fixture.detectChanges();

      const tabLink = fixture.debugElement
        .query(By.directive(MatLegacyTabLink))!
        .injector.get<MatLegacyTabLink>(MatLegacyTabLink);

      expect(tabLink.tabIndex)
        .withContext('Expected the tabIndex to be set to 0 by default.')
        .toBe(0);

      fixture.componentInstance.tabIndex = 3;
      fixture.detectChanges();

      expect(tabLink.tabIndex)
        .withContext('Expected the tabIndex to be have been set to 3.')
        .toBe(3);
    });
  });
});

@Component({
  selector: 'test-app',
  template: `
    <nav mat-tab-nav-bar [disableRipple]="disableRippleOnBar" [tabPanel]="tabPanel">
      <a mat-tab-link
         *ngFor="let tab of tabs; let index = index"
         [active]="activeIndex === index"
         [disabled]="disabled"
         (click)="activeIndex = index">
        Tab link {{label}}
      </a>
    </nav>
    <mat-tab-nav-panel #tabPanel id="tab-panel">Tab panel</mat-tab-nav-panel>
  `,
})
class SimpleTabNavBarTestApp {
  @ViewChild(MatLegacyTabNav) tabNavBar: MatLegacyTabNav;
  @ViewChildren(MatLegacyTabLink) tabLinks: QueryList<MatLegacyTabLink>;

  label = '';
  disabled = false;
  disableRippleOnBar = false;
  tabs = [0, 1, 2];

  activeIndex = 0;
}

@Component({
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      <a mat-tab-link *ngIf="!isDestroyed">Link</a>
    </nav>
    <mat-tab-nav-panel #tabPanel >Tab panel</mat-tab-nav-panel>
  `,
})
class TabLinkWithNgIf {
  isDestroyed = false;
}

@Component({
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      <a mat-tab-link *ngFor="let tab of tabs" [active]="false">Tab link {{label}}</a>
    </nav>
    <mat-tab-nav-panel #tabPanel>Tab panel</mat-tab-nav-panel>
  `,
})
class TabBarWithInactiveTabsOnInit {
  tabs = [0, 1, 2];
}

@Component({
  template: `
    <nav mat-tab-nav-bar>
      <a mat-tab-link
         *ngFor="let tab of tabs; let index = index"
         [active]="index === activeIndex"
         (click)="activeIndex = index">
         Tab link
      </a>
    </nav>
  `,
})
class TabBarWithoutPanel {
  tabs = [0, 1, 2];
  activeIndex = 0;
}

@Component({
  template: `
    <nav mat-tab-nav-bar>
      <a mat-tab-link [tabIndex]="tabIndex">TabIndex Link</a>
    </nav>
  `,
})
class TabBarWithoutPanelWithTabIndexBinding {
  tabIndex = 0;
}

@Component({
  template: `
    <nav mat-tab-nav-bar>
      <a mat-tab-link tabindex="5">Link</a>
    </nav>
  `,
})
class TabBarWithoutPanelWithNativeTabindexAttr {}
