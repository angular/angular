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
        {provide: ApplicationOperations, useValue: applicationOperationsSpy},
        {provide: MessageBus, useValue: messageBus},
        {provide: FrameManager, useValue: frameManager},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouterTreeComponent);
    component = fixture.componentInstance;

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
