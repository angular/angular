/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {NODE_TYPE_CLASS_MAP, ResolutionPathComponent} from './resolution-path.component';
import {SerializedInjector} from '../../../../../../protocol';

describe('ResolutionPath', () => {
  let component: ResolutionPathComponent;
  let fixture: ComponentFixture<ResolutionPathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolutionPathComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResolutionPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render a proper path in a reverse order', () => {
    const dummyPath = [
      {
        name: 'Root',
        type: 'environment',
      },
      {
        name: 'AppComponent',
        type: 'element',
      },
      {
        name: 'Nav',
        type: 'imported-module',
      },
      {
        name: 'NavComponent',
        type: 'element',
      },
    ] as SerializedInjector[];

    fixture.componentRef.setInput('path', dummyPath);
    fixture.detectChanges();

    const nodeElements = fixture.debugElement.queryAll(By.css('.node'));
    expect(nodeElements.length).toEqual(dummyPath.length);

    for (let i = 0; i < nodeElements.length; i++) {
      const nodeEl = nodeElements[i];
      const pathNode = dummyPath[dummyPath.length - i - 1];

      expect(nodeEl).toBeTruthy();

      const el = nodeEl.nativeElement as HTMLElement;

      expect(el.innerText).toEqual(pathNode.name);
      expect(el.classList.contains(NODE_TYPE_CLASS_MAP[pathNode.type])).toBeTrue();
    }
  });
});
