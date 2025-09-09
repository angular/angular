/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RouterTreeComponent} from './router-tree.component';
import SpyObj = jasmine.SpyObj;
import {FrameManager} from '../../application-services/frame_manager';
import {Events, MessageBus} from '../../../../../protocol';
import {ApplicationOperations} from '../../application-operations';
import {provideZoneChangeDetection} from '@angular/core';

describe('RouterTreeComponent', () => {
  let messageBus: MessageBus<Events>;
  let applicationOperationsSpy: SpyObj<ApplicationOperations>;

  let component: RouterTreeComponent;
  let fixture: ComponentFixture<RouterTreeComponent>;
  let frameManager: FrameManager;

  beforeEach(async () => {
    applicationOperationsSpy = jasmine.createSpyObj<ApplicationOperations>('_appOperations', [
      'viewSourceFromRouter',
    ]);
    messageBus = jasmine.createSpyObj('MessageBus', ['on', 'emit']);
    frameManager = jasmine.createSpyObj('FrameManager', ['selectedFrame']);

    await TestBed.configureTestingModule({
      imports: [RouterTreeComponent],
      providers: [
        provideZoneChangeDetection(),
        {provide: ApplicationOperations, useValue: applicationOperationsSpy},
        {provide: MessageBus, useValue: messageBus},
        {provide: FrameManager, useValue: frameManager},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouterTreeComponent);
    component = fixture.componentInstance;
  });

  describe('router tree apis supported', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('routerDebugApiSupport', true);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call application operations viewSourceFromRouter', () => {
      component.viewSourceFromRouter('routeActiveGuard', 'guard');
      expect(applicationOperationsSpy.viewSourceFromRouter).toHaveBeenCalledTimes(1);
      expect(applicationOperationsSpy.viewSourceFromRouter).toHaveBeenCalledWith(
        'routeActiveGuard',
        'guard',
        frameManager.selectedFrame()!,
      );
    });

    it('should call application operations viewComponentSource', () => {
      component.viewComponentSource('HomeComponent');
      expect(applicationOperationsSpy.viewSourceFromRouter).toHaveBeenCalledTimes(1);
      expect(applicationOperationsSpy.viewSourceFromRouter).toHaveBeenCalledWith(
        'HomeComponent',
        'component',
        frameManager.selectedFrame()!,
      );
    });

    it('should call emit navigateRoute', () => {
      component.navigateRoute({
        data: {
          path: '/home',
        },
      });
      expect(messageBus.emit).toHaveBeenCalledTimes(1);
      expect(messageBus.emit).toHaveBeenCalledWith('navigateRoute', ['/home']);
    });
  });

  describe('router tree apis not supported', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('routerDebugApiSupport', false);
      fixture.detectChanges();
    });

    it('should show unsupported version message when routerDebugApiSupport is false', () => {
      fixture.componentRef.setInput('routerDebugApiSupport', false);
      fixture.detectChanges();

      const unsupportedMsg = fixture.nativeElement.querySelector('.unsupported-version');
      expect(unsupportedMsg).toBeTruthy();
      expect(unsupportedMsg.textContent).toContain(
        'Router tree visualization is available for Angular applications using the latest Angular 20.2.x release and above.',
      );
    });
  });
});
