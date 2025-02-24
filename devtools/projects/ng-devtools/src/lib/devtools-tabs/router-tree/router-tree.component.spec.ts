/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RouterTreeComponent} from './router-tree.component';
import {Events, MessageBus} from 'protocol';
import {ApplicationOperations} from 'ng-devtools';
import SpyObj = jasmine.SpyObj;

describe('RouterTreeComponent', () => {
  let messageBus: MessageBus<Events>;
  let applicationOperationsSpy: SpyObj<ApplicationOperations>;

  let component: RouterTreeComponent;
  let fixture: ComponentFixture<RouterTreeComponent>;

  beforeEach(async () => {
    applicationOperationsSpy = jasmine.createSpyObj<ApplicationOperations>('_appOperations', [
      'viewSourceFromRouter',
    ]);
    messageBus = jasmine.createSpyObj('MessageBus', ['on', 'emit']);

    await TestBed.configureTestingModule({
      imports: [RouterTreeComponent],
      providers: [
        {provide: ApplicationOperations, useValue: applicationOperationsSpy},
        {provide: MessageBus, useValue: messageBus},
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
    );
  });

  it('should call application operations viewComponentSource', () => {
    component.viewComponentSource('HomeComponent');
    expect(applicationOperationsSpy.viewSourceFromRouter).toHaveBeenCalledTimes(1);
    expect(applicationOperationsSpy.viewSourceFromRouter).toHaveBeenCalledWith(
      'HomeComponent',
      'component',
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
