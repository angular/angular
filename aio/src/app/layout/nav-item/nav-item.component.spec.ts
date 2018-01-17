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
        expect(component.isSelected).toBe(false, 'becomes de-selected');
      });

      it('should collapse if previously expanded in narrow mode', () => {
        component.isWide = false;
        component.isExpanded = true;
        onChanges();
        expect(component.isExpanded).toBe(false, 'becomes collapsed');
      });

      it('should remain expanded in wide mode', () => {
        component.isWide = true;
        component.isExpanded = true;
        onChanges();
        expect(component.isExpanded).toBe(true, 'remains expanded');
      });
    });

    describe('when becomes a selected node', () => {

      // this node will be the selected node when ngOnChanges() called
      beforeEach(() => component.node = selectedNodes[0]);

      it('should select when previously not selected', () => {
        component.isSelected = false;
        onChanges();
        expect(component.isSelected).toBe(true, 'becomes selected');
      });

      it('should expand the current node or keep it expanded', () => {
        component.isExpanded = false;
        onChanges();
        expect(component.isExpanded).toBe(true, 'becomes true');

        component.isExpanded = true;
        onChanges();
        expect(component.isExpanded).toBe(true, 'remains true');
      });
    });

    describe('when becomes a selected ancestor node', () => {

      // this node will be a selected node ancestor header when ngOnChanges() called
      beforeEach(() => component.node = selectedNodes[2]);

      it('should select when previously not selected', () => {
        component.isSelected = false;
        onChanges();
        expect(component.isSelected).toBe(true, 'becomes selected');
      });

      it('should always expand this header', () => {
        component.isExpanded = false;
        onChanges();
        expect(component.isExpanded).toBe(true, 'becomes expanded');

        component.isExpanded = false;
        onChanges();
        expect(component.isExpanded).toBe(true, 'stays expanded');
      });
    });

    describe('when headerClicked()', () => {
      // current node doesn't matter in these tests.

      it('should expand when headerClicked() and previously collapsed', () => {
        component.isExpanded = false;
        component.headerClicked();
        expect(component.isExpanded).toBe(true, 'should be expanded');
      });

      it('should collapse when headerClicked() and previously expanded', () => {
        component.isExpanded = true;
        component.headerClicked();
        expect(component.isExpanded).toBe(false, 'should be collapsed');
      });

      it('should not change isSelected when headerClicked()', () => {
        component.isSelected = true;
        component.headerClicked();
        expect(component.isSelected).toBe(true, 'remains selected');

        component.isSelected = false;
        component.headerClicked();
        expect(component.isSelected).toBe(false, 'remains not selected');
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
      expect(children.length).toEqual(2, 'when IsWide is true');
      children.forEach(child => expect(child.componentInstance.isWide).toBe(true));

      component.isWide = false;
      component.ngOnChanges();
      fixture.detectChanges();
      children = fixture.debugElement.queryAll(By.directive(NavItemComponent));
      expect(children.length).toEqual(2, 'when IsWide is false');
      children.forEach(child => expect(child.componentInstance.isWide).toBe(false));
    });
  });
});
