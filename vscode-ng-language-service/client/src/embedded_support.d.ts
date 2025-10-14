import * as vscode from 'vscode';
/**
 * Determines if the position is inside a decorator
 * property that supports language service features.
 */
export declare function isNotTypescriptOrSupportedDecoratorField(document: vscode.TextDocument, position: vscode.Position): boolean;
/**
 * Determines if the position is inside a string literal. Returns `true` if the document language is
 * not TypeScript.
 */
export declare function isInsideStringLiteral(document: vscode.TextDocument, position: vscode.Position): boolean;
