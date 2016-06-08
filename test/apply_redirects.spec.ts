import {DefaultUrlSerializer} from '../src/url_serializer';
import {TreeNode} from '../src/utils/tree';
import {UrlTree, UrlSegment, equalUrlSegments} from '../src/url_tree';
import {Params, PRIMARY_OUTLET} from '../src/shared';
import {applyRedirects} from '../src/apply_redirects';

describe('applyRedirects', () => {
  it("should return the same url tree when no redirects", () => {
    applyRedirects(tree("/a/b"), [
      {path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}
    ]).forEach(t => {
      compareTrees(t, tree('/a/b'));
    });
  });

  it("should add new segments when needed", () => {
    applyRedirects(tree("/a/b"), [
      {path: 'a/b', redirectTo: 'a/b/c'}
    ]).forEach(t => {
      compareTrees(t, tree('/a/b/c'));
    });
  });

  it("should handle positional parameters", () => {
    applyRedirects(tree("/a/1/b/2"), [
      {path: 'a/:aid/b/:bid', redirectTo: 'newa/:aid/newb/:bid'}
    ]).forEach(t => {
      compareTrees(t, tree('/newa/1/newb/2'));
    });
  });

  it("should throw when cannot handle a positional parameter", () => {
    applyRedirects(tree("/a/1"), [
      {path: 'a/:id', redirectTo: 'a/:other'}
    ]).subscribe(() => {}, (e) => {
      expect(e.message).toEqual("Cannot redirect to 'a/:other'. Cannot find ':other'.");
    });
  });

  it("should pass matrix parameters", () => {
    applyRedirects(tree("/a;p1=1/1;p2=2"), [
      {path: 'a/:id', redirectTo: 'd/a/:id/e'}
    ]).forEach(t => {
      compareTrees(t, tree('/d/a;p1=1/1;p2=2/e'));
    });
  });

  it("should handle preserve secondary routes", () => {
    applyRedirects(tree("/a/1(aux:c/d)"), [
      {path: 'a/:id', redirectTo: 'd/a/:id/e'},
      {path: 'c/d', component: ComponentA, outlet: 'aux'}
    ]).forEach(t => {
      compareTrees(t, tree('/d/a/1/e(aux:c/d)'));
    });
  });

  it("should redirect secondary routes", () => {
    applyRedirects(tree("/a/1(aux:c/d)"), [
      {path: 'a/:id', component: ComponentA},
      {path: 'c/d', redirectTo: 'f/c/d/e', outlet: 'aux'}
    ]).forEach(t => {
      compareTrees(t, tree('/a/1(aux:f/c/d/e)'));
    });
  });

  it("should redirect wild cards", () => {
    applyRedirects(tree("/a/1(aux:c/d)"), [
      {path: '**', redirectTo: '/404'},
    ]).forEach(t => {
      compareTrees(t, tree('/404'));
    });
  });

  it("should support global redirects", () => {
    applyRedirects(tree("/a/b/1"), [
      {path: 'a', component: ComponentA, children: [
        {path: 'b/:id', redirectTo: '/global/:id'}
      ]},
    ]).forEach(t => {
      compareTrees(t, tree('/global/1'));
    });
  });
});

function tree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

function compareTrees(actual: UrlTree, expected: UrlTree): void{
  const serializer = new DefaultUrlSerializer();
  const error = `"${serializer.serialize(actual)}" is not equal to "${serializer.serialize(expected)}"`;
  compareNode(actual._root, expected._root, error);
}

function compareNode(actual: TreeNode<UrlSegment>, expected: TreeNode<UrlSegment>, error: string): void{
  expect(equalUrlSegments([actual.value], [expected.value])).toEqual(true, error);

  expect(actual.children.length).toEqual(expected.children.length, error);

  if (actual.children.length === expected.children.length) {
    for (let i = 0; i < actual.children.length; ++i) {
      compareNode(actual.children[i], expected.children[i], error);
    }
  }
}

class ComponentA {}
class ComponentB {}
class ComponentC {}
