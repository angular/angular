import {
  Component,
  destroyPlatform,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';

import {Field} from '../../src/controls/field';

describe('UI bindings', () => {
  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  fit(
    'works',
    withBody('<app-cmp></app-cmp>', async () => {
      @Component({
        selector: 'app-cmp',
        template: `Hello world!`,
        imports: [Field],
      })
      class TestCmp {
        ngOnInit() {
          debugger;
        }
      }

      await bootstrapApplication(TestCmp, {
        providers: [provideExperimentalZonelessChangeDetection()],
      });
    }),
  );
});
