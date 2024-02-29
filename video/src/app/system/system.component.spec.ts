import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemComponent } from './system.component';

describe('SystemComponent', () => {
  let component: SystemComponent;
  let fixture: ComponentFixture<SystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
