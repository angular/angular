/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AAT_STATUS_LIST, Account, Company, CustomDate, Offering, Opportunity, STATUS_LIST} from './common';

export function generateOfferings(count: number): Offering[] {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push(generateOffering(i));
  }
  return res;
}

export function generateOffering(seed: number): Offering {
  const res = new Offering();
  res.name = generateName(seed++);
  res.company = generateCompany(seed++);
  res.opportunity = generateOpportunity(seed++);
  res.account = generateAccount(seed++);
  res.basePoints = seed % 10;
  res.kickerPoints = seed % 4;
  res.status = STATUS_LIST[seed % STATUS_LIST.length];
  res.bundles = randomString(seed++);
  res.dueDate = randomDate(seed++);
  res.endDate = randomDate(seed++, res.dueDate);
  res.aatStatus = AAT_STATUS_LIST[seed % AAT_STATUS_LIST.length];
  return res;
}

export function generateCompany(seed: number): Company {
  const res = new Company();
  res.name = generateName(seed);
  return res;
}

export function generateOpportunity(seed: number): Opportunity {
  const res = new Opportunity();
  res.name = generateName(seed);
  return res;
}

export function generateAccount(seed: number): Account {
  const res = new Account();
  res.accountId = seed;
  return res;
}

const names = [
  'Foo', 'Bar', 'Baz', 'Qux', 'Quux', 'Garply', 'Waldo', 'Fred', 'Plugh', 'Xyzzy', 'Thud', 'Cruft',
  'Stuff'
];

function generateName(seed: number): string {
  return names[seed % names.length];
}

const offsets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function randomDate(seed: number, minDate: CustomDate = null): CustomDate {
  if (minDate == null) {
    minDate = CustomDate.now();
  }

  return minDate.addDays(offsets[seed % offsets.length]);
}

const stringLengths = [5, 7, 9, 11, 13];
const charCodeOffsets = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function randomString(seed: number): string {
  const len = stringLengths[seed % 5];
  let str = '';
  for (let i = 0; i < len; i++) {
    str += StringWrapper.fromCharCode(97 + charCodeOffsets[seed % 9] + i);
  }
  return str;
}
