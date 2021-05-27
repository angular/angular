import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { NavItemComponent } from './nav-item.component';
import { NavigationNode } from 'app/navigation/navigation.model';

describe('NavItemComponent', () => {

  // Testing the component class behaviors, independent of its template
  // No dependencies. Just new it and test :)
  // Let e2e tests verify how it displays.
  describe('(class-only)', () => {

    let component: NavItemComponent;

    let selectedNodes: NavigationNode[];
    let setClassesSpy: jasmine.Spy;

    function initialize(nd: NavigationNode) {
      component.node = nd;
      onChanges(); // Angular calls when initializing the component
    }

    // Enough to triggers component's ngOnChange method
    function onChanges() {
      component.ngOnChanges();
    }

    beforeEach(() => {

      component = new NavItemComponent();
      setClassesSpy = spyOn(component, 'setClasses').and.callThrough();

      // Selected nodes is the selected node and its header ancestors
      selectedNodes = [
        { title: 'a' },           // selected node: an item or a header
        { title: 'parent' },      // selected node's header parent
        { title: 'grandparent' }, // selected node's header grandparent
      ];
      component.selectedNodes = selectedNodes;
    });

    describe('should have expected classes when initialized', () => {
      it('with selected node', () => {
        initialize(selectedNodes[0]);
        expect(component.classes).toEqual(
          // selected node should be expanded even if is a header.
          { 'level-1': true, collapsed: false, expanded: true, selected: true }
        );
      });

      it('with selected node ancestor', () => {
        initialize(selectedNodes[1]);
        expect(component.classes).toEqual(
          // ancestor is a header and should be expanded
          { 'level-1': true, collapsed: false, expanded: true, selected: true }
        );
      });

      it('with other than a selected node or ancestor', () => {
        initialize({ title: 'x' });
        expect(component.classes).toEqual(
          { 'level-1': true, collapsed: true, expanded: false, selected: false }
        );
      });
    });

    describe('when becomes a non-selected node', () => {

      // this node won't be the selected node when ngOnChanges() called
      beforeEach(() => component.node = { title: 'x' });

      it('should de-select if previously selected', () => {
        component.isSelected = true;
        onChanges();
        expect(component.isSelected).withContext('becomes de-selected').toBe(false);
      });

      it('should collapse if previously expanded in narrow mode', () => {
        component.isWide = false;
        component.isExpanded = true;
        onChanges();
        expect(component.isExpanded).withContext('becomes collapsed').toBe(false);
      });

      it('should remain expanded in wide mode', () => {
        component.isWide = true;
        component.isExpanded = true;
        onChanges();
        expect(component.isExpanded).withContext('remains expanded').toBe(true);
      });
    });

    describe('when becomes a selected node', () => {

      // this node will be the selected node when ngOnChanges() called
      beforeEach(() => component.node = selectedNodes[0]);

      it('should select when previously not selected', () => {
        component.isSelected = false;
        onChanges();
        expect(component.isSelected).withContext('becomes selected').toBe(true);
      });

      it('should expand the current node or keep it expanded', () => {
        component.isExpanded = false;
        onChanges();
        expect(component.isExpanded).withContext('becomes true').toBe(true);

        component.isExpanded = true;
        onChanges();
        expect(component.isExpanded).withContext('remains true').toBe(true);
      });
    });

    describe('when becomes a selected ancestor node', () => {

      // this node will be a selected node ancestor header when ngOnChanges() called
      beforeEach(() => component.node = selectedNodes[2]);

      it('should select when previously not selected', () => {
        component.isSelected = false;
        onChanges();
        expect(component.isSelected).withContext('becomes selected').toBe(true);
      });

      it('should always expand this header', () => {
        component.isExpanded = false;
        onChanges();
        expect(component.isExpanded).withContext('becomes expanded').toBe(true);

        component.isExpanded = false;
        onChanges();
        expect(component.isExpanded).withContext('stays expanded').toBe(true);
      });
    });

    describe('when headerClicked()', () => {
      // current node doesn't matter in these tests.

      it('should expand when headerClicked() and previously collapsed', () => {
        component.isExpanded = false;
        component.headerClicked();
        expect(component.isExpanded).withContext('should be expanded').toBe(true);
      });

      it('should collapse when headerClicked() and previously expanded', () => {
        component.isExpanded = true;
        component.headerClicked();
        expect(component.isExpanded).withContext('should be collapsed').toBe(false);
      });

      it('should not change isSelected when headerClicked()', () => {
        component.isSelected = true;
        component.headerClicked();
        expect(component.isSelected).withContext('remains selected').toBe(true);

        component.isSelected = false;
        component.headerClicked();
        expect(component.isSelected).withContext('remains not selected').toBe(false);
      });

      it('should set classes', () => {
        component.headerClicked();
        expect(setClassesSpy).toHaveBeenCalled();
      });
    });
  });

  describe('(via TestBed)', () => {
    let component: NavItemComponent;
    let fixture: ComponentFixture<NavItemComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [NavItemComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(NavItemComponent);
      component = fixture.componentInstance;
      component.node = {
        title: 'x',
        children: [
          { title: 'a' },
          { title: 'b', hidden: true},
          { title: 'c' }
        ]
      };
    });

    it('should not show the hidden child nav-item', () => {
      component.ngOnChanges(); // assume component.ngOnChanges ignores arguments
      fixture.detectChanges();
      const children = fixture.debugElement.queryAll(By.directive(NavItemComponent));
      expect(children.length).toEqual(2);
    });

    it('should pass the `isWide` property to all displayed child nav-items', () => {
      component.isWide = true;
      component.ngOnChanges(); // assume component.ngOnChanges ignores arguments
      fixture.detectChanges();
      let children = fixture.debugElement.queryAll(By.directive(NavItemComponent));
      expect(children.length).withContext('when IsWide is true').toEqual(2);
      children.forEach(child => expect(child.componentInstance.isWide).toBe(true));

      component.isWide = false;
      component.ngOnChanges();
      fixture.detectChanges();
      children = fixture.debugElement.queryAll(By.directive(NavItemComponent));
      expect(children.length).withContext('when IsWide is false').toEqual(2);
      children.forEach(child => expect(child.componentInstance.isWide).toBe(false));
    });
  });
});
