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
});
