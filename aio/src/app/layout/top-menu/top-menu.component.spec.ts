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
});
