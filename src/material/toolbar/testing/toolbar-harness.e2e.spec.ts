import {HarnessLoader} from '@angular/cdk/testing';
import {browser} from 'protractor';
import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {MatToolbarHarness} from '@angular/material/toolbar/testing';

describe('toolbar harness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => await browser.get('/toolbar'));

  beforeEach(() => {
    loader = ProtractorHarnessEnvironment.loader();
  });

  it('should get toolbar text', async () => {
    const toolbar = await loader.getHarness(MatToolbarHarness);

    expect(await toolbar.getRowsAsText())
      .toEqual(['Custom Toolbar', 'Second Line\nverified_user', 'Third Line\nfavorite\ndelete']);
  });

  it('should have multiple rows', async () => {
    const toolbar = await loader.getHarness(MatToolbarHarness);

    expect(await toolbar.hasMultipleRows()).toBe(true);
  });
});
