module.exports = function processErrorDocs(createDocMessage) {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      const navigationDoc = docs.find(doc => doc.docType === 'navigation-json');
      const errorsNode = navigationDoc && findErrorsNode(navigationDoc.data['SideNav']);

      if (!errorsNode) {
        throw new Error(createDocMessage(
            'Missing `errors` url - This node is needed as a place to insert the generated errors docs.',
            navigationDoc));
      }

      docs.forEach(doc => {
        if (doc.docType === 'error') {
          // Add to navigation doc
          const title = `${doc.code}: ${doc.name}`;
          errorsNode.children.push({url: doc.path, title: title, tooltip: doc.name});
        }
      });
    },
  };
};

/**
 * Look for the `errors` navigation node. It is the node whose first child has `url: 'errors'`.
 * (NOTE: Using the URL instead of the title, because it is more robust.)
 *
 * We will "recursively" check all navigation nodes and their children (in breadth-first order),
 * until we find the `errors` node. Keep a list of nodes lists to check.
 * (NOTE: Each item in the list is a LIST of nodes.)
 */
function findErrorsNode(nodes) {
  const nodesList = [nodes];

  while (nodesList.length > 0) {
    // Get the first item from the list of nodes lists.
    const currentNodes = nodesList.shift();
    const errorsNode = currentNodes.find(isErrorsNode);

    // One of the nodes in `currentNodes` was the `errors` node. Return it.
    if (errorsNode) return errorsNode;

    // The `errors` node is not in `currentNodes`. Check each node's children (if any).
    currentNodes.forEach(node => node.children && nodesList.push(node.children));
  }

  // We checked all navigation nodes and their children and did not find the `errors` node.
  return undefined;
}

function isErrorsNode(node) {
  return node.children && node.children.length && node.children[0].url === 'errors';
}
