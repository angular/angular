import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild, ViewContainerRef} from '@angular/core';
import {LayoutDirection, Dir} from '../core/rtl/dir';
import {MdTabHeader} from './tab-header';
import {MdRippleModule} from '../core/ripple/index';
import {CommonModule} from '@angular/common';
import {PortalModule} from '../core';
import {MdInkBar} from './ink-bar';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {RIGHT_ARROW, LEFT_ARROW, ENTER} from '../core/keyboard/keycodes';
import {FakeViewportRuler} from '../core/overlay/position/fake-viewport-ruler';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';
import {dispatchKeyboardEvent} from '../core/testing/dispatch-events';


describe('MdTabHeader', () => {
  let dir: LayoutDirection = 'ltr';
  let fixture: ComponentFixture<SimpleTabHeaderApp>;
  let appComponent: SimpleTabHeaderApp;

  beforeEach(async(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [CommonModule, PortalModule, MdRippleModule],
      declarations: [
        MdTabHeader,
        MdInkBar,
        MdTabLabelWrapper,
        SimpleTabHeaderApp,
      ],
      providers: [
        {provide: Dir, useFactory: () => { return {value: dir}; }},
        {provide: ViewportRuler, useClass: FakeViewportRuler},
      ]
    });

    TestBed.compileComponents();
  }));

  describe('focusing', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabHeaderApp);
      fixture.detectChanges();

      appComponent = fixture.componentInstance;
    });

    it('should initialize to the selected index', () => {
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(appComponent.selectedIndex);
    });

    it('should send focus change event', () => {
      appComponent.mdTabHeader.focusIndex = 2;
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(2);
    });

    it('should not set focus a disabled tab', () => {
      appComponent.mdTabHeader.focusIndex = 0;
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(0);

      // Set focus on the disabled tab, but focus should remain 0
      appComponent.mdTabHeader.focusIndex = appComponent.disabledTabIndex;
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(0);
    });

    it('should move focus right and skip disabled tabs', () => {
      appComponent.mdTabHeader.focusIndex = 0;
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(0);

      // Move focus right, verify that the disabled tab is 1 and should be skipped
      expect(appComponent.disabledTabIndex).toBe(1);
      appComponent.mdTabHeader._focusNextTab();
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(2);

      // Move focus right to index 3
      appComponent.mdTabHeader._focusNextTab();
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(3);
    });

    it('should move focus left and skip disabled tabs', () => {
      appComponent.mdTabHeader.focusIndex = 3;
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(3);

      // Move focus left to index 3
      appComponent.mdTabHeader._focusPreviousTab();
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(2);

      // Move focus left, verify that the disabled tab is 1 and should be skipped
      expect(appComponent.disabledTabIndex).toBe(1);
      appComponent.mdTabHeader._focusPreviousTab();
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(0);
    });

    it('should support key down events to move and select focus', () => {
      appComponent.mdTabHeader.focusIndex = 0;
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(0);

      let tabListContainer = appComponent.mdTabHeader._tabListContainer.nativeElement;

      // Move focus right to 2
      dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(2);

      // Select the focused index 2
      expect(appComponent.selectedIndex).toBe(0);
      dispatchKeyboardEvent(tabListContainer, 'keydown', ENTER);
      fixture.detectChanges();
      expect(appComponent.selectedIndex).toBe(2);

      // Move focus right to 0
      dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      expect(appComponent.mdTabHeader.focusIndex).toBe(0);
    });
  });

  describe('pagination', () => {
    describe('ltr', () => {
      beforeEach(() => {
        dir = 'ltr';
        fixture = TestBed.createComponent(SimpleTabHeaderApp);
        fixture.detectChanges();

        appComponent = fixture.componentInstance;
      });

      it('should show width when tab list width exceeds container', () => {
        fixture.detectChanges();
        expect(appComponent.mdTabHeader._showPaginationControls).toBe(false);

        // Add enough tabs that it will obviously exceed the width
        appComponent.addTabsForScrolling();
        fixture.detectChanges();

        expect(appComponent.mdTabHeader._showPaginationControls).toBe(true);
      });

      it('should scroll to show the focused tab label', () => {
        appComponent.addTabsForScrolling();
        fixture.detectChanges();
        expect(appComponent.mdTabHeader.scrollDistance).toBe(0);

        // Focus on the last tab, expect this to be the maximum scroll distance.
        appComponent.mdTabHeader.focusIndex = appComponent.tabs.length - 1;
        fixture.detectChanges();
        expect(appComponent.mdTabHeader.scrollDistance)
            .toBe(appComponent.mdTabHeader._getMaxScrollDistance());

        // Focus on the first tab, expect this to be the maximum scroll distance.
        appComponent.mdTabHeader.focusIndex = 0;
        fixture.detectChanges();
        expect(appComponent.mdTabHeader.scrollDistance).toBe(0);
      });
    });

    describe('rtl', () => {
      beforeEach(() => {
        dir = 'rtl';
        fixture = TestBed.createComponent(SimpleTabHeaderApp);
        fixture.detectChanges();

        appComponent = fixture.componentInstance;
        appComponent.dir = 'rtl';
      });

      it('should scroll to show the focused tab label', () => {
        appComponent.addTabsForScrolling();
        fixture.detectChanges();
        expect(appComponent.mdTabHeader.scrollDistance).toBe(0);

        // Focus on the last tab, expect this to be the maximum scroll distance.
        appComponent.mdTabHeader.focusIndex = appComponent.tabs.length - 1;
        fixture.detectChanges();
        expect(appComponent.mdTabHeader.scrollDistance)
            .toBe(appComponent.mdTabHeader._getMaxScrollDistance());

        // Focus on the first tab, expect this to be the maximum scroll distance.
        appComponent.mdTabHeader.focusIndex = 0;
        fixture.detectChanges();
        expect(appComponent.mdTabHeader.scrollDistance).toBe(0);
      });
    });
  });

});

interface Tab {
  label: string;
  disabled?: boolean;
}

@Component({
  template: `
  <div [dir]="dir">
    <md-tab-header [selectedIndex]="selectedIndex"
               (indexFocused)="focusedIndex = $event"
               (selectFocusedIndex)="selectedIndex = $event">
      <div md-tab-label-wrapper style="min-width: 30px; width: 30px"
           *ngFor="let tab of tabs; let i = index"
           [disabled]="!!tab.disabled"
           (click)="selectedIndex = i">
         {{tab.label}}  
      </div>
    </md-tab-header>
  </div>
  `,
  styles: [`
    :host {
      width: 130px;
    }
  `]
})
class SimpleTabHeaderApp {
  selectedIndex: number = 0;
  focusedIndex: number;
  disabledTabIndex = 1;
  tabs: Tab[] = [{label: 'tab one'}, {label: 'tab one'}, {label: 'tab one'}, {label: 'tab one'}];
  dir: LayoutDirection = 'ltr';

  @ViewChild(MdTabHeader) mdTabHeader: MdTabHeader;

  constructor(private _viewContainerRef: ViewContainerRef) {
    this.tabs[this.disabledTabIndex].disabled = true;
  }

  addTabsForScrolling() {
    this.tabs.push({label: 'new'}, {label: 'new'}, {label: 'new'}, {label: 'new'});
  }
}
