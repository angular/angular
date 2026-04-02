/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  signal,
  ɵFramework as Framework,
  ɵAcxChangeDetectionStrategy as AcxChangeDetectionStrategy,
  ɵAcxViewEncapsulation as AcxViewEncapsulation,
  ChangeDetectionStrategy as AngularChangeDetectionStrategy,
  ViewEncapsulation as AngularViewEncapsulation,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {ComponentType} from '../../../../../../../../protocol';
import {ComponentMetadataComponent} from './component-metadata.component';
import {APP_DATA, AppData} from '../../../../../application-providers/app_data';
import {ElementPropertyResolver} from '../../../property-resolver/element-property-resolver';

type TestingModuleCfg = AppData & {
  framework: Framework;
  changeDetection: AngularChangeDetectionStrategy | AcxChangeDetectionStrategy;
  encapsulation: AngularViewEncapsulation | AcxViewEncapsulation;
};

async function configureTestingModule(config?: Partial<TestingModuleCfg>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ElementPropertyResolver,
        useValue: {
          getDirectiveController: () => ({
            directiveMetadata: {
              framework: config?.framework ?? Framework.Angular,
              changeDetection: config?.changeDetection ?? AngularChangeDetectionStrategy.OnPush,
              encapsulation: config?.encapsulation ?? AngularViewEncapsulation.Emulated,
            },
          }),
        },
      },
      {
        provide: APP_DATA,
        useValue: signal<AppData>({
          devMode: true,
          ivy: true,
          hydration: false,
          fullVersion: '0.0.0',
          majorVersion: 0,
          minorVersion: 0,
          patchVersion: 0,
          ...config,
        }),
      },
    ],
  });

  const fixture = TestBed.createComponent(ComponentMetadataComponent);
  const component = fixture.componentInstance;
  fixture.componentRef.setInput('currentSelectedComponent', {
    id: 0,
    name: 'ng-cmp',
    isElement: false,
  } satisfies ComponentType);

  await fixture.whenStable();

  return {fixture, component};
}

const ENCAPSULATION_SELECTOR = '.encapsulation';
const CD_SELECTOR = '.change-detection';

describe('ComponentMetadataComponent', () => {
  it('should create', async () => {
    const {component} = await configureTestingModule();
    expect(component).toBeTruthy();
  });

  describe('Encapsulation', () => {
    it('should display "Emulated" view encapsulation in Angular', async () => {
      const {fixture} = await configureTestingModule({
        framework: Framework.Angular,
        encapsulation: AngularViewEncapsulation.Emulated,
      });

      const encapsulationListItem = fixture.debugElement.query(By.css(ENCAPSULATION_SELECTOR));

      expect(encapsulationListItem.nativeElement.textContent).toContain(
        'View Encapsulation: Emulated',
      );
    });

    it('should display "None" view encapsulation in Angular', async () => {
      const {fixture} = await configureTestingModule({
        framework: Framework.Angular,
        encapsulation: AngularViewEncapsulation.None,
      });

      const encapsulationListItem = fixture.debugElement.query(By.css(ENCAPSULATION_SELECTOR));

      expect(encapsulationListItem.nativeElement.textContent).toContain('View Encapsulation: None');
    });

    it('should display "ShadowDom" view encapsulation in Angular', async () => {
      const {fixture} = await configureTestingModule({
        framework: Framework.Angular,
        encapsulation: AngularViewEncapsulation.ShadowDom,
      });

      const encapsulationListItem = fixture.debugElement.query(By.css(ENCAPSULATION_SELECTOR));

      expect(encapsulationListItem.nativeElement.textContent).toContain(
        'View Encapsulation: ShadowDom',
      );
    });

    it('should display "ExperimentalIsolatedShadowDom" view encapsulation in Angular', async () => {
      const {fixture} = await configureTestingModule({
        framework: Framework.Angular,
        encapsulation: AngularViewEncapsulation.ExperimentalIsolatedShadowDom,
      });

      const encapsulationListItem = fixture.debugElement.query(By.css(ENCAPSULATION_SELECTOR));

      expect(encapsulationListItem.nativeElement.textContent).toContain(
        'View Encapsulation: ExperimentalIsolatedShadowDom',
      );
    });

    it('should display "Emulated" view encapsulation in ACX', async () => {
      const {fixture} = await configureTestingModule({
        framework: Framework.ACX,
        encapsulation: AcxViewEncapsulation.Emulated,
      });

      const encapsulationListItem = fixture.debugElement.query(By.css(ENCAPSULATION_SELECTOR));

      expect(encapsulationListItem.nativeElement.textContent).toContain(
        'View Encapsulation: Emulated',
      );
    });

    it('should display "None" view encapsulation in ACX', async () => {
      const {fixture} = await configureTestingModule({
        framework: Framework.ACX,
        encapsulation: AcxViewEncapsulation.None,
      });

      const encapsulationListItem = fixture.debugElement.query(By.css(ENCAPSULATION_SELECTOR));

      expect(encapsulationListItem.nativeElement.textContent).toContain('View Encapsulation: None');
    });

    it('should NOT display view encapsulation in Wiz', async () => {
      const {fixture} = await configureTestingModule({
        framework: Framework.Wiz,
      });

      const encapsulationListItem = fixture.debugElement.query(By.css(ENCAPSULATION_SELECTOR));

      expect(encapsulationListItem).toBeFalsy();
    });
  });

  describe('Change Detection', () => {
    it('should display "OnPush" view encapsulation in Angular v21.2+', async () => {
      const {fixture} = await configureTestingModule({
        majorVersion: 21,
        minorVersion: 2,
        framework: Framework.Angular,
        changeDetection: AngularChangeDetectionStrategy.OnPush,
      });

      const cdListItem = fixture.debugElement.query(By.css(CD_SELECTOR));

      expect(cdListItem.nativeElement.textContent).toContain('Change Detection Strategy: OnPush');
    });

    it('should display "Eager" view encapsulation in Angular v21.2+', async () => {
      const {fixture} = await configureTestingModule({
        majorVersion: 21,
        minorVersion: 2,
        framework: Framework.Angular,
        changeDetection: AngularChangeDetectionStrategy.Eager,
      });

      const cdListItem = fixture.debugElement.query(By.css(CD_SELECTOR));

      expect(cdListItem.nativeElement.textContent).toContain('Change Detection Strategy: Eager');
    });

    it('should display "OnPush" view encapsulation in Angular v0 (dev)', async () => {
      const {fixture} = await configureTestingModule({
        majorVersion: 0,
        framework: Framework.Angular,
        changeDetection: AngularChangeDetectionStrategy.OnPush,
      });

      const cdListItem = fixture.debugElement.query(By.css(CD_SELECTOR));

      expect(cdListItem.nativeElement.textContent).toContain('Change Detection Strategy: OnPush');
    });

    it('should display "Eager" view encapsulation in Angular v0 (dev)', async () => {
      const {fixture} = await configureTestingModule({
        majorVersion: 0,
        framework: Framework.Angular,
        changeDetection: AngularChangeDetectionStrategy.Eager,
      });

      const cdListItem = fixture.debugElement.query(By.css(CD_SELECTOR));

      expect(cdListItem.nativeElement.textContent).toContain('Change Detection Strategy: Eager');
    });

    it('should display "Default" view encapsulation in Angular pre-v21.2 (legacy)', async () => {
      const {fixture} = await configureTestingModule({
        majorVersion: 20,
        minorVersion: 1,
        framework: Framework.Angular,
        changeDetection: AngularChangeDetectionStrategy.Default,
      });

      const cdListItem = fixture.debugElement.query(By.css(CD_SELECTOR));

      expect(cdListItem.nativeElement.textContent).toContain('Change Detection Strategy: Default');
    });

    it('should display "OnPush" view encapsulation in Angular pre-v21.2 (legacy)', async () => {
      const {fixture} = await configureTestingModule({
        majorVersion: 21,
        minorVersion: 1,
        framework: Framework.Angular,
        changeDetection: AngularChangeDetectionStrategy.OnPush,
      });

      const cdListItem = fixture.debugElement.query(By.css(CD_SELECTOR));

      expect(cdListItem.nativeElement.textContent).toContain('Change Detection Strategy: OnPush');
    });
  });

  it('should NOT display change detection in Wiz', async () => {
    const {fixture} = await configureTestingModule({
      framework: Framework.Wiz,
    });

    const cdListItem = fixture.debugElement.query(By.css(CD_SELECTOR));

    expect(cdListItem).toBeFalsy();
  });
});
