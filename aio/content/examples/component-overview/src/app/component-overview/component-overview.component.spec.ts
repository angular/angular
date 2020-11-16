import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentOverviewComponent } from './component-overview.component';

describe('ComponentOverviewComponent', () => {
  let component: ComponentOverviewComponent;
  let fixture: ComponentFixture<ComponentOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
