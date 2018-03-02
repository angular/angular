/**
 * We want to ensure that external modules are not resolved. Typescript happens
 * to be conveniently available in our environment.
 */
export { CompilerHost } from 'typescript';
