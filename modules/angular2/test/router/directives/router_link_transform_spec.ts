import {
  AsyncTestCompleter,
  describe,
  proxy,
  it,
  iit,
  ddescribe,
  expect,
  inject,
  beforeEach,
  beforeEachBindings,
  SpyObject
} from 'angular2/testing_internal';

import {Injector, provide} from 'angular2/core';
import {CONST_EXPR} from 'angular2/src/facade/lang';

import {parseRouterLinkExpression} from 'angular2/src/router/directives/router_link_transform';
import {Unparser} from '../../compiler/expression_parser/unparser';
import {Parser} from 'angular2/src/compiler/expression_parser/parser';

export function main() {
  function check(parser: Parser, input: string, expectedValue: string) {
    let ast = parseRouterLinkExpression(parser, input);
    expect(new Unparser().unparse(ast)).toEqual(expectedValue);
  }

  describe('parseRouterLinkExpression', () => {
    it("should parse simple routes", inject([Parser], (p) => {
         check(p, `User`, `["User"]`);
         check(p, `/User`, `["/User"]`);
         check(p, `./User`, `["./User"]`);
         check(p, `../../User`, `["../../User"]`);
       }));

    it("should trim the string", inject([Parser], (p) => { check(p, `  User  `, `["User"]`); }));

    it("should parse parameters", inject([Parser], (p) => {
         check(p, `./User(id: value, name: 'Bob')`, `["./User", {id: value, name: "Bob"}]`);
       }));

    it("should parse nested routes", inject([Parser], (p) => {
         check(p, `User/Modal`, `["User", "Modal"]`);
         check(p, `/User/Modal`, `["/User", "Modal"]`);
       }));

    it("should parse auxiliary routes", inject([Parser], (p) => {
         check(p, `User[Modal]`, `["User", ["Modal"]]`);
         check(p, `User[Modal1][Modal2]`, `["User", ["Modal1"], ["Modal2"]]`);
         check(p, `User[Modal1[Modal2]]`, `["User", ["Modal1", ["Modal2"]]]`);
       }));

    it("should parse combinations", inject([Parser], (p) => {
         check(p, `./User(id: value)/Post(title: 'blog')`, `["./User", {id: value}, "Post", {title: "blog"}]`);
         check(p, `./User[Modal(param: value)]`, `["./User", ["Modal", {param: value}]]`);
       }));

    it("should error on empty fixed parts", inject([Parser], (p) => {
         expect(() => parseRouterLinkExpression(p, `./(id: value, name: 'Bob')`))
             .toThrowErrorWith("Invalid router link");
       }));

    it("should error on multiple slashes", inject([Parser], (p) => {
         expect(() => parseRouterLinkExpression(p, `//User`))
             .toThrowErrorWith("Invalid router link");
       }));
  });
}