/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing/button-harness';
import {MIDDLE_BUTTON, NUM_BUTTONS} from './constants';
import {benchmark} from './testbed-benchmark-utilities';

describe('performance for the testbed harness environment', () => {
  let fixture: ComponentFixture<ButtonHarnessTest>;
  let loader: HarnessLoader;

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 36000000;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [ButtonHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('(baseline)', () => {
    it('should find a button', async () => {
      await benchmark('(baseline) find a button', async () => {
        document.querySelector('button');
      });
    });

    it('should find all buttons', async () => {
      await benchmark('(baseline) find all buttons', async () => {
        document.querySelectorAll('button');
      });
    });

    it('should find a button via text filter', async () => {
      await benchmark('(baseline) find a button via text filter', async () => {
        return Array.from(document.querySelectorAll('button')).filter(
          b => b.innerText === MIDDLE_BUTTON,
        );
      });
    });

    it('should click a button', async () => {
      const button = document.querySelector('button')!;
      await benchmark('(baseline) click a button', async () => {
        button.click();
        fixture.detectChanges();
      });
    });

    it('should click all buttons', async () => {
      const buttons = Array.prototype.slice.call(document.querySelectorAll('button'));
      await benchmark('(baseline) click all buttons', async () => {
        buttons.forEach(button => button.click());
        fixture.detectChanges();
      });
    });
  });

  describe('(with harness)', () => {
    it('should find a button', async () => {
      await benchmark('(with harness) find a button', async () => {
        await loader.getHarness(MatButtonHarness);
      });
    });

    it('should find all buttons', async () => {
      await benchmark('(with harness) find all buttons', async () => {
        await loader.getAllHarnesses(MatButtonHarness);
      });
    });

    it('should find a button via text filter', async () => {
      await benchmark('(with harness) find a button via text filter', async () => {
        await loader.getAllHarnesses(MatButtonHarness.with({text: MIDDLE_BUTTON}));
      });
    });

    it('should click a button', async () => {
      const button = await loader.getHarness(MatButtonHarness);
      await benchmark('(with harness) click a button', async () => {
        await button.click();
      });
    });

    it('should click all buttons', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      await benchmark('(with harness) click all buttons', async () => {
        await Promise.all(buttons.map(button => button.click()));
      });
    });
  });

  // Enable this to see performance numbers in the console. Otherwise benchmark
  // results are either put by benchpress into the runfile directory, or
  // the `--test_output=streamed` Bazel flag should be used.
  // it('should fail intentionally so performance numbers are logged', fail);
});

@Component({
  template: `
    <button *ngFor="let val of vals" mat-button> {{ val }} </button>
  `,
})
export class ButtonHarnessTest {
  vals = Array.from({length: NUM_BUTTONS}, (_, i) => i);
}
