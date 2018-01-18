import { NgZone } from '@angular/core';
import { fakeAsync, ComponentFixture, TestBed, tick, MockNgZone } from '@angular/core/testing';
import { ZoneStableComponent } from './zone-stable.component';

describe('ZoneStableComponent', () => {

  let comp: ZoneStableComponent;
  let fixture: ComponentFixture<ZoneStableComponent>;
  let zone: MockNgZone;

  beforeEach(() => {
    TestBed.configureTestingModule({
       declarations: [ ZoneStableComponent ],
       providers:    [
         {provide: NgZone, useFactory: () => {
           zone = new MockNgZone();
           return zone;
         }}],
    });

    fixture = TestBed.createComponent(ZoneStableComponent);
    comp    = fixture.componentInstance;
  });

  it('should be able to trigger onStable with mockNgZone.simulateZoneExit (fakeAsync)', fakeAsync(() => {
    fixture.detectChanges();
    tick();                  // tick to trigger fake async timer
    fixture.detectChanges(); // update view
    expect(comp.isStable).toBe(false); // isStable will be false because onStable not emitted.
    zone.simulateZoneExit(); // simulate zone exit and emit onStable
    expect(comp.isStable).toBe(true);
  }));
});
