import { fakeAsync, tick} from '@angular/core/testing';
import { ReflectiveInjector } from '@angular/core';
import { Location, LocationStrategy, APP_BASE_HREF } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/delay';

import { NavEngine } from './nav-engine.service';

describe('NavEngine', () => {
  let injector: ReflectiveInjector;
  let location: MockLocationStrategy;
  let navEngine: NavEngine;

  beforeEach(() => {

    injector = ReflectiveInjector.resolveAndCreate([
      { provide: APP_BASE_HREF, useValue: 'http://localhost:4200'},
      NavEngine,
      Location,
      { provide: LocationStrategy, useClass: MockLocationStrategy }
    ]);
    navEngine = injector.get(NavEngine);
    location = injector.get(Location);

  });

  it('should set currentUrl fake url when navigate to fake url', fakeAsync(() => {
    navEngine.navigate('fake');
    tick();
    navEngine.currentUrl.subscribe(url => {
      expect(url).toBe('fake');
    });
  }));

});
