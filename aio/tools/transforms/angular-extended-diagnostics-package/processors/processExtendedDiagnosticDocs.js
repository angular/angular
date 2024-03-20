module.exports = function processExtendedDiagnosticDocs(createDocMessage) {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      const navigationDoc = docs.find(doc => doc.docType === 'navigation-json');
      const extendedDiagnosticsNode =
          navigationDoc && findExtendedDiagnosticsNode(navigationDoc.data['SideNav']);

      if (!extendedDiagnosticsNode) {
        throw new Error(createDocMessage(
            'Missing `extended-diagnostics` url - ' +
            'This node is needed as a place to insert the generated extended diagnostics docs.',
            navigationDoc));
      }

      docs.forEach(doc => {
        if (doc.docType === 'extended-diagnostic') {
          // Add to navigation doc.
          const title = `${doc.code}: ${doc.name}`;
          extendedDiagnosticsNode.children.push({title, tooltip: doc.name, url: doc.path});
        }
      });
    },
  };
};

/**
 * Look for the `extended-diagnostics` navigation node. It is the node whose first child has
 * `url: 'extended-diagnostics'`.
 * (NOTE: Using the URL instead of the title, because it is more robust.)
 *
 * We will "recursively" check all navigation nodes and their children (in breadth-first order),
 * until we find the `extended-diagnostics` node. Keep a list of nodes lists to check.
 * (NOTE: Each item in the list is a LIST of nodes.)
 */
function findExtendedDiagnosticsNode(nodes) {
  const nodesList = [nodes];

  while (nodesList.length > 0) {
    // Get the first item from the list of nodes lists.
    const currentNodes = nodesList.shift();
    const extendedDiagnosticsNode = currentNodes.find(isExtendedDiagnosticsNode);

    // One of the nodes in `currentNodes` was the `extended-diagnostics` node. Return it.
    if (extendedDiagnosticsNode) return extendedDiagnosticsNode;

    // The `extended-diagnostics` node is not in `currentNodes`. Check each node's children
    // (if any).
    currentNodes.forEach(node => node.children && nodesList.push(node.children));
  }

  // We checked all navigation nodes and their children and did not find the `extended-diagnostics`
  // node.
  return undefined;
}

function isExtendedDiagnosticsNode(node) {
  return node.children && node.children.length && node.children[0].url === 'extended-diagnostics';
}
