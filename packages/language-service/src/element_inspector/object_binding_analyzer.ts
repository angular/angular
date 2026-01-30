/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  LiteralMap,
  LiteralMapPropertyKey,
  PropertyRead,
  SafePropertyRead,
} from '@angular/compiler';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

/**
 * Result of analyzing an object binding like [style]="obj" or [class]="obj".
 */
export interface ObjectBindingAnalysis {
  /** Known properties that can be statically determined */
  knownProperties: string[];
  /** Whether the object can be fully analyzed at compile time */
  isFullyAnalyzable: boolean;
  /** TypeScript type name if available */
  typeName?: string;
  /** Source of the binding (e.g., 'component property', 'literal', '@let declaration') */
  source?: string;
  /** Any analysis warnings/notes */
  notes: string[];
}

/**
 * Type guard to check if a LiteralMapKey is a property key (has 'key' property).
 */
function isLiteralMapPropertyKey(key: unknown): key is LiteralMapPropertyKey {
  return typeof key === 'object' && key !== null && 'key' in key;
}

/**
 * Analyzes object bindings to extract known properties at compile time.
 *
 * This helps provide better IntelliSense for [style]="obj" and [class]="obj"
 * bindings by showing what properties are known without runtime analysis.
 */
export class ObjectBindingAnalyzer {
  constructor(
    private readonly ttc: TemplateTypeChecker,
    private readonly typeChecker: ts.TypeChecker,
    private readonly component: ts.ClassDeclaration,
  ) {}

  /**
   * Analyze an object binding expression to extract known properties.
   */
  analyze(ast: AST): ObjectBindingAnalysis {
    // Unwrap ASTWithSource
    const node = ast instanceof ASTWithSource ? ast.ast : ast;

    // Handle object literals: [style]="{ width: '100px', height: '50px' }"
    if (node instanceof LiteralMap) {
      return this.analyzeLiteralMap(node);
    }

    // Handle property reads: [style]="myStyles" or [style]="obj.styles"
    if (node instanceof PropertyRead || node instanceof SafePropertyRead) {
      return this.analyzePropertyRead(node);
    }

    // Unknown expression type
    return {
      knownProperties: [],
      isFullyAnalyzable: false,
      notes: ['Expression type cannot be statically analyzed'],
    };
  }

  /**
   * Analyze an object literal expression.
   */
  private analyzeLiteralMap(literal: LiteralMap): ObjectBindingAnalysis {
    const keys: string[] = [];
    let hasSpread = false;

    for (const k of literal.keys) {
      if (isLiteralMapPropertyKey(k)) {
        keys.push(k.key);
      } else {
        // It's a spread key
        hasSpread = true;
      }
    }

    return {
      knownProperties: keys,
      isFullyAnalyzable: !hasSpread,
      source: 'object literal',
      notes: hasSpread ? ['Object contains spread operator - some properties may be dynamic'] : [],
    };
  }

  /**
   * Analyze a property read expression to get its type and properties.
   */
  private analyzePropertyRead(node: PropertyRead | SafePropertyRead): ObjectBindingAnalysis {
    // Get the symbol for this expression
    const symbol = this.ttc.getSymbolOfNode(node, this.component);

    if (!symbol || !('tsType' in symbol)) {
      return {
        knownProperties: [],
        isFullyAnalyzable: false,
        notes: ['Could not resolve type for expression'],
      };
    }

    const tsType = symbol.tsType;

    // Check if it's 'any' type
    if (tsType.flags & ts.TypeFlags.Any) {
      return {
        knownProperties: [],
        isFullyAnalyzable: false,
        typeName: 'any',
        source: 'component property',
        notes: ['Type is "any" - properties cannot be determined'],
      };
    }

    // Get the type name
    const typeName = this.typeChecker.typeToString(tsType);

    // Get properties from the type
    const properties = tsType.getProperties();
    const propertyNames = properties.map((p) => p.name);

    // Determine source description
    let source = 'component property';
    if ('kind' in symbol && symbol.kind.toString().includes('Let')) {
      source = '@let declaration';
    }

    // Check if the type has an index signature (allows arbitrary properties)
    const stringIndexType = tsType.getStringIndexType();
    const numberIndexType = tsType.getNumberIndexType();
    const hasIndexSignature = !!stringIndexType || !!numberIndexType;

    const notes: string[] = [];
    if (hasIndexSignature) {
      notes.push('Type has index signature - additional properties allowed at runtime');
    }

    return {
      knownProperties: propertyNames,
      isFullyAnalyzable: !hasIndexSignature,
      typeName,
      source,
      notes,
    };
  }

  /**
   * Format analysis result as markdown for hover display.
   */
  formatAsMarkdown(analysis: ObjectBindingAnalysis): string {
    const parts: string[] = ['**📊 Static Analysis:**'];

    if (analysis.typeName) {
      parts.push(`├─ **Type:** \`${analysis.typeName}\` (from ${analysis.source ?? 'unknown'})`);
    } else if (analysis.source) {
      parts.push(`├─ **Source:** ${analysis.source}`);
    }

    if (analysis.knownProperties.length > 0) {
      const propList = analysis.knownProperties.slice(0, 10).join(', ');
      const overflow =
        analysis.knownProperties.length > 10
          ? ` (+${analysis.knownProperties.length - 10} more)`
          : '';
      parts.push(
        `├─ **Known properties:** ${propList}${overflow} (${analysis.knownProperties.length})`,
      );
    } else {
      parts.push(`├─ **Known properties:** none`);
    }

    const coverage = analysis.isFullyAnalyzable ? '100% - all properties trackable' : 'partial';
    parts.push(`└─ **Analysis:** ${coverage}`);

    if (analysis.notes.length > 0) {
      parts.push('');
      parts.push(`*Note: ${analysis.notes.join('. ')}*`);
    }

    return parts.join('\n');
  }
}

/**
 * Create an ObjectBindingAnalyzer instance.
 */
export function createObjectBindingAnalyzer(
  ttc: TemplateTypeChecker,
  typeChecker: ts.TypeChecker,
  component: ts.ClassDeclaration,
): ObjectBindingAnalyzer {
  return new ObjectBindingAnalyzer(ttc, typeChecker, component);
}
