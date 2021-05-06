module.exports = function processNgModuleDocs(getDocFromAlias, createDocMessage, log) {
  return {
    $runAfter: ['extractDecoratedClassesProcessor', 'computeIdsProcessor'],
    $runBefore: ['createSitemap'],
    exportDocTypes: ['directive', 'pipe'],
    skipAbstractDirectives: true,
    $process(docs) {
      const errors = [];

      for (const doc of docs) {
        if (this.exportDocTypes.indexOf(doc.docType) !== -1) {
          // Match all the directives/pipes to their module
          this.processNgModuleExportDoc(doc, errors);
        }

        if (doc.docType === 'class') {
          this.processInjectableDoc(doc, errors);
        }
      }

      if (errors.length) {
        errors.forEach(error => log.error(error));
        throw new Error('Failed to process NgModule relationships.');
      }


      // Update the NgModule docs after we have associated the directives/pipes/injectables docs.
      for (const doc of docs) {
        if (doc.docType === 'ngmodule') {
          convertAllPropertiesToArrays(doc.ngmoduleOptions);
          this.sortExportDocContainers(doc);
          this.processNgModuleProviders(doc);
        }
      }
    },

    /**
     * Associate the `exportDoc` that is expected to have been exported from an `NgModule` with its
     * `NgModule` doc.
     */
    processNgModuleExportDoc(exportDoc, errors) {
      const options = exportDoc[`${exportDoc.docType}Options`];

      // Directives without a selector are considered abstract and do not need to be part of
      // any `@NgModule`.
      if (this.skipAbstractDirectives && exportDoc.docType === 'directive' && !options.selector) {
        return;
      }

      if (!exportDoc.ngModules || exportDoc.ngModules.length === 0) {
        errors.push(createDocMessage(
          `"${exportDoc.id}" has no @ngModule tag. Docs of type "${exportDoc.docType}" must have this tag.`,
          exportDoc));
        return;
      }

      exportDoc.ngModules.forEach((ngModule, index) => {
        const ngModuleDoc = getNgModule(ngModule, exportDoc, errors);
        if (ngModuleDoc !== null) {
          const containerName = getContainerName(exportDoc.docType);
          const container = ngModuleDoc[containerName] = ngModuleDoc[containerName] || [];
          container.push(exportDoc);
          exportDoc.ngModules[index] = ngModuleDoc;
        }
      });
    },

    /**
     * Associate the given `injectableDoc` with an NgModule doc if is provided on an `NgModule`.
     */
    processInjectableDoc(injectableDoc, errors) {
      const ngModules = [];

      if (Array.isArray(injectableDoc.ngModules)) {
        for (const ngModule of injectableDoc.ngModules) {
          // Convert any `@ngModule` JSDOC tags to actual NgModule docs.
          // Don't add this doc to the NgModule doc, since this should already be in the `providers`
          // property of the `@NgModule()` decorator.
          const ngModuleDoc = getNgModule(ngModule, injectableDoc, errors);
          if (ngModuleDoc !== null) {
            ngModules.push(ngModuleDoc);
          }
        }
      }

      // Check for `providedIn` property on `@Injectable()` that might associate it with an
      // `NgModule`.
      for (const decorator of injectableDoc.decorators || []) {
        if (decorator.name === 'Injectable' && decorator.argumentInfo[0]) {
          const providedIn = decorator.argumentInfo[0].providedIn;
          if (isProvidedInNgModule(providedIn)) {
            const ngModuleDoc = getNgModule(providedIn, injectableDoc, errors);
            if (ngModuleDoc === null) {
              continue;
            }
            const container = ngModuleDoc.providers = ngModuleDoc.providers || [];
            container.push(injectableDoc);
            ngModules.push(ngModuleDoc);
          }
        }
      }

      if (ngModules.length > 0) {
        injectableDoc.ngModules = ngModules;
      }
    },

    /**
     * Ensure that the arrays containing the docs exported from the `ngModuleDoc` are sorted.
     */
    sortExportDocContainers(ngModuleDoc) {
      for (const type of this.exportDocTypes) {
        const container = ngModuleDoc[getContainerName(type)];
        if (Array.isArray(container)) {
          container.sort(byId);
        }
      }
    },

    /**
     * Process the providers of the `ngModuleDoc`.
     *
     * Some providers come from the `@NgModule({providers: ...})` decoration.
     * Other providers come from the `@Injectable({providedIn: ...})` decoration.
     */
    processNgModuleProviders(ngModuleDoc) {
      // Add providers from the NgModule decorator.
      const providers = ngModuleDoc.ngmoduleOptions.providers || [];
      // And also add those associated via the `Injectable` `providedIn` property.
      if (Array.isArray(ngModuleDoc.providers)) {
        for (const provider of ngModuleDoc.providers) {
          providers.push(`{ provide: ${provider.name}, useClass: ${provider.name} }`);
        }
      }
      if (providers.length > 0) {
        ngModuleDoc.providers = providers;
      }
    }
  };

  function getNgModule(ngModuleId, doc, errors) {
    const ngModuleDocs = getDocFromAlias(ngModuleId, doc);

    if (ngModuleDocs.length === 0) {
      errors.push(
        createDocMessage(`The referenced "${ngModuleId}" does not match a public NgModule`, doc));
      return null;
    }

    if (ngModuleDocs.length > 1) {
      errors.push(createDocMessage(
        `The referenced "${ngModuleId}" is ambiguous. Matches: ${ngModuleDocs.map(d => d.id).join(', ')}`,
        doc));
      return null;
    }

    return ngModuleDocs[0];
  }
};

/**
 * Compute the name of the array that will hold items of this type in the NgModule document.
 */
function getContainerName(docType) {
  return docType + 's';
}

/**
 * Comparison function for sorting docs associated with an NgModule.
 *
 * This is used to sort docs by their id.
 */
function byId(a, b) {
  return a.id > b.id ? 1 : -1;
}

/**
 * Convert all the values of properties on the `obj` to arrays, if not already.
 */
function convertAllPropertiesToArrays(obj) {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && !Array.isArray(value)) {
      obj[key] = [value];
    }
  }
}

/**
 * Returns true if the `providedIn` is a reference to an NgModule.
 *
 * If `providedIn` is not a string then it is probably undefined, which means that this
 * is not a tree-shakable provider that needs associating with an NgModule.
 *
 * If `providedIn` is wrapped in quotes, then it will be one of `'root'`
 * or `'platform'` and is not associated with a specific NgModule.
 */
function isProvidedInNgModule(providedIn) {
  return typeof providedIn === 'string' && !/^['"].+['"]$/.test(providedIn);
}
