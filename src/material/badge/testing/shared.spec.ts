import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatBadgeModule, MatBadgePosition, MatBadgeSize} from '@angular/material/badge';
import {MatBadgeHarness} from '@angular/material/badge/testing/badge-harness';

/** Shared tests to run on both the original and MDC-based badges. */
export function runHarnessTests(
    badgeModule: typeof MatBadgeModule, badgeHarness: typeof MatBadgeHarness) {
  let fixture: ComponentFixture<BadgeHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [badgeModule],
      declarations: [BadgeHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all badge harnesses', async () => {
    const badges = await loader.getAllHarnesses(badgeHarness);
    expect(badges.length).toBe(6);
  });

  it('should be able to get the text of a badge', async () => {
    const badge = await loader.getHarness(badgeHarness.with({selector: '#simple'}));

    expect(await badge.getText()).toBe('Simple badge');
    fixture.componentInstance.simpleContent = 'Changed simple badge';
    expect(await badge.getText()).toBe('Changed simple badge');
  });

  it('should load badge with exact text', async () => {
    const badges = await loader.getAllHarnesses(badgeHarness.with({text: 'Simple badge'}));
    expect(badges.length).toBe(1);
    expect(await badges[0].getText()).toBe('Simple badge');
  });

  it('should load badge with regex label match', async () => {
    const badges = await loader.getAllHarnesses(badgeHarness.with({text: /sized|disabled/i}));
    expect(badges.length).toBe(2);
    expect(await badges[0].getText()).toBe('Sized badge');
    expect(await badges[1].getText()).toBe('Disabled badge');
  });

  it('should get whether a badge is overlapping', async () => {
    const badge = await loader.getHarness(badgeHarness.with({selector: '#overlapping'}));

    expect(await badge.isOverlapping()).toBe(true);
    fixture.componentInstance.overlap = false;
    expect(await badge.isOverlapping()).toBe(false);
  });

  it('should get whether a badge is disabled', async () => {
    const badge = await loader.getHarness(badgeHarness.with({selector: '#disabled'}));

    expect(await badge.isDisabled()).toBe(true);
    fixture.componentInstance.disabled = false;
    expect(await badge.isDisabled()).toBe(false);
  });

  it('should get whether a badge is hidden', async () => {
    const badge = await loader.getHarness(badgeHarness.with({selector: '#hidden'}));

    expect(await badge.isHidden()).toBe(true);
    fixture.componentInstance.hidden = false;
    expect(await badge.isHidden()).toBe(false);
  });

  it('should get the position of a badge', async () => {
    const instance = fixture.componentInstance;
    const badge = await loader.getHarness(badgeHarness.with({selector: '#positioned'}));

    expect(await badge.getPosition()).toBe('above after');

    instance.position = 'below';
    expect(await badge.getPosition()).toBe('below after');

    instance.position = 'below before';
    expect(await badge.getPosition()).toBe('below before');

    instance.position = 'above';
    expect(await badge.getPosition()).toBe('above after');

    instance.position = 'above before';
    expect(await badge.getPosition()).toBe('above before');
  });

  it('should get the size of a badge', async () => {
    const instance = fixture.componentInstance;
    const badge = await loader.getHarness(badgeHarness.with({selector: '#sized'}));

    expect(await badge.getSize()).toBe('medium');

    instance.size = 'small';
    expect(await badge.getSize()).toBe('small');

    instance.size = 'large';
    expect(await badge.getSize()).toBe('large');
  });
}


@Component({
  template: `
    <button id="simple" [matBadge]="simpleContent">Simple</button>
    <button
      id="positioned"
      matBadge="Positioned badge"
      [matBadgePosition]="position">Positioned</button>
    <button
      id="sized"
      matBadge="Sized badge"
      [matBadgeSize]="size">Sized</button>
    <button
      id="overlapping"
      matBadge="Overlapping badge"
      [matBadgeOverlap]="overlap">Overlapping</button>
    <button
      id="hidden"
      matBadge="Hidden badge"
      [matBadgeHidden]="hidden">Hidden</button>
    <button
      id="disabled"
      matBadge="Disabled badge"
      [matBadgeDisabled]="disabled">Disabled</button>
  `
})
class BadgeHarnessTest {
  simpleContent = 'Simple badge';
  position: MatBadgePosition = 'above after';
  size: MatBadgeSize = 'medium';
  overlap = true;
  hidden = true;
  disabled = true;
}

