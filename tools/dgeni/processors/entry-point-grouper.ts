import {DocCollection, Document, Processor} from 'dgeni';
import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import {ConstExportDoc} from 'dgeni-packages/typescript/api-doc-types/ConstExportDoc';
import {FunctionExportDoc} from 'dgeni-packages/typescript/api-doc-types/FunctionExportDoc';
import {InterfaceExportDoc} from 'dgeni-packages/typescript/api-doc-types/InterfaceExportDoc';
import {TypeAliasExportDoc} from 'dgeni-packages/typescript/api-doc-types/TypeAliasExportDoc';
import * as path from 'path';
import {computeApiDocumentUrl} from '../common/compute-api-url';
import {isDeprecatedDoc, isPrimaryExportDoc} from '../common/decorators';
import {CategorizedClassDoc} from '../common/dgeni-definitions';

export interface ModuleInfo {
  /** Name of the module (e.g. toolbar, drag-drop, ripple, slider-testing) */
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
  name: string = '';

  /** Display name of the entry-point. */
  displayName: string = '';

  /** Module import path for the entry-point. */
  moduleImportPath: string = '';

  /** Name of the package, either material or cdk */
  packageName: string = '';

  /** Display name of the package. */
  packageDisplayName: string = '';

  /** Unique id for the entry-point. */
  id: string = '';

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

  /** List of NgModules which are exported in the current entry-point. */
  exportedNgModules: CategorizedClassDoc[] = [];

  /** List of test harnesses which are exported in the entry-point. */
  testHarnesses: CategorizedClassDoc[] = [];

  /**
   * Name of the primary export of the entry-point. This export will be showed
   * in the API docs as export when show-casing the import to the entry-point.
   */
  primaryExportName: string | null = null;

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
  name = 'entryPointGrouper';
  $runBefore = ['docs-processed'];
  $runAfter = ['docs-private-filter'];
  entryPoints: string[] = [];

  $process(docs: DocCollection) {
    const entryPoints = new Map<string, EntryPointDoc>();

    docs.forEach(doc => {
      const moduleInfo = this._getModulePackageInfo(doc);

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
        entryPoint.exportedNgModules.push(doc);
      } else if (doc.docType === 'class') {
        entryPoint.classes.push(doc);
        if (doc.isTestHarness) {
          entryPoint.testHarnesses.push(doc);
        }
      } else if (doc.docType === 'interface') {
        entryPoint.interfaces.push(doc);
      } else if (doc.docType === 'type-alias') {
        entryPoint.typeAliases.push(doc);
      } else if (doc.docType === 'function') {
        entryPoint.functions.push(doc);
      } else if (doc.docType === 'const') {
        entryPoint.constants.push(doc);
      }

      if (isPrimaryExportDoc(doc)) {
        entryPoint.primaryExportName = doc.name;
      }
    });

    // For each entry-point where no explicit primary export has been specified
    // through the "@docs-primary-export" tag, we determine a primary export by
    // looking for possible "NgModule" classes or test harnesses.
    entryPoints.forEach(entryPoint => {
      if (entryPoint.primaryExportName !== null) {
        return;
      }

      const ngModuleExport = this._findBestPrimaryExport(entryPoint.exportedNgModules);
      if (ngModuleExport !== null) {
        entryPoint.primaryExportName = ngModuleExport.name;
        return;
      }
      const testHarnessExport = this._findBestPrimaryExport(entryPoint.testHarnesses);
      if (testHarnessExport !== null) {
        entryPoint.primaryExportName = testHarnessExport.name;
      }
    });

    return Array.from(entryPoints.values());
  }

  /**
   * Walks through the specified API documents and looks for the best
   * API document that could serve as primary export of an entry-point.
   */
  private _findBestPrimaryExport(docs: ApiDoc[]): ApiDoc | null {
    // Usually the first doc that is not deprecated is used, but in case there are
    // only deprecated doc, the last deprecated doc is used. We don't want to always
    // skip deprecated docs as they could be still needed for documentation of a
    // deprecated entry-point.
    for (let doc of docs) {
      if (!isDeprecatedDoc(doc)) {
        return doc;
      }
    }
    return null;
  }

  /** Resolves module package information of the given Dgeni document. */
  private _getModulePackageInfo(doc: Document): ModuleInfo {
    // Full path to the file for this doc.
    const basePath: string = doc.fileInfo.basePath;
    const filePath: string = doc.fileInfo.filePath;
    const relativeFilePath = path.relative(basePath, filePath).replace(/\\/g, '/');
    const foundEntryPoint = this._findMatchingEntryPoint(relativeFilePath);

    if (!foundEntryPoint) {
      throw Error(`Could not determine entry-point for: ${doc.name} in ${relativeFilePath}`);
    }

    const pathSegments = foundEntryPoint.split('/');
    const entryPointName = pathSegments.slice(1);

    // The module name is usually the entry-point (e.g. slide-toggle, toolbar, slider-testing),
    // but this is not guaranteed because we sometimes have special logic in place where a
    // folder is treated as its own module. e.g. "core/ripple".
    let moduleName = entryPointName.join('-');

    // The ripples are technically part of the `@angular/material/core` entry-point, but we
    // want to show the ripple API separately in the docs. In order to archive this, we treat
    // the ripple folder as its own module.
    if (relativeFilePath.startsWith('material/core/ripple')) {
      moduleName = 'ripple';
    }

    return {
      name: moduleName,
      packageName: pathSegments[0],
      entryPointName: entryPointName.join('/'),
    };
  }

  /** Finds the matching entry-point of the given file path. */
  private _findMatchingEntryPoint(relativeFilePath: string): string | null {
    let foundEntryPoint: string | null = null;
    for (let entryPoint of this.entryPoints) {
      if (!relativeFilePath.startsWith(entryPoint)) {
        continue;
      }

      // Update the found entry-point in case we didn't find one yet, or
      // if the currently matching entry-point is more explicit than the previously
      // found entry-point. e.g. "cdk/bidi/testing" should take precedence over
      // "cdk/bidi" if the API document is inside the "testing/" folder.
      if (foundEntryPoint === null || entryPoint.length > foundEntryPoint.length) {
        foundEntryPoint = entryPoint;
      }
    }
    return foundEntryPoint;
  }
}
