import {DefaultUrlSerializer} from '../src/url_serializer';
import {TreeNode} from '../src/utils/tree';
import {UrlTree, UrlSegment, equalPathsWithParams} from '../src/url_tree';
import {RouterConfig} from '../src/config';
import {applyRedirects} from '../src/apply_redirects';

describe('applyRedirects', () => {
  it("should return the same url tree when no redirects", () => {
    checkRedirect([
      {path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}
    ], "/a/b", (t:UrlTree) => {
      compareTrees(t, tree('/a/b'));
    });
  });

  it("should add new segments when needed", () => {
    checkRedirect([
      {path: 'a/b', redirectTo: 'a/b/c'},
      {path: '**', component: ComponentC}
    ], "/a/b", (t:UrlTree) => {
      compareTrees(t, tree('/a/b/c'));
    });
  });

  it("should handle positional parameters", () => {
    checkRedirect([
      {path: 'a/:aid/b/:bid', redirectTo: 'newa/:aid/newb/:bid'},
      {path: '**', component: ComponentC}
    ], "/a/1/b/2", (t:UrlTree) => {
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
    checkRedirect([
      {path: 'a/:id', redirectTo: 'd/a/:id/e'},
      {path: '**', component: ComponentC}
    ], "/a;p1=1/1;p2=2", (t:UrlTree) => {
      compareTrees(t, tree('/d/a;p1=1/1;p2=2/e'));
    });
  });

  it("should handle preserve secondary routes", () => {
    checkRedirect([
      {path: 'a/:id', redirectTo: 'd/a/:id/e'},
      {path: 'c/d', component: ComponentA, outlet: 'aux'},
      {path: '**', component: ComponentC}
    ], "/a/1(aux:c/d)", (t:UrlTree) => {
      compareTrees(t, tree('/d/a/1/e(aux:c/d)'));
    });
  });

  it("should redirect secondary routes", () => {
    checkRedirect([
      {path: 'a/:id', component: ComponentA},
      {path: 'c/d', redirectTo: 'f/c/d/e', outlet: 'aux'},
      {path: '**', component: ComponentC, outlet: 'aux'}
    ], "/a/1(aux:c/d)", (t:UrlTree) => {
      compareTrees(t, tree('/a/1(aux:f/c/d/e)'));
    });
  });

  it("should use the configuration of the route redirected to", () => {
    checkRedirect([
      {path: 'a', component: ComponentA, children: [
        {path: 'b', component: ComponentB},
      ]},
      {path: 'c', redirectTo: 'a'}
    ], "c/b", (t:UrlTree) => {
      compareTrees(t, tree('a/b'));
    });
  });

  it("should redirect empty path", () => {
    checkRedirect([
      {path: 'a', component: ComponentA, children: [
        {path: 'b', component: ComponentB},
      ]},
      {path: '', redirectTo: 'a'}
    ], "b", (t:UrlTree) => {
      compareTrees(t, tree('a/b'));
    });
  });

  it("should redirect empty path (global redirect)", () => {
    checkRedirect([
      {path: 'a', component: ComponentA, children: [
        {path: 'b', component: ComponentB},
      ]},
      {path: '', redirectTo: '/a/b'}
    ], "", (t:UrlTree) => {
      compareTrees(t, tree('a/b'));
    });
  });

  xit("should support nested redirects", () => {
    checkRedirect([
      {path: 'a', component: ComponentA, children: [
        {path: 'b', component: ComponentB},
        {path: '', redirectTo: 'b'}
      ]},
      {path: '', redirectTo: 'a'}
    ], "", (t:UrlTree) => {
      compareTrees(t, tree('a/b'));
    });
  });

  xit("should support nested redirects (when redirected to an empty path)", () => {
    checkRedirect([
      {path: '', component: ComponentA, children: [
        {path: 'b', component: ComponentB},
        {path: '', redirectTo: 'b'}
      ]},
      {path: 'a', redirectTo: ''}
    ], "a", (t:UrlTree) => {
      compareTrees(t, tree('b'));
    });
  });

  xit("should support redirects with both main and aux", () => {
    checkRedirect([
      {path: 'a', children: [
        {path: 'b', component: ComponentB},
        {path: '', redirectTo: 'b'},

        {path: 'c', component: ComponentC, outlet: 'aux'},
        {path: '', redirectTo: 'c', outlet: 'aux'}
      ]},
      {path: 'a', redirectTo: ''}
    ], "a", (t:UrlTree) => {
      compareTrees(t, tree('a/(b//aux:c)'));
    });
  });

  it("should redirect empty path route only when terminal", () => {
    const config = [
      {path: 'a', component: ComponentA, children: [
        {path: 'b', component: ComponentB},
      ]},
      {path: '', redirectTo: 'a', terminal: true}
    ];

    applyRedirects(tree("b"), config).subscribe((_) => {
      throw "Should not be reached";
    }, e => {
      expect(e.message).toEqual("Cannot match any routes: 'b'");
    });
  });

  it("should redirect wild cards", () => {
    checkRedirect([
      {path: '404', component: ComponentA},
      {path: '**', redirectTo: '/404'},
    ], "/a/1(aux:c/d)", (t:UrlTree) => {
      compareTrees(t, tree('/404'));
    });
  });

  it("should support global redirects", () => {
    checkRedirect([
      {path: 'a', component: ComponentA, children: [
        {path: 'b/:id', redirectTo: '/global/:id'}
      ]},
      {path: '**', component: ComponentC}
    ], "/a/b/1", (t:UrlTree) => {
      compareTrees(t, tree('/global/1'));
    });
  });
});

function checkRedirect(config: RouterConfig, url: string, callback: any): void {
  applyRedirects(tree(url), config).subscribe(callback, e => {
    throw e;
  });
}

function tree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

function compareTrees(actual: UrlTree, expected: UrlTree): void{
  const serializer = new DefaultUrlSerializer();
  const error = `"${serializer.serialize(actual)}" is not equal to "${serializer.serialize(expected)}"`;
  compareSegments(actual.root, expected.root, error);
}

function compareSegments(actual: UrlSegment, expected: UrlSegment, error: string): void{
  expect(actual).toBeDefined(error);
  expect(equalPathsWithParams(actual.pathsWithParams, expected.pathsWithParams)).toEqual(true, error);

  expect(Object.keys(actual.children).length).toEqual(Object.keys(expected.children).length, error);

  Object.keys(expected.children).forEach(key => {
    compareSegments(actual.children[key], expected.children[key], error);
  });
}

class ComponentA {}
class ComponentB {}
class ComponentC {}
