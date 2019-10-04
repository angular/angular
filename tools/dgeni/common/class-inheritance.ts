import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';

/** Gets all class like export documents which the given doc inherits from. */
export function getInheritedDocsOfClass(doc: ClassLikeExportDoc): ClassLikeExportDoc[] {
  const directBaseDocs = [
    ...doc.implementsClauses.filter(clause => clause.doc).map(d => d.doc!),
    ...doc.extendsClauses.filter(clause => clause.doc).map(d => d.doc!),
  ];

  return [
    ...directBaseDocs,
    // recursively collect base documents of direct base documents.
    ...directBaseDocs.reduce(
      (res: ClassLikeExportDoc[], d) => res.concat(getInheritedDocsOfClass(d)), []),
  ];
}
