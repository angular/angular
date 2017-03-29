import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NavMenuComponent } from './nav-menu.component';
import { CurrentNode, NavigationService, NavigationViews, NavigationNode } from 'app/navigation/navigation.service';


describe('NavMenuComponent', () => {
  let component: NavMenuComponent;
  let fixture: ComponentFixture<NavMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavMenuComponent ],
      providers: [
        {provide: NavigationService, useClass: TestNavigationService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

//// Test Helpers ////
class TestNavigationService {
  navJson = {
    SideNav:  [
      { title: 'a', children: [
        { url: 'b', title: 'b', children: [
          { url: 'c', title: 'c' },
          { url: 'd', title: 'd' }
        ] },
        { url: 'e', title: 'e' }
      ] },
      { url: 'f', title: 'f' }
    ]
  };

  navigationViews = new BehaviorSubject<NavigationViews>(this.navJson);
  currentNode = new BehaviorSubject<CurrentNode>(undefined);
}
