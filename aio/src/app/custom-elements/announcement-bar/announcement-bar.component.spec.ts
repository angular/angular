import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';
import { AnnouncementBarComponent } from './announcement-bar.component';

const today = new Date();
const lastWeek = changeDays(today, -7);
const yesterday = changeDays(today, -1);
const tomorrow = changeDays(today, 1);
const nextWeek = changeDays(today, 7);

describe('AnnouncementBarComponent', () => {

  let element: HTMLElement;
  let fixture: ComponentFixture<AnnouncementBarComponent>;
  let component: AnnouncementBarComponent;
  let httpMock: HttpTestingController;
  let mockLogger: MockLogger;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AnnouncementBarComponent],
      providers: [{ provide: Logger, useClass: MockLogger }]
    });

    httpMock = injector.inject(HttpTestingController);
    mockLogger = injector.inject(Logger) as any;
    fixture = TestBed.createComponent(AnnouncementBarComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should have no announcement when first created', () => {
    expect(component.announcement).toBeUndefined();
  });

  describe('ngOnInit', () => {
    it('should make a single request to the server', () => {
      component.ngOnInit();
      httpMock.expectOne('generated/announcements.json');
      expect().nothing();  // Prevent jasmine from complaining about no expectations.
    });

    it('should set the announcement to the first "live" one in the list loaded from `announcements.json`', () => {
      component.ngOnInit();
      const request = httpMock.expectOne('generated/announcements.json');
      request.flush([
        { startDate: lastWeek, endDate: yesterday, message: 'Test Announcement 0' },
        { startDate: tomorrow, endDate: nextWeek, message: 'Test Announcement 1' },
        { startDate: yesterday, endDate: tomorrow, message: 'Test Announcement 2' },
        { startDate: yesterday, endDate: tomorrow, message: 'Test Announcement 3' }
      ]);
      expect(component.announcement.message).toEqual('Test Announcement 2');
    });

    it('should set the announcement to `undefined` if there are no announcements in `announcements.json`', () => {
      component.ngOnInit();
      const request = httpMock.expectOne('generated/announcements.json');
      request.flush([]);
      expect(component.announcement).toBeUndefined();
    });

    it('should handle invalid data in `announcements.json`', () => {
      component.ngOnInit();
      const request = httpMock.expectOne('generated/announcements.json');
      request.flush('some random response');
      expect(component.announcement).toBeUndefined();
      expect(mockLogger.output.error).toEqual([
        [jasmine.any(Error)]
      ]);
      expect(mockLogger.output.error[0][0].message).toMatch(/^generated\/announcements\.json contains invalid data:/);
    });

    it('should handle a failed request for `announcements.json`', () => {
      component.ngOnInit();
      const request = httpMock.expectOne('generated/announcements.json');
      request.error(new ErrorEvent('404'));
      expect(component.announcement).toBeUndefined();
      expect(mockLogger.output.error).toEqual([
        [jasmine.any(Error)]
      ]);
      expect(mockLogger.output.error[0][0].message).toMatch(/^generated\/announcements\.json request failed:/);
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      component.announcement = {
        imageUrl: 'dummy/image',
        linkUrl: 'link/to/website',
        message: 'this is an <b>important</b> message',
        endDate: '2018-03-01',
        startDate: '2018-02-01'
      };
      fixture.detectChanges();
    });

    it('should display the message as HTML', () => {
      expect(element.innerHTML).toContain('this is an <b>important</b> message');
    });

    it('should display an image', () => {
      expect(element.querySelector('img')?.src).toContain('dummy/image');
    });

    it('should display a link', () => {
      expect(element.querySelector('a')?.href).toContain('link/to/website');
    });
  });
});

function changeDays(initial: Date, days: number) {
  return (new Date(initial.valueOf()).setDate(initial.getDate() + days));
}
