// `@types/postcss` is locked into an older version of `postcss` whose types no longer align with
// the latest ones on npm. This file re-exports the versions that are compatible with Stylelint so
// that we can use them in our custom rules.
// This file can be removed when `@types/postcss` has been updated or when `stylelint` starts to
// publish their type declarations. See https://github.com/stylelint/stylelint/issues/4399.
export {
  AtRule,
  atRule,
  decl,
  Declaration,
  Node,
  Result,
  Root
} from 'stylelint/node_modules/postcss';
