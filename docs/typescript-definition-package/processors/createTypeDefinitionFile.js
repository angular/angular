var _ = require('lodash');
var path = require('canonical-path');
var codeGen = require('./code_gen.js');

module.exports = function createTypeDefinitionFile(log, convertPrivateClassesToInterfaces) {

  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $validate: {
      dtsPath: { presence: true },
      dtsExtension: { presence: true },
      typeDefinitions: { presence: true }
    },
    dtsPath: 'typings',
    dtsExtension: '.d.ts',
    typeDefinitions: [],
    $process: function(docs) {
      var dtsPath = this.dtsPath;
      var dtsExtension = this.dtsExtension;

      // For each type definition that we wish to create we define a dgeni "doc" for it
      var typeDefDocs = _.map(this.typeDefinitions, function(def) {

        var id = def.id + dtsExtension;
        var docPath = path.join(dtsPath, id);

        return {
          docType: 'type-definition',
          id: id,
          aliases: [id],
          path: docPath,
          outputPath: docPath,
          // A type definition may include a number of top level modules
          // And those modules could be aliased (such as 'angular2/angular2.api' ->
          // 'angular2/angular2')
          moduleDocs: _.transform(def.modules,
                                  function(moduleDocs, props, alias) {
                                    moduleDocs[props.id] = {
                                      id: alias,
                                      doc: null,
                                      namespace: props.namespace,
                                      references: def.references
                                    };
                                  }),
          dts: new codeGen.DtsSerializer(def.remapTypes)
        };
      });

      // Now add all the module docs to their corresponding type definition doc
      _.forEach(docs, function(doc) {
        _.forEach(typeDefDocs, function(typeDefDoc) {
          if(typeDefDoc.moduleDocs[doc.id]) {
            // Add a copy, because we are going to modify it
            typeDefDoc.moduleDocs[doc.id].doc = doc;
          }
        });
      });

      return _.filter(typeDefDocs, function(doc) {
        _.forEach(doc.moduleDocs, function(modDoc, alias) {
          if (!doc || !modDoc.doc) {
            log.error('createTypeDefinitionFile processor: no such module "' + alias + '" (Did you forget to add it to the modules to load?)');
            doc = null;
            return;
          }
          convertPrivateClassesToInterfaces(modDoc.doc.exports, true);
        });
        return !!doc;
      });
    }
  };
};
