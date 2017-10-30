/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './portal';
export * from './dom-portal-outlet';
export * from './portal-directives';
export * from './portal-injector';

export {DomPortalOutlet as DomPortalHost} from './dom-portal-outlet';
export {
  CdkPortalOutlet as PortalHostDirective,
  CdkPortal as TemplatePortalDirective,
} from './portal-directives';
export {PortalOutlet as PortalHost, BasePortalOutlet as BasePortalHost} from './portal';
