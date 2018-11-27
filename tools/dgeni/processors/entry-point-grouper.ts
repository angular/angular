import {DocCollection, Document, Processor} from 'dgeni';
import {ConstExportDoc} from 'dgeni-packages/typescript/api-doc-types/ConstExportDoc';
import {FunctionExportDoc} from 'dgeni-packages/typescript/api-doc-types/FunctionExportDoc';
import {InterfaceExportDoc} from 'dgeni-packages/typescript/api-doc-types/InterfaceExportDoc';
import {TypeAliasExportDoc} from 'dgeni-packages/typescript/api-doc-types/TypeAliasExportDoc';
import * as path from 'path';
import {computeApiDocumentUrl} from '../common/compute-api-url';
import {CategorizedClassDoc} from '../common/dgeni-definitions';

export interface ModuleInfo {
  /** Name of the module (e.g. toolbar, drag-drop, ripple) */
  name: string;
  /** Name of the package that contains this entry point. */
  packageName: string;
  /** Name of the entry-point that contains this module. */
  entryPointName: string;
}

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
      const moduleInfo = getModulePackageInfo(doc);

      const packageName = moduleInfo.packageName;
      const packageDisplayName = packageName === 'cdk' ? 'CDK' : 'Material';

      const moduleImportPath = `@angular/${packageName}/${moduleInfo.entryPointName}`;
      const entryPointName = packageName + '-' + moduleInfo.name;

      // Compute a public URL that refers to the document. This is helpful if we want to
      // make references to other API documents. e.g. showing the extended class.
      doc.publicUrl = computeApiDocumentUrl(doc, moduleInfo);

      // Get the entry-point for this doc, or, if one does not exist, create it.
      let entryPoint;
      if (entryPoints.has(entryPointName)) {
        entryPoint = entryPoints.get(entryPointName)!;
      } else {
        entryPoint = new EntryPointDoc(entryPointName);
        entryPoints.set(entryPointName, entryPoint);
      }

      entryPoint.displayName = moduleInfo.name;
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

/** Resolves module package information of the given Dgeni document. */
function getModulePackageInfo(doc: Document): ModuleInfo {
  // Full path to the file for this doc.
  const basePath = doc.fileInfo.basePath;
  const filePath = doc.fileInfo.filePath;

  // All of the component documentation is under either `src/lib` or `src/cdk`.
  // We group the docs up by the directory immediately under that root.
  const pathSegments = path.relative(basePath, filePath).split(path.sep);

  // The module name is usually the entry-point (e.g. slide-toggle, toolbar), but this is not
  // guaranteed because we can also export a module from lib/core. e.g. the ripple module.
  let moduleName = pathSegments[1];

  // The ripples are technically part of the `@angular/material/core` entry-point, but we
  // want to show the ripple API separately in the docs. In order to archive this, we treat
  // the ripple folder as its own module.
  if (pathSegments[1] === 'core' && pathSegments[2] === 'ripple') {
    moduleName = 'ripple';
  }

  return {
    name: moduleName,
    packageName: pathSegments[0] === 'lib' ? 'material' : pathSegments[0],
    entryPointName: pathSegments[1],
  };
}
