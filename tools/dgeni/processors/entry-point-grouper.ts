import {DocCollection, Document, Processor} from 'dgeni';
import {ConstExportDoc} from 'dgeni-packages/typescript/api-doc-types/ConstExportDoc';
import {FunctionExportDoc} from 'dgeni-packages/typescript/api-doc-types/FunctionExportDoc';
import {InterfaceExportDoc} from 'dgeni-packages/typescript/api-doc-types/InterfaceExportDoc';
import {TypeAliasExportDoc} from 'dgeni-packages/typescript/api-doc-types/TypeAliasExportDoc';
import * as path from 'path';
import {CategorizedClassDoc} from '../common/dgeni-definitions';

/** Document type for an entry-point. */
export class EntryPointDoc {

  /** Unique document type for Dgeni. */
  docType = 'entry-point';

  /** Name of the component group. */
  name: string;

  /** Display name of the entry-point. */
  displayName: string;

  /** Module import path for the entry-point. */
  moduleImportPath: string;

  /** Name of the package, either material or cdk */
  packageName: string;

  /** Display name of the package. */
  packageDisplayName: string;

  /** Unique id for the entry-point. */
  id: string;

  /** Known aliases for the entry-point. This is only needed for the `computeIdsProcessor`. */
  aliases: string[] = [];

  /** List of categorized class docs that are defining a directive. */
  directives: CategorizedClassDoc[] = [];

  /** List of categorized class docs that are defining a service. */
  services: CategorizedClassDoc[] = [];

  /** Classes that belong to the entry-point. */
  classes: CategorizedClassDoc[] = [];

  /** Interfaces that belong to the entry-point. */
  interfaces: InterfaceExportDoc[] = [];

  /** Type aliases that belong to the entry-point. */
  typeAliases: TypeAliasExportDoc[] = [];

  /** Functions that belong to the entry-point. */
  functions: FunctionExportDoc[] = [];

  /** Constants that belong to the entry-point. */
  constants: ConstExportDoc[] = [];

  /** NgModule that defines the current entry-point. */
  ngModule: CategorizedClassDoc | null = null;

  constructor(name: string) {
    this.name = name;
    this.id = `entry-point-${name}`;
  }
}

/**
 * Processor to group docs into entry-points that consist of directives, component, classes,
 * interfaces, functions or type aliases.
 */
export class EntryPointGrouper implements Processor {
  name = 'entry-point-grouper';
  $runBefore = ['docs-processed'];

  $process(docs: DocCollection) {
    const entryPoints = new Map<string, EntryPointDoc>();

    docs.forEach(doc => {
      const documentInfo = getDocumentPackageInfo(doc);

      const packageName = documentInfo.packageName;
      const packageDisplayName = documentInfo.packageName === 'cdk' ? 'CDK' : 'Material';

      const moduleImportPath = `@angular/${packageName}/${documentInfo.entryPointName}`;
      const entryPointName = packageName + '-' + documentInfo.name;

      // Get the entry-point for this doc, or, if one does not exist, create it.
      let entryPoint;
      if (entryPoints.has(entryPointName)) {
        entryPoint = entryPoints.get(entryPointName)!;
      } else {
        entryPoint = new EntryPointDoc(entryPointName);
        entryPoints.set(entryPointName, entryPoint);
      }

      entryPoint.displayName = documentInfo.name;
      entryPoint.moduleImportPath = moduleImportPath;
      entryPoint.packageName = packageName;
      entryPoint.packageDisplayName = packageDisplayName;

      // Put this doc into the appropriate list in the entry-point doc.
      if (doc.isDirective) {
        entryPoint.directives.push(doc);
      } else if (doc.isService) {
        entryPoint.services.push(doc);
      } else if (doc.isNgModule) {
        entryPoint.ngModule = doc;
      } else if (doc.docType === 'class') {
        entryPoint.classes.push(doc);
      } else if (doc.docType === 'interface') {
        entryPoint.interfaces.push(doc);
      } else if (doc.docType === 'type-alias') {
        entryPoint.typeAliases.push(doc);
      } else if (doc.docType === 'function') {
        entryPoint.functions.push(doc);
      } else if (doc.docType === 'const') {
        entryPoint.constants.push(doc);
      }
    });

    return Array.from(entryPoints.values());
  }
}

/** Resolves package information for the given Dgeni document. */
function getDocumentPackageInfo(doc: Document) {
  // Full path to the file for this doc.
  const basePath = doc.fileInfo.basePath;
  const filePath = doc.fileInfo.filePath;

  // All of the component documentation is under either `src/lib` or `src/cdk`.
  // We group the docs up by the directory immediately under that root.
  const pathSegments = path.relative(basePath, filePath).split(path.sep);
  let groupName = pathSegments[1];

  // The ripples are technically part of the `@angular/material/core` entry-point, but we
  // want to show the ripple API separately in the docs. In order to archive this, we treat
  // the ripple folder as its own entry-point.
  if (pathSegments[1] === 'core' && pathSegments[2] === 'ripple') {
    groupName = 'ripple';
  }

  return {
    name: groupName,
    packageName: pathSegments[0] === 'lib' ? 'material' : pathSegments[0],
    entryPointName: pathSegments[1],
  };
}
