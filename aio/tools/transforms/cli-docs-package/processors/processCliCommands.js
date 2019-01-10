module.exports = function processCliCommands() {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      const navigationDoc = docs.find(doc => doc.docType === 'navigation-json');
      const navigationNode = navigationDoc && navigationDoc.data['SideNav'].find(node => node.title === 'CLI Commands');

      docs.forEach(doc => {
        if (doc.docType === 'cli-command') {
          doc.names = collectNames(doc.name, doc.commandAliases);

          // Recursively process the options
          processOptions(doc, doc.options);

          // Add to navigation doc
          if (navigationNode) {
            navigationNode.children.push({ url: doc.path, title: `ng ${doc.name}` });
          }
        }
      });
    }
  };
};

function processOptions(container, options) {
  container.positionalOptions = [];
  container.namedOptions = [];

  options.forEach(option => {

    if (option.type === 'boolean' && option.default === undefined) {
      option.default = false;
    }

    // Ignore any hidden options
    if (option.hidden) { return; }

    option.types = option.types || [option.type];
    option.names = collectNames(option.name, option.aliases);

    // Now work out what kind of option it is: positional/named
    if (option.positional !== undefined) {
      container.positionalOptions[option.positional] = option;
    } else {
      container.namedOptions.push(option);
    }

    // Recurse if there are subcommands
    if (option.subcommands) {
      option.subcommands = getValues(option.subcommands);
      option.subcommands.forEach(subcommand => {
        subcommand.names = collectNames(subcommand.name, subcommand.aliases);
        processOptions(subcommand, subcommand.options);
      });
    }
  });

  container.namedOptions.sort((a, b) => a.name > b.name ? 1 : -1);
}

function collectNames(name, aliases) {
  return [name].concat(aliases);
}

function getValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}
