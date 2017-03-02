import { ReflectiveInjector } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { Http, ConnectionBackend, RequestOptions, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';
import { DocumentService } from './document.service';

describe('DocumentService', () => {

  let injector: ReflectiveInjector;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        DocumentService,
        LocationService,
        Location,
        { provide: LocationStrategy, useClass: MockLocationStrategy },
        { provide: ConnectionBackend, useClass: MockBackend },
        { provide: RequestOptions, useClass: BaseRequestOptions },
        Http,
        Logger
    ]);
  });

  it('should be creatable', () => {
    const service: DocumentService = injector.get(DocumentService);
    expect(service).toBeTruthy();
  });
});
