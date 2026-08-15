/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {initializeWebMCPPolyfill, cleanupWebMCPPolyfill} from '@mcp-b/webmcp-polyfill';
import {Router, RouterModule, provideRouter, withExperimentalWebMcpRouterTools} from '../index';

@Component({
  template: '<router-outlet/>',
  imports: [RouterModule],
})
export class RootComponent {}

@Component({template: '<div>Home</div>'})
export class HomeComponent {}

@Component({template: '<div>Dashboard</div>'})
export class DashboardComponent {}

@Component({template: '<div>Settings</div>'})
export class SettingsComponent {}

describe('withExperimentalWebMcpRouterTools', () => {
  beforeEach(() => {
    initializeWebMCPPolyfill({installTestingShim: true});
    const modelContext = (globalThis.navigator as any).modelContext;
    if (modelContext) {
      modelContext.dispatchEvent = () => true;
    }
    const testingContext = (globalThis.navigator as any).modelContextTesting;
    if (testingContext) {
      testingContext.dispatchEvent = () => true;
    }
  });

  afterEach(() => {
    cleanupWebMCPPolyfill();
  });

  it('should register router.list_routes and router.navigate tools', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: 'home', component: HomeComponent},
            {
              path: 'admin',
              children: [
                {path: 'dashboard', component: DashboardComponent},
                {path: 'settings', component: SettingsComponent},
                {path: '', component: DashboardComponent},
              ],
            },
          ],
          withExperimentalWebMcpRouterTools(),
        ),
      ],
    });

    const fixture = TestBed.createComponent(RootComponent);
    await fixture.whenStable();

    const testingContext = (globalThis.navigator as any).modelContextTesting!;
    const tools = testingContext.listTools();
    expect(tools).toContain(jasmine.objectContaining({name: 'router.list_routes'}));
    expect(tools).toContain(jasmine.objectContaining({name: 'router.navigate'}));

    // Test router.list_routes execution
    const listResultJson = await testingContext.executeTool('router.list_routes', '{}');
    const listResult = JSON.parse(listResultJson!);
    expect(listResult.content[0].text).toContain('/home');
    expect(listResult.content[0].text).toContain('/admin/dashboard');
    expect(listResult.content[0].text).toContain('/admin/settings');
    expect(listResult.content[0].text).toContain('/admin\n');
    expect(listResult.content[0].text).not.toContain('/admin/\n');

    // Test router.navigate execution
    const router = TestBed.inject(Router);
    expect(router.url).toEqual('/');

    const navigateResultJson = await testingContext.executeTool(
      'router.navigate',
      '{"url": "/admin/dashboard"}',
    );
    const navigateResult = JSON.parse(navigateResultJson!);
    expect(navigateResult.content[0].text).toContain('Successfully navigated to /admin/dashboard');

    await fixture.whenStable();
    expect(router.url).toEqual('/admin/dashboard');
  });
});
