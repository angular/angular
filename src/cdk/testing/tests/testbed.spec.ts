import {_supportsShadowDom} from '@angular/cdk/platform';
import {
  HarnessLoader,
} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {waitForAsync, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {querySelectorAll as piercingQuerySelectorAll} from 'kagekiri';
import {crossEnvironmentSpecs} from './cross-environment.spec';
import {FakeOverlayHarness} from './harnesses/fake-overlay-harness';
import {MainComponentHarness} from './harnesses/main-component-harness';
import {TestComponentsModule} from './test-components-module';
import {TestMainComponent} from './test-main-component';

describe('TestbedHarnessEnvironment', () => {
  let fixture: ComponentFixture<{}>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [TestComponentsModule]}).compileComponents();
    fixture = TestBed.createComponent(TestMainComponent);
  });

  describe('environment specific', () => {
    describe('HarnessLoader', () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it('should create HarnessLoader from fixture', () => {
        expect(loader).not.toBeNull();
      });

      it('should create ComponentHarness for fixture', async () => {
        const harness =
          await TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness);
        expect(harness).not.toBeNull();
      });

      it('should be able to load harness through document root loader', async () => {
        const documentRootHarnesses =
            await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(
                FakeOverlayHarness);
        const fixtureHarnesses = await loader.getAllHarnesses(FakeOverlayHarness);
        expect(fixtureHarnesses.length).toBe(0);
        expect(documentRootHarnesses.length).toBe(1);
        expect(await documentRootHarnesses[0].getDescription()).toBe('This is a fake overlay.');
      });
    });

    describe('ComponentHarness', () => {
      let harness: MainComponentHarness;

      beforeEach(async () => {
        harness =
          await TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness);
      });

      it('can get elements outside of host', async () => {
        const subcomponents = await harness.allLists();
        expect(subcomponents[0]).not.toBeNull();
        const globalEl = await subcomponents[0]!.globalElement();
        expect(globalEl).not.toBeNull();
        expect(await globalEl.text()).toBe('Hello Yi from Angular 2!');
      });

      it('should be able to wait for tasks outside of Angular within native async/await',
          async () => {
        expect(await harness.getTaskStateResult()).toBe('result');
      });

      it('should be able to wait for tasks outside of Angular within async test zone',
          waitForAsync(() => {
        harness.getTaskStateResult().then(res => expect(res).toBe('result'));
      }));

      it('should be able to wait for tasks outside of Angular within fakeAsync test zone',
          fakeAsync(async () => {
        expect(await harness.getTaskStateResult()).toBe('result');
      }));
    });

    if (_supportsShadowDom()) {
      describe('shadow DOM interaction', () => {
        it('should not pierce shadow boundary by default', async () => {
          const harness = await TestbedHarnessEnvironment
              .harnessForFixture(fixture, MainComponentHarness);
          expect(await harness.shadows()).toEqual([]);
        });

        it('should pierce shadow boundary when using piercing query', async () => {
          const harness = await TestbedHarnessEnvironment.harnessForFixture(
            fixture, MainComponentHarness, {queryFn: piercingQuerySelectorAll},
          );
          const shadows = await harness.shadows();
          expect(await Promise.all(shadows.map(el => el.text()))).toEqual(['Shadow 1', 'Shadow 2']);
        });

        it('should allow querying across shadow boundary', async () => {
          const harness = await TestbedHarnessEnvironment.harnessForFixture(
            fixture, MainComponentHarness, {queryFn: piercingQuerySelectorAll},
          );
          expect(await (await harness.deepShadow()).text()).toBe('Shadow 2');
        });

        it('should be able to retrieve the native DOM element from a UnitTestElement', async () => {
          const harness = await TestbedHarnessEnvironment
            .harnessForFixture(fixture, MainComponentHarness);
          const element = TestbedHarnessEnvironment.getNativeElement(await harness.host());
          expect(element.id).toContain('root');
        });
      });
    }
  });

  describe('environment independent', () => crossEnvironmentSpecs(
    () => TestbedHarnessEnvironment.loader(fixture),
    () => TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness),
    () => Promise.resolve(document.activeElement!.id),
  ));
});
