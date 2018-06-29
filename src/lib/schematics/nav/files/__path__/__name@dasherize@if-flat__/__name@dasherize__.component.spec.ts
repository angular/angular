
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { <%= classify(name) %>Component } from './<%= dasherize(name) %>.component';

describe('<%= classify(name) %>Component', () => {
  let component: <%= classify(name) %>Component;
  let fixture: ComponentFixture<<%= classify(name) %>Component>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule],
      declarations: [<%= classify(name) %>Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(<%= classify(name) %>Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
