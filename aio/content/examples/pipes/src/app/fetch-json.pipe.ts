// #docregion
import { Pipe, PipeTransform } from '@angular/core';
import { Http }                from '@angular/http';

import 'rxjs/add/operator/map';

// #docregion pipe-metadata
@Pipe({
  name: 'fetch',
  pure: false
})
// #enddocregion pipe-metadata
export class FetchJsonPipe  implements PipeTransform {
  private cachedData: any = null;
  private cachedUrl = '';

  constructor(private http: Http) { }

  transform(url: string): any {
    if (url !== this.cachedUrl) {
      this.cachedData = null;
      this.cachedUrl = url;
      this.http.get(url)
        .map( result => result.json() )
        .subscribe( result => this.cachedData = result );
    }

    return this.cachedData;
  }
}
