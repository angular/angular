/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Interface used with listing object entries in this benchmark
 */
export interface ObjectEntry {
  value: number;
}

/**
 * Prints out a table in the following format
 *
 * index | scenario1 | scenario2 | scenario2and1Diff% | scenario3 | scenario3and1Diff%
 * -----------------------------------------------------------------------------------
 * ...values...
 */
export function printBenchmarkResultsTable(
    scenarios: string[], benchmarks: string[], entries: number[][]): void {
  const rowTpl: {[scenario: string]: any} = {benchmark: ''};
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    const scenarioName = timeColumn(scenario);
    rowTpl[scenarioName] = null;
    if (i !== 0) {
      const diffName = diffColumn(scenario);
      rowTpl[diffName] = null;
    }
  }

  const rows: any[] = [];
  for (let i = 0; i < benchmarks.length; i++) {
    const entry = entries[i];
    if (!entry) continue;
    const row: {[scenario: string]: string|number|null} = {...rowTpl, benchmark: benchmarks[i]};
    const masterValue = entry[0] || 0;
    for (let j = 0; j < scenarios.length; j++) {
      const scenario = scenarios[j];
      const scenarioName = timeColumn(scenario);
      const value = entry[j] || 0 as number;
      row[scenarioName] = formatTime(value);
      if (j !== 0) {
        const diffName = diffColumn(scenario);
        row[diffName] = value === 0 ? 'n/a' : formatDiff(masterValue / value);
      }
    }
    rows.push(row);
  }

  // tslint:disable-next-line
  console.table(rows);
}

function diffColumn(name: string) {
  return `${name} (diff)`;
}

function timeColumn(name: string) {
  return `${name} (ms)`;
}

// e.g. `1.02 x 10^-2ms`
const TIME_DECIMAL_PLACES = 2;

// e.g. `0.05x`
const DIFF_DECIMAL_PLACES = 2;

/**
 * Formats the provided number into millisecond form (using scientific notation to help reduce
 * characters).
 *
 * Example:
 * ```ts
 * formatTime(0) // 0ms
 * formatTime(1) // 1ms
 * formatTime(0.1) // 1 * 10^-1ms
 * formatTime(0.01) // 1 * 10^-2ms
 * formatTime(0.001) // 1 * 10^-3ms
 * // ...
 * ```
 *
 * @param value a number in millisecond form
 */
function formatTime(value: number): string {
  let exponentValue;
  for (exponentValue = 0; value !== 0 && value < 1; exponentValue++) {
    value *= 10;
  }

  let displayValue: string;
  if (value === 0) {
    displayValue = 'n/a';
  } else {
    displayValue = value.toFixed(TIME_DECIMAL_PLACES);
    displayValue = exponentValue === 0 ? displayValue : `${displayValue} * 10^-${exponentValue}`;
  }

  return displayValue;
}

/**
 * Returns a diff value representing the change in value in the form of `valueX`.
 *
 * There are three cases of the value is formatted:
 * Case 1: If greater than 1 then round down
 * Case 2: If greater than 1 but less than 2 then still use a floating point diff
 * Case 3: Otherwise show a negative difference
 */
function formatDiff(value: number) {
  let slower = false;
  if (value > 2) {
    // Case 1: bigger than 100%
    value = Math.floor(value);
  } else if (value > 1) {
    // Case 2: less than 2x, but greater than 1x
    value--;
  } else {
    // Case 3: less than 1x
    value = 1 - value;
    slower = true;
  }

  const displayValue =
      value < 1 ? formatToDecimalPlaces(value, DIFF_DECIMAL_PLACES) : value.toString();

  return displayValue === '0' ? 'no difference' :
                                `${displayValue}x ${slower ? 'slower' : 'faster'}`;
}

/**
 * Formats the value nicely to the given decimal places amount, but returns `0` when the value is
 * beyond the provided decimal places
 */
function formatToDecimalPlaces(value: number, decimalPlaces: number): string {
  const maxNumber = Math.pow(10, -decimalPlaces);
  return value < maxNumber ? '0' : value.toFixed(decimalPlaces);
}

export function printHeading(name: string) {
  // tslint:disable-next-line
  console.log(
      '-----------------------------------------------\n' + name + '\n' +
      '-----------------------------------------------');
}

/**
 * Returns a list of 1000 numbers
 */
export function makeNumberArray(): number[] {
  const array: number[] = [];
  for (let i = 0; i < 1000; i++) {
    array.push(i);
  }
  return array;
}

/**
 * Returns a list of 1000 objects each having an incremented value
 */
export function makeObjectArray(): ObjectEntry[] {
  return makeNumberArray().map(value => ({value}));
}

/**
 * The trackBy function used for tracking `ObjectEntry` entries.
 *
 * This function is designed to be used with NgFor.
 */
export function trackByObjects(index: number, item: ObjectEntry) {
  return item.value;
}
