/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom} from '@angular/compiler-cli';
import {initMockFileSystem} from '@angular/compiler-cli/private/testing';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {diffText} from '../../utils/tsurge/testing/diff';
import {BootstrapOptionsMigration} from './migration';

const platformBrowserFile = {
  name: absoluteFrom('/node_modules/@angular/platform-browser/index.d.ts'),
  contents: `
  export declare function bootstrapApplication<T>(component: T, options?: any);
  export declare const platformBrowser: (extraProviders?: StaticProvider[]) => PlatformRef;  
  
  export declare class PlatformRef {
    bootstrapModule<M>(module: any, options?: any): Promise<any>;
  }

  export declare class BrowserModule {}
  `,
};
const platformBrowserDynamicFile = {
  name: absoluteFrom('/node_modules/@angular/platform-browser-dynamic/index.d.ts'),
  contents: `  
  export declare const platformBrowserDynamic: (extraProviders?: StaticProvider[]) => PlatformRef; 
  `,
};

const platformBrowserTestingFile = {
  name: absoluteFrom('/node_modules/@angular/platform-browser/testing/index.d.ts'),
  contents: `
  export declare const platformBrowserTesting: (extraProviders?: StaticProvider[]) => PlatformRef;
  export declare class BrowserTestingModule {}
  `,
};

const platformBrowserDynamicTestingFile = {
  name: absoluteFrom('/node_modules/@angular/platform-browser-dynamic/testing/index.d.ts'),
  contents: `
  export declare const platformBrowserDynamicTesting: (extraProviders?: StaticProvider[]) => PlatformRef;
  export declare class BrowserDynamicTestingModule {}
  `,
};

const coreTypesFile = {
  name: absoluteFrom('/node_modules/@angular/core/index.d.ts'),
  contents: `
  export declare function provideZoneChangeDetection(options?: any): any;
  export declare function provideZonelessChangeDetection(options?: any): any;

  export declare function NgModule(obj: any): any;
  export declare function Component(obj: any): any;
  export declare function mergeApplicationConfig(...config:any[]): ApplicationConfig
  export interface ApplicationConfig {}
}

  `,
};
const coreTestingTypesFile = {
  name: absoluteFrom('/node_modules/@angular/core/testing/index.d.ts'),
  contents: `
  export class TestBed {}

  export function getTestBed(): TestBed {}
  `,
};

const typeFiles = [
  platformBrowserDynamicFile,
  platformBrowserFile,
  platformBrowserTestingFile,
  platformBrowserDynamicTestingFile,
  coreTypesFile,
  coreTestingTypesFile,
];

describe('bootstrap options migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('bootstrapApplication', () => {
    it('should migrate bootstrapApplication with existing options', async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        platformBrowserFile,
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';

          bootstrapApplication(AppComponent, {providers: []});
        `,
        },
        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class AppComponent {}
        `,
        },
      ]);

      const actual = fs.readFile(absoluteFrom('/main.ts'));
      const expected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';

          bootstrapApplication(AppComponent, {providers: [provideZoneChangeDetection(),]});
        `;
      expect(actual.replace(/\s+/g, ''))
        .withContext(diffText(expected, actual))
        .toEqual(expected.replace(/\s+/g, ''));
    });

    it('should migrate bootstrapApplication without existing options', async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';

          bootstrapApplication(AppComponent);
        `,
        },
        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class AppComponent {}
        `,
        },
      ]);

      const actual = fs.readFile(absoluteFrom('/main.ts'));
      const expected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';

          bootstrapApplication(AppComponent, {providers: [provideZoneChangeDetection()]});
        `;
      expect(actual.replace(/\s+/g, ''))
        .withContext(diffText(expected, actual))
        .toEqual(expected.replace(/\s+/g, ''));
    });

    it('should migrate bootstrapApplication without existing options in app.config.ts', async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/app/app.config.ts'),
          contents: `
          import { provideZoneChangeDetection } from '@angular/core';

          export const appConfig = {
            providers: [],
          };
        `,
        },
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          bootstrapApplication(AppComponent, appConfig);
        `,
        },

        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class AppComponent {}
        `,
        },
      ]);

      const actualMain = fs.readFile(absoluteFrom('/main.ts'));
      const expectedMain = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]});
        `;
      expect(actualMain.replace(/\s+/g, ''))
        .withContext(diffText(expectedMain, actualMain))
        .toEqual(expectedMain.replace(/\s+/g, ''));

      // We're not changing that file because it might not be analyzable in G3
      // So the changes are only applied to the file where the bootstrapApplication is called
      const actualConfig = fs.readFile(absoluteFrom('/app/app.config.ts'));
      const expectedConfig = `
          import { provideZoneChangeDetection } from '@angular/core';

          export const appConfig = {
            providers: [],
          };
        `;
      expect(actualConfig.replace(/\s+/g, ''))
        .withContext(diffText(expectedConfig, actualConfig))
        .toEqual(expectedConfig.replace(/\s+/g, ''));
    });

    it('should migrate bootstrapApplication with existing option but without CD providers', () => {
      return runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';

          bootstrapApplication(AppComponent, {providers: []});
        `,
        },
        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class AppComponent {}
        `,
        },
      ]).then(({fs}) => {
        const actual = fs.readFile(absoluteFrom('/main.ts'));
        const expected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';

          bootstrapApplication(AppComponent, {providers: [provideZoneChangeDetection(),]});
        `;
        expect(actual.replace(/\s+/g, ''))
          .withContext(diffText(expected, actual))
          .toEqual(expected.replace(/\s+/g, ''));
      });
    });

    ['provideZoneChangeDetection', 'provideZonelessChangeDetection'].forEach((providerFn) => {
      it(`should not add ${providerFn} if it is already present (inline)`, async () => {
        const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
          ...typeFiles,
          {
            name: absoluteFrom('/main.ts'),
            isProgramRootFile: true,
            contents: `
          import { ${providerFn} } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          bootstrapApplication(AppComponent, {providers: [${providerFn}()]});
        `,
          },
          {
            name: absoluteFrom('/app/app.component.ts'),
            contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class AppComponent {}
        `,
          },
        ]);

        const actualMain = fs.readFile(absoluteFrom('/main.ts'));
        const expectedMain = `
          import { ${providerFn} } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          bootstrapApplication(AppComponent, {providers: [${providerFn}()]});
        `;
        expect(actualMain.replace(/\s+/g, ''))
          .withContext(diffText(expectedMain, actualMain))
          .toEqual(expectedMain.replace(/\s+/g, ''));
      });

      it(`should not add ${providerFn} if it is already present (separate option const)`, async () => {
        const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
          ...typeFiles,
          {
            name: absoluteFrom('/main.ts'),
            isProgramRootFile: true,
            contents: `
          import { ${providerFn} } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          const options = {providers: [${providerFn}()]};
          bootstrapApplication(AppComponent, options);
        `,
          },
          {
            name: absoluteFrom('/app/app.component.ts'),
            contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class AppComponent {}
        `,
          },
        ]);

        const actualMain = fs.readFile(absoluteFrom('/main.ts'));
        const expectedMain = `
          import { ${providerFn} } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          const options = {providers: [${providerFn}()]};
          bootstrapApplication(AppComponent, options);
        `;
        expect(actualMain.replace(/\s+/g, ''))
          .withContext(diffText(expectedMain, actualMain))
          .toEqual(expectedMain.replace(/\s+/g, ''));
      });

      it(`should not add ${providerFn} if it is already present (appConfig)`, async () => {
        const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
          ...typeFiles,
          {
            name: absoluteFrom('/app/app.config.ts'),
            contents: `
          import { ${providerFn} } from '@angular/core';

          export const appConfig = {
            providers: [${providerFn}()],
          };
        `,
          },
          {
            name: absoluteFrom('/main.ts'),
            isProgramRootFile: true,
            contents: `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          bootstrapApplication(AppComponent, appConfig);
        `,
          },
          {
            name: absoluteFrom('/app/app.component.ts'),
            contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class AppComponent {}
        `,
          },
        ]);

        const actualMain = fs.readFile(absoluteFrom('/main.ts'));
        const expectedMain = `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          bootstrapApplication(AppComponent, appConfig);
        `;
        expect(actualMain.replace(/\s+/g, ''))
          .withContext(diffText(expectedMain, actualMain))
          .toEqual(expectedMain.replace(/\s+/g, ''));

        const actualConfig = fs.readFile(absoluteFrom('/app/app.config.ts'));
        const expectedConfig = `
          import { ${providerFn} } from '@angular/core';

          export const appConfig = {
            providers: [${providerFn}()],
          };
        `;
        expect(actualConfig.replace(/\s+/g, ''))
          .withContext(diffText(expectedConfig, actualConfig))
          .toEqual(expectedConfig.replace(/\s+/g, ''));
      });
    });

    it('should support margeApplication config', async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/app/app.config.ts'),
          contents: `
          import { provideZoneChangeDetection } from '@angular/core';

          export const appConfig = {
            providers: [],
          };
        `,
        },
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          bootstrapApplication(AppComponent, appConfig);
        `,
        },
        {
          name: absoluteFrom('/main.server.ts'),
          isProgramRootFile: true,
          contents: `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { config } from './app/app.config.server';

          const bootstrap = () => bootstrapApplication(AppComponent, config);

          export default bootstrap;
        `,
        },
        {
          name: absoluteFrom('/app/app.config.server.ts'),
          contents: `
          import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
          import { appConfig } from './app.config';

          const serverConfig: ApplicationConfig = {
            providers: [
            ]
          };

          export const config = mergeApplicationConfig(appConfig, serverConfig);
        `,
        },
        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class AppComponent {}
        `,
        },
      ]);

      const actualMain = fs.readFile(absoluteFrom('/main.ts'));
      const expectedMain = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appConfig } from './app/app.config';

          bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]});
        `;
      expect(actualMain.replace(/\s+/g, ''))
        .withContext(diffText(expectedMain, actualMain))
        .toEqual(expectedMain.replace(/\s+/g, ''));

      const actualMainServer = fs.readFile(absoluteFrom('/main.server.ts'));
      const expectedMainServer = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { config } from './app/app.config.server';

          const bootstrap = () => bootstrapApplication(AppComponent, {...config, providers: [provideZoneChangeDetection(), ...config.providers]});
          export default bootstrap;
        `;
      expect(actualMainServer.replace(/\s+/g, ''))
        .withContext(diffText(expectedMainServer, actualMainServer))
        .toEqual(expectedMainServer.replace(/\s+/g, ''));

      // We're not changing that file because it might not be analyzable in G3
      // So the changes are only applied to the file where the bootstrapApplication is called
      const actualConfig = fs.readFile(absoluteFrom('/app/app.config.ts'));
      const expectedConfig = `
          import { provideZoneChangeDetection } from '@angular/core';

          export const appConfig = {
            providers: [],
          };
        `;
      expect(actualConfig.replace(/\s+/g, ''))
        .withContext(diffText(expectedConfig, actualConfig))
        .toEqual(expectedConfig.replace(/\s+/g, ''));

      const actualServerConfig = fs.readFile(absoluteFrom('/app/app.config.server.ts'));
      const expectedServerConfig = `
          import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
          import { appConfig } from './app.config';

          const serverConfig: ApplicationConfig = {
            providers: [
            ]
          };

          export const config = mergeApplicationConfig(appConfig, serverConfig);
        `;
      expect(actualServerConfig.replace(/\s+/g, ''))
        .withContext(diffText(actualServerConfig, expectedServerConfig))
        .toEqual(expectedServerConfig.replace(/\s+/g, ''));
    });

    it('should migrate bootstrapApplication with concatenated providers', () => {
      return runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { EnvironmentProviders } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { App } from './app/app.component';

          const providers: EnvironmentProviders[] = [];
          const other: EnvironmentProviders = {};

          bootstrapApplication(App, {providers: providers.concat([other])});
        `,
        },
        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class App {}
        `,
        },
      ]).then(({fs}) => {
        const actual = fs.readFile(absoluteFrom('/main.ts'));
        const expected = `
          import { EnvironmentProviders, provideZoneChangeDetection } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { App } from './app/app.component';

          const providers: EnvironmentProviders[] = [];
          const other: EnvironmentProviders = {};

          bootstrapApplication(App, {providers: [provideZoneChangeDetection(), ...providers.concat([other])]});
        `;
        expect(actual.replace(/\s+/g, ''))
          .withContext(diffText(expected, actual))
          .toEqual(expected.replace(/\s+/g, ''));
      });
    });

    it('should migrate bootstrapApplication with shorthand providers', () => {
      return runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { EnvironmentProviders } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { App } from './app/app.component';

          const providers: EnvironmentProviders[] = [];

          bootstrapApplication(App, {providers});
        `,
        },
        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class App {}
        `,
        },
      ]).then(({fs}) => {
        const actual = fs.readFile(absoluteFrom('/main.ts'));
        const expected = `
          import { EnvironmentProviders, provideZoneChangeDetection } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { App } from './app/app.component';

          const providers: EnvironmentProviders[] = [];

          bootstrapApplication(App, {providers: [provideZoneChangeDetection() , ...providers]});
        `;
        expect(actual.replace(/\s+/g, ''))
          .withContext(diffText(expected, actual))
          .toEqual(expected.replace(/\s+/g, ''));
      });
    });

    it('should migrate destructured appConfig', () => {
      return runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { EnvironmentProviders } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { App } from './app/app.component';

          const providers: EnvironmentProviders[] = [];

          bootstrapApplication(App, {
            ...appConfig,
          }).catch((err) => {
            console.error(err);
          });
        `,
        },
        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class App {}
        `,
        },
      ]).then(({fs}) => {
        const actual = fs.readFile(absoluteFrom('/main.ts'));
        const expected = `
          import { EnvironmentProviders, provideZoneChangeDetection } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { App } from './app/app.component';

          const providers: EnvironmentProviders[] = [];

          bootstrapApplication(App, {
            ...appConfig,
            providers: [provideZoneChangeDetection(), ...appConfig.providers],
          }).catch((err) => {
            console.error(err);
          });
        `;
        expect(actual.replace(/\s+/g, ''))
          .withContext(diffText(expected, actual))
          .toEqual(expected.replace(/\s+/g, ''));
      });
    });

    it('should migrate destructured appConfig with providers', () => {
      return runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/main.ts'),
          isProgramRootFile: true,
          contents: `
          import { EnvironmentProviders } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { App } from './app/app.component';

          const providers: EnvironmentProviders[] = [];

          bootstrapApplication(App, {
            ...appConfig,
            providers: [...appConfig.providers, ...providers],
          }).catch((err) => {
            console.error(err);
          });
        `,
        },
        {
          name: absoluteFrom('/app/app.component.ts'),
          contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-root',
            template: '',
          })
          export class App {}
        `,
        },
      ]).then(({fs}) => {
        const actual = fs.readFile(absoluteFrom('/main.ts'));
        const expected = `
          import { EnvironmentProviders, provideZoneChangeDetection } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { App } from './app/app.component';

          const providers: EnvironmentProviders[] = [];

          bootstrapApplication(App, {
            ...appConfig,
            providers: [provideZoneChangeDetection(), ...appConfig.providers, ...providers],
          }).catch((err) => {
            console.error(err);
          });
        `;
        expect(actual.replace(/\s+/g, ''))
          .withContext(diffText(expected, actual))
          .toEqual(expected.replace(/\s+/g, ''));
      });
    });

    it('should not migrate a SSR config that has provideZonelessChangeDetection in the base config', async () => {
      return runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/app/app.config.ts'),
          contents: `
          import { provideZonelessChangeDetection } from '@angular/core';
          export const appConfig = {
            providers: [provideZonelessChangeDetection()],
          };
        `,
        },
        {
          name: absoluteFrom('/app/app.config.server.ts'),
          contents: `
          import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
          import { appConfig } from './app.config';
          const serverConfig: ApplicationConfig = {
            providers: []
          };
          export const appServerConfig = mergeApplicationConfig(appConfig, serverConfig);
        `,
        },
        {
          name: absoluteFrom('/main.server.ts'),
          isProgramRootFile: true,
          contents: `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appServerConfig } from './app/app.config.server';
          const bootstrap = () => bootstrapApplication(AppComponent, appServerConfig);
          export default bootstrap;
        `,
        },
      ]).then(({fs}) => {
        const actualMainServer = fs.readFile(absoluteFrom('/main.server.ts'));
        const expectedMainServer = `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app/app.component';
          import { appServerConfig } from './app/app.config.server';
          const bootstrap = () => bootstrapApplication(AppComponent, appServerConfig);
          export default bootstrap;
        `;
        expect(actualMainServer.replace(/\s+/g, ''))
          .withContext(diffText(expectedMainServer, actualMainServer))
          .toEqual(expectedMainServer.replace(/\s+/g, ''));
      });
    });
  });

  describe('bootstrapModule', () => {
    [
      {packageName: 'platform-browser-dynamic', platformBrowserFn: 'platformBrowserDynamic'},
      {packageName: 'platform-browser', platformBrowserFn: 'platformBrowser'},
    ].forEach(({packageName, platformBrowserFn}) => {
      describe(`${platformBrowserFn}().bootstrapModule`, () => {
        it(`should migrate bootstrapModule`, async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule);
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, {
            applicationProviders: [provideZoneChangeDetection()],
          });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should migrate ngZone: "noop"', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZone: 'noop' });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule);
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should migrate ngZone: "noop" with provideZonelessChangeDetection already present', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZone: 'noop' });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule, provideZonelessChangeDetection } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            providers: [provideZonelessChangeDetection()],
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule, provideZonelessChangeDetection } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            providers: [provideZonelessChangeDetection()],
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule);
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should migrate ngZoneEventCoalescing', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZoneEventCoalescing: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, {
            applicationProviders: [provideZoneChangeDetection({ eventCoalescing: true })],
          });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should migrate ngZoneRunCoalescing', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZoneRunCoalescing: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, {applicationProviders: [provideZoneChangeDetection({runCoalescing: true})], });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should not add provideZoneChangeDetection if provideZonelessChangeDetection is present', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZoneRunCoalescing: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule, provideZonelessChangeDetection } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [provideZonelessChangeDetection()],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule, provideZonelessChangeDetection } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [provideZonelessChangeDetection()],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));
        });

        // We explicitly don't support that for now
        xit('should not add provideZoneChangeDetection if it is already present in an imported module', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZoneRunCoalescing: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';
          import { MyOtherModule } from './other.module';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule, MyOtherModule],
            providers: [],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/other.module.ts'),
              contents: `
          import { NgModule, provideZoneChangeDetection } from '@angular/core';

          @NgModule({
            providers: [provideZoneChangeDetection({eventCoalescing: true})],
          })
          export class MyOtherModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';
          import { MyOtherModule } from './other.module';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule, MyOtherModule],
            providers: [],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));
        });

        it('should migrate ngZone: "zone.js"', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZone: 'zone.js' });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, {applicationProviders: [provideZoneChangeDetection()],});
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should migrate ngZone with a custom class', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';
          import { MyZone } from './app/my-zone';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZone: MyZone });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
            {
              name: absoluteFrom('/app/my-zone.ts'),
              contents: `
          import { NgZone } from '@angular/core';
          export class MyZone extends NgZone {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';
          import { MyZone } from './app/my-zone';

          ${platformBrowserFn}().bootstrapModule(AppModule, {applicationProviders: [provideZoneChangeDetection(), { provide: NgZone, useClass: MyZone }],});
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should remove ignoreChangesOutsideZone', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ignoreChangesOutsideZone: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, {applicationProviders: [provideZoneChangeDetection()],});
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should not add provideZoneChangeDetection if it is already present', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZoneRunCoalescing: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule, provideZoneChangeDetection } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [provideZoneChangeDetection({eventCoalescing: true})],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule, provideZoneChangeDetection } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [provideZoneChangeDetection({eventCoalescing: true})],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));
        });

        it('should remove bootstrapOptions but not add provideZoneChangeDetection if it is already present', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZoneRunCoalescing: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule, provideZoneChangeDetection } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [provideZoneChangeDetection({eventCoalescing: true})],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule, provideZoneChangeDetection } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            providers: [provideZoneChangeDetection({eventCoalescing: true})],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule);
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should keep compiler options if present', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { preserveWhitespaces: true, ngZoneRunCoalescing: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection({ runCoalescing: true })], preserveWhitespaces: true, });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should migrate imports when it is a variable identifier', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZoneRunCoalescing: true });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          const myImports = [BrowserModule];

          @NgModule({
            declarations: [AppComponent],
            imports: myImports,
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          const myImports = [BrowserModule];

          @NgModule({
            declarations: [AppComponent],
            imports: myImports,
            bootstrap: [AppComponent]
          })
          export class AppModule {}
          `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection({ runCoalescing: true })], });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should add provideZoneChangeDetection if no bootstrap options are present', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule);
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should not migrate bootstrapModule if it has already been migrated', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [ provideZoneChangeDetection() ] });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [ provideZoneChangeDetection() ] });
        `;
          expect(mainActual.replace(/\s+/g, '')).withContext(diffText(mainExpected, mainActual));
        });

        it('should insert the ZoneDetectionModule before the JSDoc of the boostraped NgModule', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule);
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              isProgramRootFile: true, // for the migration to also run in the file
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          /**
           * This is a comment.
           */
          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          /**
           * This is a comment.
           */
          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should gracefuly fail with a TODO when having non-string ngZone', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZone: new NgZone({}) });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          // TODO: BootstrapOptions are deprecated & ignored. Configure NgZone in the providers array of the application module instead.
          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], ngZone: new NgZone({}), });
          `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should gracefuly fail with a TODO when having non-string ngZone (shorthand)', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { NgZone } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          const ngZone = new NgZone({});

          ${platformBrowserFn}().bootstrapModule(AppModule, { ngZone });
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { NgZone, provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          const ngZone = new NgZone({});

          // TODO: BootstrapOptions are deprecated & ignored. Configure NgZone in the providers array of the application module instead.
          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], ngZone, });
          `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should migrate option array with multiple items', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, [{ preserveWhitespaces: true},{ngZoneRunCoalescing: true }]);
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection({ runCoalescing: true })], preserveWhitespaces: true, });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });

        it('should migrate option array with a single item', async () => {
          const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
            ...typeFiles,
            {
              name: absoluteFrom('/main.ts'),
              isProgramRootFile: true,
              contents: `
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, [{ngZoneRunCoalescing: true }]);
        `,
            },
            {
              name: absoluteFrom('/app/app.module.ts'),
              contents: `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `,
            },
            {
              name: absoluteFrom('/app/app.component.ts'),
              contents: `
          import { Component } from '@angular/core';

          @Component({selector: 'app-root', template: ''})
          export class AppComponent {}
        `,
            },
          ]);

          const actual = fs.readFile(absoluteFrom('/app/app.module.ts'));
          const expected = `
          import { NgModule } from '@angular/core';
          import { BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          @NgModule({
            declarations: [AppComponent],
            imports: [BrowserModule],
            bootstrap: [AppComponent]
          })
          export class AppModule {}
        `;
          expect(actual.replace(/\s+/g, ''))
            .withContext(diffText(expected, actual))
            .toEqual(expected.replace(/\s+/g, ''));

          const mainActual = fs.readFile(absoluteFrom('/main.ts'));
          const mainExpected = `
          import { provideZoneChangeDetection } from "@angular/core";
          import { ${platformBrowserFn} } from '@angular/${packageName}';
          import { AppModule } from './app/app.module';

          ${platformBrowserFn}().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection({ runCoalescing: true })], });
        `;
          expect(mainActual.replace(/\s+/g, ''))
            .withContext(diffText(mainExpected, mainActual))
            .toEqual(mainExpected.replace(/\s+/g, ''));
        });
      });
    });
  });

  describe('TestBed.initTestEnironment', () => {
    it(`should migrate initTestEnvironment`, async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/test.ts'),
          isProgramRootFile: true,
          contents: `
          import { TestBed } from '@angular/core/testing';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          TestBed.initTestEnvironment(
            [BrowserTestingModule],
            platformBrowserTesting(),
        );
        `,
        },
      ]);

      const actual = fs.readFile(absoluteFrom('/test.ts'));
      const expected = `
          import { provideZoneChangeDetection, NgModule } from "@angular/core";
          import { TestBed } from '@angular/core/testing';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          @NgModule({ providers: [provideZoneChangeDetection()]})
          export class ZoneChangeDetectionModule {}

          TestBed.initTestEnvironment(
            [ZoneChangeDetectionModule,BrowserTestingModule],
            platformBrowserTesting(),
          );
        `;
      expect(actual.replace(/\s+/g, ''))
        .withContext(diffText(expected, actual))
        .toEqual(expected.replace(/\s+/g, ''));
    });

    it(`should migrate getTestBed.initTestEnvironment`, async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/test.ts'),
          isProgramRootFile: true,
          contents: `
          import { getTestBed } from '@angular/core/testing';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          getTestBed.initTestEnvironment(
            [BrowserTestingModule],
            platformBrowserTesting(),
        );
        `,
        },
      ]);

      const actual = fs.readFile(absoluteFrom('/test.ts'));
      const expected = `
          import { provideZoneChangeDetection, NgModule } from "@angular/core";
          import { getTestBed } from '@angular/core/testing';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          @NgModule({ providers: [provideZoneChangeDetection()]})
          export class ZoneChangeDetectionModule {}

          getTestBed.initTestEnvironment(
            [ZoneChangeDetectionModule,BrowserTestingModule],
            platformBrowserTesting(),
          );
        `;
      expect(actual.replace(/\s+/g, ''))
        .withContext(diffText(expected, actual))
        .toEqual(expected.replace(/\s+/g, ''));
    });

    it(`should migrate initTestEnvironment with single module`, async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/test.ts'),
          isProgramRootFile: true,
          contents: `
          import { TestBed } from '@angular/core/testing';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          TestBed.initTestEnvironment(
            BrowserTestingModule,
            platformBrowserTesting(),
            {teardown: { destroyAfterEach: true, rethrowErrors: true }},
          );
        `,
        },
      ]);

      const actual = fs.readFile(absoluteFrom('/test.ts'));
      const expected = `
          import { provideZoneChangeDetection, NgModule } from "@angular/core";
          import { TestBed } from '@angular/core/testing';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          @NgModule({ providers: [provideZoneChangeDetection()]})
          export class ZoneChangeDetectionModule {}

          TestBed.initTestEnvironment(
            [ZoneChangeDetectionModule,BrowserTestingModule],
            platformBrowserTesting(),
            {teardown: { destroyAfterEach: true, rethrowErrors: true }},

          );
        `;
      expect(actual.replace(/\s+/g, ''))
        .withContext(diffText(expected, actual))
        .toEqual(expected.replace(/\s+/g, ''));
    });

    it(`should not migrate initTestEnvironment if it has the provider `, async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/test.ts'),
          isProgramRootFile: true,
          contents: `
          import { TestBed, provideZoneChangeDetection, NgModule } from '@angular/core';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          @NgModule({ providers: [provideZoneChangeDetection()]})
          export class ZoneChangeDetectionModule {}

          TestBed.initTestEnvironment(
            [BrowserTestingModule, ZoneChangeDetectionModule],
            platformBrowserTesting(),
          );
        `,
        },
      ]);

      const actual = fs.readFile(absoluteFrom('/test.ts'));
      const expected = `
          import { TestBed, provideZoneChangeDetection, NgModule } from '@angular/core';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          @NgModule({ providers: [provideZoneChangeDetection()]})
          export class ZoneChangeDetectionModule {}

          TestBed.initTestEnvironment(
            [BrowserTestingModule, ZoneChangeDetectionModule],
            platformBrowserTesting(),
          );
        `;
      expect(actual.replace(/\s+/g, ''))
        .withContext(diffText(expected, actual))
        .toEqual(expected.replace(/\s+/g, ''));
    });

    it('should migrate nested initTestEnvironment', async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/test.ts'),
          isProgramRootFile: true,
          contents: `
          import { TestBed } from '@angular/core/testing';
          import { platformBrowserTesting } from '@angular/platform-browser/testing';
          import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

          function initTestEnvironment() {
            try {
              TestBed.initTestEnvironment(
                BrowserDynamicTestingModule,
                platformBrowserTesting(),
                {teardown: {destroyAfterEach: true, rethrowErrors: true}},
              );
            } catch (e: unknown) {
              // Ignore exceptions when calling it multiple times.
            }
          }
        `,
        },
      ]);

      const actual = fs.readFile(absoluteFrom('/test.ts'));
      const expected = `
          import { provideZoneChangeDetection, NgModule } from "@angular/core";
          import { TestBed } from '@angular/core/testing';
          import { platformBrowserTesting } from '@angular/platform-browser/testing';
          import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

          @NgModule({providers: [provideZoneChangeDetection()]})
          export class ZoneChangeDetectionModule {}

          function initTestEnvironment() {
            try {
              TestBed.initTestEnvironment(
                [ZoneChangeDetectionModule, BrowserDynamicTestingModule], 
                platformBrowserTesting(), 
                {teardown: {destroyAfterEach: true, rethrowErrors: true}},
              );
            } catch (e: unknown) {
              // Ignore exceptions when calling it multiple times.
            }
          }
        `;
      expect(actual.replace(/\s+/g, ''))
        .withContext(diffText(expected, actual))
        .toEqual(expected.replace(/\s+/g, ''));
    });

    it('should insert the ZoneChangeDetectionModule before the JSDoc of the initTestEnvironment', async () => {
      const {fs} = await runTsurgeMigration(new BootstrapOptionsMigration(), [
        ...typeFiles,
        {
          name: absoluteFrom('/test.ts'),
          isProgramRootFile: true,
          contents: `
          import { TestBed } from '@angular/core/testing';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          /**
           * This is a comment.
           */
          TestBed.initTestEnvironment(
            [BrowserTestingModule],
            platformBrowserTesting(),
          );
        `,
        },
      ]);

      const actual = fs.readFile(absoluteFrom('/test.ts'));
      const expected = `
          import { provideZoneChangeDetection, NgModule } from "@angular/core";
          import { TestBed } from '@angular/core/testing';
          import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

          @NgModule({ providers: [provideZoneChangeDetection()]})
          export class ZoneChangeDetectionModule {}

          /**
           * This is a comment.
           */
          TestBed.initTestEnvironment(
            [ZoneChangeDetectionModule,BrowserTestingModule],
            platformBrowserTesting(),
          );
        `;
      expect(actual.replace(/\s+/g, ''))
        .withContext(diffText(expected, actual))
        .toEqual(expected.replace(/\s+/g, ''));
    });
  });
});
