/* tslint:disable */
// #docregion routestuff
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SpyLocation } from '@angular/common/testing';

import { PhoneListComponent } from './phone-list.component';
import { Phone, PhoneData } from '../core/phone/phone.service';

// #enddocregion routestuff

class ActivatedRouteMock {
  constructor(public snapshot: any) {}
}

class MockPhone {
  query(): Observable<PhoneData[]> {
    return Observable.of([
      {name: 'Nexus S', snippet: '', images: []},
      {name: 'Motorola DROID', snippet: '', images: []}
    ]);
  }
}

let fixture: ComponentFixture<PhoneListComponent>;

describe('PhoneList', () => {

  // #docregion routestuff

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneListComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: new ActivatedRouteMock({ params: { 'phoneId': 1 } }) },
        { provide: Location, useClass: SpyLocation },
        { provide: Phone, useClass: MockPhone },
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneListComponent);
  });
  // #enddocregion routestuff

  it('should create "phones" model with 2 phones fetched from xhr', () => {
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll('.phone-list-item').length).toBe(2);
    expect(
      compiled.querySelector('.phone-list-item:nth-child(1)').textContent
    ).toContain('Motorola DROID');
    expect(
      compiled.querySelector('.phone-list-item:nth-child(2)').textContent
    ).toContain('Nexus S');
  });

  xit('should set the default value of orderProp model', () => {
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
    expect(
      compiled.querySelector('select option:last-child').selected
    ).toBe(true);
  });

});
