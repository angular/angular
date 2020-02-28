import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopMenuComponent } from './top-menu.component';

describe('TopMenuComponent', () => {
  let component: TopMenuComponent;
  let fixture: ComponentFixture<TopMenuComponent>;

  // Helpers
  const getListItems = () => {
    const list: HTMLUListElement = fixture.debugElement.nativeElement.querySelector('ul');
    return Array.from(list.querySelectorAll('li'));
  };
  const getSelected = (items: HTMLLIElement[]) =>
    items.filter(item => item.classList.contains('selected'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TopMenuComponent,
      ],
    });

    fixture = TestBed.createComponent(TopMenuComponent);
    component = fixture.componentInstance;

    component.nodes = [
      {url: 'api', title: 'API', tooltip: 'API docs'},
      {url: 'features', title: 'Features', tooltip: 'Angular features overview'},
    ];
    fixture.detectChanges();
  });

  it('should create an item for each navigation node', () => {
    const items = getListItems();
    const links = items.map(item => item.querySelector('a'))
                      .filter((link): link is NonNullable<typeof link> => link !== null);

    expect(links.length).toBe(2);
    expect(links.map(link => link.pathname)).toEqual(['/api', '/features']);
    expect(links.map(link => link.textContent)).toEqual(['API', 'Features']);
    expect(links.map(link => link.title)).toEqual(['API docs', 'Angular features overview']);
  });

  it('should mark the currently selected node with `.selected`', () => {
    const items = getListItems();
    expect(getSelected(items)).toEqual([]);

    component.currentNode = {url: 'api', view: 'foo', nodes: []};
    fixture.detectChanges();
    expect(getSelected(items)).toEqual([items[0]]);

    component.currentNode = {url: 'features', view: 'foo', nodes: []};
    fixture.detectChanges();
    expect(getSelected(items)).toEqual([items[1]]);

    component.currentNode = {url: 'something/else', view: 'foo', nodes: []};
    fixture.detectChanges();
    expect(getSelected(items)).toEqual([]);
  });

  it('should not mark any node with `.selected` if the current URL is undefined', () => {
    component.nodes = [
      {url: '', title: 'API', tooltip: 'API docs'},
      {url: undefined, title: 'Features', tooltip: 'Angular features overview'},
    ];
    fixture.detectChanges();
    const items = getListItems();

    component.currentNode = undefined;
    fixture.detectChanges();
    expect(getSelected(items)).toEqual([]);
  });

  it('should correctly mark a node with `.selected` even if its URL is empty', () => {
    component.nodes = [
      {url: '', title: 'API', tooltip: 'API docs'},
      {url: undefined, title: 'Features', tooltip: 'Angular features overview'},
    ];
    fixture.detectChanges();
    const items = getListItems();

    component.currentNode = {url: '', view: 'Empty url', nodes: []};
    fixture.detectChanges();
    expect(getSelected(items)).toEqual([items[0]]);
  });
});
