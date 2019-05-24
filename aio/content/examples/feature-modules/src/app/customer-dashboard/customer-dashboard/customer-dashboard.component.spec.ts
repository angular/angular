import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDashboardComponent } from './customer-dashboard.component';

describe('CustomerDashboardComponent', () => {
  let component: CustomerDashboardComponent;
  let fixture: ComponentFixture<CustomerDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
