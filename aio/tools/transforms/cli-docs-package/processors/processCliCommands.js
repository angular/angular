module.exports = function processCliCommands(createDocMessage) {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      const navigationDoc = docs.find(doc => doc.docType === 'navigation-json');
      const cliCommandsNode = navigationDoc && findCliCommandsNode(navigationDoc.data['SideNav']);

      if (!cliCommandsNode) {
        throw new Error(createDocMessage(
            'Missing `cli` url - CLI Commands must include a first child node with url set at `cli`',
            navigationDoc));
      }

      docs.forEach(doc => {
        if (doc.docType === 'cli-command') {
          doc.names = collectNames(doc.name, doc.commandAliases);

          // Recursively process the options
          const optionKeywords = new Set();
          processOptions(doc, doc.options, optionKeywords);
          doc.optionKeywords = Array.from(optionKeywords).join(' ');

          // Add to navigation doc
          cliCommandsNode.children.push({url: doc.path, title: `ng ${doc.name}`});
        }
      });
    }
  };
};

// Look for the `CLI Commands` navigation node. It is the node whose first child has `url: 'cli'`.
// (NOTE: Using the URL instead of the title, because it is more robust.)
function findCliCommandsNode(nodes) {
  // We will "recursively" check all navigation nodes and their children (in breadth-first order),
  // until we find the `CLI Commands` node. Keep a list of nodes lists to check.
  // (NOTE: Each item in the list is a LIST of nodes.)
  const nodesList = [nodes];

  while (nodesList.length > 0) {
    // Get the first item from the list of nodes lists.
    const currentNodes = nodesList.shift();
    const cliCommandsNode = currentNodes.find(isCliCommandsNode);

    // One of the nodes in `currentNodes` was the `CLI Commands` node. Return it.
    if (cliCommandsNode) return cliCommandsNode;

    // The `CLI Commands` node is not in `currentNodes`. Check each node's children (if any).
    currentNodes.forEach(node => node.children && nodesList.push(node.children));
  }

  // We checked all navigation nodes and their children and did not find the `CLI Commands` node.
  return undefined;
}

function isCliCommandsNode(node) {
  return node.children && node.children.length && node.children[0].url === 'cli';
}

function processOptions(container, options, optionKeywords) {
  container.positionalOptions = [];
  container.namedOptions = [];

  options.forEach(option => {
    // Ignore any hidden options
    if (option.hidden) {
      return;
    }

    option.types = option.types || [option.type];
    option.names = collectNames(option.name, option.aliases);
    option.names.forEach(name => optionKeywords.add(name));

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
        subcommand.names.forEach(name => optionKeywords.add(name));
        processOptions(subcommand, subcommand.options, optionKeywords);
      });
    }
  });

  container.namedOptions.sort((a, b) => a.name > b.name ? 1 : -1);
}

function collectNames(name, aliases) {
  return [name].concat(aliases || []);
}

function getValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}
