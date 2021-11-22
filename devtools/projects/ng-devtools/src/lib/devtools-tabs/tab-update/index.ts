import { Observable, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

// This service is used to notify the CDK virtual scroll parents
// when the tab has changed. Alternatively, we risk to have broken
// layout since the virtual scroll is nested inside of a TabGroup
// which doesn't have consistent dimensions when collapsed and expanded.
export class TabUpdate {
  private _tabUpdate = new Subject<void>();

  tabUpdate$: Observable<void> = this._tabUpdate.asObservable().pipe(share());

  notify(): void {
    this._tabUpdate.next();
  }
}
