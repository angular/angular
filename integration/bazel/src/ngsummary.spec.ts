import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {platformServerTesting, ServerTestingModule} from '@angular/platform-server/testing';

import {HelloWorldComponent} from './hello-world/hello-world.component';
import {HelloWorldModule} from './hello-world/hello-world.module';
import {HelloWorldModuleNgSummary} from './hello-world/hello-world.module.ngsummary';

describe('Jit Summaries', () => {
  beforeEach(() => {
    TestBed.initTestEnvironment(
        ServerTestingModule, platformServerTesting(), HelloWorldModuleNgSummary);
  });

  afterEach(() => {
    TestBed.resetTestEnvironment();
  });

  it('should be able to create a component', () => {
    const helloWorldComponent = TestBed.configureTestingModule({imports: [HelloWorldModule]})
                                    .createComponent(HelloWorldComponent);

    expect(helloWorldComponent).toBeDefined();
  });
});
