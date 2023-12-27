import { inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Phone, PhoneData } from './phone.service';

describe('Phone', () => {
  let phone: Phone;
  const phonesData: PhoneData[] = [
    {name: 'Phone X', snippet: '', images: []},
    {name: 'Phone Y', snippet: '', images: []},
    {name: 'Phone Z', snippet: '', images: []}
  ];
  let mockHttp: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Phone]
    });
  });

  beforeEach(inject([HttpTestingController, Phone], (_mockHttp_: HttpTestingController, _phone_: Phone) => {
    mockHttp = _mockHttp_;
    phone = _phone_;
  }));

  it('should fetch the phones data from `/phones/phones.json`', () => {
    phone.query().subscribe(result => {
      expect(result).toEqual(phonesData);
    });
    const req = mockHttp.expectOne(`/phones/phones.json`);
    req.flush(phonesData);
  });

});
