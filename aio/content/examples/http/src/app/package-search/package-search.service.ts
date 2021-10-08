import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

export interface NpmPackageInfo {
  name: string;
  version: string;
  description: string;
}

export const searchUrl = '/packages/query';

function createHttpOptions(packageName: string, refresh = false) {
    // package name search api
    // e.g., /packages/query?name=dom'
    const params = new HttpParams({ fromObject: { name: packageName } });
    const headerMap: Record<string, string> = refresh ? {'x-refresh': 'true'} : {};
    const headers = new HttpHeaders(headerMap) ;
    return { headers, params };
}

@Injectable()
export class PackageSearchService {
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('PackageSearchService');
  }

  search(packageName: string, refresh = false): Observable<NpmPackageInfo[]> {
    // clear if no pkg name
    if (!packageName.trim()) { return of([]); }

    const options = createHttpOptions(packageName, refresh);

    return this.http.get<NpmPackageInfo[]>(searchUrl, options).pipe(
      catchError(this.handleError('search', []))
    );
  }
}
