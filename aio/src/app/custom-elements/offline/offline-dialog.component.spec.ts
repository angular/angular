import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineDialogComponent } from './offline-dialog.component';

describe('OfflineDialogComponent', () => {
  let component: OfflineDialogComponent;
  let fixture: ComponentFixture<OfflineDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
