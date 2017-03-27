import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/take';


export class MockSwUpdatesService {
  $$activateUpdateSubj = new Subject<boolean>();
  $$isUpdateAvailableSubj = new Subject<boolean>();
  isUpdateAvailable = this.$$isUpdateAvailableSubj.distinctUntilChanged();

  activateUpdate(): Promise<boolean> {
    return new Promise(resolve => {
      this.$$activateUpdateSubj
          // Better simulate what actually happens with the real ServiceWorker.
          .take(1)
          .do(() => this.$$isUpdateAvailableSubj.next(false))
          .subscribe(resolve);
    });
  }
}
