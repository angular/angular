use crate::analyzer::utils::unwrap_forward_ref_evaluated;
use crate::resource_loader::ResourceResolverFs;
use oxc_ast::ast::{
    ArrayExpression, ArrayExpressionElement, BindingPattern, Expression, ImportDeclaration,
    ImportDeclarationSpecifier, Program, Statement,
};
use oxc_ast::AstKind;
use oxc_semantic::{Semantic, SymbolId};
use oxc_span::Span;
use oxc_syntax::module_record::ModuleRecord;
use oxc_syntax::reference::ReferenceId as SemanticReferenceId;
use oxc_syntax::symbol::SymbolFlags;
use std::collections::{HashMap, HashSet};

/// Import info extracted during semantic analysis. Carried (unresolved) on the owning class's
/// [`crate::analyzer::ClassData`] wrapper so Stage-2 resolution can chase each component's
/// `imports: [...]`. Internal to Rust — never serialized.
#[derive(Clone, Debug)]
// TODO: Feature Parity: Track original exported name for alias imports (e.g. import { MyComponent as CustomComponent }) to correctly resolve them during correlation.
pub struct ImportInfo {
    pub local_name: String,
    pub imported_name: Option<String>,
    pub import_source: Option<String>,
    pub is_forward_ref: bool,
    /// The identifier occurrence this entry came from: inside the `imports: [...]` array
    /// itself, or inside the initializer of a local variable the array names (see
    /// [`Self::in_decorator`]). oxc's `ReferenceId` (one per *use site*), not
    /// [`crate::query::ReferenceId`].
    pub reference_id: SemanticReferenceId,
    /// Whether [`Self::reference_id`] is written inside the decorator, rather than in the
    /// initializer of a local variable the decorator names (`const SHARED = [A];` …
    /// `imports: [SHARED]`). The decorator is stripped from the output but the variable is not,
    /// so only an occurrence written in the decorator stops being a reference to its import.
    pub in_decorator: bool,
}

impl ImportInfo {
    pub fn to_declaration_tuple(&self) -> crate::DeclarationTuple {
        crate::DeclarationTuple {
            local_name: self.local_name.clone(),
            imported_name: self.imported_name.clone(),
            import_source: self.import_source.clone(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum ImportKind {
    /// A named import (e.g., `import { Component }` -> `Named("Component")`)
    Named(String),
    /// A default import (e.g., `import Component`)
    Default,
    /// A namespace import (e.g., `import * as core`)
    Namespace,
}

impl ImportKind {
    pub fn export_name(&self) -> Option<&str> {
        match self {
            ImportKind::Named(name) => Some(name),
            ImportKind::Default => Some("default"),
            ImportKind::Namespace => None,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ImportedSymbol {
    /// The module specifier being imported from (e.g., `@angular/core` or `./component`).
    pub source: String,
    /// The kind of import (Named, Default, or Namespace).
    pub kind: ImportKind,
}

/// Extracts import specifiers from a module record.
/// Returns Vec of import paths (e.g., ["@angular/core", "./services/data.service"])
/// Also includes sources from re-exports (export { X } from './y' and export * from './z')
pub fn extract_imports(module_record: &ModuleRecord<'_>) -> Vec<String> {
    module_record
        .requested_modules
        .keys()
        .map(|atom| atom.to_string())
        .collect()
}

/// The module specifiers of the file's dynamic imports, in source order: `import()` calls and
/// literal import types.
///
/// Mirrors what TypeScript's `collectExternalModuleReferences` adds to a file's imports through
/// `forEachDynamicImportOrRequireCall` (type-space imports included, string-literal-like
/// arguments required):
/// - an `import()` call whose specifier is string-literal-like (a string literal, or a template
///   literal without substitutions, taken as written); any other `import(expr)` is resolved at
///   runtime and names no module;
/// - a literal import type (`let x: import('./x').T`, `typeof import('./x')`;
///   `isLiteralImportTypeNode`), whose specifier the grammar requires to be a string literal.
///
/// The module record lists `import()` calls but not import types, so every file's node list is
/// scanned. The pass costs under 1% of parsing the file and building its semantic model.
pub fn extract_dynamic_imports(semantic: &Semantic<'_>) -> Vec<String> {
    semantic
        .nodes()
        .iter()
        .filter_map(|node| match node.kind() {
            AstKind::ImportExpression(import) => {
                crate::analyzer::utils::extract_literal_string(&import.source)
            }
            AstKind::TSImportType(import_type) => Some(import_type.source.value.to_string()),
            _ => None,
        })
        .collect()
}

/// Resolve an `imports`-shaped value (`imports`, `deferredImports` or one of its blocks) to the
/// identifiers its entries are rooted at, in source order.
pub fn resolve_imports_expression<'a>(
    expr: &'a Expression<'a>,
    in_decorator: bool,
    semantic: &Semantic<'a>,
    import_map: &HashMap<String, ImportedSymbol>,
) -> Vec<ImportInfo> {
    let mut collector = ImportsCollector {
        semantic,
        import_map,
        expanding: HashSet::new(),
        entries: Vec::new(),
    };
    collector.collect_expression(
        expr,
        EntryOrigin {
            in_decorator,
            is_forward_ref: false,
        },
    );
    collector.entries
}

/// What an entry inherits from the expressions enclosing it.
#[derive(Clone, Copy)]
struct EntryOrigin {
    /// See [`ImportInfo::in_decorator`].
    in_decorator: bool,
    /// Whether an enclosing expression was a `forwardRef(() => …)`. The wrapper defers the
    /// evaluation of everything under it, array elements included.
    is_forward_ref: bool,
}

struct ImportsCollector<'s, 'a> {
    semantic: &'s Semantic<'a>,
    import_map: &'s HashMap<String, ImportedSymbol>,
    /// Variables whose initializer is being walked, so that a self-referential one
    /// (`const A = [B, ...A]`) terminates.
    expanding: HashSet<SymbolId>,
    entries: Vec<ImportInfo>,
}

impl<'a> ImportsCollector<'_, 'a> {
    fn collect_expression(&mut self, expr: &'a Expression<'a>, origin: EntryOrigin) {
        let unwrapped = unwrap_forward_ref_evaluated(expr, self.semantic);
        let origin = EntryOrigin {
            is_forward_ref: origin.is_forward_ref || unwrapped.is_some(),
            ..origin
        };
        let target = unwrapped.unwrap_or(expr);

        if let Expression::ArrayExpression(array) = target.get_inner_expression() {
            self.collect_array(array, origin);
            return;
        }

        let Expression::Identifier(ident) = root_expression(target) else {
            return;
        };
        let Some(reference_id) = ident.reference_id.get() else {
            return;
        };
        let scoping = self.semantic.scoping();
        let Some(symbol_id) = scoping.get_reference(reference_id).symbol_id() else {
            return;
        };

        if scoping
            .symbol_flags(symbol_id)
            .contains(SymbolFlags::Import)
        {
            let Some(imported) = self.import_map.get(scoping.symbol_name(symbol_id)) else {
                return;
            };
            self.entries.push(ImportInfo {
                local_name: ident.name.to_string(),
                imported_name: imported.kind.export_name().map(str::to_owned),
                import_source: Some(imported.source.clone()),
                is_forward_ref: origin.is_forward_ref,
                reference_id,
                in_decorator: origin.in_decorator,
            });
            return;
        }

        let is_bare_identifier = matches!(target.get_inner_expression(), Expression::Identifier(_));
        if is_bare_identifier && self.expand_local_variable(symbol_id, origin) {
            return;
        }

        self.entries.push(ImportInfo {
            local_name: ident.name.to_string(),
            imported_name: None,
            import_source: None,
            is_forward_ref: origin.is_forward_ref,
            reference_id,
            in_decorator: origin.in_decorator,
        });
    }

    fn collect_array(&mut self, array: &'a ArrayExpression<'a>, origin: EntryOrigin) {
        for element in &array.elements {
            match element {
                ArrayExpressionElement::SpreadElement(spread) => {
                    self.collect_expression(&spread.argument, origin)
                }
                ArrayExpressionElement::Elision(_) => {}
                // Everything that is neither a spread nor a hole is an expression.
                other => self.collect_expression(other.to_expression(), origin),
            }
        }
    }

    /// Walk the initializer of the local variable `symbol_id` in place of a reference to it.
    fn expand_local_variable(&mut self, symbol_id: SymbolId, origin: EntryOrigin) -> bool {
        let AstKind::VariableDeclarator(declarator) =
            self.semantic.symbol_declaration(symbol_id).kind()
        else {
            return false;
        };
        // A pattern binds a part of the initializer, not the whole of it: `const [first] = LIST`
        // must not stand for all of `LIST`.
        let BindingPattern::BindingIdentifier(_) = &declarator.id else {
            return false;
        };
        let Some(init) = &declarator.init else {
            return false;
        };
        if !self.expanding.insert(symbol_id) {
            return false;
        }

        let before = self.entries.len();
        self.collect_expression(
            init,
            EntryOrigin {
                in_decorator: false,
                ..origin
            },
        );
        self.expanding.remove(&symbol_id);

        self.entries.len() > before
            || matches!(init.get_inner_expression(), Expression::ArrayExpression(_))
    }
}

/// The expression an `imports` entry is rooted at: the callee of a call, the object of a member
/// access, and the operand of parentheses and the type-only wrappers, applied repeatedly.
fn root_expression<'r, 'a>(expr: &'r Expression<'a>) -> &'r Expression<'a> {
    let mut expr = expr;
    loop {
        expr = match expr {
            Expression::CallExpression(call) => &call.callee,
            Expression::StaticMemberExpression(member) => &member.object,
            Expression::ParenthesizedExpression(paren) => &paren.expression,
            Expression::TSNonNullExpression(non_null) => &non_null.expression,
            Expression::TSAsExpression(as_expr) => &as_expr.expression,
            _ => return expr,
        };
    }
}

/// One binding introduced by a static `import` declaration.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ImportBindingInfo {
    /// Source span of the individual specifier (`Foo`, `Foo as Bar`, `type Foo`, or `* as ns`).
    pub span: Span,
    /// The identifier this declaration binds in the importing file.
    pub local: String,
    /// The name the module exports this binding under: the named export, the reserved key
    /// `"default"` for a default import, or `None` for a namespace import (`import * as ns`),
    /// which binds the module object itself rather than any one export.
    pub imported: Option<String>,
    /// Whether any reference to `local` survives the edits this compiler makes to the file.
    ///
    /// References from a component's `imports: [...]` array are excluded, because the whole
    /// decorator is stripped from the output — that array is the one place a deferrable symbol
    /// is *expected* to appear, and ngtsc excuses it for the same reason
    /// (`DeferredSymbolTracker.markAsDeferrableCandidate` deletes the identifier it was handed
    /// from the symbol's reference set).
    ///
    /// Unlike ngtsc, references in *type* positions count. ngtsc runs after type checking and
    /// emits JavaScript, so a type reference cannot outlive its import; this compiler emits
    /// TypeScript that is type-checked downstream, so a deferrable declaration that a type
    /// annotation still names must be converted to a type-only import rather than deleted.
    pub eagerly_referenced: bool,
    /// Whether any reference to `local` outside those same excused arrays is in *value*
    /// position — that is, would survive into JavaScript.
    ///
    /// This is the question ngtsc asks: `DeferredSymbolTracker.lookupIdentifiersInSourceFile`
    /// walks the file for identifier references but skips type nodes, since its output is
    /// JavaScript and a type reference is erased on the way there. The one carve-out it makes,
    /// a class `extends` clause, falls out of `oxc`'s flags for free: the superclass is a plain
    /// value read, while `implements` and annotations are type references.
    ///
    /// Consumers deciding whether a symbol can be deferred (and whether ngtsc would report
    /// `NG8014`) want this; [`Self::eagerly_referenced`] tells the emitter whether a deferrable
    /// declaration can be removed outright or must have its non-type specifiers converted to
    /// `type` specifiers so type annotations stay valid.
    /// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/imports/src/deferred_symbol_tracker.ts
    pub value_referenced: bool,
    /// `import type { X }` / `import { type X }`: the binding exists only in type position, so a
    /// re-export of it cannot back a value reference.
    pub is_type: bool,
}

/// A static `import` declaration, with what a consumer needs to decide whether the declaration
/// may be dropped in favour of dynamic `import()`s inside `@defer` blocks, plus the exact byte
/// range to delete when it may.
///
/// Deferral is all-or-nothing per *declaration*, matching ngtsc's `DeferredSymbolTracker`: a
/// declaration is deferrable only when every value binding it introduces is deferrable, since the
/// declaration is a single statement and keeping any runtime part of it keeps the module in the
/// eager graph anyway.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ImportDeclarationInfo {
    /// The declaration's own span, for anchoring a diagnostic on the statement.
    pub span: Span,
    /// [`Self::span`] extended over trailing horizontal whitespace and a single line
    /// terminator, so that deleting it leaves no blank line behind. Only the removal wants the
    /// extension: underlining it would drag the squiggle onto the next line.
    pub removal_span: Span,
    /// The module specifier, verbatim (unresolved).
    pub specifier: String,
    /// Every binding the declaration introduces, including type-only ones. A bare
    /// `import './side-effect'` introduces none.
    pub bindings: Vec<ImportBindingInfo>,
}

/// Build the file's static import table.
///
/// `dependency_refs` are the identifier occurrences every `@Component.imports` array in the file
/// resolved to; they do not count towards [`ImportBindingInfo::eagerly_referenced`]. They are
/// passed in rather than rediscovered because the class visitor already resolved them
/// ([`ImportInfo::reference_id`]).
pub fn collect_import_declarations(
    program: &Program<'_>,
    semantic: &Semantic<'_>,
    source_text: &str,
    dependency_refs: &HashSet<SemanticReferenceId>,
) -> Vec<ImportDeclarationInfo> {
    program
        .body
        .iter()
        .filter_map(|stmt| match stmt {
            Statement::ImportDeclaration(decl) => Some(decl),
            _ => None,
        })
        .map(|decl| ImportDeclarationInfo {
            span: decl.span,
            removal_span: Span::new(
                decl.span.start,
                extend_past_line_end(source_text, decl.span.end),
            ),
            specifier: decl.source.value.to_string(),
            bindings: collect_import_bindings(decl, semantic, dependency_refs),
        })
        .collect()
}

fn collect_import_bindings(
    decl: &ImportDeclaration<'_>,
    semantic: &Semantic<'_>,
    dependency_refs: &HashSet<SemanticReferenceId>,
) -> Vec<ImportBindingInfo> {
    let Some(specifiers) = &decl.specifiers else {
        return Vec::new();
    };

    specifiers
        .iter()
        .map(|specifier| {
            let (span, local, imported, is_type) = match specifier {
                ImportDeclarationSpecifier::ImportSpecifier(named) => (
                    named.span,
                    &named.local,
                    Some(named.imported.name().as_str().to_string()),
                    named.import_kind.is_type(),
                ),
                ImportDeclarationSpecifier::ImportDefaultSpecifier(default) => (
                    default.span,
                    &default.local,
                    Some("default".to_string()),
                    false,
                ),
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(namespace) => {
                    (namespace.span, &namespace.local, None, false)
                }
            };
            let references = reference_use(local.name.as_str(), semantic, dependency_refs);
            ImportBindingInfo {
                span,
                local: local.name.to_string(),
                imported,
                eagerly_referenced: references.any,
                value_referenced: references.value,
                is_type: decl.import_kind.is_type() || is_type,
            }
        })
        .collect()
}

/// How a binding is referenced outside the excused `@Component.imports` entries.
struct ReferenceUse {
    /// Any reference at all, including ones erased with the types they appear in.
    any: bool,
    /// A reference that survives into JavaScript. A `typeof` query reads a value symbol but
    /// lives inside a type, so it is excluded here for the same reason ngtsc excludes it.
    value: bool,
}

/// Classify `name`'s module-scope references. The binding site itself is not a reference, so an
/// import used nowhere reports both fields as `false`.
fn reference_use(
    name: &str,
    semantic: &Semantic<'_>,
    dependency_refs: &HashSet<SemanticReferenceId>,
) -> ReferenceUse {
    let scoping = semantic.scoping();
    let Some(symbol_id) = scoping.get_binding(scoping.root_scope_id(), name.into()) else {
        return ReferenceUse {
            any: false,
            value: false,
        };
    };

    let mut use_ = ReferenceUse {
        any: false,
        value: false,
    };
    for reference_id in scoping.get_resolved_reference_ids(symbol_id) {
        if dependency_refs.contains(reference_id) {
            continue;
        }
        let flags = scoping.get_reference(*reference_id).flags();
        use_.any = true;
        use_.value |= flags.is_value() && !flags.is_value_as_type();
    }
    use_
}

/// Extend `end` past trailing horizontal whitespace and a single line terminator, so that
/// deleting the returned range does not leave the declaration's line behind as a blank one.
/// A trailing comment or any other code on the line stops the extension.
fn extend_past_line_end(source_text: &str, end: u32) -> u32 {
    let bytes = source_text.as_bytes();
    let mut index = end as usize;
    while matches!(bytes.get(index), Some(b' ' | b'\t' | b'\r')) {
        index += 1;
    }
    match bytes.get(index) {
        Some(b'\n') => index as u32 + 1,
        _ => end,
    }
}

/// Info about a single named re-export
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReexportInfo {
    pub exported_name: String, // Name as exported
    pub local_name: String,    // Original name (may differ for aliases)
    pub source: String,        // Source specifier
    /// True when `exported_name` is *also* bound in this file, so code here can name the
    /// symbol directly. A bare `export { X } from './x'` forwards the symbol without
    /// introducing a binding, but the spec folds `import { X } from './x'; export { X };`
    /// into the same indirect export entry — and there `X` is bound.
    pub binds_locally: bool,
    /// `export type { X } from './x'` / `export { type X } from './x'`: the name exists, but
    /// only in type position, so it cannot back a value reference.
    pub is_type: bool,
}

/// Info about a local export alias (export { X as Y }) without a from specifier
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LocalExportAlias {
    pub exported_name: String, // Name as exported
    pub local_name: String,    // Local name in this file
    /// See [`ReexportInfo::is_type`].
    pub is_type: bool,
}

/// Info about a star re-export (`export * from './x'`)
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WildcardExport {
    pub source: String,
    /// `export type * from './x'`: forwards types only. See [`ReexportInfo::is_type`].
    pub is_type: bool,
}

#[derive(Clone, Default, Debug, PartialEq, Eq)]
pub struct FileExportInfo {
    pub named: Vec<ReexportInfo>,
    pub wildcards: Vec<WildcardExport>,
    pub local_aliases: Vec<LocalExportAlias>,
}

/// Byte position the preprocessor splices its generated (and hoisted) imports into: the end of
/// the file's *leading* run of `import` declarations.
///
/// The scan stops at the first top-level statement that is not an `ImportDeclaration`, so nothing
/// is ever spliced below one. Imports written *after* such a statement are hoisted up to this
/// point by the emitter instead.
///
/// Falls back to [`find_leading_comments_end`] when no import leads the file, which keeps
/// file-level directives (`@fileoverview`, `/// <reference … />`, `// @ts-nocheck`) above the
/// insertion point — together with the empty line that separates them from the file body — while
/// leaving a doc comment attached to the declaration it documents.
pub fn find_imports_end(program: &Program<'_>, source_text: &str) -> u32 {
    let mut imports_end: u32 = 0;

    for stmt in &program.body {
        let Statement::ImportDeclaration(decl) = stmt else {
            break;
        };
        imports_end = decl.span.end;
    }

    if imports_end > 0 {
        let line_end = source_text[imports_end as usize..]
            .find('\n')
            .map(|idx| imports_end as usize + idx)
            .unwrap_or(source_text.len());
        let trailing = &source_text[imports_end as usize..line_end];
        let trimmed = trailing.trim();
        if trimmed.is_empty() || trimmed.starts_with("//") {
            return line_end as u32;
        }
        return imports_end;
    }

    find_leading_comments_end(source_text)
}

fn is_fileoverview_comment(comment_text: &str) -> bool {
    // Matches @fileoverview (case-insensitive) to mirror @angular/compiler-cli
    // CLOSURE_FILE_OVERVIEW_REGEXP in transform.ts
    comment_text.to_ascii_lowercase().contains("@fileoverview")
}

/// Whether a leading comment documents the *file* rather than the declaration that follows it,
/// and so must stay above everything this compiler splices in (or hoists up to) the insertion
/// point.
///
/// Three shapes qualify, and all three are positional: they lose their meaning the moment a
/// statement — such as a hoisted `import` — is placed above them.
///
/// * `@fileoverview`, Closure's file-level annotation, which ngtsc recognises with the same
///   case-insensitive substring test (`CLOSURE_FILE_OVERVIEW_REGEXP` in `transform.ts`).
/// * A triple-slash directive (`/// <reference … />`, `/// <amd-module … />`). TypeScript only
///   honours these while they precede every statement in the file.
/// * A `// @ts-nocheck` / `// @ts-check` compiler pragma, which is file-scoped only at the top of
///   the file. The other `@ts-` directives are deliberately excluded — see below.
fn is_file_header_comment(comment_text: &str) -> bool {
    if is_fileoverview_comment(comment_text) {
        return true;
    }
    let Some(line) = comment_text.trim_start().strip_prefix("//") else {
        return false;
    };
    // A triple-slash directive is always an XML-ish tag; a `///`-prefixed prose comment is not
    // one, and must keep behaving like the doc comment it is.
    if let Some(directive) = line.strip_prefix('/') {
        return directive.trim_start().starts_with('<');
    }
    // Only these two are file-scoped, and TypeScript accepts them only as the whole comment
    // (`checkJsDirectiveRegEx`). `@ts-ignore` and `@ts-expect-error` apply to the *next line*, so
    // they must stay attached to the statement they suppress.
    matches!(line.trim(), "@ts-nocheck" | "@ts-check")
}

fn find_leading_comments_end(source_text: &str) -> u32 {
    let bytes = source_text.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut last_comment_end = 0;
    let mut attached_to_following = false;

    while i < len {
        // Skip whitespace
        while i < len
            && (bytes[i] == b' ' || bytes[i] == b'\t' || bytes[i] == b'\r' || bytes[i] == b'\n')
        {
            i += 1;
        }

        if i >= len {
            break;
        }

        let comment_start = i;
        if i + 1 < len && bytes[i] == b'/' && bytes[i + 1] == b'/' {
            // Single-line comment: skip to newline
            i += 2;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            if i < len {
                i += 1; // skip \n
            }
        } else if i + 1 < len && bytes[i] == b'/' && bytes[i + 1] == b'*' {
            // Multi-line comment: skip to */
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 >= len {
                // Unterminated: the source is malformed (oxc reports this as a recoverable parse
                // error, so analysis still reaches here). There is no comment boundary below to
                // splice at — and `i` is not even guaranteed to sit on a UTF-8 char boundary, so
                // slicing the comment text would panic. Leave the insertion point where it is.
                break;
            }
            i += 2; // skip */
            if i < len && bytes[i] == b'\r' {
                i += 1;
            }
            if i < len && bytes[i] == b'\n' {
                i += 1;
            }
        } else {
            // Reached non-whitespace, non-comment code
            break;
        }

        let comment_text = &source_text[comment_start..i];
        let comment_end = i;

        // A file-level header comment is unconditionally kept above the insertion point,
        // however it is spaced relative to what follows it.
        if is_file_header_comment(comment_text) {
            last_comment_end = comment_end;
            attached_to_following = false;
            continue;
        }

        if attached_to_following {
            continue;
        }

        // Count newlines in the whitespace following this comment before the next token.
        let mut peek = i;
        let mut newline_count = 0;
        while peek < len
            && (bytes[peek] == b' '
                || bytes[peek] == b'\t'
                || bytes[peek] == b'\r'
                || bytes[peek] == b'\n')
        {
            if bytes[peek] == b'\n' {
                newline_count += 1;
            }
            peek += 1;
        }

        // If separated from the next statement/comment by a blank line (>= 1 newline
        // after the comment's own trailing newline), treat it as a detached file banner.
        if newline_count >= 1 {
            last_comment_end = comment_end;
        } else {
            // Attached directly to the subsequent statement/node without an empty line.
            attached_to_following = true;
        }
    }

    if last_comment_end == 0 {
        return 0;
    }
    extend_past_blank_line(source_text, last_comment_end as u32)
}

/// Extend `offset` past the blank line that follows it, if there is one.
///
/// The comment scan stops immediately after a comment's own line terminator. Splicing there would
/// consume the empty line separating a file-level comment from the file body, and Closure rejects
/// that: "file comments must be at the top of the file, separated from the file body by an empty
/// line" — the banner would end up glued to the generated imports. Stepping over the blank line
/// puts the imports below it instead, so the banner keeps its separation and the imports still sit
/// directly above the first statement.
///
/// Only the leading-comment fallback wants this. When the insertion point is the end of a leading
/// `import` run, a blank line below it separates the imports from the body and must stay there.
fn extend_past_blank_line(source_text: &str, offset: u32) -> u32 {
    let bytes = source_text.as_bytes();
    let mut index = offset as usize;
    while matches!(bytes.get(index), Some(b' ' | b'\t' | b'\r')) {
        index += 1;
    }
    match bytes.get(index) {
        Some(b'\n') => index as u32 + 1,
        _ => offset,
    }
}

/// Extracts a map of local import names to their imported symbol info.
///
/// Examples:
/// * `import { booleanAttribute } from '@angular/core'`
///   -> `{"booleanAttribute": ImportedSymbol { source: "@angular/core", kind: ImportKind::Named("booleanAttribute") }}`
///
/// * `import { booleanAttribute as aliased } from '@angular/core'`
///   -> `{"aliased": ImportedSymbol { source: "@angular/core", kind: ImportKind::Named("booleanAttribute") }}`
///
/// * `import DefaultComponent from './component'`
///   -> `{"DefaultComponent": ImportedSymbol { source: "./component", kind: ImportKind::Default }}`
///
/// * `import * as core from '@angular/core'`
///   -> `{"core": ImportedSymbol { source: "@angular/core", kind: ImportKind::Namespace }}`
pub fn extract_import_map(module_record: &ModuleRecord<'_>) -> HashMap<String, ImportedSymbol> {
    let mut map = HashMap::new();
    for entry in &module_record.import_entries {
        let kind = match &entry.import_name {
            oxc_syntax::module_record::ImportImportName::Name(ns) => {
                ImportKind::Named(ns.name.to_string())
            }
            oxc_syntax::module_record::ImportImportName::Default(_) => ImportKind::Default,
            oxc_syntax::module_record::ImportImportName::NamespaceObject => ImportKind::Namespace,
        };
        map.insert(
            entry.local_name.name.to_string(),
            ImportedSymbol {
                source: entry.module_request.name.to_string(),
                kind,
            },
        );
    }
    map
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AngularImportSymbol {
    // Initializer APIs (Functions)
    InputFn,
    ModelFn,
    OutputFn,
    OutputFromObservableFn,
    ViewChildFn,
    ViewChildrenFn,
    ContentChildFn,
    ContentChildrenFn,

    // Decorators
    InputDecorator,
    OutputDecorator,
    ViewChildDecorator,
    ViewChildrenDecorator,
    ContentChildDecorator,
    ContentChildrenDecorator,
    ComponentDecorator,
    DirectiveDecorator,
    NgModuleDecorator,
    InjectableDecorator,
    PipeDecorator,
    ServiceDecorator,
    HostBindingDecorator,
    HostListenerDecorator,
    InjectDecorator,
    OptionalDecorator,
    SelfDecorator,
    SkipSelfDecorator,
    HostDecorator,
    AttributeDecorator,

    // Namespaces
    CoreNamespace,
    RxjsInteropNamespace,
}

/// What kind of `@angular/core` API an [`AngularImportSymbol`] stands for.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AngularApiKind {
    /// A decorator, e.g. `@Component`.
    Decorator,
    /// An initializer function, e.g. `input()`.
    InitializerFn,
}

/// Every `@angular/core` export this analyzer models, and the symbol it maps to.
///
/// This is the single source of truth for the export-name ↔ symbol relation: it backs both
/// directions of the mapping and both the named-import and `import * as core` namespace paths.
/// The namespace bindings themselves are deliberately absent — they stand for the module rather
/// than for any one export.
///
/// `@angular/core/rxjs-interop` exports are not listed here; they are keyed off a different module
/// specifier and are handled separately.
const CORE_EXPORTS: &[(&str, AngularImportSymbol, AngularApiKind)] = {
    use AngularApiKind::{Decorator, InitializerFn};
    use AngularImportSymbol::*;
    &[
        ("input", InputFn, InitializerFn),
        ("model", ModelFn, InitializerFn),
        ("output", OutputFn, InitializerFn),
        ("viewChild", ViewChildFn, InitializerFn),
        ("viewChildren", ViewChildrenFn, InitializerFn),
        ("contentChild", ContentChildFn, InitializerFn),
        ("contentChildren", ContentChildrenFn, InitializerFn),
        ("Input", InputDecorator, Decorator),
        ("Output", OutputDecorator, Decorator),
        ("ViewChild", ViewChildDecorator, Decorator),
        ("ViewChildren", ViewChildrenDecorator, Decorator),
        ("ContentChild", ContentChildDecorator, Decorator),
        ("ContentChildren", ContentChildrenDecorator, Decorator),
        ("Component", ComponentDecorator, Decorator),
        ("Directive", DirectiveDecorator, Decorator),
        ("NgModule", NgModuleDecorator, Decorator),
        ("Injectable", InjectableDecorator, Decorator),
        ("Pipe", PipeDecorator, Decorator),
        ("Service", ServiceDecorator, Decorator),
        ("HostBinding", HostBindingDecorator, Decorator),
        ("HostListener", HostListenerDecorator, Decorator),
        ("Inject", InjectDecorator, Decorator),
        ("Optional", OptionalDecorator, Decorator),
        ("Self", SelfDecorator, Decorator),
        ("SkipSelf", SkipSelfDecorator, Decorator),
        ("Host", HostDecorator, Decorator),
        ("Attribute", AttributeDecorator, Decorator),
    ]
};

impl AngularImportSymbol {
    /// The symbol `@angular/core` exports under `name`, or `None` if this analyzer does not model
    /// it. `name` is the *exported* name, so an aliased `import {Component as Cmp}` and a
    /// namespaced `core.Component` both look this up as `"Component"`.
    pub fn from_core_export(name: &str) -> Option<Self> {
        CORE_EXPORTS
            .iter()
            .find(|(export, _, _)| *export == name)
            .map(|(_, symbol, _)| *symbol)
    }

    /// The name this symbol is exported under, if it is a decorator; `None` for everything else.
    pub fn decorator_name(self) -> Option<&'static str> {
        CORE_EXPORTS
            .iter()
            .find(|(_, symbol, kind)| *symbol == self && *kind == AngularApiKind::Decorator)
            .map(|(export, _, _)| *export)
    }

    /// Whether this symbol is an initializer function such as `input()` rather than a decorator.
    pub fn is_initializer_fn(self) -> bool {
        CORE_EXPORTS
            .iter()
            .any(|(_, symbol, kind)| *symbol == self && *kind == AngularApiKind::InitializerFn)
    }
}

#[derive(Clone, Default, Debug)]
pub struct AngularImports {
    /// Bindings this analyzer recognises as a specific Angular API.
    pub symbols: HashMap<SymbolId, AngularImportSymbol>,
    /// Every local binding introduced by an `import ... from '@angular/core'`, including ones
    /// with no [`AngularImportSymbol`] of their own, and including the namespace binding of an
    /// `import * as core from '@angular/core'`.
    ///
    /// This backs the name-agnostic "did this come from `@angular/core`?" question, which ngtsc
    /// answers with `decorator.import.from === '@angular/core'` (`isAngularCore`) rather than by
    /// comparing against a list of known names.
    /// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L107-L109
    pub core_bindings: HashSet<SymbolId>,
    /// Whether the file being analyzed is part of the `@angular/core` package itself. Mirrors
    /// ngtsc's `isCore`, under which a decorator matches on its local name alone because core
    /// imports its own decorators through relative paths.
    pub is_core: bool,
}

pub fn extract_angular_imports(
    module_record: &ModuleRecord<'_>,
    semantic: &Semantic<'_>,
    is_core: bool,
) -> AngularImports {
    let mut imports = HashMap::new();
    let mut core_bindings = HashSet::new();
    let scoping = semantic.scoping();
    let root_scope = scoping.root_scope_id();

    for entry in &module_record.import_entries {
        let local_name = entry.local_name.name.as_str();
        let Some(symbol_id) = scoping.get_binding(root_scope, local_name.into()) else {
            continue;
        };

        let source = entry.module_request.name.as_str();
        if source == "@angular/core" || is_core {
            core_bindings.insert(symbol_id);
            match &entry.import_name {
                oxc_syntax::module_record::ImportImportName::Name(ns) => {
                    if let Some(symbol) = AngularImportSymbol::from_core_export(ns.name.as_str()) {
                        imports.insert(symbol_id, symbol);
                    }
                }
                // Don't resolve package imports as Angular unless they're from '@angular/core'
                oxc_syntax::module_record::ImportImportName::NamespaceObject
                    if source == "@angular/core" || source.starts_with('.') =>
                {
                    imports.insert(symbol_id, AngularImportSymbol::CoreNamespace);
                }
                _ => {}
            }
        }
        if (source == "@angular/core/rxjs-interop" || is_core) && !imports.contains_key(&symbol_id)
        {
            match &entry.import_name {
                oxc_syntax::module_record::ImportImportName::Name(ns)
                    if ns.name.as_str() == "outputFromObservable" =>
                {
                    imports.insert(symbol_id, AngularImportSymbol::OutputFromObservableFn);
                }
                oxc_syntax::module_record::ImportImportName::NamespaceObject
                    if source == "@angular/core/rxjs-interop" || source.starts_with('.') =>
                {
                    imports.insert(symbol_id, AngularImportSymbol::RxjsInteropNamespace);
                }
                _ => {}
            }
        }
    }
    AngularImports {
        symbols: imports,
        core_bindings,
        is_core,
    }
}

#[derive(serde::Deserialize)]
struct PackageManifest<'a> {
    #[serde(borrow)]
    name: Option<&'a str>,
}

fn parse_package_is_core(contents: &str) -> bool {
    serde_json::from_str::<PackageManifest>(contents)
        .ok()
        .and_then(|m| m.name)
        .map(|name| name == "@angular/core")
        .unwrap_or(false)
}

/// Detect whether the file being analyzed belongs to `@angular/core` (`isCore` compilation mode).
///
/// Unlike ngtsc which searches an in-memory whole-program `ts.Program` for `r3_symbols.ts`'s
/// `ITS_JUST_ANGULAR` constant (`isAngularCorePackage`), this analyzer operates in a stateless,
/// per-file/delta model. Walking up to the nearest `package.json` manifest (`name === "@angular/core"`)
/// provides an accurate, stateless equivalent that is immune to `rootDirs`/path aliasing. Findings
/// and intermediate directories are memoized on [`ResourceResolverFs`].
/// https://github.com/angular/angular/blob/c1829f6d7cc37aec73217a53da1e8314690c8c79/packages/compiler-cli/src/ngtsc/core/src/compiler.ts#L1724-L1758
pub fn detect_is_core<Fs: ResourceResolverFs>(path: &std::path::Path, fs: &Fs) -> bool {
    let Some(start_dir) = path.parent() else {
        return false;
    };

    if let Some(&cached) = fs.is_core_cache().read().unwrap().get(start_dir) {
        return cached;
    }

    let mut visited = Vec::new();
    let mut current = Some(start_dir);
    let mut result = false;

    while let Some(dir) = current {
        visited.push(dir);
        let manifest = dir.join("package.json");
        let Ok(contents) = fs.read_to_string(&manifest) else {
            current = dir.parent();
            if let Some(parent_dir) = current {
                if let Some(&cached) = fs.is_core_cache().read().unwrap().get(parent_dir) {
                    result = cached;
                    break;
                }
            }
            continue;
        };
        result = parse_package_is_core(&contents);
        break;
    }

    let mut cache = fs.is_core_cache().write().unwrap();
    for dir in visited {
        cache.insert(dir.to_path_buf(), result);
    }
    result
}

/// The uncached directory walk backing [`detect_is_core`]. Split out so the cache lookup in
/// `detect_is_core` stays trivial and this remains directly unit-testable.
#[cfg(test)]
fn detect_is_core_uncached<Fs: oxc_resolver::FileSystem>(path: &std::path::Path, fs: &Fs) -> bool {
    let mut dir = path.parent();
    while let Some(current) = dir {
        let manifest = current.join("package.json");
        let Ok(contents) = fs.read_to_string(&manifest) else {
            dir = current.parent();
            continue;
        };
        return parse_package_is_core(&contents);
    }
    false
}

pub fn resolved_value_to_super_class(
    value: &crate::evaluator::ResolvedValue,
) -> Option<crate::DeclarationTuple> {
    use crate::evaluator::{IncompleteDep, ResolvedValue};

    match value.unwrap_named() {
        ResolvedValue::Reference(ref_val) => {
            let owning = ref_val.owning_reference.as_ref();
            Some(crate::DeclarationTuple {
                local_name: ref_val.name.clone(),
                imported_name: owning.map(|owning| owning.export_name().to_string()),
                import_source: owning.map(|owning| owning.specifier().to_string()),
            })
        }
        ResolvedValue::Incomplete(incomplete) => {
            let IncompleteDep::Reference(unresolved) = &incomplete.dep else {
                return None;
            };
            // Namespace members (`ns.Foo`) have no local binding; fall back to the export name as the lookup key.
            let local_name =
                unresolved
                    .local_name
                    .clone()
                    .or_else(|| match &unresolved.symbol {
                        crate::analyzer::ImportKind::Named(name) => Some(name.clone()),
                        _ => None,
                    })?;
            // `import {Foo as Bar}`: `local_name` is `Bar`, but `specifier` exports `Foo`.
            Some(crate::DeclarationTuple {
                local_name,
                imported_name: unresolved.symbol.export_name().map(str::to_owned),
                import_source: Some(unresolved.specifier.clone()),
            })
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_ast::ast::Statement;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    /// Resolve the initializer of `const imports = ...` as though it were written in a decorator.
    fn parse_and_resolve(source_text: &str) -> Vec<ImportInfo> {
        let allocator = Allocator::default();
        let source_type = SourceType::ts();
        let ret = Parser::new(&allocator, source_text, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;

        let imports_expr = ret
            .program
            .body
            .iter()
            .filter_map(|stmt| match stmt {
                Statement::VariableDeclaration(decl) => Some(decl),
                _ => None,
            })
            .flat_map(|decl| decl.declarations.iter())
            .find(|declarator| {
                declarator
                    .id
                    .get_binding_identifier()
                    .is_some_and(|id| id.name == "imports")
            })
            .and_then(|declarator| declarator.init.as_ref())
            .expect("Failed to find `const imports = ...` in test");
        let import_map = extract_import_map(&ret.module_record);
        resolve_imports_expression(imports_expr, true, &semantic, &import_map)
    }

    /// `(local_name, import_source, in_decorator)` per entry.
    fn summarize(imports: &[ImportInfo]) -> Vec<(&str, Option<&str>, bool)> {
        imports
            .iter()
            .map(|i| {
                (
                    i.local_name.as_str(),
                    i.import_source.as_deref(),
                    i.in_decorator,
                )
            })
            .collect()
    }

    #[test]
    fn test_resolve_imports_array_forward_ref_arrow() {
        let source = r#"
            import { forwardRef } from '@angular/core';
            class MyComponent {}
            const imports = [forwardRef(() => MyComponent)];
        "#;
        let imports = parse_and_resolve(source);
        assert_eq!(imports.len(), 1);
        assert_eq!(imports[0].local_name, "MyComponent");
        assert_eq!(imports[0].import_source, None);
        assert!(imports[0].is_forward_ref);
    }

    #[test]
    fn test_resolve_imports_array_forward_ref_function() {
        let source = r#"
            import { forwardRef } from '@angular/core';
            class MyComponent {}
            const imports = [forwardRef(function() { return MyComponent; })];
        "#;
        let imports = parse_and_resolve(source);
        assert_eq!(imports.len(), 1);
        assert_eq!(imports[0].local_name, "MyComponent");
        assert_eq!(imports[0].import_source, None);
        assert!(imports[0].is_forward_ref);
    }

    #[test]
    fn test_resolve_imports_array_regular_and_forward_ref() {
        let source = r#"
            import { forwardRef } from '@angular/core';
            class RegularComponent {}
            class ForwardComponent {}
            const imports = [RegularComponent, forwardRef(() => ForwardComponent)];
        "#;
        let imports = parse_and_resolve(source);
        assert_eq!(imports.len(), 2);
        assert_eq!(imports[0].local_name, "RegularComponent");
        assert!(!imports[0].is_forward_ref);
        assert_eq!(imports[1].local_name, "ForwardComponent");
        assert!(imports[1].is_forward_ref);
    }

    #[test]
    fn test_resolve_imports_array_forward_ref_static_member() {
        let source = r#"
            import * as core from '@angular/core';
            class MyComponent {}
            const imports = [core.forwardRef(() => MyComponent)];
        "#;
        let imports = parse_and_resolve(source);
        assert_eq!(imports.len(), 1);
        assert_eq!(imports[0].local_name, "MyComponent");
        assert_eq!(imports[0].import_source, None);
        assert!(imports[0].is_forward_ref);
    }

    #[test]
    fn test_resolve_imports_array_call_expression_unwrap() {
        let source = r#"
            import { RouterModule } from '@angular/router';
            const imports = [RouterModule.forRoot()];
        "#;
        let imports = parse_and_resolve(source);
        assert_eq!(imports.len(), 1);
        assert_eq!(imports[0].local_name, "RouterModule");
        assert_eq!(
            imports[0].import_source,
            Some("@angular/router".to_string())
        );
        assert!(!imports[0].is_forward_ref);
    }

    #[test]
    fn test_resolve_imports_unwraps_local_array_variable() {
        let source = r#"
            import { CommonModule } from '@angular/common';
            import { FlexLayoutModule } from '@angular/flex-layout';
            class LocalCmp {}
            const NG_COMPONENT_IMPORTS = [CommonModule, FlexLayoutModule, LocalCmp];
            const imports = [NG_COMPONENT_IMPORTS];
        "#;
        assert_eq!(
            summarize(&parse_and_resolve(source)),
            vec![
                ("CommonModule", Some("@angular/common"), false),
                ("FlexLayoutModule", Some("@angular/flex-layout"), false),
                ("LocalCmp", None, false),
            ]
        );
    }

    #[test]
    fn test_resolve_imports_flattens_spreads_nested_arrays_and_chains() {
        let source = r#"
            import { A } from './a';
            import { B } from './b';
            import { C } from './c';
            import { D } from './d';
            const INNER = [B];
            const ALIAS = INNER;
            const imports = [A, ...ALIAS, [C, ...[D]]];
        "#;
        assert_eq!(
            summarize(&parse_and_resolve(source)),
            vec![
                ("A", Some("./a"), true),
                ("B", Some("./b"), false),
                ("C", Some("./c"), true),
                ("D", Some("./d"), true),
            ]
        );
    }

    #[test]
    fn test_resolve_imports_spread_of_imported_array_is_kept() {
        let source = r#"
            import { SHARED } from './shared';
            class LocalCmp {}
            const imports = [...SHARED, LocalCmp];
        "#;
        assert_eq!(
            summarize(&parse_and_resolve(source)),
            vec![("SHARED", Some("./shared"), true), ("LocalCmp", None, true)]
        );
    }

    #[test]
    fn test_resolve_imports_forward_ref_to_local_array() {
        let source = r#"
            import { forwardRef } from '@angular/core';
            import { A } from './a';
            const imports = [forwardRef(() => LATER)];
            const LATER = [A];
        "#;
        let imports = parse_and_resolve(source);
        assert_eq!(summarize(&imports), vec![("A", Some("./a"), false)]);
        assert!(imports[0].is_forward_ref);
    }

    #[test]
    fn test_resolve_imports_opaque_local_variable_keeps_its_name() {
        let source = r#"
            declare function makeImports(): unknown[];
            const OPAQUE = class {};
            const NONE = [];
            const CALLED = makeImports();
            const imports = [OPAQUE, NONE, CALLED];
        "#;
        assert_eq!(
            summarize(&parse_and_resolve(source)),
            vec![("OPAQUE", None, true), ("makeImports", None, false)]
        );
    }

    #[test]
    fn test_resolve_imports_self_referential_variable_terminates() {
        let source = r#"
            import { A } from './a';
            const LOOP = [A, ...LOOP];
            const imports = [LOOP];
        "#;
        assert_eq!(
            summarize(&parse_and_resolve(source)),
            vec![("A", Some("./a"), false), ("LOOP", None, false)]
        );
    }

    #[test]
    fn test_resolve_imports_non_array_value_follows_local_variable() {
        // `imports: SHARED` (no surrounding array) resolves the same way as `[SHARED]`.
        let source = r#"
            import { A } from './a';
            const SHARED = [A];
            const imports = SHARED;
        "#;
        assert_eq!(
            summarize(&parse_and_resolve(source)),
            vec![("A", Some("./a"), false)]
        );
    }

    /// Collect the import table without excusing anything, so the assertions are about the
    /// declaration shapes and raw reference counting. The `@Component.imports` exclusion is
    /// covered end-to-end below, where the class visitor supplies the excused references.
    fn collect_imports(source_text: &str) -> Vec<ImportDeclarationInfo> {
        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, source_text, SourceType::ts()).parse();
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program)
            .semantic;
        collect_import_declarations(&ret.program, &semantic, source_text, &HashSet::new())
    }

    #[test]
    fn import_table_records_every_binding_shape() {
        let source = "import Default from './d';\n\
                      import * as ns from './n';\n\
                      import { A, B as Renamed, type T } from './m';\n\
                      import './side-effect';\n";
        let declarations = collect_imports(source);

        /// `(specifier, [(local, imported, span_text)])` for one declaration.
        type Shape<'a> = (&'a str, Vec<(&'a str, Option<&'a str>, &'a str)>);

        let shapes: Vec<Shape<'_>> = declarations
            .iter()
            .map(|decl| {
                (
                    decl.specifier.as_str(),
                    decl.bindings
                        .iter()
                        .map(|b| {
                            (
                                b.local.as_str(),
                                b.imported.as_deref(),
                                &source[b.span.start as usize..b.span.end as usize],
                            )
                        })
                        .collect(),
                )
            })
            .collect();

        assert_eq!(
            shapes,
            vec![
                ("./d", vec![("Default", Some("default"), "Default")]),
                // A namespace import binds the module object, not any one export.
                ("./n", vec![("ns", None, "* as ns")]),
                (
                    "./m",
                    vec![
                        ("A", Some("A"), "A"),
                        // The *exported* name, not the local one — that is what an import must
                        // be written with.
                        ("Renamed", Some("B"), "B as Renamed"),
                        ("T", Some("T"), "type T"),
                    ]
                ),
                ("./side-effect", vec![]),
            ]
        );
    }

    #[test]
    fn removal_span_covers_the_trailing_newline_but_the_declaration_span_does_not() {
        let source = "import { A } from './a';\nconst x = A;\n";
        let declarations = collect_imports(source);
        assert_eq!(declarations.len(), 1);
        let span = declarations[0].span;
        assert_eq!(
            &source[span.start as usize..span.end as usize],
            "import { A } from './a';"
        );
        let mut edited = source.to_string();
        let removal = declarations[0].removal_span;
        edited.replace_range(removal.start as usize..removal.end as usize, "");
        assert_eq!(edited, "const x = A;\n");
    }

    #[test]
    fn removal_span_stops_at_a_trailing_comment() {
        let source = "import { A } from './a'; // keep me\nconst x = A;\n";
        let declarations = collect_imports(source);
        let removal = declarations[0].removal_span;
        assert_eq!(
            &source[removal.start as usize..removal.end as usize],
            "import { A } from './a';"
        );
    }

    #[test]
    fn eager_reference_tracks_uses_in_value_and_type_position() {
        // `Unused` has no reference at all; the binding site itself is not one. `Typed` is only
        // named in a type annotation, which still reaches this compiler's TypeScript output.
        let source = "import { Used, Unused, Typed } from './m';\n\
                      const x = Used;\n\
                      let y: Typed;\n";
        let declarations = collect_imports(source);
        let flags: Vec<(&str, bool)> = declarations[0]
            .bindings
            .iter()
            .map(|b| (b.local.as_str(), b.eagerly_referenced))
            .collect();
        assert_eq!(
            flags,
            vec![("Used", true), ("Unused", false), ("Typed", true)]
        );
    }

    #[test]
    fn value_reference_excludes_positions_erased_from_javascript() {
        let source = "import { Read, Annotated, Implemented, Queried, Extended } from './m';\n\
                      const x = Read;\n\
                      let y: Annotated;\n\
                      class C implements Implemented {}\n\
                      type T = typeof Queried;\n\
                      class D extends Extended {}\n";
        let declarations = collect_imports(source);
        let flags: Vec<(&str, bool, bool)> = declarations[0]
            .bindings
            .iter()
            .map(|b| (b.local.as_str(), b.eagerly_referenced, b.value_referenced))
            .collect();
        assert_eq!(
            flags,
            vec![
                ("Read", true, true),
                ("Annotated", true, false),
                ("Implemented", true, false),
                ("Queried", true, false),
                ("Extended", true, true),
            ]
        );
    }

    /// The `@Component.imports` entries are the one place a deferrable symbol is expected to
    /// appear, and the decorator is stripped from the output, so they must not mark the symbol
    /// as eagerly referenced — otherwise nothing would ever be deferrable. Every *other* use
    /// must still count.
    #[test]
    fn component_imports_array_does_not_count_as_an_eager_reference() {
        let fs = crate::test_utils::create_test_fs(&[
            (
                "/proj/tsconfig.json",
                r#"{"compilerOptions":{},"files":["app.ts"]}"#,
            ),
            (
                "/proj/app.ts",
                r#"
                import { Component, ViewChild } from '@angular/core';
                import { Deferred } from './deferred';
                import { Queried } from './queried';

                @Component({
                    selector: 'app',
                    template: '',
                    imports: [Deferred, Queried],
                })
                export class App {
                    @ViewChild(Queried) queried!: Queried;
                }
                "#,
            ),
        ]);

        let results = crate::test_utils::run_analyzer(fs, "/proj/tsconfig.json", false);
        let app = results
            .iter()
            .find(|r| r.file_path.ends_with("app.ts"))
            .expect("app.ts analyzed");

        let eager: std::collections::HashMap<&str, bool> = app
            .imports
            .iter()
            .flat_map(|decl| &decl.bindings)
            .map(|b| (b.local.as_str(), b.eagerly_referenced))
            .collect();

        // Only reachable through `imports: [...]`, which is stripped — deferrable.
        assert_eq!(eager.get("Deferred"), Some(&false));
        // Also named by `@ViewChild`, which is emitted into the view query — not deferrable.
        assert_eq!(eager.get("Queried"), Some(&true));
        // The decorator names themselves are ordinary eager references.
        assert_eq!(eager.get("Component"), Some(&true));
    }

    /// An entry reached through a local variable is written in the variable's initializer, which
    /// stays in the output after the decorator is stripped. Excusing it would let the import be
    /// deleted from under the surviving `const`.
    #[test]
    fn component_imports_through_local_variable_still_count_as_eager_references() {
        let fs = crate::test_utils::create_test_fs(&[
            (
                "/proj/tsconfig.json",
                r#"{"compilerOptions":{},"files":["app.ts"]}"#,
            ),
            (
                "/proj/app.ts",
                r#"
                import { Component } from '@angular/core';
                import { Direct } from './direct';
                import { Shared } from './shared';

                const SHARED_IMPORTS = [Shared];

                @Component({
                    selector: 'app',
                    template: '',
                    imports: [Direct, SHARED_IMPORTS],
                })
                export class App {}
                "#,
            ),
        ]);

        let results = crate::test_utils::run_analyzer(fs, "/proj/tsconfig.json", false);
        let app = results
            .iter()
            .find(|r| r.file_path.ends_with("app.ts"))
            .expect("app.ts analyzed");

        let eager: std::collections::HashMap<&str, bool> = app
            .imports
            .iter()
            .flat_map(|decl| &decl.bindings)
            .map(|b| (b.local.as_str(), b.eagerly_referenced))
            .collect();

        assert_eq!(eager.get("Direct"), Some(&false));
        assert_eq!(eager.get("Shared"), Some(&true));
    }

    #[test]
    fn component_deferred_imports_array_does_not_count_as_an_eager_reference() {
        let fs = crate::test_utils::create_test_fs(&[
            (
                "/proj/tsconfig.json",
                r#"{"compilerOptions":{},"files":["app.ts"]}"#,
            ),
            (
                "/proj/app.ts",
                r#"
                import { Component, ViewChild } from '@angular/core';
                import { Deferred } from './deferred';
                import { Queried } from './queried';

                @Component({
                    selector: 'app',
                    template: '',
                    deferredImports: [Deferred, Queried],
                })
                export class App {
                    @ViewChild(Queried) queried!: Queried;
                }
                "#,
            ),
        ]);

        let results = crate::test_utils::run_analyzer(fs, "/proj/tsconfig.json", false);
        let app = results
            .iter()
            .find(|r| r.file_path.ends_with("app.ts"))
            .expect("app.ts analyzed");

        let eager: std::collections::HashMap<&str, bool> = app
            .imports
            .iter()
            .flat_map(|decl| &decl.bindings)
            .map(|b| (b.local.as_str(), b.eagerly_referenced))
            .collect();

        // Only reachable through `deferredImports: [...]`, which is stripped — deferrable.
        assert_eq!(eager.get("Deferred"), Some(&false));
        // Also named by `@ViewChild`, which is emitted into the view query — not deferrable.
        assert_eq!(eager.get("Queried"), Some(&true));
        // The decorator names themselves are ordinary eager references.
        assert_eq!(eager.get("Component"), Some(&true));
    }

    #[test]
    fn component_deferred_imports_object_does_not_count_as_an_eager_reference() {
        let fs = crate::test_utils::create_test_fs(&[
            (
                "/proj/tsconfig.json",
                r#"{"compilerOptions":{},"files":["app.ts"]}"#,
            ),
            (
                "/proj/app.ts",
                r#"
                import { Component, ViewChild } from '@angular/core';
                import { Deferred } from './deferred';
                import { Queried } from './queried';

                @Component({
                    selector: 'app',
                    template: '',
                    deferredImports: {
                        blockA: [Deferred],
                        blockB: [Queried],
                    },
                })
                export class App {
                    @ViewChild(Queried) queried!: Queried;
                }
                "#,
            ),
        ]);

        let results = crate::test_utils::run_analyzer(fs, "/proj/tsconfig.json", false);
        let app = results
            .iter()
            .find(|r| r.file_path.ends_with("app.ts"))
            .expect("app.ts analyzed");

        let eager: std::collections::HashMap<&str, bool> = app
            .imports
            .iter()
            .flat_map(|decl| &decl.bindings)
            .map(|b| (b.local.as_str(), b.eagerly_referenced))
            .collect();

        // Only reachable through `deferredImports: {...}`, which is stripped — deferrable.
        assert_eq!(eager.get("Deferred"), Some(&false));
        // Also named by `@ViewChild`, which is emitted into the view query — not deferrable.
        assert_eq!(eager.get("Queried"), Some(&true));
        // The decorator names themselves are ordinary eager references.
        assert_eq!(eager.get("Component"), Some(&true));
    }

    #[test]
    fn a_symbol_shared_across_deferred_blocks_is_excused_at_every_occurrence() {
        let fs = crate::test_utils::create_test_fs(&[
            (
                "/proj/tsconfig.json",
                r#"{"compilerOptions":{},"files":["app.ts"]}"#,
            ),
            (
                "/proj/app.ts",
                r#"
                import { Component } from '@angular/core';
                import { DeferredA } from './deferred-a';
                import { DeferredB } from './deferred-b';

                @Component({
                    selector: 'app',
                    template: '',
                    deferredImports: {
                        blockA: [DeferredA],
                        blockB: [DeferredA, DeferredB],
                    },
                })
                export class App {}
                "#,
            ),
        ]);

        let results = crate::test_utils::run_analyzer(fs, "/proj/tsconfig.json", false);
        let app = results
            .iter()
            .find(|r| r.file_path.ends_with("app.ts"))
            .expect("app.ts analyzed");

        let eager: std::collections::HashMap<&str, bool> = app
            .imports
            .iter()
            .flat_map(|decl| &decl.bindings)
            .map(|b| (b.local.as_str(), b.eagerly_referenced))
            .collect();

        assert_eq!(eager.get("DeferredA"), Some(&false));
        assert_eq!(eager.get("DeferredB"), Some(&false));
    }

    fn imports_end_of(source: &str) -> u32 {
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        find_imports_end(&ret.program, source)
    }

    #[test]
    fn test_find_imports_end() {
        let source = "import { A } from 'a';\nimport { B } from 'b';\n\nconsole.log('hello');\n";
        let end = imports_end_of(source);
        assert!(end > 0);
        let imported_part = &source[..end as usize];
        assert!(imported_part.contains("import { A } from 'a';"));
        assert!(imported_part.contains("import { B } from 'b';"));
        assert!(!imported_part.contains("console.log"));
    }

    #[test]
    fn test_find_imports_end_with_comment_on_same_line() {
        let source = "import { A } from 'a';/**\n * JSDoc comment\n */\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(&source[..end as usize], "import { A } from 'a';");
    }

    #[test]
    fn test_find_imports_end_with_line_comment_on_same_line() {
        let source = "import { A } from 'a'; // trailing comment\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "import { A } from 'a'; // trailing comment"
        );
    }

    #[test]
    fn test_find_imports_end_with_fileoverview_comment() {
        let source = "/**\n * @fileoverview Header comment.\n */\n\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "/**\n * @fileoverview Header comment.\n */\n\n",
            "the blank line separating the banner from the body stays above the insertion point"
        );
    }

    /// A doc comment attached to the declaration it documents must not be split off from it, so
    /// with no import to anchor on the insertion point stays at the top of the file.
    #[test]
    fn test_find_imports_end_with_declaration_jsdoc() {
        let source = "/**\n * @desc Message description\n */\nexport const MSG = 'foo';\n";
        let end = imports_end_of(source);
        assert_eq!(end, 0);
    }

    #[test]
    fn test_find_imports_end_with_fileoverview_and_declaration_jsdoc() {
        let source = "/**\n * @fileoverview Header comment.\n */\n\n/**\n * @desc Message description\n */\nexport const MSG = 'foo';\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "/**\n * @fileoverview Header comment.\n */\n\n"
        );
    }

    #[test]
    fn test_find_imports_end_with_fileoverview_below_attached_comment() {
        let source = "// Copyright 2024 Google LLC\n/**\n * @fileoverview Header comment.\n */\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "// Copyright 2024 Google LLC\n/**\n * @fileoverview Header comment.\n */\n",
            "nothing may be spliced above a `@fileoverview`, even when another comment precedes it"
        );
    }

    #[test]
    fn test_find_imports_end_with_pragma_below_attached_comment() {
        let source = "// Prose about this file.\n// @ts-nocheck\nexport const VERSION = '1';\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "// Prose about this file.\n// @ts-nocheck\n",
            "nothing may be spliced above a `@ts-nocheck`, even when another comment precedes it"
        );
    }

    #[test]
    fn test_find_imports_end_with_fileoverview_below_several_attached_comments() {
        let source = "// Copyright 2024 Google LLC\n// All rights reserved.\n// Third line.\n/** @fileoverview Header. */\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "// Copyright 2024 Google LLC\n// All rights reserved.\n// Third line.\n/** @fileoverview Header. */\n"
        );
    }

    #[test]
    fn test_find_imports_end_detached_banner_after_header_below_attached_comment() {
        let source = "// Attached prose.\n/** @fileoverview Header. */\n\n/** @modName {my_module} */\n\nexport const MSG = 'foo';\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "// Attached prose.\n/** @fileoverview Header. */\n\n/** @modName {my_module} */\n\n"
        );
    }

    #[test]
    fn test_find_imports_end_keeps_line_scoped_ts_pragmas_with_their_target() {
        for pragma in ["@ts-ignore", "@ts-expect-error"] {
            let source = format!("/** Doc. */\n// {pragma}\nexport class A extends B {{}}\n");
            assert_eq!(
                imports_end_of(&source),
                0,
                "`{pragma}` applies to the next line, so nothing may be spliced below it"
            );
            // The bare pragma, with no comment above it, must behave the same way.
            let bare = format!("// {pragma}\nexport class A extends B {{}}\n");
            assert_eq!(
                imports_end_of(&bare),
                0,
                "`{pragma}` alone is still line-scoped"
            );
        }
    }

    #[test]
    fn test_find_imports_end_with_crlf_fileoverview_below_attached_comment() {
        let source = "// Copyright 2024 Google LLC\r\n/**\r\n * @fileoverview Header.\r\n */\r\nexport class Foo {}\r\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "// Copyright 2024 Google LLC\r\n/**\r\n * @fileoverview Header.\r\n */\r\n"
        );
    }

    /// Degenerate inputs must not panic. The unterminated block comment is the interesting one:
    /// its end offset is not guaranteed to land on a UTF-8 char boundary.
    #[test]
    fn test_find_imports_end_degenerate_inputs() {
        assert_eq!(imports_end_of(""), 0);
        assert_eq!(imports_end_of("// just a comment, no newline"), 0);
        assert_eq!(imports_end_of("/** @fileoverview unterminated"), 0);
        assert_eq!(imports_end_of("// lead\n/* unterminated ünicöde"), 0);
        // A file of nothing but a header comment: the offset may sit at EOF, but must be a valid
        // char boundary within the source.
        let only_header = "/** @fileoverview Header. */\n";
        assert!(only_header.is_char_boundary(imports_end_of(only_header) as usize));
    }

    /// The real-world shape that regressed: a `@fileoverview` banner, a blank line, and a file
    /// whose only statement is a re-export. There is no leading `import` to anchor on, so the
    /// insertion point comes entirely from the leading-comment scan.
    #[test]
    fn test_find_imports_end_reexport_only_file_with_fileoverview() {
        let source = concat!(
            "/**\n",
            " * @fileoverview Some stuff\n",
            " */\n",
            "\n",
            "export {Foo} from './foo';\n",
        );
        let end = imports_end_of(source);
        let head = &source[..end as usize];
        assert!(
            head.contains("@fileoverview"),
            "insertion point must fall below the banner, got {end}: {head:?}"
        );
        assert!(
            !head.contains("export {"),
            "insertion point must not fall below the re-export, got {end}: {head:?}"
        );
        assert!(
            head.ends_with("*/\n\n"),
            "Closure requires the banner to stay separated from the file body by an empty line, \
             so that empty line must sit above the insertion point, got {end}: {head:?}"
        );
    }

    #[test]
    fn test_find_imports_end_with_detached_banner_and_blank_line() {
        let source = "/** @modName {my_module} */\n\n/** @desc Message description */\nexport const MSG = 'foo';\n";
        let end = imports_end_of(source);
        assert_eq!(&source[..end as usize], "/** @modName {my_module} */\n\n");
    }

    #[test]
    fn test_find_imports_end_with_function_jsdoc() {
        let source = "/**\n * Helper function.\n */\nexport function helper() {}\n";
        let end = imports_end_of(source);
        assert_eq!(end, 0);
    }

    #[test]
    fn test_find_imports_end_with_import_after_statement() {
        let source = "// @ts-nocheck\nexport const VERSION = '1';\nimport { Component } from '@angular/core';\n\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(&source[..end as usize], "// @ts-nocheck\n");
    }

    #[test]
    fn test_find_imports_end_with_reexport_before_imports() {
        let source = "// @ts-nocheck\nexport * from './other';\nimport { Component } from '@angular/core';\n\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(&source[..end as usize], "// @ts-nocheck\n");
    }

    #[test]
    fn test_find_imports_end_stops_above_statement_referencing_later_imports() {
        let source = concat!(
            "import {Component} from '@angular/core';\n",
            "import {PrimaryButton} from './primary_button';\n",
            "\n",
            "const COMPONENT_IMPORTS = [PrimaryButton, TooltipDirective];\n",
            "\n",
            "import {TooltipDirective} from './tooltip';\n",
        );
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "import {Component} from '@angular/core';\nimport {PrimaryButton} from './primary_button';"
        );
    }

    #[test]
    fn test_find_imports_end_with_pragma_between_banner_and_statement() {
        let source = "/**\n * @fileoverview Header.\n */\n\n// @ts-nocheck\nexport enum Mode { A }\nimport { Component } from '@angular/core';\n\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "/**\n * @fileoverview Header.\n */\n\n// @ts-nocheck\n",
            "the insertion point must fall after the pragma, which is only honoured while nothing precedes it"
        );
    }

    #[test]
    fn test_find_imports_end_with_triple_slash_reference() {
        let source = "/// <reference types=\"node\" />\nexport const VERSION = '1';\nimport { Component } from '@angular/core';\n\nexport class Foo {}\n";
        let end = imports_end_of(source);
        assert_eq!(
            &source[..end as usize],
            "/// <reference types=\"node\" />\n",
            "a triple-slash directive is only honoured above every statement, so nothing may be spliced or hoisted over it"
        );
    }

    #[test]
    fn test_find_imports_end_with_triple_slash_prose_comment() {
        let source = "/// Documents the constant below.\nexport const VERSION = '1';\n";
        let end = imports_end_of(source);
        assert_eq!(end, 0);
    }

    #[test]
    fn test_find_imports_end_stops_at_first_class() {
        let source = "import { A } from 'a';\nexport class Foo {}\nimport { B } from 'b';\n";
        let end = imports_end_of(source);
        assert_eq!(&source[..end as usize], "import { A } from 'a';");
    }

    #[test]
    fn test_find_imports_end_stops_at_first_non_exported_class() {
        let source = "import { A } from 'a';\nclass Foo {}\nimport { B } from 'b';\n";
        let end = imports_end_of(source);
        assert_eq!(&source[..end as usize], "import { A } from 'a';");
    }

    #[test]
    fn test_find_imports_end_stops_at_class_nested_in_namespace() {
        let source = "import { A } from 'a';\nnamespace Ns {\n  export class Foo {}\n}\nimport { B } from 'b';\n";
        let end = imports_end_of(source);
        assert_eq!(&source[..end as usize], "import { A } from 'a';");
    }

    #[test]
    fn test_detect_is_core_nested_dirs_and_cache() {
        use crate::fs::OverlayFileSystem;
        // Uniquely-namespaced paths so this test does not collide with the process-global
        // cache entries of any other (potentially concurrent) test.
        let core_pkg = std::path::PathBuf::from("/detect_is_core_test/core/package.json");
        let other_pkg = std::path::PathBuf::from("/detect_is_core_test/other/package.json");

        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(
            core_pkg.clone(),
            r#"{ "name": "@angular/core" }"#.to_string(),
        );
        fs.upsert_file(other_pkg, r#"{ "name": "@angular/common" }"#.to_string());

        // Files inside the `@angular/core` package resolve to is_core = true, including from a
        // nested subdirectory that must walk up to the same manifest.
        assert!(detect_is_core(
            std::path::Path::new("/detect_is_core_test/core/src/a.ts"),
            &fs
        ));
        assert!(detect_is_core(
            std::path::Path::new("/detect_is_core_test/core/src/nested/c.ts"),
            &fs
        ));
        // A sibling non-core package resolves to false.
        assert!(!detect_is_core(
            std::path::Path::new("/detect_is_core_test/other/src/d.ts"),
            &fs
        ));

        // Prove memoization: after the "/detect_is_core_test/core/src" directory has been resolved
        // once, deleting the manifest does NOT change the cached answer (no second read happens),
        // while the uncached walker — which re-reads — now correctly sees no manifest.
        fs.remove_virtual_file(&core_pkg);
        assert!(detect_is_core(
            std::path::Path::new("/detect_is_core_test/core/src/b.ts"),
            &fs
        ));
        assert!(!detect_is_core_uncached(
            std::path::Path::new("/detect_is_core_test/core/src/b.ts"),
            &fs
        ));
    }
}
