import {LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk/keycodes';
import {dispatchFakeEvent, dispatchKeyboardEvent} from '../../cdk/testing/private';
import {Component, DebugElement, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  flush,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {Observable} from 'rxjs';
import {
  MatLegacyTab,
  MatLegacyTabGroup,
  MatLegacyTabHeader,
  MatLegacyTabsModule,
  MAT_LEGACY_TABS_CONFIG,
} from './index';
import {MatLegacyTabHeaderPosition} from '@angular/material/legacy-tabs';

describe('MatTabGroup', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatLegacyTabsModule, CommonModule, NoopAnimationsModule],
      declarations: [
        SimpleTabsTestApp,
        SimpleDynamicTabsTestApp,
        BindedTabsTestApp,
        AsyncTabsTestApp,
        DisabledTabsTestApp,
        TabGroupWithSimpleApi,
        TemplateTabs,
        TabGroupWithAriaInputs,
        TabGroupWithIsActiveBinding,
        NestedTabs,
        TabGroupWithIndirectDescendantTabs,
        TabGroupWithSpaceAbove,
        NestedTabGroupWithLabel,
        TabsWithClassesTestApp,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<SimpleTabsTestApp>;
    let element: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabsTestApp);
      element = fixture.nativeElement;
    });

    it('should default to the first tab', () => {
      checkSelectedIndex(1, fixture);
    });

    it('will properly load content on first change detection pass', () => {
      fixture.detectChanges();
      expect(element.querySelectorAll('.mat-tab-body')[1].querySelectorAll('span').length).toBe(3);
    });

    it('should change selected index on click', () => {
      const component = fixture.debugElement.componentInstance;
      component.selectedIndex = 0;
      checkSelectedIndex(0, fixture);

      // select the second tab
      let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();
      checkSelectedIndex(1, fixture);

      // select the third tab
      tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[2];
      tabLabel.nativeElement.click();
      checkSelectedIndex(2, fixture);
    });

    it('should support two-way binding for selectedIndex', fakeAsync(() => {
      const component = fixture.componentInstance;
      component.selectedIndex = 0;

      fixture.detectChanges();

      const tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(component.selectedIndex).toBe(1);
    }));

    // Note: needs to be `async` in order to fail when we expect it to.
    it('should set to correct tab on fast change', waitForAsync(() => {
      const component = fixture.componentInstance;
      component.selectedIndex = 0;
      fixture.detectChanges();

      setTimeout(() => {
        component.selectedIndex = 1;
        fixture.detectChanges();

        setTimeout(() => {
          component.selectedIndex = 0;
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            expect(component.selectedIndex).toBe(0);
          });
        }, 1);
      }, 1);
    }));

    it('should change tabs based on selectedIndex', fakeAsync(() => {
      const component = fixture.componentInstance;
      const tabComponent = fixture.debugElement.query(By.css('mat-tab-group'))!.componentInstance;

      spyOn(component, 'handleSelection').and.callThrough();

      checkSelectedIndex(1, fixture);

      tabComponent.selectedIndex = 2;

      checkSelectedIndex(2, fixture);
      tick();

      expect(component.handleSelection).toHaveBeenCalledTimes(1);
      expect(component.selectEvent.index).toBe(2);
    }));

    it('should update tab positions when selected index is changed', () => {
      fixture.detectChanges();
      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;
      const tabs: MatLegacyTab[] = component._tabs.toArray();

      expect(tabs[0].position).toBeLessThan(0);
      expect(tabs[1].position).toBe(0);
      expect(tabs[2].position).toBeGreaterThan(0);

      // Move to third tab
      component.selectedIndex = 2;
      fixture.detectChanges();
      expect(tabs[0].position).toBeLessThan(0);
      expect(tabs[1].position).toBeLessThan(0);
      expect(tabs[2].position).toBe(0);

      // Move to the first tab
      component.selectedIndex = 0;
      fixture.detectChanges();
      expect(tabs[0].position).toBe(0);
      expect(tabs[1].position).toBeGreaterThan(0);
      expect(tabs[2].position).toBeGreaterThan(0);
    });

    it('should clamp the selected index to the size of the number of tabs', () => {
      fixture.detectChanges();
      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;

      // Set the index to be negative, expect first tab selected
      fixture.componentInstance.selectedIndex = -1;
      fixture.detectChanges();
      expect(component.selectedIndex).toBe(0);

      // Set the index beyond the size of the tabs, expect last tab selected
      fixture.componentInstance.selectedIndex = 3;
      fixture.detectChanges();
      expect(component.selectedIndex).toBe(2);
    });

    it('should not crash when setting the selected index to NaN', () => {
      const component = fixture.debugElement.componentInstance;

      expect(() => {
        component.selectedIndex = NaN;
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should show ripples for tab-group labels', () => {
      fixture.detectChanges();

      const testElement = fixture.nativeElement;
      const tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];

      expect(testElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripples to show up initially.')
        .toBe(0);

      dispatchFakeEvent(tabLabel.nativeElement, 'mousedown');

      expect(testElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected one ripple to show up on label mousedown.')
        .toBe(1);
    });

    it('should allow disabling ripples for tab-group labels', () => {
      fixture.componentInstance.disableRipple = true;
      fixture.detectChanges();

      const testElement = fixture.nativeElement;
      const tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];

      expect(testElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripples to show up initially.')
        .toBe(0);

      dispatchFakeEvent(tabLabel.nativeElement, 'mousedown');

      expect(testElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripple to show up on label mousedown.')
        .toBe(0);
    });

    it('should set the isActive flag on each of the tabs', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const tabs = fixture.componentInstance.tabs.toArray();

      expect(tabs[0].isActive).toBe(false);
      expect(tabs[1].isActive).toBe(true);
      expect(tabs[2].isActive).toBe(false);

      fixture.componentInstance.selectedIndex = 2;
      fixture.detectChanges();
      tick();

      expect(tabs[0].isActive).toBe(false);
      expect(tabs[1].isActive).toBe(false);
      expect(tabs[2].isActive).toBe(true);
    }));

    it('should fire animation done event', fakeAsync(() => {
      fixture.detectChanges();

      spyOn(fixture.componentInstance, 'animationDone');
      const tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.animationDone).toHaveBeenCalledTimes(1);
    }));

    it('should add the proper `aria-setsize` and `aria-posinset`', () => {
      fixture.detectChanges();

      const labels = Array.from(element.querySelectorAll('.mat-tab-label'));

      expect(labels.map(label => label.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
      expect(labels.every(label => label.getAttribute('aria-setsize') === '3')).toBe(true);
    });

    it('should emit focusChange event on click', () => {
      spyOn(fixture.componentInstance, 'handleFocus');
      fixture.detectChanges();

      const tabLabels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));

      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(0);

      tabLabels[2].nativeElement.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledWith(
        jasmine.objectContaining({index: 2}),
      );
    });

    it('should emit focusChange on arrow key navigation', () => {
      spyOn(fixture.componentInstance, 'handleFocus');
      fixture.detectChanges();

      const tabLabels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));
      const tabLabelContainer = fixture.debugElement.query(By.css('.mat-tab-label-container'))!
        .nativeElement as HTMLElement;

      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(0);

      // In order to verify that the `focusChange` event also fires with the correct
      // index, we focus the third tab before testing the keyboard navigation.
      tabLabels[2].nativeElement.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(1);

      dispatchKeyboardEvent(tabLabelContainer, 'keydown', LEFT_ARROW);

      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledWith(
        jasmine.objectContaining({index: 1}),
      );
    });

    it('should clean up the tabs QueryList on destroy', () => {
      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;
      const spy = jasmine.createSpy('complete spy');
      const subscription = component._tabs.changes.subscribe({complete: spy});

      fixture.destroy();

      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should have a focus indicator', () => {
      const tabLabelNativeElements = [
        ...fixture.debugElement.nativeElement.querySelectorAll('.mat-tab-label'),
      ];

      expect(tabLabelNativeElements.every(el => el.classList.contains('mat-focus-indicator'))).toBe(
        true,
      );
    });

    it('should emit focusChange when a tab receives focus', fakeAsync(() => {
      spyOn(fixture.componentInstance, 'handleFocus');
      fixture.detectChanges();

      const tabLabels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));

      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(0);

      // In order to verify that the `focusChange` event also fires with the correct
      // index, we focus the second tab before testing the keyboard navigation.
      dispatchFakeEvent(tabLabels[2].nativeElement, 'focus');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.handleFocus).toHaveBeenCalledWith(
        jasmine.objectContaining({index: 2}),
      );
    }));

    it('should be able to programmatically focus a particular tab', () => {
      fixture.detectChanges();
      const tabGroup: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      ).componentInstance;
      const tabHeader: MatLegacyTabHeader = fixture.debugElement.query(
        By.css('mat-tab-header'),
      ).componentInstance;

      expect(tabHeader.focusIndex).not.toBe(3);

      tabGroup.focusTab(3);
      fixture.detectChanges();

      expect(tabHeader.focusIndex).not.toBe(3);
    });

    it('should be able to set a tabindex on the inner content element', () => {
      fixture.componentInstance.contentTabIndex = 1;
      fixture.detectChanges();
      const contentElements = Array.from<HTMLElement>(
        fixture.nativeElement.querySelectorAll('mat-tab-body'),
      );

      expect(contentElements.map(e => e.getAttribute('tabindex'))).toEqual([null, '1', null]);

      fixture.componentInstance.selectedIndex = 0;
      fixture.detectChanges();

      expect(contentElements.map(e => e.getAttribute('tabindex'))).toEqual(['1', null, null]);
    });

    it('should update the tabindex of the labels when navigating via keyboard', () => {
      fixture.detectChanges();

      const tabLabels = fixture.debugElement
        .queryAll(By.css('.mat-tab-label'))
        .map(label => label.nativeElement);
      const tabLabelContainer = fixture.debugElement.query(By.css('.mat-tab-label-container'))
        .nativeElement as HTMLElement;

      expect(tabLabels.map(label => label.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

      dispatchKeyboardEvent(tabLabelContainer, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(tabLabels.map(label => label.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
    });
  });

  describe('aria labelling', () => {
    let fixture: ComponentFixture<TabGroupWithAriaInputs>;
    let tab: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(TabGroupWithAriaInputs);
      fixture.detectChanges();
      tick();
      tab = fixture.nativeElement.querySelector('.mat-tab-label');
    }));

    it('should not set aria-label or aria-labelledby attributes if they are not passed in', () => {
      expect(tab.hasAttribute('aria-label')).toBe(false);
      expect(tab.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('should set the aria-label attribute', () => {
      fixture.componentInstance.ariaLabel = 'Fruit';
      fixture.detectChanges();

      expect(tab.getAttribute('aria-label')).toBe('Fruit');
    });

    it('should set the aria-labelledby attribute', () => {
      fixture.componentInstance.ariaLabelledby = 'fruit-label';
      fixture.detectChanges();

      expect(tab.getAttribute('aria-labelledby')).toBe('fruit-label');
    });

    it('should not be able to set both an aria-label and aria-labelledby', () => {
      fixture.componentInstance.ariaLabel = 'Fruit';
      fixture.componentInstance.ariaLabelledby = 'fruit-label';
      fixture.detectChanges();

      expect(tab.getAttribute('aria-label')).toBe('Fruit');
      expect(tab.hasAttribute('aria-labelledby')).toBe(false);

      fixture.componentInstance.ariaLabel = 'Veggie';
      fixture.detectChanges();
      expect(tab.getAttribute('aria-label')).toBe('Veggie');
    });
  });

  describe('disable tabs', () => {
    let fixture: ComponentFixture<DisabledTabsTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(DisabledTabsTestApp);
    });

    it('should have one disabled tab', () => {
      fixture.detectChanges();
      const labels = fixture.debugElement.queryAll(By.css('.mat-tab-disabled'));
      expect(labels.length).toBe(1);
      expect(labels[0].nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should set the disabled flag on tab', () => {
      fixture.detectChanges();

      const tabs = fixture.componentInstance.tabs.toArray();
      let labels = fixture.debugElement.queryAll(By.css('.mat-tab-disabled'));
      expect(tabs[2].disabled).toBe(false);
      expect(labels.length).toBe(1);
      expect(labels[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();

      expect(tabs[2].disabled).toBe(true);
      labels = fixture.debugElement.queryAll(By.css('.mat-tab-disabled'));
      expect(labels.length).toBe(2);
      expect(
        labels.every(label => label.nativeElement.getAttribute('aria-disabled') === 'true'),
      ).toBe(true);
    });
  });

  describe('dynamic binding tabs', () => {
    let fixture: ComponentFixture<SimpleDynamicTabsTestApp>;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(SimpleDynamicTabsTestApp);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }));

    it('should be able to add a new tab, select it, and have correct origin position', fakeAsync(() => {
      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;

      let tabs: MatLegacyTab[] = component._tabs.toArray();
      expect(tabs[0].origin).toBe(null);
      expect(tabs[1].origin).toBe(0);
      expect(tabs[2].origin).toBe(null);

      // Add a new tab on the right and select it, expect an origin >= than 0 (animate right)
      fixture.componentInstance.tabs.push({label: 'New tab', content: 'to right of index'});
      fixture.componentInstance.selectedIndex = 4;
      fixture.detectChanges();
      tick();

      tabs = component._tabs.toArray();
      expect(tabs[3].origin).toBeGreaterThanOrEqual(0);

      // Add a new tab in the beginning and select it, expect an origin < than 0 (animate left)
      fixture.componentInstance.selectedIndex = 0;
      fixture.detectChanges();
      tick();

      fixture.componentInstance.tabs.push({label: 'New tab', content: 'to left of index'});
      fixture.detectChanges();
      tick();

      tabs = component._tabs.toArray();
      expect(tabs[0].origin).toBeLessThan(0);
    }));

    it('should update selected index if the last tab removed while selected', fakeAsync(() => {
      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;

      const numberOfTabs = component._tabs.length;
      fixture.componentInstance.selectedIndex = numberOfTabs - 1;
      fixture.detectChanges();
      tick();

      // Remove last tab while last tab is selected, expect next tab over to be selected
      fixture.componentInstance.tabs.pop();
      fixture.detectChanges();
      tick();

      expect(component.selectedIndex).toBe(numberOfTabs - 2);
    }));

    it('should maintain the selected tab if a new tab is added', () => {
      fixture.detectChanges();
      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;

      fixture.componentInstance.selectedIndex = 1;
      fixture.detectChanges();

      // Add a new tab at the beginning.
      fixture.componentInstance.tabs.unshift({label: 'New tab', content: 'at the start'});
      fixture.detectChanges();

      expect(component.selectedIndex).toBe(2);
      expect(component._tabs.toArray()[2].isActive).toBe(true);
    });

    it('should maintain the selected tab if a tab is removed', () => {
      // Select the second tab.
      fixture.componentInstance.selectedIndex = 1;
      fixture.detectChanges();

      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;

      // Remove the first tab that is right before the selected one.
      fixture.componentInstance.tabs.splice(0, 1);
      fixture.detectChanges();

      // Since the first tab has been removed and the second one was selected before, the selected
      // tab moved one position to the right. Meaning that the tab is now the first tab.
      expect(component.selectedIndex).toBe(0);
      expect(component._tabs.toArray()[0].isActive).toBe(true);
    });

    it('should be able to select a new tab after creation', fakeAsync(() => {
      fixture.detectChanges();
      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;

      fixture.componentInstance.tabs.push({label: 'Last tab', content: 'at the end'});
      fixture.componentInstance.selectedIndex = 3;

      fixture.detectChanges();
      tick();

      expect(component.selectedIndex).toBe(3);
      expect(component._tabs.toArray()[3].isActive).toBe(true);
    }));

    it('should not fire `selectedTabChange` when the amount of tabs changes', fakeAsync(() => {
      fixture.detectChanges();
      fixture.componentInstance.selectedIndex = 1;
      fixture.detectChanges();

      // Add a new tab at the beginning.
      spyOn(fixture.componentInstance, 'handleSelection');
      fixture.componentInstance.tabs.unshift({label: 'New tab', content: 'at the start'});
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(fixture.componentInstance.handleSelection).not.toHaveBeenCalled();
    }));

    it('should update the newly-selected tab if the previously-selected tab is replaced', fakeAsync(() => {
      const component: MatLegacyTabGroup = fixture.debugElement.query(
        By.css('mat-tab-group'),
      )!.componentInstance;

      spyOn(fixture.componentInstance, 'handleSelection');

      fixture.componentInstance.tabs[fixture.componentInstance.selectedIndex] = {
        label: 'New',
        content: 'New',
      };
      fixture.detectChanges();
      tick();

      expect(component._tabs.get(1)?.isActive).toBe(true);
      expect(fixture.componentInstance.handleSelection).toHaveBeenCalledWith(
        jasmine.objectContaining({index: 1}),
      );
    }));
  });

  describe('async tabs', () => {
    let fixture: ComponentFixture<AsyncTabsTestApp>;

    it('should show tabs when they are available', fakeAsync(() => {
      fixture = TestBed.createComponent(AsyncTabsTestApp);

      expect(fixture.debugElement.queryAll(By.css('.mat-tab-label')).length).toBe(0);

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      expect(fixture.debugElement.queryAll(By.css('.mat-tab-label')).length).toBe(2);
    }));
  });

  describe('with simple api', () => {
    let fixture: ComponentFixture<TabGroupWithSimpleApi>;
    let tabGroup: MatLegacyTabGroup;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(TabGroupWithSimpleApi);
      fixture.detectChanges();
      tick();

      tabGroup = fixture.debugElement.query(By.directive(MatLegacyTabGroup))!
        .componentInstance as MatLegacyTabGroup;
    }));

    it('should support a tab-group with the simple api', fakeAsync(() => {
      expect(getSelectedLabel(fixture).textContent).toMatch('Junk food');
      expect(getSelectedContent(fixture).textContent).toMatch('Pizza, fries');

      tabGroup.selectedIndex = 2;
      fixture.detectChanges();
      tick();

      expect(getSelectedLabel(fixture).textContent).toMatch('Fruit');
      expect(getSelectedContent(fixture).textContent).toMatch('Apples, grapes');

      fixture.componentInstance.otherLabel = 'Chips';
      fixture.componentInstance.otherContent = 'Salt, vinegar';
      fixture.detectChanges();

      expect(getSelectedLabel(fixture).textContent).toMatch('Chips');
      expect(getSelectedContent(fixture).textContent).toMatch('Salt, vinegar');
    }));

    it('should support @ViewChild in the tab content', () => {
      expect(fixture.componentInstance.legumes).toBeTruthy();
    });

    it('should only have the active tab in the DOM', fakeAsync(() => {
      expect(fixture.nativeElement.textContent).toContain('Pizza, fries');
      expect(fixture.nativeElement.textContent).not.toContain('Peanuts');

      tabGroup.selectedIndex = 3;
      fixture.detectChanges();
      tick();

      expect(fixture.nativeElement.textContent).not.toContain('Pizza, fries');
      expect(fixture.nativeElement.textContent).toContain('Peanuts');
    }));

    it('should support setting the header position', () => {
      const tabGroupNode = fixture.debugElement.query(By.css('mat-tab-group'))!.nativeElement;

      expect(tabGroupNode.classList).not.toContain('mat-tab-group-inverted-header');

      tabGroup.headerPosition = 'below';
      fixture.detectChanges();

      expect(tabGroupNode.classList).toContain('mat-tab-group-inverted-header');
    });

    it('should be able to opt into keeping the inactive tab content in the DOM', fakeAsync(() => {
      fixture.componentInstance.preserveContent = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Pizza, fries');
      expect(fixture.nativeElement.textContent).not.toContain('Peanuts');

      tabGroup.selectedIndex = 3;
      fixture.detectChanges();
      tick();

      expect(fixture.nativeElement.textContent).toContain('Pizza, fries');
      expect(fixture.nativeElement.textContent).toContain('Peanuts');
    }));

    it('should visibly hide the content of inactive tabs', fakeAsync(() => {
      const contentElements: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.mat-tab-body-content'),
      );

      expect(contentElements.map(element => element.style.visibility)).toEqual([
        '',
        'hidden',
        'hidden',
        'hidden',
      ]);

      tabGroup.selectedIndex = 2;
      fixture.detectChanges();
      tick();

      expect(contentElements.map(element => element.style.visibility)).toEqual([
        'hidden',
        'hidden',
        '',
        'hidden',
      ]);

      tabGroup.selectedIndex = 1;
      fixture.detectChanges();
      tick();

      expect(contentElements.map(element => element.style.visibility)).toEqual([
        'hidden',
        '',
        'hidden',
        'hidden',
      ]);
    }));
  });

  describe('lazy loaded tabs', () => {
    it('should lazy load the second tab', fakeAsync(() => {
      const fixture = TestBed.createComponent(TemplateTabs);
      fixture.detectChanges();
      tick();

      const secondLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      secondLabel.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const child = fixture.debugElement.query(By.css('.child'))!;
      expect(child.nativeElement).toBeDefined();
    }));
  });

  describe('special cases', () => {
    it('should not throw an error when binding isActive to the view', fakeAsync(() => {
      const fixture = TestBed.createComponent(TabGroupWithIsActiveBinding);

      expect(() => {
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
      }).not.toThrow();

      expect(fixture.nativeElement.textContent).toContain('pizza is active');
    }));

    it('should not pick up mat-tab-label from a child tab', fakeAsync(() => {
      const fixture = TestBed.createComponent(NestedTabGroupWithLabel);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const labels = fixture.nativeElement.querySelectorAll('.mat-tab-label-content');
      const contents = Array.from<HTMLElement>(labels).map(label => label.textContent?.trim());

      expect(contents).toEqual([
        'Parent 1',
        'Parent 2',
        'Parent 3',
        'Child 1',
        'Child 2',
        'Child 3',
      ]);
    }));
  });

  describe('nested tabs', () => {
    it('should not pick up the tabs from descendant tab groups', fakeAsync(() => {
      const fixture = TestBed.createComponent(NestedTabs);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const groups = fixture.componentInstance.groups.toArray();

      expect(groups.length).toBe(2);
      expect(groups[0]._tabs.map((tab: MatLegacyTab) => tab.textLabel)).toEqual(['One', 'Two']);
      expect(groups[1]._tabs.map((tab: MatLegacyTab) => tab.textLabel)).toEqual([
        'Inner tab one',
        'Inner tab two',
      ]);
    }));

    it('should pick up indirect descendant tabs', fakeAsync(() => {
      const fixture = TestBed.createComponent(TabGroupWithIndirectDescendantTabs);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const tabs = fixture.componentInstance.tabGroup._tabs;
      expect(tabs.map((tab: MatLegacyTab) => tab.textLabel)).toEqual(['One', 'Two']);
    }));
  });

  describe('tall tabs', () => {
    beforeEach(() => {
      window.scrollTo({top: 0});
    });

    it('should not scroll when changing tabs by clicking', fakeAsync(() => {
      const fixture = TestBed.createComponent(TabGroupWithSpaceAbove);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      window.scrollBy(0, 250);
      expect(window.scrollY).toBe(250);

      // select the second tab
      const tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();
      checkSelectedIndex(1, fixture);

      expect(window.scrollY).toBe(250);
      tick();
    }));

    it('should not scroll when changing tabs programatically', fakeAsync(() => {
      const fixture = TestBed.createComponent(TabGroupWithSpaceAbove);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      window.scrollBy(0, 250);
      expect(window.scrollY).toBe(250);

      fixture.componentInstance.tabGroup.selectedIndex = 1;
      fixture.detectChanges();

      expect(window.scrollY).toBe(250);
      tick();
    }));
  });

  describe('tabs with custom css classes', () => {
    let fixture: ComponentFixture<TabsWithClassesTestApp>;
    let labelElements: DebugElement[];
    let bodyElements: DebugElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(TabsWithClassesTestApp);
      fixture.detectChanges();
      labelElements = fixture.debugElement.queryAll(By.css('.mat-tab-label'));
      bodyElements = fixture.debugElement.queryAll(By.css('mat-tab-body'));
    });

    it('should apply label/body classes', () => {
      expect(labelElements[1].nativeElement.classList).toContain('hardcoded-label-class');
      expect(bodyElements[1].nativeElement.classList).toContain('hardcoded-body-class');
    });

    it('should set classes as strings dynamically', () => {
      expect(labelElements[0].nativeElement.classList).not.toContain('custom-label-class');
      expect(bodyElements[0].nativeElement.classList).not.toContain('custom-body-class');

      fixture.componentInstance.labelClassList = 'custom-label-class';
      fixture.componentInstance.bodyClassList = 'custom-body-class';
      fixture.detectChanges();

      expect(labelElements[0].nativeElement.classList).toContain('custom-label-class');
      expect(bodyElements[0].nativeElement.classList).toContain('custom-body-class');

      delete fixture.componentInstance.labelClassList;
      delete fixture.componentInstance.bodyClassList;
      fixture.detectChanges();

      expect(labelElements[0].nativeElement.classList).not.toContain('custom-label-class');
      expect(bodyElements[0].nativeElement.classList).not.toContain('custom-body-class');
    });

    it('should set classes as strings array dynamically', () => {
      expect(labelElements[0].nativeElement.classList).not.toContain('custom-label-class');
      expect(bodyElements[0].nativeElement.classList).not.toContain('custom-body-class');

      fixture.componentInstance.labelClassList = ['custom-label-class'];
      fixture.componentInstance.bodyClassList = ['custom-body-class'];
      fixture.detectChanges();

      expect(labelElements[0].nativeElement.classList).toContain('custom-label-class');
      expect(bodyElements[0].nativeElement.classList).toContain('custom-body-class');

      delete fixture.componentInstance.labelClassList;
      delete fixture.componentInstance.bodyClassList;
      fixture.detectChanges();

      expect(labelElements[0].nativeElement.classList).not.toContain('custom-label-class');
      expect(bodyElements[0].nativeElement.classList).not.toContain('custom-body-class');
    });
  });

  /**
   * Checks that the `selectedIndex` has been updated; checks that the label and body have their
   * respective `active` classes
   */
  function checkSelectedIndex(expectedIndex: number, fixture: ComponentFixture<any>) {
    fixture.detectChanges();

    const tabComponent: MatLegacyTabGroup = fixture.debugElement.query(
      By.css('mat-tab-group'),
    )!.componentInstance;
    expect(tabComponent.selectedIndex).toBe(expectedIndex);

    const tabLabelElement = fixture.debugElement.query(
      By.css(`.mat-tab-label:nth-of-type(${expectedIndex + 1})`),
    )!.nativeElement;
    expect(tabLabelElement.classList.contains('mat-tab-label-active')).toBe(true);

    const tabContentElement = fixture.debugElement.query(
      By.css(`mat-tab-body:nth-of-type(${expectedIndex + 1})`),
    )!.nativeElement;
    expect(tabContentElement.classList.contains('mat-tab-body-active')).toBe(true);
  }

  function getSelectedLabel(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.nativeElement.querySelector('.mat-tab-label-active');
  }

  function getSelectedContent(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.nativeElement.querySelector('.mat-tab-body-active');
  }
});

describe('MatTabNavBar with a default config', () => {
  let fixture: ComponentFixture<SimpleTabsTestApp>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatLegacyTabsModule, BrowserAnimationsModule],
      declarations: [SimpleTabsTestApp],
      providers: [{provide: MAT_LEGACY_TABS_CONFIG, useValue: {dynamicHeight: true}}],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleTabsTestApp);
    fixture.detectChanges();
  });

  it('should set whether the height of the tab group is dynamic', () => {
    expect(fixture.componentInstance.tabGroup.dynamicHeight).toBe(true);
  });
});

describe('nested MatTabGroup with enabled animations', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatLegacyTabsModule, BrowserAnimationsModule],
      declarations: [NestedTabs, TabsWithCustomAnimationDuration],
    });

    TestBed.compileComponents();
  }));

  it('should not throw when creating a component with nested tab groups', fakeAsync(() => {
    expect(() => {
      const fixture = TestBed.createComponent(NestedTabs);
      fixture.detectChanges();
      tick();
    }).not.toThrow();
  }));

  it('should not throw when setting an animationDuration without units', fakeAsync(() => {
    expect(() => {
      const fixture = TestBed.createComponent(TabsWithCustomAnimationDuration);
      fixture.detectChanges();
      tick();
    }).not.toThrow();
  }));
});

@Component({
  template: `
    <mat-tab-group class="tab-group"
        [(selectedIndex)]="selectedIndex"
        [headerPosition]="headerPosition"
        [disableRipple]="disableRipple"
        [contentTabIndex]="contentTabIndex"
        (animationDone)="animationDone()"
        (focusChange)="handleFocus($event)"
        (selectedTabChange)="handleSelection($event)">
      <mat-tab>
        <ng-template mat-tab-label>Tab One</ng-template>
        Tab one content
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>Tab Two</ng-template>
        <span>Tab </span><span>two</span><span>content</span>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>Tab Three</ng-template>
        Tab three content
      </mat-tab>
    </mat-tab-group>
  `,
})
class SimpleTabsTestApp {
  @ViewChild(MatLegacyTabGroup) tabGroup: MatLegacyTabGroup;
  @ViewChildren(MatLegacyTab) tabs: QueryList<MatLegacyTab>;
  selectedIndex: number = 1;
  focusEvent: any;
  selectEvent: any;
  disableRipple: boolean = false;
  contentTabIndex: number | null = null;
  headerPosition: MatLegacyTabHeaderPosition = 'above';
  handleFocus(event: any) {
    this.focusEvent = event;
  }
  handleSelection(event: any) {
    this.selectEvent = event;
  }
  animationDone() {}
}

@Component({
  template: `
    <mat-tab-group class="tab-group"
        [(selectedIndex)]="selectedIndex"
        (focusChange)="handleFocus($event)"
        (selectedTabChange)="handleSelection($event)">
      <mat-tab *ngFor="let tab of tabs">
        <ng-template mat-tab-label>{{tab.label}}</ng-template>
        {{tab.content}}
      </mat-tab>
    </mat-tab-group>
  `,
})
class SimpleDynamicTabsTestApp {
  tabs = [
    {label: 'Label 1', content: 'Content 1'},
    {label: 'Label 2', content: 'Content 2'},
    {label: 'Label 3', content: 'Content 3'},
  ];
  selectedIndex: number = 1;
  focusEvent: any;
  selectEvent: any;
  handleFocus(event: any) {
    this.focusEvent = event;
  }
  handleSelection(event: any) {
    this.selectEvent = event;
  }
}

@Component({
  template: `
    <mat-tab-group class="tab-group" [(selectedIndex)]="selectedIndex">
      <mat-tab *ngFor="let tab of tabs" label="{{tab.label}}">
        {{tab.content}}
      </mat-tab>
    </mat-tab-group>
  `,
})
class BindedTabsTestApp {
  tabs = [
    {label: 'one', content: 'one'},
    {label: 'two', content: 'two'},
  ];
  selectedIndex = 0;

  addNewActiveTab(): void {
    this.tabs.push({
      label: 'new tab',
      content: 'new content',
    });
    this.selectedIndex = this.tabs.length - 1;
  }
}

@Component({
  template: `
    <mat-tab-group class="tab-group">
      <mat-tab>
        <ng-template mat-tab-label>Tab One</ng-template>
        Tab one content
      </mat-tab>
      <mat-tab disabled>
        <ng-template mat-tab-label>Tab Two</ng-template>
        Tab two content
      </mat-tab>
      <mat-tab [disabled]="isDisabled">
        <ng-template mat-tab-label>Tab Three</ng-template>
        Tab three content
      </mat-tab>
    </mat-tab-group>
  `,
})
class DisabledTabsTestApp {
  @ViewChildren(MatLegacyTab) tabs: QueryList<MatLegacyTab>;
  isDisabled = false;
}

@Component({
  template: `
    <mat-tab-group class="tab-group">
      <mat-tab *ngFor="let tab of tabs | async">
        <ng-template mat-tab-label>{{ tab.label }}</ng-template>
        {{ tab.content }}
      </mat-tab>
   </mat-tab-group>
  `,
})
class AsyncTabsTestApp implements OnInit {
  private _tabs = [
    {label: 'one', content: 'one'},
    {label: 'two', content: 'two'},
  ];

  tabs: Observable<any>;

  ngOnInit() {
    // Use ngOnInit because there is some issue with scheduling the async task in the constructor.
    this.tabs = new Observable((observer: any) => {
      setTimeout(() => observer.next(this._tabs));
    });
  }
}

@Component({
  template: `
  <mat-tab-group [preserveContent]="preserveContent">
    <mat-tab label="Junk food"> Pizza, fries </mat-tab>
    <mat-tab label="Vegetables"> Broccoli, spinach </mat-tab>
    <mat-tab [label]="otherLabel"> {{otherContent}} </mat-tab>
    <mat-tab label="Legumes"> <p #legumes>Peanuts</p> </mat-tab>
  </mat-tab-group>
  `,
})
class TabGroupWithSimpleApi {
  preserveContent = false;
  otherLabel = 'Fruit';
  otherContent = 'Apples, grapes';
  @ViewChild('legumes') legumes: any;
}

@Component({
  template: `
    <mat-tab-group>
      <mat-tab label="One">Tab one content</mat-tab>
      <mat-tab label="Two">
        Tab two content
         <mat-tab-group [dynamicHeight]="true">
          <mat-tab label="Inner tab one">Inner content one</mat-tab>
          <mat-tab label="Inner tab two">Inner content two</mat-tab>
        </mat-tab-group>
      </mat-tab>
    </mat-tab-group>
  `,
})
class NestedTabs {
  @ViewChildren(MatLegacyTabGroup) groups: QueryList<MatLegacyTabGroup>;
}

@Component({
  template: `
    <mat-tab-group>
      <mat-tab label="One">
        Eager
      </mat-tab>
      <mat-tab label="Two">
        <ng-template matTabContent>
          <div class="child">Hi</div>
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  `,
})
class TemplateTabs {}

@Component({
  template: `
  <mat-tab-group>
    <mat-tab [aria-label]="ariaLabel" [aria-labelledby]="ariaLabelledby"></mat-tab>
  </mat-tab-group>
  `,
})
class TabGroupWithAriaInputs {
  ariaLabel: string;
  ariaLabelledby: string;
}

@Component({
  template: `
    <mat-tab-group>
      <mat-tab label="Junk food" #pizza> Pizza, fries </mat-tab>
      <mat-tab label="Vegetables"> Broccoli, spinach </mat-tab>
    </mat-tab-group>

    <div *ngIf="pizza.isActive">pizza is active</div>
  `,
})
class TabGroupWithIsActiveBinding {}

@Component({
  template: `
    <mat-tab-group animationDuration="500">
      <mat-tab label="One">Tab one content</mat-tab>
      <mat-tab label="Two">Tab two content</mat-tab>
    </mat-tab-group>
  `,
})
class TabsWithCustomAnimationDuration {}

@Component({
  template: `
    <mat-tab-group>
      <ng-container [ngSwitch]="true">
        <mat-tab label="One">Tab one content</mat-tab>
        <mat-tab label="Two">Tab two content</mat-tab>
      </ng-container>
    </mat-tab-group>
  `,
})
class TabGroupWithIndirectDescendantTabs {
  @ViewChild(MatLegacyTabGroup) tabGroup: MatLegacyTabGroup;
}

@Component({
  template: `
    <div style="height: 300px; background-color: aqua">
      Top Content here
    </div>
    <mat-tab-group>
      <ng-container>
        <mat-tab label="One">
          <div style="height: 3000px; background-color: red"></div>
        </mat-tab>
        <mat-tab label="Two">
          <div style="height: 3000px; background-color: green"></div>
        </mat-tab>
      </ng-container>
    </mat-tab-group>
  `,
})
class TabGroupWithSpaceAbove {
  @ViewChild(MatLegacyTabGroup) tabGroup: MatLegacyTabGroup;
}

@Component({
  template: `
    <mat-tab-group>
      <mat-tab label="Parent 1">
        <mat-tab-group>
          <mat-tab label="Child 1">Content 1</mat-tab>
          <mat-tab>
            <ng-template mat-tab-label>Child 2</ng-template>
            Content 2
          </mat-tab>
          <mat-tab label="Child 3">Child 3</mat-tab>
        </mat-tab-group>
      </mat-tab>
      <mat-tab label="Parent 2">Parent 2</mat-tab>
      <mat-tab label="Parent 3">Parent 3</mat-tab>
    </mat-tab-group>
  `,
})
class NestedTabGroupWithLabel {}

@Component({
  template: `
    <mat-tab-group class="tab-group">
      <mat-tab label="Tab One" [labelClass]="labelClassList" [bodyClass]="bodyClassList">
        Tab one content
      </mat-tab>
      <mat-tab label="Tab Two" labelClass="hardcoded-label-class"
               bodyClass="hardcoded-body-class">
        Tab two content
      </mat-tab>
    </mat-tab-group>
  `,
})
class TabsWithClassesTestApp {
  labelClassList?: string | string[];
  bodyClassList?: string | string[];
}
