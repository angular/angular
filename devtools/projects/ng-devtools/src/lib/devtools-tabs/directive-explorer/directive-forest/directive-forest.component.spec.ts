/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';

import {By} from '@angular/platform-browser';
import {DevToolsNode, Events, MessageBus} from '../../../../../../protocol';
import {APP_DATA, AppData} from '../../../application-providers/app_data';
import {DEEP_LINK_INSTANCE_ID} from '../../../application-providers/deep_link';
import {TabUpdate} from '../../tab-update';
import {DirectiveForestComponent} from './directive-forest.component';

function createDummyNode(
  name: string,
  id: number,
  children: DevToolsNode[] = [],
  staticNode: boolean = false,
): DevToolsNode {
  return {
    tagName: name,
    static: staticNode,
    children,
    directives: [],
    component: {id, name, isElement: false},
    nativeElement: document.createElement('div'),
    controlFlowBlock: null,
  };
}

describe('DirectiveForestComponent', () => {
  let component: DirectiveForestComponent;
  let fixture: ComponentFixture<DirectiveForestComponent>;
  let messageBusSpy: jasmine.SpyObj<MessageBus<Events>>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let deepLinkInstanceIdSignal = signal<number | null>(null);

  beforeEach(() => {
    deepLinkInstanceIdSignal = signal<number | null>(null);
    messageBusSpy = jasmine.createSpyObj('MessageBus', ['on', 'emit', 'once', 'destroy']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
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
          }),
        },
        {provide: MessageBus, useValue: messageBusSpy},
        {provide: MatSnackBar, useValue: snackBarSpy},
        {provide: DEEP_LINK_INSTANCE_ID, useValue: deepLinkInstanceIdSignal},
        TabUpdate,
      ],
    });

    fixture = TestBed.createComponent(DirectiveForestComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentSelectedElement', {
      position: [0],
      children: [],
      directives: [],
      component: null,
      controlFlowBlock: null,
      static: false,
      hasNativeElement: false,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update matchedNodes atomically in a single set rather than per-match copies', async () => {
    const tree: DevToolsNode[] = [
      createDummyNode('match-alpha', 1),
      createDummyNode('match-beta', 2),
      createDummyNode('match-gamma', 3),
      createDummyNode('match-delta', 4),
    ];
    fixture.componentRef.setInput('forest', tree);
    await fixture.whenStable();

    const updateSpy = spyOn(component.matchedNodes, 'update').and.callThrough();
    const setSpy = spyOn(component.matchedNodes, 'set').and.callThrough();

    const filterFn = component.filterGenerator('match');
    component.handleFilter(filterFn);

    expect(updateSpy).toHaveBeenCalledTimes(0);
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(component.matchedNodes().size).toBe(4);
  });

  it('should render the mismatch banner and jump to nested mismatched leaf components', async () => {
    const mismatchedLeaf: DevToolsNode = {
      ...createDummyNode('leaf-card', 2),
      hydration: {
        status: 'mismatched',
        expectedNodeDetails: '<b>expected</b>',
        actualNodeDetails: '<span>actual</span>',
        errorCode: 'NG0500',
      },
    };
    const root: DevToolsNode = createDummyNode('app-root', 1, [mismatchedLeaf]);
    fixture.componentRef.setInput('forest', [root]);
    await fixture.whenStable();

    const bannerBtn = fixture.debugElement.query(By.css('.banner-jump-btn'));
    expect(bannerBtn).not.toBeNull();
    expect(bannerBtn.nativeElement.textContent).toContain('leaf-card');

    const rootFlat = component.dataSource.getFlatNodeByPosition([0])!;
    component.expansionModel.collapse(rootFlat);

    bannerBtn.nativeElement.click();
    await fixture.whenStable();

    expect(component.expansionModel.isExpanded(rootFlat)).toBeTrue();
    expect(component.selectedNode()?.position).toEqual([0, 0]);
  });

  it('should navigate across multiple hydration mismatches with prev/next buttons', async () => {
    const first: DevToolsNode = {
      ...createDummyNode('card-a', 2),
      hydration: {status: 'mismatched', expectedNodeDetails: null, actualNodeDetails: null},
    };
    const second: DevToolsNode = {
      ...createDummyNode('card-b', 3),
      hydration: {status: 'mismatched', expectedNodeDetails: null, actualNodeDetails: null},
    };
    fixture.componentRef.setInput('forest', [createDummyNode('app-root', 1, [first, second])]);
    await fixture.whenStable();

    const navButtons = fixture.debugElement.queryAll(By.css('.banner-nav-btn'));
    expect(navButtons.length).toBe(2);

    component.jumpToHydrationMismatch(0);
    expect(component.selectedNode()?.position).toEqual([0, 0]);

    navButtons[1].nativeElement.click();
    expect(component.selectedNode()?.position).toEqual([0, 1]);

    navButtons[0].nativeElement.click();
    expect(component.selectedNode()?.position).toEqual([0, 0]);
  });
});
