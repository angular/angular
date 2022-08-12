import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatLegacyButtonHarness} from '@angular/material/legacy-button/testing';
import {MatLegacyCardHarness} from '@angular/material/legacy-card/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {CardHarnessExample} from './card-harness-example';

describe('CardHarnessExample', () => {
  let fixture: ComponentFixture<CardHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacyCardModule],
      declarations: [CardHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(CardHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should find card with text', async () => {
    const cards = await loader.getAllHarnesses(MatLegacyCardHarness.with({text: /spitz breed/}));
    expect(cards.length).toBe(1);
    expect(await cards[0].getTitleText()).toBe('Shiba Inu');
  });

  it('should get subtitle text', async () => {
    const cards = await loader.getAllHarnesses(MatLegacyCardHarness);
    expect(await parallel(() => cards.map(card => card.getSubtitleText()))).toEqual([
      '',
      'Dog Breed',
    ]);
  });

  it('should act as a harness loader for user content', async () => {
    const card = await loader.getHarness(MatLegacyCardHarness.with({title: 'Shiba Inu'}));
    const footerSubcomponents = (await card.getAllHarnesses(MatLegacyButtonHarness)) ?? [];
    expect(footerSubcomponents.length).toBe(2);
  });
});
