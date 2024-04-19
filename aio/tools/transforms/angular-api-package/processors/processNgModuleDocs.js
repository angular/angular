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
      const options = exportDoc[`${exportDoc.docType}Options`] || {};

      // Directives without a selector are considered abstract and do not need to be part of
      // any `@NgModule`.
      if (this.skipAbstractDirectives && exportDoc.docType === 'directive' && !options.selector) {
        return;
      }

      if (!exportDoc.ngModules || exportDoc.ngModules.length === 0) {
        // Trigger an error for non-standalone components/pipes/directives only.
        // Standalone types may not be a part of an NgModule, in which case
        // we just exit this function without throwing an error.
        if (!options.standalone) {
          errors.push(createDocMessage(
              `"${exportDoc.id}" has no @ngModule tag. Docs of type "${
                  exportDoc.docType}" must have this tag.`,
              exportDoc));
        }
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
     * Associate the given `injectableDoc` with an NgModule doc if it is provided on an `NgModule`.
     */
    processInjectableDoc(injectableDoc, errors) {
      const ngModules = [];

      if (Array.isArray(injectableDoc.ngModules)) {
        for (const ngModule of injectableDoc.ngModules) {
          if (isWrappedInQuotes(ngModule)) {
            // `ngModule` is wrapped in quotes, so it will be one of `'any'`, `'root'` or
            // `'platform'` and is not associated with a specific NgModule. So just use the string.
            ngModules.push(ngModule.slice(1, -1));
            continue;
          }
          // Convert any `@ngModule` JSDOC tags to actual NgModule docs.
          // Don't add this doc to the NgModule doc, since this should already be in the `providers`
          // property of the `@NgModule()` decorator.
          const ngModuleDoc = getNgModule(ngModule, injectableDoc, errors);
          if (ngModuleDoc !== null) {
            ngModules.push(ngModuleDoc);
          }
        }
      }

      // Check for `providedIn` property on `@Injectable()`.
      for (const decorator of injectableDoc.decorators || []) {
        if (decorator.name === 'Injectable' && decorator.argumentInfo[0]) {
          const providedIn = decorator.argumentInfo[0].providedIn;
          this.processProvidedIn(providedIn, injectableDoc, ngModules, errors);
        }
      }

      // Check for `providedIn` property on an `ɵprov` static property
      if (injectableDoc.symbol?.exports.has('ɵprov')) {
        const declaration = injectableDoc.symbol?.exports.get('ɵprov')?.valueDeclaration;
        const properties = declaration?.initializer?.arguments?.[0]?.properties;
        const providedInProp = properties?.find(prop => prop.name.text === 'providedIn');
        const providedInNode = providedInProp?.initializer;
        if (providedInNode) {
          const providedIn = providedInNode.getSourceFile()
                                 .text.slice(providedInNode.pos, providedInNode.end)
                                 .trim();
          this.processProvidedIn(providedIn, injectableDoc, ngModules, errors);
        }
      }

      if (ngModules.length > 0) {
        injectableDoc.ngModules = ngModules;
      }
    },

    processProvidedIn(providedIn, injectableDoc, ngModules, errors) {
      if (typeof providedIn !== 'string') {
        // `providedIn` is not a string, which means that this is not a tree-shakable provider
        // that needs associating with an NgModule.
        return;
      }
      if (isWrappedInQuotes(providedIn)) {
        // `providedIn` is wrapped in quotes, so it will be one of `'root'` or `'platform'` and
        // is not associated with a specific NgModule. So just use the string.
        ngModules.push(providedIn.slice(1, -1));
        return;
      }

      // `providedIn` ought to reference a public NgModule
      const ngModuleDoc = getNgModule(providedIn, injectableDoc, errors);
      if (ngModuleDoc === null) {
        return;
      }

      const container = ngModuleDoc.providers = ngModuleDoc.providers || [];
      container.push(injectableDoc);
      ngModules.push(ngModuleDoc);
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

      // Update injectables which are provided by this NgModule
      for (const provider of providers) {
        const injectable = parseProvider(provider);
        const injectableDocs = getDocFromAlias(injectable, ngModuleDoc);
        if (injectableDocs.length !== 1) {
          continue;
        }
        const injectableDoc = injectableDocs[0];
        injectableDoc.ngModules = injectableDoc.ngModules || [];
        injectableDoc.ngModules.push(ngModuleDoc);
      }

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
          `The referenced "${ngModuleId}" is ambiguous. Matches: ${
              ngModuleDocs.map(d => d.id).join(', ')}`,
          doc));
      return null;
    }

    return ngModuleDocs[0];
  }
};

function parseProvider(provider) {
  const match = /\{\s*provide:\s*(\w+)\s*,/.exec(provider);
  if (match) {
    return match[1];
  } else {
    return provider;
  }
}

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
  for (const [key, value] of Object.entries(obj)) {
    if (value && !Array.isArray(value)) {
      obj[key] = [value];
    }
  }
}

/**
 * Returns true if the `str` is wrapped in single or double quotes.
 */
function isWrappedInQuotes(str) {
  return /^['"].+['"]$/.test(str);
}
