/**
 * Determines whether the provided symbols represent the same declaration.
 */
export function isSymbolEqual(a, b) {
  if (a.decl === b.decl) {
    // If the declaration is identical then it must represent the same symbol.
    return true;
  }
  if (a.identifier === null || b.identifier === null) {
    // Unidentifiable symbols are assumed to be different.
    return false;
  }
  return a.path === b.path && a.identifier === b.identifier;
}
/**
 * Determines whether the provided references to a semantic symbol are still equal, i.e. represent
 * the same symbol and are imported by the same path.
 */
export function isReferenceEqual(a, b) {
  if (!isSymbolEqual(a.symbol, b.symbol)) {
    // If the reference's target symbols are different, the reference itself is different.
    return false;
  }
  // The reference still corresponds with the same symbol, now check that the path by which it is
  // imported has not changed.
  return a.importPath === b.importPath;
}
export function referenceEquality(a, b) {
  return a === b;
}
/**
 * Determines if the provided arrays are equal to each other, using the provided equality tester
 * that is called for all entries in the array.
 */
export function isArrayEqual(a, b, equalityTester = referenceEquality) {
  if (a === null || b === null) {
    return a === b;
  }
  if (a.length !== b.length) {
    return false;
  }
  return !a.some((item, index) => !equalityTester(item, b[index]));
}
/**
 * Determines if the provided sets are equal to each other, using the provided equality tester.
 * Sets that only differ in ordering are considered equal.
 */
export function isSetEqual(a, b, equalityTester = referenceEquality) {
  if (a === null || b === null) {
    return a === b;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const itemA of a) {
    let found = false;
    for (const itemB of b) {
      if (equalityTester(itemA, itemB)) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
}
//# sourceMappingURL=util.js.map
