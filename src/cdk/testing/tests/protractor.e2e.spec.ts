import {HarnessLoader} from '@angular/cdk/testing';
import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {browser, by, element as protractorElement, ElementFinder} from 'protractor';
import {parallel} from '../change-detection';
import {crossEnvironmentSpecs} from './cross-environment.spec';
import {MainComponentHarness} from './harnesses/main-component-harness';

// Kagekiri is available globally in the browser. We declare it here so we can use it in the
// browser-side script passed to `by.js`.
declare const kagekiri: {
  querySelectorAll: (selector: string, root: Element) => NodeListOf<Element>;
};

const piercingQueryFn = (selector: string, root: ElementFinder) =>
  protractorElement.all(
    by.js(
      (s: string, r: Element) => kagekiri.querySelectorAll(s, r),
      selector,
      root.getWebElement(),
    ),
  );

describe('ProtractorHarnessEnvironment', () => {
  beforeEach(async () => {
    await browser.get('/component-harness');
  });

  describe('environment specific', () => {
    describe('HarnessLoader', () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = ProtractorHarnessEnvironment.loader();
      });

      it('should create HarnessLoader from ProtractorEnvironment', () => {
        expect(loader).not.toBeNull();
      });
    });

    describe('ComponentHarness', () => {
      let harness: MainComponentHarness;

      beforeEach(async () => {
        harness = await ProtractorHarnessEnvironment.loader().getHarness(MainComponentHarness);
      });

      it('can get elements outside of host', async () => {
        const globalEl = await harness.globalEl();
        expect(await globalEl.text()).toBe('I am a sibling!');
      });

      it('should get correct text excluding certain selectors', async () => {
        const results = await harness.subcomponentAndSpecialHarnesses();
        const subHarnessHost = await results[0].host();

        expect(await subHarnessHost.text({exclude: 'h2'})).toBe('ProtractorTestBedOther');
        expect(await subHarnessHost.text({exclude: 'li'})).toBe('List of test tools');
      });

      it('should be able to retrieve the ElementFinder from a ProtractorElement', async () => {
        const element = ProtractorHarnessEnvironment.getNativeElement(await harness.host());
        expect(await element.getTagName()).toBe('test-main');
      });
    });

    describe('shadow DOM interaction', () => {
      it('should not pierce shadow boundary by default', async () => {
        const harness = await ProtractorHarnessEnvironment.loader().getHarness(
          MainComponentHarness,
        );
        expect(await harness.shadows()).toEqual([]);
      });

      it('should pierce shadow boundary when using piercing query', async () => {
        const harness = await ProtractorHarnessEnvironment.loader({
          queryFn: piercingQueryFn,
        }).getHarness(MainComponentHarness);
        const shadows = await harness.shadows();
        expect(
          await parallel(() => {
            return shadows.map(el => el.text());
          }),
        ).toEqual(['Shadow 1', 'Shadow 2']);
      });

      it('should allow querying across shadow boundary', async () => {
        const harness = await ProtractorHarnessEnvironment.loader({
          queryFn: piercingQueryFn,
        }).getHarness(MainComponentHarness);
        expect(await (await harness.deepShadow()).text()).toBe('Shadow 2');
      });
    });
  });

  describe('environment independent', () =>
    crossEnvironmentSpecs(
      () => ProtractorHarnessEnvironment.loader(),
      () => ProtractorHarnessEnvironment.loader().getHarness(MainComponentHarness),
      async () => (await activeElement()).getAttribute('id'),
    ));
});

function activeElement() {
  return Promise.resolve(browser.switchTo().activeElement());
}
