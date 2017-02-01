import {ViewContainerRef} from '@angular/core';
import {AriaLivePoliteness} from '../core';

/**
 * Configuration used when opening a snack-bar.
 */
export class MdSnackBarConfig {
  /** The politeness level for the MdAriaLiveAnnouncer announcement. */
  politeness?: AriaLivePoliteness = 'assertive';

  /** Message to be announced by the MdAriaLiveAnnouncer */
  announcementMessage?: string = '';

  /** The view container to place the overlay for the snack bar into. */
  viewContainerRef?: ViewContainerRef = null;

  /** The length of time in milliseconds to wait before automatically dismissing the snack bar. */
  duration?: number = 0;

  /** Extra CSS classes to be added to the snack bar container. */
  extraClasses?: string[];
}
