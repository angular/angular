import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Subscription } from 'rxjs';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';
import { htmlEscape } from 'safevalues';
import { MockLocationService } from 'testing/location.service';
import { MockLogger } from 'testing/logger.service';
import { DocumentService, DocumentContents,
         FETCHING_ERROR_ID, FILE_NOT_FOUND_ID } from './document.service';


const CONTENT_URL_PREFIX = 'generated/docs/';

describe('DocumentService', () => {

  let httpMock: HttpTestingController;

  function createInjector(initialUrl: string) {
    return TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DocumentService,
        { provide: LocationService, useFactory: () => new MockLocationService(initialUrl) },
        { provide: Logger, useClass: MockLogger },
      ]
    });
  }

  function getServices(initialUrl: string = '') {
    const injector = createInjector(initialUrl);
    httpMock = injector.inject(HttpTestingController);
    return {
      locationService: injector.inject(LocationService) as any as MockLocationService,
      docService: injector.inject(DocumentService) as any as DocumentService,
      logger: injector.inject(Logger) as any as MockLogger,
    };
  }

  afterEach(() => httpMock.verify());

  describe('currentDocument', () => {

    it('should fetch a document for the initial location', () => {
      const { docService } = getServices('initial/doc');
      docService.currentDocument.subscribe();

      httpMock.expectOne(CONTENT_URL_PREFIX + 'initial/doc.json');
      expect().nothing();  // Prevent jasmine from complaining about no expectations.
    });

    it('should emit a document each time the location changes', () => {
      let latestDocument: DocumentContents|undefined;
      const doc0 = { contents: 'doc 0', id: 'initial/doc' };
      const doc1 = { contents: 'doc 1', id: 'new/doc' };
      const { docService, locationService } = getServices('initial/doc');

      docService.currentDocument.subscribe(doc => latestDocument = doc);
      expect(latestDocument).toBeUndefined();

      httpMock.expectOne({}).flush(doc0);
      expect(latestDocument?.id).toBe(doc0.id);
      expect(latestDocument?.contents?.toString()).toBe(doc0.contents);

      locationService.go('new/doc');
      httpMock.expectOne({}).flush(doc1);
      expect(latestDocument?.id).toBe(doc1.id);
      expect(latestDocument?.contents?.toString()).toBe(doc1.contents);
    });

    it('should encode the request path to be case-insensitive', () => {
      const { docService, locationService } = getServices('initial/Doc');
      docService.currentDocument.subscribe();

      expect(() => {
        httpMock.expectOne(CONTENT_URL_PREFIX + 'initial/d_oc.json').flush({});
        locationService.go('NEW/Doc');
        httpMock.expectOne(CONTENT_URL_PREFIX + 'n_e_w_/d_oc.json').flush({});
        locationService.go('doc_with_underscores');
        httpMock.expectOne(CONTENT_URL_PREFIX + 'doc__with__underscores.json').flush({});
        locationService.go('DOC_WITH_UNDERSCORES');
        httpMock.expectOne(CONTENT_URL_PREFIX + 'd_o_c___w_i_t_h___u_n_d_e_r_s_c_o_r_e_s_.json').flush({});
      }).not.toThrow();
    });

    it('should emit the not-found document if the document is not found on the server', () => {
      let currentDocument: DocumentContents|undefined;
      const notFoundDoc = { id: FILE_NOT_FOUND_ID, contents: '<h1>Page Not Found</h1>' };
      const { docService, logger } = getServices('missing/doc');
      docService.currentDocument.subscribe(doc => currentDocument = doc);

      // Initial request return 404.
      httpMock.expectOne({}).flush(null, {status: 404, statusText: 'NOT FOUND'});
      expect(logger.output.error).toEqual([
        [jasmine.any(Error)]
      ]);
      expect(logger.output.error[0][0].message).toEqual("Document file not found at 'missing/doc'");

      // Subsequent request for not-found document.
      logger.output.error = [];
      httpMock.expectOne(CONTENT_URL_PREFIX + 'file-not-found.json').flush(notFoundDoc);
      expect(logger.output.error).toEqual([]); // does not report repeated errors
      expect(currentDocument?.id).toBe(notFoundDoc.id);
      expect(currentDocument?.contents?.toString()).toBe(notFoundDoc.contents);
    });

    it('should emit a hard-coded not-found document if the not-found document is not found on the server', () => {
      let currentDocument: DocumentContents|undefined;
      const hardCodedNotFoundDoc = { contents: 'Document not found', id: FILE_NOT_FOUND_ID };
      const nextDoc = { contents: 'Next Doc', id: 'new/doc' };
      const { docService, locationService } = getServices(FILE_NOT_FOUND_ID);

      docService.currentDocument.subscribe(doc => currentDocument = doc);

      httpMock.expectOne({}).flush(null, {status: 404, statusText: 'NOT FOUND'});
      expect(currentDocument?.id).toBe(hardCodedNotFoundDoc.id);
      expect(currentDocument?.contents?.toString()).toBe(hardCodedNotFoundDoc.contents);

      // now check that we haven't killed the currentDocument observable sequence
      locationService.go('new/doc');
      httpMock.expectOne({}).flush(nextDoc);
      expect(currentDocument?.id).toBe(nextDoc.id);
      expect(currentDocument?.contents?.toString()).toBe(nextDoc.contents);
    });

    it('should use a hard-coded error doc if the request fails (but not cache it)', () => {
      let latestDocument!: DocumentContents;
      const doc1 = { contents: htmlEscape('doc 1') } as DocumentContents;
      const doc2 = { contents: htmlEscape('doc 2') } as DocumentContents;
      const { docService, locationService, logger } = getServices('initial/doc');

      docService.currentDocument.subscribe(doc => latestDocument = doc);

      httpMock.expectOne({}).flush(null, {status: 500, statusText: 'Server Error'});
      expect(latestDocument.id).toBe(FETCHING_ERROR_ID);
      expect(
        latestDocument.contents?.toString()
      ).toContain('We are unable to retrieve the "initial/doc" page at this time.');
      expect(logger.output.error).toEqual([
        [jasmine.any(Error)]
      ]);
      expect(logger.output.error[0][0].message)
        .toEqual(
          'Error fetching document \'initial/doc\': ' +
          '(Http failure response for generated/docs/initial/doc.json: 500 Server Error)'
        );

      locationService.go('new/doc');
      httpMock.expectOne({}).flush(doc1);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));

      locationService.go('initial/doc');
      httpMock.expectOne({}).flush(doc2);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc2));
    });

    it('should not crash the app if the response is invalid JSON', () => {
      let latestDocument!: DocumentContents;
      const doc1 = { contents: htmlEscape('doc 1') } as DocumentContents;
      const { docService, locationService } = getServices('initial/doc');

      docService.currentDocument.subscribe(doc => latestDocument = doc);

      httpMock.expectOne({}).flush('this is invalid JSON');
      expect(latestDocument.id).toEqual(FETCHING_ERROR_ID);

      locationService.go('new/doc');
      httpMock.expectOne({}).flush(doc1);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));
    });

    it('should not make a request to the server if the doc is in the cache already', () => {
      let latestDocument!: DocumentContents;
      let subscription: Subscription;

      const doc0 = { contents: htmlEscape('doc 0') } as DocumentContents;
      const doc1 = { contents: htmlEscape('doc 1') } as DocumentContents;
      const { docService, locationService } = getServices('url/0');

      subscription = docService.currentDocument.subscribe(doc => latestDocument = doc);
      httpMock.expectOne({}).flush(doc0);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc0));
      subscription.unsubscribe();

      subscription = docService.currentDocument.subscribe(doc => latestDocument = doc);
      locationService.go('url/1');
      httpMock.expectOne({}).flush(doc1);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));
      subscription.unsubscribe();

      // This should not trigger a new request.
      subscription = docService.currentDocument.subscribe(doc => latestDocument = doc);
      locationService.go('url/0');
      httpMock.expectNone({});
      expect(latestDocument).toEqual(jasmine.objectContaining(doc0));
      subscription.unsubscribe();

      // This should not trigger a new request.
      subscription = docService.currentDocument.subscribe(doc => latestDocument = doc);
      locationService.go('url/1');
      httpMock.expectNone({});
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));
      subscription.unsubscribe();
    });
  });

  describe('computeMap', () => {
    it('should map the "empty" location to the correct document request', () => {
      const { docService } = getServices();
      docService.currentDocument.subscribe();

      httpMock.expectOne(CONTENT_URL_PREFIX + 'index.json');
      expect().nothing();  // Prevent jasmine from complaining about no expectations.
    });

    it('should map the "folder" locations to the correct document request', () => {
      const { docService } = getServices('guide');
      docService.currentDocument.subscribe();

      httpMock.expectOne(CONTENT_URL_PREFIX + 'guide.json');
      expect().nothing();  // Prevent jasmine from complaining about no expectations.
    });
  });
});
