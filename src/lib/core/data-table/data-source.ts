import {Observable} from 'rxjs/Observable';

export interface CollectionViewer {
  viewChanged: Observable<{start: number, end: number}>;
}

export abstract class DataSource<T> {
  abstract connect(collectionViewer: CollectionViewer): Observable<T[]>;
}
