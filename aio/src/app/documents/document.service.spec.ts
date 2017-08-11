import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { Logger } from 'app/shared/logger.service';
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
    httpMock = injector.get(HttpTestingController) as HttpTestingController;
    return {
      locationService: injector.get(LocationService) as MockLocationService,
      docService: injector.get(DocumentService) as DocumentService,
      logger: injector.get(Logger) as MockLogger
    };
  }

  afterEach(() => httpMock.verify());

  describe('currentDocument', () => {

    it('should fetch a document for the initial location', () => {
      const { docService } = getServices('initial/doc');
      docService.currentDocument.subscribe();

      httpMock.expectOne(CONTENT_URL_PREFIX + 'initial/doc.json');
    });

    it('should emit a document each time the location changes', () => {
      let latestDocument: DocumentContents;
      const doc0 = { contents: 'doc 0', id: 'initial/doc' };
      const doc1 = { contents: 'doc 1', id: 'new/doc' };
      const { docService, locationService } = getServices('initial/doc');

      docService.currentDocument.subscribe(doc => latestDocument = doc);
      expect(latestDocument).toBeUndefined();

      httpMock.expectOne({}).flush(doc0);
      expect(latestDocument).toEqual(doc0);

      locationService.go('new/doc');
      httpMock.expectOne({}).flush(doc1);
      expect(latestDocument).toEqual(doc1);
    });

    it('should emit the not-found document if the document is not found on the server', () => {
      let currentDocument: DocumentContents;
      const notFoundDoc = { id: FILE_NOT_FOUND_ID, contents: '<h1>Page Not Found</h1>' };
      const { docService } = getServices('missing/doc');
      docService.currentDocument.subscribe(doc => currentDocument = doc);

      // Initial request return 404.
      httpMock.expectOne({}).flush(null, {status: 404, statusText: 'NOT FOUND'});

      // Subsequent request for not-found document.
      httpMock.expectOne(CONTENT_URL_PREFIX + 'file-not-found.json').flush(notFoundDoc);

      expect(currentDocument).toEqual(notFoundDoc);
    });

    it('should emit a hard-coded not-found document if the not-found document is not found on the server', () => {
      let currentDocument: DocumentContents;
      const hardCodedNotFoundDoc = { contents: 'Document not found', id: FILE_NOT_FOUND_ID };
      const nextDoc = { contents: 'Next Doc', id: 'new/doc' };
      const { docService, locationService } = getServices(FILE_NOT_FOUND_ID);

      docService.currentDocument.subscribe(doc => currentDocument = doc);

      httpMock.expectOne({}).flush(null, { status: 404, statusText: 'NOT FOUND'});
      expect(currentDocument).toEqual(hardCodedNotFoundDoc);

      // now check that we haven't killed the currentDocument observable sequence
      locationService.go('new/doc');
      httpMock.expectOne({}).flush(nextDoc);
      expect(currentDocument).toEqual(nextDoc);
    });

    it('should use a hard-coded error doc if the request fails (but not cache it)', () => {
      let latestDocument: DocumentContents;
      const doc1 = { contents: 'doc 1' };
      const doc2 = { contents: 'doc 2' };
      const { docService, locationService } = getServices('initial/doc');

      docService.currentDocument.subscribe(doc => latestDocument = doc);

      httpMock.expectOne({}).flush(null, {status: 500, statusText: 'Server Error'});
      expect(latestDocument.id).toEqual(FETCHING_ERROR_ID);

      locationService.go('new/doc');
      httpMock.expectOne({}).flush(doc1);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));

      locationService.go('initial/doc');
      httpMock.expectOne({}).flush(doc2);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc2));
    });

    it('should not crash the app if the response is invalid JSON', () => {
      let latestDocument: DocumentContents;
      const doc1 = { contents: 'doc 1' };
      const { docService, locationService } = getServices('initial/doc');

      docService.currentDocument.subscribe(doc => latestDocument = doc);

      httpMock.expectOne({}).flush('this is invalid JSON');
      expect(latestDocument.id).toEqual(FETCHING_ERROR_ID);

      locationService.go('new/doc');
      httpMock.expectOne({}).flush(doc1);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));
    });

    it('should not make a request to the server if the doc is in the cache already', () => {
      let latestDocument: DocumentContents;
      let subscription: Subscription;

      const doc0 = { contents: 'doc 0' };
      const doc1 = { contents: 'doc 1' };
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
      let latestDocument: DocumentContents;
      const { docService } = getServices();

      docService.currentDocument.subscribe(doc => latestDocument = doc);

      httpMock.expectOne(CONTENT_URL_PREFIX + 'index.json');
    });

    it('should map the "folder" locations to the correct document request', () => {
      const { docService } = getServices('guide');
      docService.currentDocument.subscribe();

      httpMock.expectOne(CONTENT_URL_PREFIX + 'guide.json');
    });
  });
});
