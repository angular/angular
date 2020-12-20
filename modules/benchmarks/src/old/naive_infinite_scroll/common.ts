/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Math} from '@angular/facade/src/math';

export const ITEMS = 1000;
export const ITEM_HEIGHT = 40;
export const VISIBLE_ITEMS = 17;

export const HEIGHT = ITEMS * ITEM_HEIGHT;
export const VIEW_PORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export const COMPANY_NAME_WIDTH = 100;
export const OPPORTUNITY_NAME_WIDTH = 100;
export const OFFERING_NAME_WIDTH = 100;
export const ACCOUNT_CELL_WIDTH = 50;
export const BASE_POINTS_WIDTH = 50;
export const KICKER_POINTS_WIDTH = 50;
export const STAGE_BUTTONS_WIDTH = 220;
export const BUNDLES_WIDTH = 120;
export const DUE_DATE_WIDTH = 100;
export const END_DATE_WIDTH = 100;
export const AAT_STATUS_WIDTH = 100;
export const ROW_WIDTH = COMPANY_NAME_WIDTH + OPPORTUNITY_NAME_WIDTH + OFFERING_NAME_WIDTH +
    ACCOUNT_CELL_WIDTH + BASE_POINTS_WIDTH + KICKER_POINTS_WIDTH + STAGE_BUTTONS_WIDTH +
    BUNDLES_WIDTH + DUE_DATE_WIDTH + END_DATE_WIDTH + AAT_STATUS_WIDTH;

export const STATUS_LIST = ['Planned', 'Pitched', 'Won', 'Lost'];

export const AAT_STATUS_LIST = ['Active', 'Passive', 'Abandoned'];

// Imitate Streamy entities.

// Just a non-trivial object. Nothing fancy or correct.
export class CustomDate {
  year: number;
  month: number;
  day: number;

  constructor(y: number, m: number, d: number) {
    this.year = y;
    this.month = m;
    this.day = d;
  }

  addDays(days: number): CustomDate {
    let newDay = this.day + days;
    const newMonth = this.month + Math.floor(newDay / 30);
    newDay = newDay % 30;
    const newYear = this.year + Math.floor(newMonth / 12);
    return new CustomDate(newYear, newMonth, newDay);
  }

  static now(): CustomDate {
    return new CustomDate(2014, 1, 28);
  }
}

export class RawEntity {
  private _data: Map<any, any>;

  constructor() {
    this._data = new Map();
  }

  get(key: string) {
    if (key.indexOf('.') == -1) {
      return this._data[key];
    }
    const pieces = key.split('.');
    const last = pieces[pieces.length - 1];
    pieces.length = pieces.length - 1;
    const target = this._resolve(pieces, this);
    if (target == null) {
      return null;
    }
    return target[last];
  }

  set(key: string, value) {
    if (key.indexOf('.') == -1) {
      this._data[key] = value;
      return;
    }
    const pieces = key.split('.');
    const last = pieces[pieces.length - 1];
    pieces.length = pieces.length - 1;
    const target = this._resolve(pieces, this);
    target[last] = value;
  }

  remove(key: string) {
    if (!StringWrapper.contains(key, '.')) {
      return this._data.delete(key);
    }
    const pieces = key.split('.');
    const last = pieces[pieces.length - 1];
    pieces.length = pieces.length - 1;
    const target = this._resolve(pieces, this);
    return target.remove(last);
  }

  private _resolve(pieces, start) {
    let cur = start;
    for (let i = 0; i < pieces.length; i++) {
      cur = cur[pieces[i]];
      if (cur == null) {
        return null;
      }
    }
    return cur;
  }
}

export class Company extends RawEntity {
  get name(): string {
    return this.get('name');
  }
  set name(val: string) {
    this.set('name', val);
  }
}

export class Offering extends RawEntity {
  get name(): string {
    return this.get('name');
  }
  set name(val: string) {
    this.set('name', val);
  }

  get company(): Company {
    return this.get('company');
  }
  set company(val: Company) {
    this.set('company', val);
  }

  get opportunity(): Opportunity {
    return this.get('opportunity');
  }
  set opportunity(val: Opportunity) {
    this.set('opportunity', val);
  }

  get account(): Account {
    return this.get('account');
  }
  set account(val: Account) {
    this.set('account', val);
  }

  get basePoints(): number {
    return this.get('basePoints');
  }
  set basePoints(val: number) {
    this.set('basePoints', val);
  }

  get kickerPoints(): number {
    return this.get('kickerPoints');
  }
  set kickerPoints(val: number) {
    this.set('kickerPoints', val);
  }

  get status(): string {
    return this.get('status');
  }
  set status(val: string) {
    this.set('status', val);
  }

  get bundles(): string {
    return this.get('bundles');
  }
  set bundles(val: string) {
    this.set('bundles', val);
  }

  get dueDate(): CustomDate {
    return this.get('dueDate');
  }
  set dueDate(val: CustomDate) {
    this.set('dueDate', val);
  }

  get endDate(): CustomDate {
    return this.get('endDate');
  }
  set endDate(val: CustomDate) {
    this.set('endDate', val);
  }

  get aatStatus(): string {
    return this.get('aatStatus');
  }
  set aatStatus(val: string) {
    this.set('aatStatus', val);
  }
}

export class Opportunity extends RawEntity {
  get name(): string {
    return this.get('name');
  }
  set name(val: string) {
    this.set('name', val);
  }
}

export class Account extends RawEntity {
  get accountId(): number {
    return this.get('accountId');
  }
  set accountId(val: number) {
    this.set('accountId', val);
  }
}
