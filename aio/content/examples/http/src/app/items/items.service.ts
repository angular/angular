// #docplaster
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
// #docregion http-options
import { HttpHeaders } from '@angular/common/http';

// #enddocregion http-options

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Item } from './item';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

// #docregion http-options
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'my-auth-token'
  })
};
// #enddocregion http-options

@Injectable()
export class ItemsService {
  itemsUrl = 'api/items';  // URL to web api
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('ItemsService');
  }

  /** GET items from the server */
  getItems (): Observable<Item[]> {
    return this.http.get<Item[]>(this.itemsUrl)
      .pipe(
        catchError(this.handleError('getItems', []))
      );
  }

    // #docregion searchItems
  /* GET items whose name contains search term */
  searchItems(term: string): Observable<Item[]> {
    term = term.trim();

    // Add safe, URL encoded search parameter if there is a search term
    const options = term ?
     { params: new HttpParams().set('name', term) } : {};

    return this.http.get<Item[]>(this.itemsUrl, options)
      .pipe(
        catchError(this.handleError<Item[]>('searchItems', []))
      );
  }
  // #enddocregion searchItems

  //////// Save methods //////////

  // #docregion addItem
  /** POST: add a new item to the database */
  addItem (item: Item): Observable<Item> {
    return this.http.post<Item>(this.itemsUrl, item, httpOptions)
      .pipe(
        catchError(this.handleError('addItem', item))
      );
  }
  // #enddocregion addItem

  // #docregion deleteItem
  /** DELETE: delete the item from the server */
  deleteItem (id: number): Observable<{}> {
    const url = `${this.itemsUrl}/${id}`; // DELETE api/items/42
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError('deleteItem'))
      );
  }
  // #enddocregion deleteItem

  // #docregion updateItem
  /** PUT: update the item on the server. Returns the updated item upon success. */
  updateItem (item: Item): Observable<Item> {
    // #enddocregion updateItem
    // #docregion update-headers
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'my-new-auth-token');
    // #enddocregion update-headers

    // #docregion updateItem
    return this.http.put<Item>(this.itemsUrl, item, httpOptions)
      .pipe(
        catchError(this.handleError('updateItem', item))
      );
  }
  // #enddocregion updateItem
}
