import {CategorizedClassDoc} from './categorizer';
import {DocCollection, Processor} from 'dgeni';
import * as path from 'path';

/** Component group data structure. */
export class ComponentGroup {

  /** Name of the component group. */
  name: string;

  /** Display name of the component group */
  displayName: string;

  /** Module import path for the component group. */
  moduleImportPath: string;

  /** Name of the package, either material or cdk */
  packageName: string;

  /** Display name of the package. */
  packageDisplayName: string;

  /** Unique id for the component group. */
  id: string;

  /** Known aliases for the component group. */
  aliases: string[];

  /** Unique document type for Dgeni. */
  docType: string;

  /** List of categorized class docs that are defining a directive. */
  directives: CategorizedClassDoc[];

  /** List of categorized class docs that are defining a service. */
  services: CategorizedClassDoc[];

  /** Additional classes that belong to the component group. */
  additionalClasses: CategorizedClassDoc[];

  /** NgModule that defines the current component group. */
  ngModule: CategorizedClassDoc | null;

  constructor(name: string) {
    this.name = name;
    this.id = `component-group-${name}`;
    this.aliases = [];
    this.docType = 'componentGroup';
    this.directives = [];
    this.services = [];
    this.additionalClasses = [];
    this.ngModule = null;
  }
}

/**
 * Processor to group docs into top-level "Components" WRT material design, e.g., "Button", "Tabs",
 * where each group may conists of several directives and services.
 */
export class ComponentGrouper implements Processor {
  name = 'component-grouper';
  $runBefore = ['docs-processed'];

  $process(docs: DocCollection) {
    // Map of group name to group instance.
    const groups = new Map<string, ComponentGroup>();

    docs.forEach(doc => {
      // Full path to the file for this doc.
      const basePath = doc.fileInfo.basePath;
      const filePath = doc.fileInfo.filePath;

      // All of the component documentation is under either `src/lib` or `src/cdk`.
      // We group the docs up by the directory immediately under that root.
      let packageName, packageDisplayName;
      if (filePath.includes('cdk')) {
        packageName = 'cdk';
        packageDisplayName = 'CDK';
      } else {
        packageName = 'material';
        packageDisplayName = 'Material';
      }

      const displayName = path.relative(basePath, filePath).split(path.sep)[1];
      const moduleImportPath = `@angular/${packageName}/${displayName}`;
      const groupName = packageName + '-' + displayName;

      // Get the group for this doc, or, if one does not exist, create it.
      let group;
      if (groups.has(groupName)) {
        group = groups.get(groupName)!;
      } else {
        group = new ComponentGroup(groupName);
        groups.set(groupName, group);
      }

      group.displayName = displayName;
      group.moduleImportPath = moduleImportPath;

      group.packageName = packageName;
      group.packageDisplayName = packageDisplayName;

      // Put this doc into the appropriate list in this group.
      if (doc.isDirective) {
        group.directives.push(doc);
      } else if (doc.isService) {
        group.services.push(doc);
      } else if (doc.isNgModule) {
        group.ngModule = doc;
      } else if (doc.docType == 'class') {
        group.additionalClasses.push(doc);
      }
    });

    return Array.from(groups.values());
  }
}
