// #docregion
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

// #docregion downgrade-injectable
declare var angular: angular.IAngularStatic;
import { downgradeInjectable } from '@angular/upgrade/static';
// #enddocregion downgrade-injectable

import 'rxjs/add/operator/map';

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
  constructor(private http: Http) { }
  query(): Observable<PhoneData[]> {
    return this.http.get(`phones/phones.json`)
      .map((res: Response) => res.json());
  }
  get(id: string): Observable<PhoneData> {
    return this.http.get(`phones/${id}.json`)
      .map((res: Response) => res.json());
  }
// #docregion classdef, downgrade-injectable
}
// #enddocregion classdef
// #enddocregion fullclass

angular.module('core.phone')
  .factory('phone', downgradeInjectable(Phone));
// #enddocregion downgrade-injectable
