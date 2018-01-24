import {CategorizedMethodMemberDoc, CategorizedPropertyMemberDoc} from './dgeni-definitions';

/** Combined type for a categorized method member document. */
type CategorizedMemberDoc = CategorizedMethodMemberDoc & CategorizedPropertyMemberDoc;

/** Sorts members by deprecated status, member decorator, and name. */
export function sortCategorizedMembers(docA: CategorizedMemberDoc, docB: CategorizedMemberDoc) {
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
