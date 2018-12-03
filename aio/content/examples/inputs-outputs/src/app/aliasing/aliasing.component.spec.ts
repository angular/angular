import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AliasingComponent } from './aliasing.component';

describe('AliasingComponent', () => {
  let component: AliasingComponent;
  let fixture: ComponentFixture<AliasingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AliasingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AliasingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
