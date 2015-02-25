suite('projection', function() {

  function getDestinationInsertionPoints(node) {
    return node._destinationInsertionPoints || 
      Array.prototype.slice.call(node.getDestinationInsertionPoints(), 0);
  }

  function getDistributedNodes(node) {
    return node._distributedNodes || 
      Array.prototype.slice.call(node.getDistributedNodes(), 0);
  }


  test('localDom.querySelector', function() {
    var test = document.querySelector('x-test');
    var projected = test.localDom.querySelector('#projected');
    assert.equal(projected.textContent, 'projected');
    var p2 = test.lightDom.querySelector('#projected');
    assert.notOk(p2);
    var rere = test.localDom.querySelector('x-rereproject');
    assert.equal(rere.is, 'x-rereproject');
    var re = rere.localDom.querySelector('x-reproject');
    assert.equal(re.is, 'x-reproject');
    var p = re.localDom.querySelector('x-project');
    assert.equal(p.is, 'x-project');
  });

  test('localDom.querySelectorAll', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var re = rere.localDom.querySelector('x-reproject');
    var p = re.localDom.querySelector('x-project');
    var rereList = rere.localDom.querySelectorAll('*');
    assert.include(rereList, re);
    assert.equal(rereList.length, 2);
    var reList = re.localDom.querySelectorAll('*');
    assert.include(reList, p);
    assert.equal(reList.length, 2);
    var pList = p.localDom.querySelectorAll('*');
    assert.equal(pList.length, 1);
  });

  test('lightDom.querySelector', function() {
    var test = document.querySelector('x-test');
    var projected = test.localDom.querySelector('#projected');
    var rere = test.localDom.querySelector('x-rereproject');
    var re = rere.localDom.querySelector('x-reproject');
    var p = re.localDom.querySelector('x-project');
    assert.equal(rere.lightDom.querySelector('#projected'), projected);
    assert(re.lightDom.querySelector('content'));
    assert(p.lightDom.querySelector('content'));
  });

  test('lightDom.querySelectorAll', function() {
    var test = document.querySelector('x-test');
    var projected = test.localDom.querySelector('#projected');
    var rere = test.localDom.querySelector('x-rereproject');
    var re = rere.localDom.querySelector('x-reproject');
    var p = re.localDom.querySelector('x-project');
    assert.equal(rere.lightDom.querySelectorAll('#projected')[0], projected);
    assert(re.lightDom.querySelectorAll('content').length, 1);
    assert(p.lightDom.querySelectorAll('content').length, 1);
  });

  test('querySelectorAllComposed', function() {
    var test = document.querySelector('x-test');
    var projected = test.localDom.querySelector('#projected');
    var rere = test.localDom.querySelector('x-rereproject');
    var re = rere.localDom.querySelector('x-reproject');
    var p = re.localDom.querySelector('x-project');
    assert.equal(rere.querySelectorAllComposed('#projected')[0], projected);
    assert.equal(re.querySelectorAllComposed('#projected')[0], projected);
    assert.equal(p.querySelectorAllComposed('#projected')[0], projected);
  });


  test('projection', function() {
    var test = document.querySelector('x-test');
    var projected = test.localDom.querySelector('#projected');
    assert.equal(projected.textContent, 'projected');
    var rere = test.localDom.querySelector('x-rereproject');
    assert.equal(rere.is, 'x-rereproject');
    var re = rere.localDom.querySelector('x-reproject');
    assert.equal(re.is, 'x-reproject');
    var p = re.localDom.querySelector('x-project');
    assert.equal(p.is, 'x-project');
    var c1 = rere.localDom.querySelector('content');
    assert.include(rere.localDom.distributedNodes(c1), projected);
    var c2 = re.localDom.querySelector('content');
    assert.include(rere.localDom.distributedNodes(c2), projected);
    var c3 = p.localDom.querySelector('content');
    assert.include(rere.localDom.distributedNodes(c3), projected);
    var ip$ = [c1, c2, c3];
    assert.deepEqual(rere.localDom.destinationInsertionPoints(projected), ip$);
  });

  test('distributeContent', function() {
    var test = document.querySelector('x-test');
    test._distributeContent();
    var rere = test.localDom.querySelector('x-rereproject');
    assert.equal(rere.is, 'x-rereproject');
    var re = rere.localDom.querySelector('x-reproject');
    assert.equal(re.is, 'x-reproject');
    var p = re.localDom.querySelector('x-project');
    assert.equal(p.is, 'x-project');
  });

  test('lightDom.appendChild', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var s = document.createElement('span');
    s.id = 'added';
    s.textContent = 'Added';
    rere.lightDom.appendChild(s);
    assert.equal(test.localDom.querySelector('#added'), s);
  });

  test('lightDom.insertBefore', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var ref = test.localDom.querySelector('#added');
    var s = document.createElement('span');
    s.id = 'added2';
    s.textContent = 'Added2';
    rere.lightDom.insertBefore(s, ref);
    assert.equal(test.localDom.querySelector('#added2'), s);
  });

  test('lightDom.removeChild', function() {
    var test = document.querySelector('x-test');
    var added = test.localDom.querySelector('#added');
    var added2 = test.localDom.querySelector('#added2');
    var rere = test.localDom.querySelector('x-rereproject');
    rere.lightDom.removeChild(added);
    rere.lightDom.removeChild(added2);
    assert.equal(test.localDom.querySelectorAll().length, 0);
  });

  test('localDom.appendChild', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var s = document.createElement('span');
    s.id = 'local';
    s.textContent = 'Local';
    rere.localDom.appendChild(s);
    assert.equal(rere.localDom.querySelector('#local'), s);
  });

  test('localDom.insertBefore', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var ref = test.localDom.querySelector('#local');
    var s = document.createElement('span');
    s.id = 'local2';
    s.textContent = 'Local2';
    rere.localDom.insertBefore(s, ref);
    assert.equal(rere.localDom.querySelector('#local2'), s);
  });

  test('localDom.removeChild', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var local = rere.localDom.querySelector('#local');
    var local2 = rere.localDom.querySelector('#local2');
    rere.localDom.removeChild(local);
    rere.localDom.removeChild(local2);
    assert.equal(rere.localDom.querySelectorAll('#local').length, 0);
  });

  test('localDom.insertBefore first element results in minimal change', function() {
    var test = document.querySelector('x-test');
    var children = test.localDom.children();
    var rere = test.localDom.querySelector('x-rereproject');
    assert.equal(rere.attachedCount, 1);
    var s = document.createElement('span');
    s.id = 'local-first';
    s.textContent = 'Local First';
    test.localDom.insertBefore(s, children[0]);
    assert.equal(test.localDom.querySelector('#local-first'), s);
    assert.equal(rere.attachedCount, 1);
    test.localDom.removeChild(s);
    assert.equal(rere.attachedCount, 1);
  });

  test('localDom.appendChild (fragment)', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var fragment = document.createDocumentFragment();
    var childCount = 5;
    for (var i=0; i < childCount; i++) {
      var s = document.createElement('span');
      s.textContent = i; 
      fragment.appendChild(s);
    }
    rere.localDom.appendChild(fragment);
    var added = rere.localDom.querySelectorAll('span');
    assert.equal(added.length, childCount);
    for (var i=0; i < added.length; i++) {
      rere.localDom.removeChild(added[i]);
    }
    assert.equal(rere.localDom.querySelectorAll('span').length, 0);
  });

  test('localDom.insertBefore (fragment)', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var fragment = document.createDocumentFragment();
    var childCount = 5;
    for (var i=0; i < childCount; i++) {
      var s = document.createElement('span');
      s.textContent = i; 
      fragment.appendChild(s);
    }
    var l = document.createElement('span');
    l.textContent = 'last';
    rere.localDom.appendChild(l);
    rere.localDom.insertBefore(fragment, l);
    var added = rere.localDom.querySelectorAll('span');
    assert.equal(added.length, childCount+1);
    assert.equal(added[added.length-1], l);
    for (var i=0; i < added.length; i++) {
      rere.localDom.removeChild(added[i]);
    }
    assert.equal(rere.localDom.querySelectorAll('span').length, 0);
  });

  test('localDom.batch', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var s = document.createElement('span');
    s.id = 'local';
    s.textContent = 'Local';
    rere.localDom.batch();
    rere.localDom.appendChild(s);
    assert.equal(rere.localDom.querySelector('#local'), s);
    if (rere.shadyRoot) {
      assert.notEqual(s.parentNode, rere.root);
    }
    rere.localDom.distribute();
    assert.equal(s.parentNode, rere.root);
    rere.localDom.removeChild(s);
  });

  test('localDom.batch function', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var s = document.createElement('span');
    s.id = 'local';
    s.textContent = 'Local';
    rere.localDom.batch(function() {;
      rere.localDom.appendChild(s);
    });
    assert.equal(rere.localDom.querySelector('#local'), s);
    assert.equal(s.parentNode, rere.root);
    rere.localDom.removeChild(s);
  });

  test('lightDom/localDom.elementParent', function() {
    var test = document.querySelector('x-test');
    var rere = test.localDom.querySelector('x-rereproject');
    var projected = test.localDom.querySelector('#projected');
    assert.equal(test.lightDom.elementParent(), wrap(document.body));
    assert.equal(test.localDom.elementParent(projected), rere);
  });

  test('Polymer.dom.querySelector', function() {
    var test = Polymer.dom.querySelector('x-test');
    var rere = Polymer.dom.querySelector('x-rereproject');
    var projected = Polymer.dom.querySelector('#projected');
    assert.ok(test);
    assert.notOk(rere);
    assert.notOk(projected);
  });

});
