import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatCardHarness} from '@angular/material/card/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import {MatCardModule} from '@angular/material/card';
import {CardHarnessExample} from './card-harness-example';

describe('CardHarnessExample', () => {
  let fixture: ComponentFixture<CardHarnessExample>;
  let loader: HarnessLoader;
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCardModule],
      declarations: [CardHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(CardHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should find card with text', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness.with({text: /spitz breed/}));
    expect(cards.length).toBe(1);
    expect(await cards[0].getTitleText()).toBe('Shiba Inu');
  });

  it('should get subtitle text', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness);
    expect(await parallel(() => cards.map(card => card.getSubtitleText()))).toEqual([
      '',
      'Dog Breed'
    ]);
  });

  it('should act as a harness loader for user content', async () => {
    const card = await loader.getHarness(MatCardHarness.with({title: 'Shiba Inu'}));
    const footerSubcomponents = await card.getAllHarnesses(MatButtonHarness) ?? [];
    expect(footerSubcomponents.length).toBe(2);
  });
});
