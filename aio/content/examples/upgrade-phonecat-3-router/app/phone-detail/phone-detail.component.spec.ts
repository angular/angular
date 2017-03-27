// #docregion
// #docregion activatedroute
import { ActivatedRoute } from '@angular/router';

// #enddocregion activatedroute
import { Observable } from 'rxjs/Rx';

import { async, TestBed } from '@angular/core/testing';

import { PhoneDetailComponent } from './phone-detail.component';
import { Phone, PhoneData } from '../core/phone/phone.service';
import { CheckmarkPipe } from '../core/checkmark/checkmark.pipe';

function xyzPhoneData(): PhoneData {
  return {
    name: 'phone xyz',
    snippet: '',
    images: ['image/url1.png', 'image/url2.png']
  };
}

class MockPhone {
  get(id: string): Observable<PhoneData> {
    return Observable.of(xyzPhoneData());
  }
}

// #docregion activatedroute

class ActivatedRouteMock {
  constructor(public snapshot: any) {}
}

// #enddocregion activatedroute

describe('PhoneDetailComponent', () => {

  // #docregion activatedroute

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckmarkPipe, PhoneDetailComponent ],
      providers: [
        { provide: Phone, useClass: MockPhone },
        { provide: ActivatedRoute, useValue: new ActivatedRouteMock({ params: { 'phoneId': 1 } }) }
      ]
    })
    .compileComponents();
  }));
  // #enddocregion activatedroute

  it('should fetch phone detail', () => {
    const fixture = TestBed.createComponent(PhoneDetailComponent);
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain(xyzPhoneData().name);
  });

});
