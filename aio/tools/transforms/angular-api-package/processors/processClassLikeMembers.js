/**
 * A class like API doc contains members, but these can be either properties or method.
 * Separate the members into two new collections: `doc.properties` and `doc.methods`.
 */
module.exports = function processClassLikeMembers() {
  return {
    $runAfter: ['filterContainedDocs'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      docs.forEach(doc => {
        if (doc.members) {
          doc.properties = [];
          doc.methods = [];
          doc.members.forEach(member => {
            if (isMethod(member)) {
              doc.methods.push(member);
              computeMemberDescription(member);
            } else {
              doc.properties.push(member);

              if (!member.description) {
                // Is this property defined as a constructor parameter e.g. `constructor(public property: string) { ... }`?
                const constructorDoc = member.containerDoc.constructorDoc;
                if (constructorDoc) {
                  const matchingParameterDoc = constructorDoc.parameterDocs.filter(doc => doc.declaration === member.declaration)[0];
                  member.constructorParamDoc = matchingParameterDoc;
                }
              }
            }
          });
        }
        if (doc.statics) {
          doc.staticProperties = [];
          doc.staticMethods = [];
          doc.statics.forEach(member => {
            if (isMethod(member)) {
              doc.staticMethods.push(member);
              computeMemberDescription(member);
            } else {
              doc.staticProperties.push(member);
            }
          });
        }

      });
    }
  };
};

function isMethod(doc) {
  return doc.hasOwnProperty('parameters') && !doc.isGetAccessor && !doc.isSetAccessor;
}

function computeMemberDescription(member) {
  if (!member.description && member.overloads) {
    // Perhaps the description is on one of the overloads - take the first non-empty one
    member.description = member.overloads.map(overload => overload.description).filter(description => !!description)[0];
  }
}