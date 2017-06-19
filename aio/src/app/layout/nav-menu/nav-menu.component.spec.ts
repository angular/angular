import { NavMenuComponent } from './nav-menu.component';
import { NavigationNode } from 'app/navigation/navigation.service';

// Testing the component class behaviors, independent of its template
// No dependencies, no life-cycle hooks. Just new it and test :)
// Let e2e tests verify how it displays.
describe('NavMenuComponent (class-only)', () => {
  it('should filter out hidden nodes', () => {
    const component = new NavMenuComponent();
    const nodes: NavigationNode[] =
      [ { title: 'a' }, { title: 'b', hidden: true}, { title: 'c'} ];
    component.nodes = nodes;
    expect(component.filteredNodes).toEqual([ nodes[0], nodes[2] ]);
  });
});
