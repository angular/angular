import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatIconHarness} from '@angular/material/icon/testing/icon-harness';
import {DomSanitizer} from '@angular/platform-browser';
import {IconType} from './icon-harness-filters';

/** Shared tests to run on both the original and MDC-based icons. */
export function runHarnessTests(
  iconModule: typeof MatIconModule,
  iconRegistry: typeof MatIconRegistry,
  iconHarness: typeof MatIconHarness,
) {
  let fixture: ComponentFixture<IconHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [iconModule],
      declarations: [IconHarnessTest],
    }).compileComponents();

    const registry = TestBed.inject(iconRegistry);
    const sanitizer = TestBed.inject(DomSanitizer);

    registry.addSvgIconLiteralInNamespace(
      'svgIcons',
      'svgIcon',
      sanitizer.bypassSecurityTrustHtml('<svg></svg>'),
    );
    fixture = TestBed.createComponent(IconHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all icon harnesses', async () => {
    const icons = await loader.getAllHarnesses(iconHarness);
    expect(icons.length).toBe(4);
  });

  it('should filter icon harnesses based on their type', async () => {
    const [svgIcons, fontIcons] = await parallel(() => [
      loader.getAllHarnesses(iconHarness.with({type: IconType.SVG})),
      loader.getAllHarnesses(iconHarness.with({type: IconType.FONT})),
    ]);

    expect(svgIcons.length).toBe(1);
    expect(fontIcons.length).toBe(3);
  });

  it('should filter icon harnesses based on their name', async () => {
    const [regexFilterResults, stringFilterResults] = await parallel(() => [
      loader.getAllHarnesses(iconHarness.with({name: /^font/})),
      loader.getAllHarnesses(iconHarness.with({name: 'fontIcon'})),
    ]);

    expect(regexFilterResults.length).toBe(1);
    expect(stringFilterResults.length).toBe(1);
  });

  it('should filter icon harnesses based on their namespace', async () => {
    const [regexFilterResults, stringFilterResults, nullFilterResults] = await parallel(() => [
      loader.getAllHarnesses(iconHarness.with({namespace: /^font/})),
      loader.getAllHarnesses(iconHarness.with({namespace: 'svgIcons'})),
      loader.getAllHarnesses(iconHarness.with({namespace: null})),
    ]);

    expect(regexFilterResults.length).toBe(1);
    expect(stringFilterResults.length).toBe(1);
    expect(nullFilterResults.length).toBe(2);
  });

  it('should get the type of each icon', async () => {
    const icons = await loader.getAllHarnesses(iconHarness);
    const types = await parallel(() => icons.map(icon => icon.getType()));
    expect(types).toEqual([IconType.FONT, IconType.SVG, IconType.FONT, IconType.FONT]);
  });

  it('should get the name of an icon', async () => {
    const icons = await loader.getAllHarnesses(iconHarness);
    const names = await parallel(() => icons.map(icon => icon.getName()));
    expect(names).toEqual(['fontIcon', 'svgIcon', 'ligature_icon', 'ligature_icon_by_attribute']);
  });

  it('should get the namespace of an icon', async () => {
    const icons = await loader.getAllHarnesses(iconHarness);
    const namespaces = await parallel(() => icons.map(icon => icon.getNamespace()));
    expect(namespaces).toEqual(['fontIcons', 'svgIcons', null, null]);
  });

  it('should get whether an icon is inline', async () => {
    const icons = await loader.getAllHarnesses(iconHarness);
    const inlineStates = await parallel(() => icons.map(icon => icon.isInline()));
    expect(inlineStates).toEqual([false, false, true, false]);
  });
}

@Component({
  template: `
    <mat-icon fontSet="fontIcons" fontIcon="fontIcon"></mat-icon>
    <mat-icon svgIcon="svgIcons:svgIcon"></mat-icon>
    <mat-icon inline>ligature_icon</mat-icon>
    <mat-icon fontIcon="ligature_icon_by_attribute"></mat-icon>
  `,
})
class IconHarnessTest {}
