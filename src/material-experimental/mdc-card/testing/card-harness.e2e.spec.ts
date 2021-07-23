import {HarnessLoader} from '@angular/cdk/testing';
import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {MatCardHarness} from '@angular/material-experimental/mdc-card/testing/card-harness';
import {browser} from 'protractor';

describe('card harness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => await browser.get('/mdc-card'));

  beforeEach(() => {
    loader = ProtractorHarnessEnvironment.loader();
  });

  it('should get card text', async () => {
    const card = await loader.getHarness(MatCardHarness);
    expect(await card.getText()).toBe('Shiba InuDog Breed The Shiba Inu is the smallest of ' +
                                      'the six original and distinct spitz breeds of dog from ' +
                                      'Japan. A small, agile dog that copes very well with ' +
                                      'mountainous terrain, the Shiba Inu was originally bred ' +
                                      'for hunting. LIKESHARE');
  });

  it('should get title text', async () => {
    const card = await loader.getHarness(MatCardHarness);
    expect(await card.getTitleText()).toBe('Shiba Inu');
  });

  it('should get subtitle text', async () => {
    const card = await loader.getHarness(MatCardHarness);
    expect(await card.getSubtitleText()).toBe('Dog Breed');
  });
});
