import {CategorizedMethodMemberDoc, CategorizedPropertyMemberDoc} from './dgeni-definitions';

/** Sorts method members by deprecated status, member decorator, and name. */
export function sortCategorizedMethodMembers(docA: CategorizedMethodMemberDoc,
                                             docB: CategorizedMethodMemberDoc) {
  // Sort deprecated docs to the end
  if (!docA.isDeprecated && docB.isDeprecated) {
    return -1;
  }

  if (docA.isDeprecated && !docB.isDeprecated) {
    return 1;
  }

  // Break ties by sorting alphabetically on the name
  if (docA.name < docB.name) {
    return -1;
  }

  if (docA.name > docB.name) {
    return 1;
  }

  return 0;
}

/** Sorts property members by deprecated status, member decorator, and name. */
export function sortCategorizedPropertyMembers(docA: CategorizedPropertyMemberDoc,
                                               docB: CategorizedPropertyMemberDoc) {
  // Sort deprecated docs to the end
  if (!docA.isDeprecated && docB.isDeprecated) {
    return -1;
  }

  if (docA.isDeprecated && !docB.isDeprecated) {
    return 1;
  }

  // Sort in the order of: Inputs, Outputs, neither
  if ((docA.isDirectiveInput && !docB.isDirectiveInput) ||
    (docA.isDirectiveOutput && !docB.isDirectiveInput && !docB.isDirectiveOutput)) {
    return -1;
  }

  if ((docB.isDirectiveInput && !docA.isDirectiveInput) ||
    (docB.isDirectiveOutput && !docA.isDirectiveInput && !docA.isDirectiveOutput)) {
    return 1;
  }

  // Break ties by sorting alphabetically on the name
  if (docA.name < docB.name) {
    return -1;
  }

  if (docA.name > docB.name) {
    return 1;
  }

  return 0;
}
