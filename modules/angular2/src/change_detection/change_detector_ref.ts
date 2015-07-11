import {ChangeDetector} from './interfaces';
import {CHECK_ONCE, DETACHED, CHECK_ALWAYS} from './constants';

/**
 * Controls change detection.
 *
 * {@link ChangeDetectorRef} allows requesting checks for detectors that rely on observables. It
 * also allows detaching and attaching change detector subtrees.
 */
export class ChangeDetectorRef {
  /**
   * @private
   */
  constructor(private _cd: ChangeDetector) {}

  /**
   * Request to check all ON_PUSH ancestors.
   */
  requestCheck(): void { this._cd.markPathToRootAsCheckOnce(); }

  /**
   * Detaches the change detector from the change detector tree.
   *
   * The detached change detector will not be checked until it is reattached.
   */
  detach(): void { this._cd.mode = DETACHED; }

  /**
   * Reattach the change detector to the change detector tree.
   *
   * This also requests a check of this change detector. This reattached change detector will be
   *checked during the
   * next change detection run.
   */
  reattach(): void {
    this._cd.mode = CHECK_ALWAYS;
    this.requestCheck();
  }
}
