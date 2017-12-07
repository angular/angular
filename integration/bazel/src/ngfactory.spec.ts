import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {platformServerTesting, ServerTestingModule} from '@angular/platform-server/testing';

import {AppModuleNgFactory} from './app.module.ngfactory';

describe('ngfactory generation', () => {
  it('should be able to create a component',
     (done) => platformServerTesting().bootstrapModuleFactory(AppModuleNgFactory).then(done));
});
