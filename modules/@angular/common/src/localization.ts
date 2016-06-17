/**
 * @experimental
 */
export abstract class NgLocalization { abstract getPluralCategory(value: any): string; }

/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 *
 * @internal
 */
export function getPluralCategory(
    value: number, cases: string[], ngLocalization: NgLocalization): string {
  const nbCase = `=${value}`;

  return cases.indexOf(nbCase) > -1 ? nbCase : ngLocalization.getPluralCategory(value);
}
