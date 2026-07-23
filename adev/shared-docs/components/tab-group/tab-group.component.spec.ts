/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TabGroup} from './tab-group.component';

describe('TabGroup', () => {
  let fixture: ComponentFixture<TabGroup>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TabGroup);
    await fixture.whenStable();
  });

  it('should update tabs and tabpanels', async () => {
    const testPanel = document.createElement('div');
    testPanel.textContent = 'panel 1';
    fixture.componentRef.setInput('tabs', [{label: 'tab 1', panel: testPanel}]);
    await fixture.whenStable();

    const tabs = fixture.nativeElement.querySelectorAll('.docs-tab');
    const tabpanels = fixture.nativeElement.querySelectorAll('.docs-tab-panel');

    expect(tabs.length).toBe(1);
    expect(tabpanels.length).toBe(1);
    expect(tabs[0].textContent.trim()).toBe('tab 1');
    expect(tabpanels[0].textContent.trim()).toBe('panel 1');
  });

  it('should generate unique ids for tabs and tabpanels', async () => {
    const testPanel1 = document.createElement('div');
    testPanel1.textContent = 'panel 1';
    const testPanel2 = document.createElement('div');
    testPanel2.textContent = 'panel 2';
    fixture.componentRef.setInput('tabs', [
      {label: 'tab 1', panel: testPanel1},
      {label: 'tab 2', panel: testPanel2},
    ]);
    await fixture.whenStable();

    const tabs = fixture.nativeElement.querySelectorAll('.docs-tab');
    const tabpanels = fixture.nativeElement.querySelectorAll('.docs-tab-panel');
    expect(tabs[0].id).not.toBe(tabs[1].id);
    expect(tabpanels[0].id).not.toBe(tabpanels[1].id);

    const fixture2 = TestBed.createComponent(TabGroup);
    fixture2.componentRef.setInput('tabs', [
      {label: 'tab 1', panel: testPanel1},
      {label: 'tab 2', panel: testPanel2},
    ]);
    await fixture2.whenStable();
    const tabs2 = fixture2.nativeElement.querySelectorAll('.docs-tab');
    const tabpanels2 = fixture2.nativeElement.querySelectorAll('.docs-tab-panel');
    expect(tabs[0].id).not.toBe(tabs2[0].id);
    expect(tabpanels[0].id).not.toBe(tabpanels2[0].id);
  });
});
