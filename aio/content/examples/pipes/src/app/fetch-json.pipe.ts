// #docregion
import { HttpClient }          from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';

// #docregion pipe-metadata
@Pipe({
  name: 'fetch',
  pure: false
})
// #enddocregion pipe-metadata
export class FetchJsonPipe implements PipeTransform {
  private cachedData: any = null;
  private cachedUrl = '';

  constructor(private http: HttpClient) { }

  transform(url: string): any {
    if (url !== this.cachedUrl) {
      this.cachedData = null;
      this.cachedUrl = url;
      this.http.get(url).subscribe(result => this.cachedData = result);
    }

    return this.cachedData;
  }
}
