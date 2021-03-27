import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyComponent2Component } from './my-component2.component';

describe('MyComponent2Component', () => {
  let component: MyComponent2Component;
  let fixture: ComponentFixture<MyComponent2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyComponent2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
