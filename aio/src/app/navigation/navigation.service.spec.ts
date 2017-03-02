import { ReflectiveInjector } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { Http, ConnectionBackend, RequestOptions, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { NavigationService } from 'app/navigation/navigation.service';
import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';

describe('NavigationService', () => {

  let injector: ReflectiveInjector;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        NavigationService,
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
    const service: NavigationService = injector.get(NavigationService);
    expect(service).toBeTruthy();
  });

  xit('should fetch the navigation views', () => {});
  xit('should compute the navigation map', () => {});
});
