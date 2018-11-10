// #docregion
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// #docregion downgrade-injectable
declare var angular: angular.IAngularStatic;
import { downgradeInjectable } from '@angular/upgrade/static';
// #enddocregion downgrade-injectable

// #docregion phonedata-interface
export interface PhoneData {
  name: string;
  snippet: string;
  images: string[];
}
// #enddocregion phonedata-interface

// #docregion fullclass
// #docregion classdef, downgrade-injectable
@Injectable()
export class Phone {
// #enddocregion classdef, downgrade-injectable
  constructor(private http: HttpClient) { }
  query(): Observable<PhoneData[]> {
    return this.http.get<PhoneData[]>(`phones/phones.json`);
  }
  get(id: string): Observable<PhoneData> {
    return this.http.get<PhoneData>(`phones/${id}.json`);
  }
// #docregion classdef, downgrade-injectable
}
// #enddocregion classdef
// #enddocregion fullclass

angular.module('core.phone')
  .factory('phone', downgradeInjectable(Phone));
// #enddocregion downgrade-injectable
