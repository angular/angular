import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorSubject } from 'rxjs';

import { TopMenuComponent } from './top-menu.component';
import { NavigationService, NavigationViews } from 'app/navigation/navigation.service';

describe('TopMenuComponent', () => {
  let component: TopMenuComponent;
  let fixture: ComponentFixture<TopMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ TopMenuComponent ],
      providers: [
        { provide: NavigationService, useClass: TestNavigationService }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopMenuComponent);
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
    TopBar: [
      {url: 'api', title: 'API' },
      {url: 'features', title: 'Features' }
    ],
  };

  navigationViews = new BehaviorSubject<NavigationViews>(this.navJson);
}
