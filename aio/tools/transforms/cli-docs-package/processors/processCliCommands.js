module.exports = function processCliCommands(createDocMessage) {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      const navigationDoc = docs.find(doc => doc.docType === 'navigation-json');
      const navigationNode = navigationDoc && navigationDoc.data['SideNav'].find(node => node.children && node.children.length && node.children[0].url === 'cli');

      if (!navigationNode) {
        throw new Error(createDocMessage('Missing `cli` url - CLI Commands must include a first child node with url set at `cli`', navigationDoc));
      }

      docs.forEach(doc => {
        if (doc.docType === 'cli-command') {
          doc.names = collectNames(doc.name, doc.commandAliases);

          // Recursively process the options
          processOptions(doc, doc.options);

          // Add to navigation doc
          navigationNode.children.push({ url: doc.path, title: `ng ${doc.name}` });
        }
      });
    }
  };
};

function processOptions(container, options) {
  container.positionalOptions = [];
  container.namedOptions = [];

  options.forEach(option => {
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
