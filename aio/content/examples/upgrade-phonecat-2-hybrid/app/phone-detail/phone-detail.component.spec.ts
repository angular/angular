import { TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';

import { PhoneDetailComponent } from './phone-detail.component';
import { Phone, PhoneData } from '../core/phone/phone.service';
import { CheckmarkPipe } from '../core/checkmark/checkmark.pipe';

function xyzPhoneData(): PhoneData {
  return {name: 'phone xyz', snippet: '', images: ['image/url1.png', 'image/url2.png']};
}

class MockPhone {
  get(id: string): Observable<PhoneData> {
    return of(xyzPhoneData());
  }
}


class ActivatedRouteMock {
  constructor(public snapshot: any) {}
}


describe('PhoneDetailComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckmarkPipe, PhoneDetailComponent ],
      providers: [
        { provide: Phone, useClass: MockPhone },
        { provide: ActivatedRoute, useValue: new ActivatedRouteMock({ params: { phoneId: 1 } }) }
      ]
    })
    .compileComponents();
  }));

  it('should fetch phone detail', () => {
    const fixture = TestBed.createComponent(PhoneDetailComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain(xyzPhoneData().name);
  });
});
