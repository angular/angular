// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
 * @param date to convert to a compact ISO8601 format
 * @return date in a compact ISO8601 format
 */
export const toISO8601Compact = (date: Date): string => {
  /*
   * @param x an integer to append a leading 0 to if less than 9
   * @return x with a leading 0 appended if less than 9
   */
  function leadZero(x: number): string {
    return (x > 9 ? '' : '0') + x;
  }

  return (
      date.getFullYear() + leadZero(date.getMonth() + 1) + leadZero(date.getDate()) + 'T' +
      leadZero(date.getHours()) + leadZero(date.getMinutes()) + leadZero(date.getSeconds()));
};
