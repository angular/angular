import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationService } from 'app/shared/location.service';
import { CurrentLocationComponent } from './current-location.component';

let currentPath: string;
class MockLocation {
  path() { return currentPath; }
}

describe('CurrentLocationComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentLocationComponent ],
      providers: [
        { provide: LocationService, useClass: MockLocation }
      ]
    });
    TestBed.compileComponents();
  }));

  it('should render the current location', () => {
    const fixture = TestBed.createComponent(CurrentLocationComponent);
    const element: HTMLElement = fixture.nativeElement;
    currentPath = 'a/b/c';
    fixture.detectChanges();
    expect(element.innerText).toEqual('a/b/c');
  });
});
