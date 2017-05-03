import { ReflectiveInjector } from '@angular/core';
import { Http, ConnectionBackend, RequestOptions, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MockBackend } from '@angular/http/testing';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';
import { DocumentService, DocumentContents,
         FETCHING_ERROR_ID, FILE_NOT_FOUND_ID } from './document.service';


const CONTENT_URL_PREFIX = 'generated/docs/';

function createResponse(body: any) {
  return new Response(new ResponseOptions({ body: JSON.stringify(body) }));
}

function createInjector(initialUrl: string) {
  return ReflectiveInjector.resolveAndCreate([
      DocumentService,
      { provide: LocationService, useFactory: () => new MockLocationService(initialUrl) },
      { provide: ConnectionBackend, useClass: MockBackend },
      { provide: RequestOptions, useClass: BaseRequestOptions },
      { provide: Logger, useClass: MockLogger },
      Http,
  ]);
}

function getServices(initialUrl: string = '') {
  const injector = createInjector(initialUrl);
  return {
    backend: injector.get(ConnectionBackend) as MockBackend,
    locationService: injector.get(LocationService) as MockLocationService,
    docService: injector.get(DocumentService) as DocumentService,
    logger: injector.get(Logger) as MockLogger
  };
}

describe('DocumentService', () => {

  it('should be creatable', () => {
    const { docService } = getServices();
    expect(docService).toBeTruthy();
  });

  describe('currentDocument', () => {

    it('should fetch a document for the initial location', () => {
      const { docService, backend } = getServices('initial/doc');
      const connections = backend.connectionsArray;
      docService.currentDocument.subscribe();

      expect(connections.length).toEqual(1);
      expect(connections[0].request.url).toEqual(CONTENT_URL_PREFIX + 'initial/doc.json');
      expect(backend.connectionsArray[0].request.url).toEqual(CONTENT_URL_PREFIX + 'initial/doc.json');
    });

    it('should emit a document each time the location changes', () => {
      let latestDocument: DocumentContents;
      const doc0 = { contents: 'doc 0', id: 'initial/doc' };
      const doc1 = { contents: 'doc 1', id: 'new/doc'  };
      const { docService, backend, locationService } = getServices('initial/doc');
      const connections = backend.connectionsArray;

      docService.currentDocument.subscribe(doc => latestDocument = doc);
      expect(latestDocument).toBeUndefined();

      connections[0].mockRespond(createResponse(doc0));
      expect(latestDocument).toEqual(doc0);

      locationService.go('new/doc');
      connections[1].mockRespond(createResponse(doc1));
      expect(latestDocument).toEqual(doc1);
    });

    it('should emit the not-found document if the document is not found on the server', () => {
      const { docService, backend } = getServices('missing/doc');
      const connections = backend.connectionsArray;
      let currentDocument: DocumentContents;
      docService.currentDocument.subscribe(doc => currentDocument = doc);

      connections[0].mockError(new Response(new ResponseOptions({ status: 404, statusText: 'NOT FOUND'})) as any);
      expect(connections.length).toEqual(2);
      expect(connections[1].request.url).toEqual(CONTENT_URL_PREFIX + 'file-not-found.json');
      const fileNotFoundDoc = { id: FILE_NOT_FOUND_ID, contents: '<h1>Page Not Found</h1>' };
      connections[1].mockRespond(createResponse(fileNotFoundDoc));
      expect(currentDocument).toEqual(fileNotFoundDoc);
    });

    it('should emit a hard-coded not-found document if the not-found document is not found on the server', () => {
      let currentDocument: DocumentContents;
      const notFoundDoc: DocumentContents = { contents: 'Document not found', id: FILE_NOT_FOUND_ID };
      const nextDoc = { contents: 'Next Doc', id: 'new/doc' };
      const { docService, backend, locationService } = getServices(FILE_NOT_FOUND_ID);
      const connections = backend.connectionsArray;
      docService.currentDocument.subscribe(doc => currentDocument = doc);

      connections[0].mockError(new Response(new ResponseOptions({ status: 404, statusText: 'NOT FOUND'})) as any);
      expect(connections.length).toEqual(1);
      expect(currentDocument).toEqual(notFoundDoc);

      // now check that we haven't killed the currentDocument observable sequence
      locationService.go('new/doc');
      connections[1].mockRespond(createResponse(nextDoc));
      expect(currentDocument).toEqual(nextDoc);
    });

    it('should not crash the app if the response is invalid JSON', () => {
      let latestDocument: DocumentContents;
      const { docService, backend, locationService} = getServices('initial/doc');
      const connections = backend.connectionsArray;

      docService.currentDocument.subscribe(doc => latestDocument = doc);

      connections[0].mockRespond(new Response(new ResponseOptions({ body: 'this is invalid JSON' })));
      expect(latestDocument.id).toEqual(FETCHING_ERROR_ID);

      const doc1 = { contents: 'doc 1' };
      locationService.go('new/doc');
      connections[1].mockRespond(createResponse(doc1));
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));
    });

    it('should not make a request to the server if the doc is in the cache already', () => {
      let latestDocument: DocumentContents;
      let subscription: Subscription;

      const doc0 = { contents: 'doc 0' };
      const doc1 = { contents: 'doc 1' };
      const { docService, backend, locationService} = getServices('url/0');
      const connections = backend.connectionsArray;

      subscription = docService.currentDocument.subscribe(doc => latestDocument = doc);
      expect(connections.length).toEqual(1);
      connections[0].mockRespond(createResponse(doc0));
      expect(latestDocument).toEqual(jasmine.objectContaining(doc0));
      subscription.unsubscribe();

      // modify the response so we can check that future subscriptions do not trigger another request
      connections[0].response.next(createResponse({ contents: 'error 0' }));

      subscription = docService.currentDocument.subscribe(doc => latestDocument = doc);
      locationService.go('url/1');
      expect(connections.length).toEqual(2);
      connections[1].mockRespond(createResponse(doc1));
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));
      subscription.unsubscribe();

      // modify the response so we can check that future subscriptions do not trigger another request
      connections[1].response.next(createResponse({ contents: 'error 1' }));

      subscription = docService.currentDocument.subscribe(doc => latestDocument = doc);
      locationService.go('url/0');
      expect(connections.length).toEqual(2);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc0));
      subscription.unsubscribe();

      subscription = docService.currentDocument.subscribe(doc => latestDocument = doc);
      locationService.go('url/1');
      expect(connections.length).toEqual(2);
      expect(latestDocument).toEqual(jasmine.objectContaining(doc1));
      subscription.unsubscribe();
    });
  });

  describe('computeMap', () => {
    it('should map the "empty" location to the correct document request', () => {
      let latestDocument: DocumentContents;
      const { docService, backend } = getServices();
      docService.currentDocument.subscribe(doc => latestDocument = doc);

      expect(backend.connectionsArray[0].request.url).toEqual(CONTENT_URL_PREFIX + 'index.json');
    });

    it('should map the "folder" locations to the correct document request', () => {
      const { docService, backend, locationService} = getServices('guide');
      docService.currentDocument.subscribe();

      expect(backend.connectionsArray[0].request.url).toEqual(CONTENT_URL_PREFIX + 'guide.json');
    });
  });
});
