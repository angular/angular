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
import { DocumentService, DocumentContents } from './document.service';


const CONTENT_URL_PREFIX = 'content/docs/';

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
    location: injector.get(LocationService) as MockLocationService,
    service: injector.get(DocumentService) as DocumentService,
    logger: injector.get(Logger) as MockLogger
  };
}

describe('DocumentService', () => {

  it('should be creatable', () => {
    const { service } = getServices();
    expect(service).toBeTruthy();
  });

  describe('currentDocument', () => {

    it('should fetch a document for the initial location url', () => {
      const { service, backend } = getServices('initial/url');
      const connections = backend.connectionsArray;
      service.currentDocument.subscribe();

      expect(connections.length).toEqual(1);
      expect(connections[0].request.url).toEqual(CONTENT_URL_PREFIX + 'initial/url.json');
      expect(backend.connectionsArray[0].request.url).toEqual(CONTENT_URL_PREFIX + 'initial/url.json');
    });

    it('should emit a document each time the location changes', () => {
      let latestDocument: DocumentContents;
      const doc0 = { title: 'doc 0' };
      const doc1 = { title: 'doc 1' };
      const { service, backend, location } = getServices('initial/url');
      const connections = backend.connectionsArray;

      service.currentDocument.subscribe(doc => latestDocument = doc);
      expect(latestDocument).toBeUndefined();

      connections[0].mockRespond(createResponse(doc0));
      expect(latestDocument).toEqual(doc0);

      location.urlSubject.next('new/url');
      connections[1].mockRespond(createResponse(doc1));
      expect(latestDocument).toEqual(doc1);
    });

    it('should emit the not-found document if the document is not found on the server', () => {
      const { service, backend } = getServices('missing/url');
      const connections = backend.connectionsArray;
      service.currentDocument.subscribe();

      connections[0].mockError(new Response(new ResponseOptions({ status: 404, statusText: 'NOT FOUND'})) as any);
      expect(connections.length).toEqual(2);
      expect(connections[1].request.url).toEqual(CONTENT_URL_PREFIX + 'file-not-found.json');
    });

    it('should emit a hard-coded not-found document if the not-found document is not found on the server', () => {
      let currentDocument: DocumentContents;
      const notFoundDoc = { title: 'Not Found', contents: 'Document not found' };
      const nextDoc = { title: 'Next Doc' };
      const { service, backend, location } = getServices('file-not-found');
      const connections = backend.connectionsArray;
      service.currentDocument.subscribe(doc => currentDocument = doc);

      connections[0].mockError(new Response(new ResponseOptions({ status: 404, statusText: 'NOT FOUND'})) as any);
      expect(connections.length).toEqual(1);
      expect(currentDocument).toEqual(notFoundDoc);

      // now check that we haven't killed the currentDocument observable sequence
      location.urlSubject.next('new/url');
      connections[1].mockRespond(createResponse(nextDoc));
      expect(currentDocument).toEqual(nextDoc);
    });

    it('should not crash the app if the response is not valid JSON', () => {
      let latestDocument: DocumentContents;
      const { service, backend, location } = getServices('initial/url');
      const connections = backend.connectionsArray;

      service.currentDocument.subscribe(doc => latestDocument = doc);

      connections[0].mockRespond(new Response(new ResponseOptions({ body: 'this is invalid JSON' })));
      expect(latestDocument.title).toEqual('Error fetching document');

      const doc1 = { title: 'doc 1' };
      location.urlSubject.next('new/url');
      connections[1].mockRespond(createResponse(doc1));
      expect(latestDocument).toEqual(doc1);
    });

    it('should not make a request to the server if the doc is in the cache already', () => {
      let latestDocument: DocumentContents;
      let subscription: Subscription;

      const doc0 = { title: 'doc 0' };
      const doc1 = { title: 'doc 1' };
      const { service, backend, location } = getServices('url/0');
      const connections = backend.connectionsArray;

      subscription = service.currentDocument.subscribe(doc => latestDocument = doc);
      expect(connections.length).toEqual(1);
      connections[0].mockRespond(createResponse(doc0));
      expect(latestDocument).toEqual(doc0);
      subscription.unsubscribe();

      // modify the response so we can check that future subscriptions do not trigger another request
      connections[0].response.next(createResponse({ title: 'error 0' }));

      subscription = service.currentDocument.subscribe(doc => latestDocument = doc);
      location.urlSubject.next('url/1');
      expect(connections.length).toEqual(2);
      connections[1].mockRespond(createResponse(doc1));
      expect(latestDocument).toEqual(doc1);
      subscription.unsubscribe();

      // modify the response so we can check that future subscriptions do not trigger another request
      connections[1].response.next(createResponse({ title: 'error 1' }));

      subscription = service.currentDocument.subscribe(doc => latestDocument = doc);
      location.urlSubject.next('url/0');
      expect(connections.length).toEqual(2);
      expect(latestDocument).toEqual(doc0);
      subscription.unsubscribe();

      subscription = service.currentDocument.subscribe(doc => latestDocument = doc);
      location.urlSubject.next('url/1');
      expect(connections.length).toEqual(2);
      expect(latestDocument).toEqual(doc1);
      subscription.unsubscribe();
    });
  });

  describe('computeMap', () => {
    it('should map the "empty" location to the correct document request', () => {
      let latestDocument: DocumentContents;
      const { service, backend } = getServices();
      service.currentDocument.subscribe(doc => latestDocument = doc);

      expect(backend.connectionsArray[0].request.url).toEqual(CONTENT_URL_PREFIX + 'index.json');
    });

    it('should map the "folder" locations to the correct document request', () => {
      const { service, backend, location } = getServices('guide/');
      service.currentDocument.subscribe();

      expect(backend.connectionsArray[0].request.url).toEqual(CONTENT_URL_PREFIX + 'guide.json');
    });
  });
});
