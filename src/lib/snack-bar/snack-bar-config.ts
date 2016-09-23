import {ViewContainerRef} from '@angular/core';
import {AriaLivePoliteness} from '../core';


export class MdSnackBarConfig {
  /** The politeness level for the MdAriaLiveAnnouncer announcement. */
  politeness: AriaLivePoliteness = 'assertive';

  /** Message to be announced by the MdAriaLiveAnnouncer */
  announcementMessage: string;

  /** The view container to place the overlay for the snack bar into. */
  viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }
}
