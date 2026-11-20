//! Extracts custom element tag names declared on TypeScript's global
//! `HTMLElementTagNameMap` interface.
//!
//! Mirrors `collectKnownCustomElements` in `ngtsc` (`packages/compiler-cli/src/ngtsc/typecheck/src/checker.ts`):
//! collects lowercase WHATWG tag names (`[a-z].*-`) declared as non-optional, non-nullish
//! properties on global `HTMLElementTagNameMap`, including `declare global`, top-level script
//! declarations, ambient module `global { ... }` blocks, `extends` heritage clauses (including
//! local/imported/ambient namespaces, sound utility/mapped types, `export =` / `import = require`,
//! and `import()` types), sound computed `const` / `as const` / `enum` string keys, and
//! `/// <reference ... />` directives.

use std::borrow::Cow;
use std::collections::{HashMap, HashSet};

use oxc_ast::ast::{
    Declaration, ExportDefaultDeclarationKind, Expression, Program, PropertyKey, Statement,
    TSEnumDeclaration, TSEnumMemberName, TSImportType, TSImportTypeQualifier,
    TSInterfaceDeclaration, TSLiteral, TSModuleReference, TSNamespaceDeclaration,
    TSNamespaceDeclarationBody, TSSignature, TSType, TSTypeName, TSTypeParameterInstantiation,
    VariableDeclarationKind,
};
use oxc_ast_visit::Visit;
use oxc_syntax::module_record::{ImportImportName, ModuleRecord};

use super::utils::{extract_literal_string, extract_property_key};

/// Sentinel export name used for CommonJS `import X = require('...')` targeting `export = ...`.
pub(crate) const EXPORT_EQUALS_SENTINEL: &str = "export=";

/// Custom element tag contributions discovered in a single `.ts` or `.d.ts` file.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub(crate) struct CustomElementTagContributions {
    /// Lowercase custom element tag names starting with `[a-z]` and containing `-` declared
    /// directly on global `HTMLElementTagNameMap` (or inherited from same-file declarations).
    pub tags: Vec<String>,
    /// Imported base types referenced in `HTMLElementTagNameMap extends ...` as
    /// `(module_specifier, exported_path)` (where `exported_path` may be dotted, e.g. `Ns.Tags`)
    /// for cross-file resolution by the query engine.
    pub external_extends: Vec<(String, String)>,
    /// Ambient/global type paths (e.g. `["google", "maps", "HTMLElementTagNameMap"]`
    /// or `["MyAmbientTagMap"]`) that may be declared or merged in other ambient files.
    pub ambient_extends: Vec<Vec<String>>,
}

impl CustomElementTagContributions {
    pub(crate) fn is_empty(&self) -> bool {
        self.tags.is_empty() && self.external_extends.is_empty() && self.ambient_extends.is_empty()
    }
}

/// Triple-slash `/// <reference path/types/lib ... />` directives extracted from the top of a
/// `.ts` or `.d.ts` file without invoking the JS/TS parser.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub(crate) struct TripleSlashReferences {
    pub paths: Vec<String>,
    pub types: Vec<String>,
    pub has_dom_lib: bool,
}

impl TripleSlashReferences {
    pub(crate) fn is_empty(&self) -> bool {
        self.paths.is_empty() && self.types.is_empty() && !self.has_dom_lib
    }
}

/// Single-pass scan result for a `.d.ts` file, cached by `(path, SourceKey)` in
/// `shared_dts_parse_cache` and per-`FileId` on `QueryEngine`.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub(crate) struct DtsCustomElementScan {
    pub contributions: CustomElementTagContributions,
    /// Static / `import = require(...)` / `import(...)` module specifiers referenced by this `.d.ts`.
    pub import_specifiers: Vec<String>,
    /// Triple-slash `/// <reference path/types ... />` directives at the top of this `.d.ts`.
    pub references: TripleSlashReferences,
}

/// Whether `name` is a candidate WHATWG custom element tag name matching `ngtsc`'s
/// `HTMLElementTagNameMap` filter (`/^[a-z].*-/` and all lowercase).
fn is_custom_element_tag(name: &str) -> bool {
    name.starts_with(|c: char| c.is_ascii_lowercase())
        && name.contains('-')
        && name.to_lowercase() == name
}

fn is_builtin_global_type(name: &str) -> bool {
    matches!(
        name,
        "HTMLElement"
            | "Element"
            | "SVGElement"
            | "MathMLElement"
            | "Node"
            | "EventTarget"
            | "Object"
            | "Record"
            | "Partial"
            | "Required"
            | "Readonly"
            | "Pick"
            | "Omit"
            | "HTMLElementTagNameMap"
    )
}

fn push_unique_tag(tags: &mut Vec<String>, seen: &mut HashSet<String>, name: &str) {
    if is_custom_element_tag(name) && seen.insert(name.to_string()) {
        tags.push(name.to_string());
    }
}

fn push_unique_external(
    external: &mut Vec<(String, String)>,
    seen: &mut HashSet<(String, String)>,
    specifier: &str,
    exported_path: &str,
) {
    let key = (specifier.to_string(), exported_path.to_string());
    if seen.insert(key.clone()) {
        external.push(key);
    }
}

fn push_unique_ambient(
    ambient: &mut Vec<Vec<String>>,
    seen: &mut HashSet<Vec<String>>,
    path: Vec<String>,
) {
    if !path.is_empty() && seen.insert(path.clone()) {
        ambient.push(path);
    }
}

/// Parse a double- or single-quoted XML-style attribute value (`attr="value"` or `attr='value'`)
/// from a `/// <reference ... />` directive body.
fn parse_reference_attr<'a>(body: &'a str, attr: &str) -> Option<&'a str> {
    let mut rest = body;
    while let Some(idx) = rest.find(attr) {
        let before_ok = idx == 0 || rest.as_bytes()[idx - 1].is_ascii_whitespace();
        let after = &rest[idx + attr.len()..];
        if !before_ok {
            rest = after;
            continue;
        }
        let after_ws = after.trim_start();
        let Some(after_eq) = after_ws.strip_prefix('=') else {
            rest = after;
            continue;
        };
        let after_eq = after_eq.trim_start();
        let quote = after_eq.as_bytes().first().copied()?;
        if quote != b'"' && quote != b'\'' {
            return None;
        }
        let inner = &after_eq[1..];
        let end = inner.find(quote as char)?;
        let value = &inner[..end];
        return (!value.is_empty()).then_some(value);
    }
    None
}

/// Extract `/// <reference path="..." />` and `/// <reference types="..." />` directives from
/// leading comments in `source_text` (matching TypeScript's triple-slash directive grammar).
pub(crate) fn extract_triple_slash_references(source_text: &str) -> TripleSlashReferences {
    if !source_text.contains("///") || !source_text.contains("reference") {
        return TripleSlashReferences::default();
    }
    let mut refs = TripleSlashReferences::default();
    let mut seen_paths = HashSet::new();
    let mut seen_types = HashSet::new();
    let mut in_block_comment = false;

    for raw_line in source_text.lines() {
        let mut line = raw_line.trim_start_matches('\u{feff}').trim();

        // Advance past any block comments (single-line, multi-line, or repeated inline blocks).
        loop {
            if in_block_comment {
                let Some(end) = line.find("*/") else {
                    line = "";
                    break;
                };
                in_block_comment = false;
                line = line[end + 2..].trim_start();
                continue;
            }
            let Some(after_open) = line.strip_prefix("/*") else {
                break;
            };
            let Some(end) = after_open.find("*/") else {
                in_block_comment = true;
                line = "";
                break;
            };
            line = after_open[end + 2..].trim_start();
        }

        if line.is_empty() {
            continue;
        }
        let Some(after_slashes) = line.strip_prefix("///") else {
            if line.starts_with("//") {
                continue;
            }
            // TypeScript only recognizes triple-slash directives at the top of the file before
            // executable/declaration statements.
            break;
        };
        let body = after_slashes.trim();
        let Some(tag_body) = body
            .strip_prefix("<reference")
            .and_then(|s| s.strip_suffix("/>"))
        else {
            continue;
        };
        if !tag_body
            .as_bytes()
            .first()
            .is_some_and(u8::is_ascii_whitespace)
        {
            continue;
        }
        if let Some(p) = parse_reference_attr(tag_body, "path") {
            if seen_paths.insert(p.to_string()) {
                refs.paths.push(p.to_string());
            }
        }
        if let Some(t) = parse_reference_attr(tag_body, "types") {
            if seen_types.insert(t.to_string()) {
                refs.types.push(t.to_string());
            }
        }
        if let Some(lib) = parse_reference_attr(tag_body, "lib") {
            let lower = lib.to_ascii_lowercase();
            if lower == "dom" || lower.starts_with("dom.") {
                refs.has_dom_lib = true;
            }
        }
    }
    refs
}

fn is_as_const_type(ty: &TSType<'_>) -> bool {
    let TSType::TSTypeReference(type_ref) = ty else {
        return false;
    };
    let TSTypeName::IdentifierReference(ident) = &type_ref.type_name else {
        return false;
    };
    ident.name == "const" && type_ref.type_arguments.is_none()
}

fn is_nullish_ts_type(ty: &TSType<'_>) -> bool {
    match ty {
        TSType::TSUndefinedKeyword(_) | TSType::TSNullKeyword(_) => true,
        TSType::TSParenthesizedType(p) => is_nullish_ts_type(&p.type_annotation),
        TSType::TSUnionType(u) => u.types.iter().any(is_nullish_ts_type),
        _ => false,
    }
}

/// Extract a statically preserved string literal from an initializer expression, respecting
/// TypeScript casts (`as const` preserves the literal; `as 'other'` yields `'other'`; `as string`
/// or `as any` widens and returns `None`).
fn unwrap_literal_string_expr(expr: &Expression<'_>) -> Option<String> {
    match expr {
        Expression::TSAsExpression(as_expr) => {
            if is_as_const_type(&as_expr.type_annotation) {
                unwrap_literal_string_expr(&as_expr.expression)
            } else {
                extract_ts_literal_string(&as_expr.type_annotation)
            }
        }
        Expression::TSSatisfiesExpression(sat) => unwrap_literal_string_expr(&sat.expression),
        Expression::ParenthesizedExpression(paren) => unwrap_literal_string_expr(&paren.expression),
        other => extract_literal_string(other),
    }
}

fn extract_ts_literal_string(ty: &TSType<'_>) -> Option<String> {
    match ty {
        TSType::TSLiteralType(lit) => match &lit.literal {
            TSLiteral::StringLiteral(s) => Some(s.value.to_string()),
            TSLiteral::TemplateLiteral(t) if t.expressions.is_empty() => {
                let q = t.quasis.first()?;
                Some(
                    q.value
                        .cooked
                        .as_deref()
                        .unwrap_or(q.value.raw.as_str())
                        .to_string(),
                )
            }
            _ => None,
        },
        TSType::TSParenthesizedType(p) => extract_ts_literal_string(&p.type_annotation),
        _ => None,
    }
}

fn collect_const_strings_from_enum(en: &TSEnumDeclaration<'_>, out: &mut HashMap<String, String>) {
    let enum_name = en.id.name.as_str();
    for member in &en.body.members {
        let member_name = match &member.id {
            TSEnumMemberName::Identifier(ident) => ident.name.as_str(),
            TSEnumMemberName::String(s) | TSEnumMemberName::ComputedString(s) => s.value.as_str(),
            TSEnumMemberName::ComputedTemplateString(_) => continue,
        };
        let Some(init) = &member.initializer else {
            continue;
        };
        let Some(val) = unwrap_literal_string_expr(init) else {
            continue;
        };
        out.insert(format!("{enum_name}.{member_name}"), val);
    }
}

fn collect_const_strings_in_stmts(stmts: &[Statement<'_>], out: &mut HashMap<String, String>) {
    for stmt in stmts {
        let decl = match stmt {
            Statement::ExportDeclaration(export) => Some(&export.declaration),
            other => other.as_declaration(),
        };
        match decl {
            Some(Declaration::VariableDeclaration(var_decl))
                if var_decl.kind == VariableDeclarationKind::Const =>
            {
                for declarator in &var_decl.declarations {
                    let Some(ident) = declarator.id.get_binding_identifier() else {
                        continue;
                    };
                    // Explicit type annotations control the TS type (e.g. `const TAG: string = 'a-b'`
                    // widens to `string` and must NOT be extracted as `'a-b'`).
                    if let Some(ann) = &declarator.type_annotation {
                        if let Some(val) = extract_ts_literal_string(&ann.type_annotation) {
                            out.insert(ident.name.to_string(), val);
                        } else {
                            collect_const_object_type_strings(
                                ident.name.as_str(),
                                &ann.type_annotation,
                                out,
                            );
                        }
                        continue;
                    }
                    let Some(init) = &declarator.init else {
                        continue;
                    };
                    if let Some(val) = unwrap_literal_string_expr(init) {
                        out.insert(ident.name.to_string(), val);
                    } else {
                        collect_const_object_expr_strings(ident.name.as_str(), init, out);
                    }
                }
            }
            Some(Declaration::TSEnumDeclaration(en)) => {
                collect_const_strings_from_enum(en, out);
            }
            _ => {}
        }
    }
}

/// Only extracts object-literal property string values when explicitly asserted `as const`,
/// because plain `const TAGS = { Foo: 'a-b' }` widens `TAGS.Foo` to `string` in TypeScript.
fn collect_const_object_expr_strings(
    obj_name: &str,
    expr: &Expression<'_>,
    out: &mut HashMap<String, String>,
) {
    let mut current = expr;
    let mut saw_as_const = false;
    loop {
        match current {
            Expression::ParenthesizedExpression(p) => current = &p.expression,
            Expression::TSSatisfiesExpression(s) => current = &s.expression,
            Expression::TSAsExpression(a) if is_as_const_type(&a.type_annotation) => {
                saw_as_const = true;
                current = &a.expression;
            }
            _ => break,
        }
    }
    if !saw_as_const {
        return;
    }
    let Expression::ObjectExpression(obj) = current else {
        return;
    };
    for prop in &obj.properties {
        let oxc_ast::ast::ObjectPropertyKind::ObjectProperty(prop) = prop else {
            continue;
        };
        let Some(key) = extract_property_key(&prop.key) else {
            continue;
        };
        if let Some(val) = unwrap_literal_string_expr(&prop.value) {
            out.insert(format!("{obj_name}.{key}"), val);
        }
    }
}

fn collect_const_object_type_strings(
    obj_name: &str,
    ty: &TSType<'_>,
    out: &mut HashMap<String, String>,
) {
    let unwrapped = match ty {
        TSType::TSParenthesizedType(p) => &p.type_annotation,
        other => other,
    };
    let TSType::TSTypeLiteral(lit) = unwrapped else {
        return;
    };
    for sig in &lit.members {
        let TSSignature::TSPropertySignature(prop) = sig else {
            continue;
        };
        if prop.optional {
            continue;
        }
        let Some(key) = extract_property_key(&prop.key) else {
            continue;
        };
        let Some(ann) = &prop.type_annotation else {
            continue;
        };
        if let Some(val) = extract_ts_literal_string(&ann.type_annotation) {
            out.insert(format!("{obj_name}.{key}"), val);
        }
    }
}

enum ImportedBinding<'a> {
    Named(&'a str, &'a str),
    Namespace(&'a str),
    /// `import X = require('spec')`: bare `X` targets `export =`, while `X.Foo` targets `Foo`.
    ImportEquals(&'a str),
}

fn build_import_lookup<'a>(
    program: &'a Program<'a>,
    module_record: &'a ModuleRecord<'a>,
) -> HashMap<&'a str, ImportedBinding<'a>> {
    let mut map = HashMap::new();
    for entry in &module_record.import_entries {
        let spec = entry.module_request.name.as_str();
        let binding = match &entry.import_name {
            ImportImportName::Name(n) => ImportedBinding::Named(spec, n.name.as_str()),
            ImportImportName::Default(_) => ImportedBinding::Named(spec, "default"),
            ImportImportName::NamespaceObject => ImportedBinding::Namespace(spec),
        };
        map.insert(entry.local_name.name.as_str(), binding);
    }
    for stmt in &program.body {
        let decl = match stmt {
            Statement::TSImportEqualsDeclaration(decl) => decl.as_ref(),
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::TSImportEqualsDeclaration(decl) => decl.as_ref(),
                _ => continue,
            },
            _ => continue,
        };
        if let TSModuleReference::ExternalModuleReference(ext) = &decl.module_reference {
            map.insert(
                decl.id.name.as_str(),
                ImportedBinding::ImportEquals(ext.expression.value.as_str()),
            );
        }
    }
    map
}

fn flatten_type_name<'a>(type_name: &'a TSTypeName<'a>, out: &mut Vec<&'a str>) -> bool {
    match type_name {
        TSTypeName::IdentifierReference(ident) => {
            out.push(ident.name.as_str());
            true
        }
        TSTypeName::QualifiedName(qual) => {
            if !flatten_type_name(&qual.left, out) {
                return false;
            }
            out.push(qual.right.name.as_str());
            true
        }
        TSTypeName::ThisExpression(_) => false,
    }
}

fn flatten_import_qualifier<'a>(qualifier: &'a TSImportTypeQualifier<'a>, out: &mut Vec<&'a str>) {
    match qualifier {
        TSImportTypeQualifier::Identifier(ident) => out.push(ident.name.as_str()),
        TSImportTypeQualifier::QualifiedName(qual) => {
            flatten_import_qualifier(&qual.left, out);
            out.push(qual.right.name.as_str());
        }
    }
}

fn collect_namespace_blocks<'a>(
    stmts: &'a [Statement<'a>],
    ns_path: &[&str],
    exported_only: bool,
    out: &mut Vec<&'a [Statement<'a>]>,
) {
    let Some((&first, rest)) = ns_path.split_first() else {
        return;
    };
    for stmt in stmts {
        let decl = match stmt {
            Statement::TSNamespaceDeclaration(decl) if !exported_only => decl.as_ref(),
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::TSNamespaceDeclaration(decl) => decl.as_ref(),
                _ => continue,
            },
            _ => continue,
        };
        collect_from_namespace_decl(decl, first, rest, out);
    }
}

fn collect_from_namespace_decl<'a>(
    decl: &'a TSNamespaceDeclaration<'a>,
    expected_name: &str,
    rest: &[&str],
    out: &mut Vec<&'a [Statement<'a>]>,
) {
    if decl.id.name.as_str() != expected_name {
        return;
    }
    match (&decl.body, rest.split_first()) {
        (TSNamespaceDeclarationBody::TSModuleBlock(block), None) => {
            out.push(&block.body);
        }
        (TSNamespaceDeclarationBody::TSNamespaceDeclaration(inner), Some((&next, tail))) => {
            collect_from_namespace_decl(inner, next, tail, out);
        }
        (TSNamespaceDeclarationBody::TSModuleBlock(block), Some(_)) => {
            collect_namespace_blocks(&block.body, rest, false, out);
        }
        (TSNamespaceDeclarationBody::TSNamespaceDeclaration(_), None) => {}
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum FoundType {
    None,
    /// Only type alias(es) matched (cannot declaration-merge across files in TypeScript).
    AliasOnly,
    /// At least one interface matched (can declaration-merge across files in TypeScript).
    Interface,
}

impl FoundType {
    fn is_found(self) -> bool {
        !matches!(self, Self::None)
    }

    fn merge(self, other: Self) -> Self {
        match (self, other) {
            (Self::Interface, _) | (_, Self::Interface) => Self::Interface,
            (Self::AliasOnly, _) | (_, Self::AliasOnly) => Self::AliasOnly,
            (Self::None, Self::None) => Self::None,
        }
    }
}

struct FileTypeCollector<'a> {
    program: &'a Program<'a>,
    is_module: bool,
    imports: HashMap<&'a str, ImportedBinding<'a>>,
    module_const_strings: HashMap<String, String>,
    global_const_strings: HashMap<String, String>,
    /// Stack of enclosing namespace or `declare module` statement blocks (innermost last).
    scope_stack: Vec<&'a [Statement<'a>]>,
    /// Stack of in-scope generic type parameter names (prevents leaking `T`/`K` into `ambient_extends`).
    active_type_params: Vec<HashSet<&'a str>>,
    tags: Vec<String>,
    seen_tags: HashSet<String>,
    external_extends: Vec<(String, String)>,
    seen_external: HashSet<(String, String)>,
    ambient_extends: Vec<Vec<String>>,
    seen_ambient: HashSet<Vec<String>>,
    visited_local: HashSet<(bool, usize, String)>,
}

impl<'a> FileTypeCollector<'a> {
    fn new(
        program: &'a Program<'a>,
        module_record: &'a ModuleRecord<'a>,
        is_module_by_extension: bool,
    ) -> Self {
        let is_module = is_module_by_extension
            || crate::query::engine::is_external_module_dts(program, module_record);
        let mut module_const_strings = HashMap::new();
        let mut global_const_strings = HashMap::new();
        if is_module {
            collect_const_strings_in_stmts(&program.body, &mut module_const_strings);
        } else {
            collect_const_strings_in_stmts(&program.body, &mut global_const_strings);
        }
        for stmt in &program.body {
            match stmt {
                Statement::TSGlobalDeclaration(global_decl) => {
                    collect_const_strings_in_stmts(
                        &global_decl.body.body,
                        &mut global_const_strings,
                    );
                }
                Statement::TSExternalModuleDeclaration(mod_decl) => {
                    let Some(block) = &mod_decl.body else {
                        continue;
                    };
                    for inner in &block.body {
                        if let Statement::TSGlobalDeclaration(global_decl) = inner {
                            collect_const_strings_in_stmts(
                                &global_decl.body.body,
                                &mut global_const_strings,
                            );
                        }
                    }
                }
                _ => {}
            }
        }
        Self {
            program,
            is_module,
            imports: build_import_lookup(program, module_record),
            module_const_strings,
            global_const_strings,
            scope_stack: Vec::new(),
            active_type_params: Vec::new(),
            tags: Vec::new(),
            seen_tags: HashSet::new(),
            external_extends: Vec::new(),
            seen_external: HashSet::new(),
            ambient_extends: Vec::new(),
            seen_ambient: HashSet::new(),
            visited_local: HashSet::new(),
        }
    }

    fn finish(self) -> CustomElementTagContributions {
        CustomElementTagContributions {
            tags: self.tags,
            external_extends: self.external_extends,
            ambient_extends: self.ambient_extends,
        }
    }

    fn is_active_type_param(&self, name: &str) -> bool {
        self.active_type_params
            .iter()
            .any(|params| params.contains(name))
    }

    fn push_type_params(
        &mut self,
        type_parameters: Option<&'a oxc_ast::ast::TSTypeParameterDeclaration<'a>>,
    ) -> bool {
        let Some(tp) = type_parameters else {
            return false;
        };
        if tp.params.is_empty() {
            return false;
        }
        let set: HashSet<&'a str> = tp.params.iter().map(|p| p.name.name.as_str()).collect();
        self.active_type_params.push(set);
        true
    }

    fn lookup_const_string(&self, key: &str, in_global_scope: bool) -> Option<String> {
        for &block in self.scope_stack.iter().rev() {
            let mut local = HashMap::new();
            collect_const_strings_in_stmts(block, &mut local);
            if let Some(val) = local.get(key) {
                return Some(val.clone());
            }
        }
        if in_global_scope {
            self.global_const_strings
                .get(key)
                .or_else(|| self.module_const_strings.get(key))
                .cloned()
        } else {
            self.module_const_strings
                .get(key)
                .or_else(|| self.global_const_strings.get(key))
                .cloned()
        }
    }

    fn extract_signature_key(
        &self,
        key: &'a PropertyKey<'a>,
        computed: bool,
        in_global_scope: bool,
    ) -> Option<Cow<'a, str>> {
        if !computed {
            return extract_property_key(key);
        }
        if let Some(static_name) = key.static_name() {
            return Some(static_name);
        }
        match key {
            PropertyKey::Identifier(ident) => self
                .lookup_const_string(ident.name.as_str(), in_global_scope)
                .map(Cow::Owned),
            PropertyKey::StaticMemberExpression(mem) => {
                let Expression::Identifier(obj) = &mem.object else {
                    return None;
                };
                let lookup = format!("{}.{}", obj.name, mem.property.name);
                self.lookup_const_string(&lookup, in_global_scope)
                    .map(Cow::Owned)
            }
            PropertyKey::ComputedMemberExpression(mem) => {
                let Expression::Identifier(obj) = &mem.object else {
                    return None;
                };
                let prop = extract_literal_string(&mem.expression)?;
                let lookup = format!("{}.{prop}", obj.name);
                self.lookup_const_string(&lookup, in_global_scope)
                    .map(Cow::Owned)
            }
            _ => None,
        }
    }

    fn collect_tags_from_signatures(
        &mut self,
        signatures: &[TSSignature<'a>],
        in_global_scope: bool,
    ) {
        for sig in signatures {
            let TSSignature::TSPropertySignature(prop) = sig else {
                continue;
            };
            if prop.optional {
                continue;
            }
            if prop
                .type_annotation
                .as_ref()
                .is_some_and(|ann| is_nullish_ts_type(&ann.type_annotation))
            {
                continue;
            }
            let Some(name) = self.extract_signature_key(&prop.key, prop.computed, in_global_scope)
            else {
                continue;
            };
            push_unique_tag(&mut self.tags, &mut self.seen_tags, &name);
        }
    }

    fn visit_interface(&mut self, iface: &'a TSInterfaceDeclaration<'a>, in_global_scope: bool) {
        let pushed_tp = self.push_type_params(iface.type_parameters.as_deref());
        self.collect_tags_from_signatures(&iface.body.body, in_global_scope);
        for heritage in &iface.extends {
            self.visit_type_name_with_args(
                &heritage.type_name,
                heritage.type_arguments.as_deref(),
                in_global_scope,
            );
        }
        if pushed_tp {
            self.active_type_params.pop();
        }
    }

    fn visit_type_alias(
        &mut self,
        alias: &'a oxc_ast::ast::TSTypeAliasDeclaration<'a>,
        in_global_scope: bool,
    ) {
        let pushed_tp = self.push_type_params(alias.type_parameters.as_deref());
        self.visit_ts_type(&alias.type_annotation, in_global_scope);
        if pushed_tp {
            self.active_type_params.pop();
        }
    }

    fn visit_type_name_with_args(
        &mut self,
        type_name: &'a TSTypeName<'a>,
        type_arguments: Option<&'a TSTypeParameterInstantiation<'a>>,
        in_global_scope: bool,
    ) {
        if let (TSTypeName::IdentifierReference(ident), Some(args)) = (type_name, type_arguments) {
            let name = ident.name.as_str();
            if !self.has_local_or_imported_binding(name) {
                match name {
                    // Note: `Partial<T>` makes every property optional (`El | undefined`), which
                    // `ngtsc` skips to avoid leaking `TS18048: '_t1' is possibly 'undefined'`.
                    "Partial" => return,
                    "Required" | "Readonly" => {
                        if let Some(first) = args.params.first() {
                            self.visit_ts_type(first, in_global_scope);
                            return;
                        }
                    }
                    "Record" => {
                        if let Some(val_ty) = args.params.get(1) {
                            if is_nullish_ts_type(val_ty) {
                                return;
                            }
                        }
                        if let Some(key_ty) = args.params.first() {
                            let mut keys = Vec::new();
                            let mut visited = HashSet::new();
                            if self.extract_string_keys_exact(
                                key_ty,
                                in_global_scope,
                                &mut keys,
                                &mut visited,
                            ) {
                                for key in keys {
                                    push_unique_tag(&mut self.tags, &mut self.seen_tags, &key);
                                }
                            }
                            return;
                        }
                    }
                    "Pick" | "Omit" => {
                        let (Some(base_ty), Some(key_ty)) =
                            (args.params.first(), args.params.get(1))
                        else {
                            return;
                        };
                        let mut key_list = Vec::new();
                        let mut visited = HashSet::new();
                        if !self.extract_string_keys_exact(
                            key_ty,
                            in_global_scope,
                            &mut key_list,
                            &mut visited,
                        ) {
                            // Cannot statically prove which keys are kept/omitted; bail out
                            // conservatively so we never emit false positives.
                            return;
                        }
                        let key_set: HashSet<String> = key_list.into_iter().collect();
                        let is_omit = name == "Omit";
                        self.visit_filtered_base_type(base_ty, in_global_scope, |tag| {
                            if is_omit {
                                !key_set.contains(tag)
                            } else {
                                key_set.contains(tag)
                            }
                        });
                        return;
                    }
                    _ => {}
                }
            }
        }
        let mut segments = Vec::new();
        if !flatten_type_name(type_name, &mut segments) || segments.is_empty() {
            return;
        }
        self.resolve_type_path(&segments, in_global_scope);
    }

    /// Evaluates `base_ty` in an isolated snapshot and keeps only tags satisfying `keep`.
    /// If `base_ty` requires cross-file (`external_extends` / `ambient_extends`) resolution,
    /// rolls back conservatively so `Pick`/`Omit` can never leak un-filtered remote tags.
    fn visit_filtered_base_type(
        &mut self,
        base_ty: &'a TSType<'a>,
        in_global_scope: bool,
        keep: impl Fn(&str) -> bool,
    ) {
        let start_tags = self.tags.len();
        let prev_seen_tags = self.seen_tags.clone();
        let start_ext = self.external_extends.len();
        let prev_seen_ext = self.seen_external.clone();
        let start_amb = self.ambient_extends.len();
        let prev_seen_amb = self.seen_ambient.clone();
        let prev_visited = self.visited_local.clone();

        self.visit_ts_type(base_ty, in_global_scope);

        // Restore `visited_local` so diamond extends like `extends Omit<Base, 'b'>, Base` can
        // still visit `Base` cleanly afterwards.
        self.visited_local = prev_visited;

        if self.external_extends.len() > start_ext || self.ambient_extends.len() > start_amb {
            self.tags.truncate(start_tags);
            self.seen_tags = prev_seen_tags;
            self.external_extends.truncate(start_ext);
            self.seen_external = prev_seen_ext;
            self.ambient_extends.truncate(start_amb);
            self.seen_ambient = prev_seen_amb;
            return;
        }

        let added: Vec<String> = self.tags.drain(start_tags..).collect();
        self.seen_tags = prev_seen_tags;
        for tag in added {
            if keep(&tag) {
                push_unique_tag(&mut self.tags, &mut self.seen_tags, &tag);
            }
        }
    }

    /// Extracts string literal keys from `ty`, returning `true` only if the entire key type was
    /// statically resolved (returns `false` on `keyof`, imported aliases, generic params, etc.).
    fn extract_string_keys_exact(
        &self,
        ty: &'a TSType<'a>,
        in_global_scope: bool,
        out: &mut Vec<String>,
        visited_aliases: &mut HashSet<String>,
    ) -> bool {
        match ty {
            TSType::TSLiteralType(_) => {
                let Some(s) = extract_ts_literal_string(ty) else {
                    return false;
                };
                out.push(s);
                true
            }
            TSType::TSUnionType(union) => union.types.iter().all(|member| {
                self.extract_string_keys_exact(member, in_global_scope, out, visited_aliases)
            }),
            TSType::TSParenthesizedType(paren) => self.extract_string_keys_exact(
                &paren.type_annotation,
                in_global_scope,
                out,
                visited_aliases,
            ),
            TSType::TSTypeReference(type_ref) => {
                let TSTypeName::IdentifierReference(ident) = &type_ref.type_name else {
                    return false;
                };
                let name = ident.name.as_str();
                if self.is_active_type_param(name) {
                    return false;
                }
                if !visited_aliases.insert(name.to_string()) {
                    return true;
                }
                let Some((alias_ty, alias_in_global)) =
                    self.find_local_type_alias(name, in_global_scope)
                else {
                    return false;
                };
                self.extract_string_keys_exact(alias_ty, alias_in_global, out, visited_aliases)
            }
            TSType::TSTypeQuery(query) => {
                let oxc_ast::ast::TSTypeQueryExprName::IdentifierReference(ident) =
                    &query.expr_name
                else {
                    return false;
                };
                let Some(val) = self.lookup_const_string(ident.name.as_str(), in_global_scope)
                else {
                    return false;
                };
                out.push(val);
                true
            }
            _ => false,
        }
    }

    fn find_local_type_alias(
        &self,
        name: &str,
        in_global_scope: bool,
    ) -> Option<(&'a TSType<'a>, bool)> {
        let search_stmts = |stmts: &'a [Statement<'a>]| -> Option<&'a TSType<'a>> {
            for stmt in stmts {
                match stmt {
                    Statement::TSTypeAliasDeclaration(alias) if alias.id.name == name => {
                        return Some(&alias.type_annotation);
                    }
                    Statement::ExportDeclaration(export) => {
                        let Declaration::TSTypeAliasDeclaration(alias) = &export.declaration else {
                            continue;
                        };
                        if alias.id.name == name {
                            return Some(&alias.type_annotation);
                        }
                    }
                    _ => {}
                }
            }
            None
        };
        for &block in self.scope_stack.iter().rev() {
            if let Some(ty) = search_stmts(block) {
                return Some((ty, in_global_scope));
            }
        }
        let search_global = || -> Option<(&'a TSType<'a>, bool)> {
            if !self.is_module {
                if let Some(ty) = search_stmts(&self.program.body) {
                    return Some((ty, true));
                }
            }
            for stmt in &self.program.body {
                let Statement::TSGlobalDeclaration(g) = stmt else {
                    continue;
                };
                if let Some(ty) = search_stmts(&g.body.body) {
                    return Some((ty, true));
                }
            }
            None
        };
        if in_global_scope {
            search_global().or_else(|| {
                self.is_module
                    .then(|| search_stmts(&self.program.body).map(|ty| (ty, false)))
                    .flatten()
            })
        } else {
            search_stmts(&self.program.body)
                .map(|ty| (ty, false))
                .or_else(search_global)
        }
    }

    fn has_local_or_imported_binding(&self, name: &str) -> bool {
        if self.imports.contains_key(name) || self.is_active_type_param(name) {
            return true;
        }
        if self
            .scope_stack
            .iter()
            .any(|block| self.stmts_declare_type(block, name))
        {
            return true;
        }
        if self.stmts_declare_type(&self.program.body, name) {
            return true;
        }
        self.program.body.iter().any(|stmt| match stmt {
            Statement::TSGlobalDeclaration(g) => self.stmts_declare_type(&g.body.body, name),
            _ => false,
        })
    }

    fn stmts_declare_type(&self, stmts: &[Statement<'a>], target: &str) -> bool {
        stmts.iter().any(|stmt| match stmt {
            Statement::TSInterfaceDeclaration(iface) => iface.id.name == target,
            Statement::TSTypeAliasDeclaration(alias) => alias.id.name == target,
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::TSInterfaceDeclaration(iface) => iface.id.name == target,
                Declaration::TSTypeAliasDeclaration(alias) => alias.id.name == target,
                _ => false,
            },
            Statement::ExportDefaultDeclaration(export) => {
                matches!(
                    &export.declaration,
                    ExportDefaultDeclarationKind::TSInterfaceDeclaration(iface) if iface.id.name == target
                )
            }
            _ => false,
        })
    }

    fn visit_ts_type(&mut self, ty: &'a TSType<'a>, in_global_scope: bool) {
        match ty {
            TSType::TSTypeLiteral(lit) => {
                self.collect_tags_from_signatures(&lit.members, in_global_scope);
            }
            TSType::TSIntersectionType(inter) => {
                for member in &inter.types {
                    self.visit_ts_type(member, in_global_scope);
                }
            }
            TSType::TSParenthesizedType(paren) => {
                self.visit_ts_type(&paren.type_annotation, in_global_scope);
            }
            TSType::TSMappedType(mapped) => {
                if mapped.name_type.is_some() {
                    return;
                }
                if mapped.optional.is_some()
                    || mapped
                        .type_annotation
                        .as_ref()
                        .is_some_and(|ann| is_nullish_ts_type(ann))
                {
                    return;
                }
                let mut keys = Vec::new();
                let mut visited = HashSet::new();
                if self.extract_string_keys_exact(
                    &mapped.constraint,
                    in_global_scope,
                    &mut keys,
                    &mut visited,
                ) {
                    for key in keys {
                        push_unique_tag(&mut self.tags, &mut self.seen_tags, &key);
                    }
                }
            }
            TSType::TSImportType(import_type) => {
                let Some(qualifier) = &import_type.qualifier else {
                    return;
                };
                let mut segments = Vec::new();
                flatten_import_qualifier(qualifier, &mut segments);
                if !segments.is_empty() {
                    push_unique_external(
                        &mut self.external_extends,
                        &mut self.seen_external,
                        import_type.source.value.as_str(),
                        &segments.join("."),
                    );
                }
            }
            TSType::TSTypeReference(type_ref) => {
                self.visit_type_name_with_args(
                    &type_ref.type_name,
                    type_ref.type_arguments.as_deref(),
                    in_global_scope,
                );
            }
            _ => {}
        }
    }

    fn resolve_type_path(&mut self, segments: &[&str], in_global_scope: bool) {
        let Some(&first) = segments.first() else {
            return;
        };
        if self.is_active_type_param(first) {
            return;
        }
        let cache_key = (in_global_scope, self.scope_stack.len(), segments.join("."));
        if !self.visited_local.insert(cache_key) {
            return;
        }

        // 1. Search enclosing namespace / `declare module` scopes innermost-to-outermost.
        for idx in (0..self.scope_stack.len()).rev() {
            let block = self.scope_stack[idx];
            let found = if segments.len() == 1 {
                self.collect_direct_type_in_stmts(block, first, in_global_scope)
                    .is_found()
            } else {
                self.collect_qualified_in_stmts(block, segments, in_global_scope, false)
                    .is_found()
            };
            if found {
                return;
            }
        }

        if segments.len() == 1 {
            let name = first;
            if in_global_scope {
                // Inside `declare global` / script scope: check global declarations in this file
                // (recording global interfaces as ambient for cross-file declaration merging,
                // while skipping non-mergeable type aliases), else fall back to module-scope
                // locals / imports, else cross-file ambient declarations.
                let found_global = self.collect_type_in_global_blocks(name);
                if found_global.is_found() {
                    if found_global == FoundType::Interface && !is_builtin_global_type(name) {
                        push_unique_ambient(
                            &mut self.ambient_extends,
                            &mut self.seen_ambient,
                            vec![name.to_string()],
                        );
                    }
                    return;
                }
                if self.is_module
                    && self
                        .collect_direct_type_in_stmts(&self.program.body, name, false)
                        .is_found()
                {
                    return;
                }
                if self.is_module && self.try_record_imported_single(name) {
                    return;
                }
            } else {
                // In module scope: module-scope declarations and explicit imports shadow
                // ambient `declare global` declarations.
                if self
                    .collect_direct_type_in_stmts(&self.program.body, name, false)
                    .is_found()
                {
                    return;
                }
                if self.try_record_imported_single(name) {
                    return;
                }
                if self.collect_type_in_global_blocks(name) == FoundType::AliasOnly {
                    return;
                }
            }
            if !is_builtin_global_type(name) {
                push_unique_ambient(
                    &mut self.ambient_extends,
                    &mut self.seen_ambient,
                    vec![name.to_string()],
                );
            }
            return;
        }

        // Qualified type name `a.b.c`.
        let rest = &segments[1..];
        if in_global_scope {
            let found_global = self.collect_qualified_in_global_blocks(segments);
            if found_global.is_found() {
                if found_global == FoundType::Interface && !is_builtin_global_type(first) {
                    push_unique_ambient(
                        &mut self.ambient_extends,
                        &mut self.seen_ambient,
                        segments.iter().map(|s| (*s).to_string()).collect(),
                    );
                }
                return;
            }
            if self.is_module
                && (self
                    .collect_qualified_in_stmts(&self.program.body, segments, false, false)
                    .is_found()
                    || self.try_record_imported_qualified(first, rest))
            {
                return;
            }
        } else {
            if self
                .collect_qualified_in_stmts(&self.program.body, segments, false, false)
                .is_found()
                || self.try_record_imported_qualified(first, rest)
            {
                return;
            }
            if self.collect_qualified_in_global_blocks(segments) == FoundType::AliasOnly {
                return;
            }
        }
        if !is_builtin_global_type(first) {
            push_unique_ambient(
                &mut self.ambient_extends,
                &mut self.seen_ambient,
                segments.iter().map(|s| (*s).to_string()).collect(),
            );
        }
    }

    fn try_record_imported_single(&mut self, name: &str) -> bool {
        match self.imports.get(name) {
            Some(ImportedBinding::Named(spec, exported)) => {
                push_unique_external(
                    &mut self.external_extends,
                    &mut self.seen_external,
                    spec,
                    exported,
                );
                true
            }
            Some(ImportedBinding::ImportEquals(spec)) => {
                push_unique_external(
                    &mut self.external_extends,
                    &mut self.seen_external,
                    spec,
                    EXPORT_EQUALS_SENTINEL,
                );
                true
            }
            _ => false,
        }
    }

    fn try_record_imported_qualified(&mut self, first: &str, rest: &[&str]) -> bool {
        match self.imports.get(first) {
            Some(ImportedBinding::Namespace(spec) | ImportedBinding::ImportEquals(spec)) => {
                push_unique_external(
                    &mut self.external_extends,
                    &mut self.seen_external,
                    spec,
                    &rest.join("."),
                );
                true
            }
            Some(ImportedBinding::Named(spec, exported)) => {
                let path = format!("{exported}.{}", rest.join("."));
                push_unique_external(
                    &mut self.external_extends,
                    &mut self.seen_external,
                    spec,
                    &path,
                );
                true
            }
            None => false,
        }
    }

    fn collect_type_in_global_blocks(&mut self, target: &str) -> FoundType {
        let mut found = FoundType::None;
        if !self.is_module {
            found =
                found.merge(self.collect_direct_type_in_stmts(&self.program.body, target, true));
        }
        for stmt in &self.program.body {
            match stmt {
                Statement::TSGlobalDeclaration(global_decl) => {
                    found = found.merge(self.collect_direct_type_in_stmts(
                        &global_decl.body.body,
                        target,
                        true,
                    ));
                }
                Statement::TSExternalModuleDeclaration(mod_decl) => {
                    let Some(block) = &mod_decl.body else {
                        continue;
                    };
                    self.scope_stack.push(&block.body);
                    for inner in &block.body {
                        let Statement::TSGlobalDeclaration(global_decl) = inner else {
                            continue;
                        };
                        found = found.merge(self.collect_direct_type_in_stmts(
                            &global_decl.body.body,
                            target,
                            true,
                        ));
                    }
                    self.scope_stack.pop();
                }
                _ => {}
            }
        }
        found
    }

    fn collect_qualified_in_global_blocks(&mut self, segments: &[&str]) -> FoundType {
        let mut found = FoundType::None;
        if !self.is_module {
            found = found.merge(self.collect_qualified_in_stmts(
                &self.program.body,
                segments,
                true,
                false,
            ));
        }
        for stmt in &self.program.body {
            match stmt {
                Statement::TSGlobalDeclaration(global_decl) => {
                    found = found.merge(self.collect_qualified_in_stmts(
                        &global_decl.body.body,
                        segments,
                        true,
                        false,
                    ));
                }
                Statement::TSExternalModuleDeclaration(mod_decl) => {
                    let Some(block) = &mod_decl.body else {
                        continue;
                    };
                    self.scope_stack.push(&block.body);
                    for inner in &block.body {
                        let Statement::TSGlobalDeclaration(global_decl) = inner else {
                            continue;
                        };
                        found = found.merge(self.collect_qualified_in_stmts(
                            &global_decl.body.body,
                            segments,
                            true,
                            false,
                        ));
                    }
                    self.scope_stack.pop();
                }
                _ => {}
            }
        }
        found
    }

    fn collect_qualified_in_stmts(
        &mut self,
        stmts: &'a [Statement<'a>],
        segments: &[&str],
        in_global_scope: bool,
        exported_only: bool,
    ) -> FoundType {
        let Some((&target, ns_path)) = segments.split_last() else {
            return FoundType::None;
        };
        let mut blocks = Vec::new();
        collect_namespace_blocks(stmts, ns_path, exported_only, &mut blocks);
        let mut found = FoundType::None;
        for block_stmts in blocks {
            self.scope_stack.push(block_stmts);
            found = found.merge(self.collect_direct_type_in_stmts(
                block_stmts,
                target,
                in_global_scope,
            ));
            self.scope_stack.pop();
        }
        found
    }

    fn collect_direct_type_in_stmts(
        &mut self,
        stmts: &'a [Statement<'a>],
        target: &str,
        in_global_scope: bool,
    ) -> FoundType {
        let mut found = FoundType::None;
        for stmt in stmts {
            match stmt {
                Statement::TSInterfaceDeclaration(iface) if iface.id.name == target => {
                    found = found.merge(FoundType::Interface);
                    self.visit_interface(iface, in_global_scope);
                }
                Statement::TSTypeAliasDeclaration(alias) if alias.id.name == target => {
                    found = found.merge(FoundType::AliasOnly);
                    self.visit_type_alias(alias, in_global_scope);
                }
                Statement::ExportDeclaration(export) => match &export.declaration {
                    Declaration::TSInterfaceDeclaration(iface) if iface.id.name == target => {
                        found = found.merge(FoundType::Interface);
                        self.visit_interface(iface, in_global_scope);
                    }
                    Declaration::TSTypeAliasDeclaration(alias) if alias.id.name == target => {
                        found = found.merge(FoundType::AliasOnly);
                        self.visit_type_alias(alias, in_global_scope);
                    }
                    _ => {}
                },
                Statement::ExportDefaultDeclaration(export) => {
                    let ExportDefaultDeclarationKind::TSInterfaceDeclaration(iface) =
                        &export.declaration
                    else {
                        continue;
                    };
                    if iface.id.name == target {
                        found = found.merge(FoundType::Interface);
                        self.visit_interface(iface, in_global_scope);
                    }
                }
                _ => {}
            }
        }
        found
    }

    fn collect_exported_type_in_stmts(&mut self, stmts: &'a [Statement<'a>], exported_path: &str) {
        let segments: Vec<&str> = exported_path.split('.').collect();
        if segments.len() > 1 {
            let mut found = self
                .collect_qualified_in_stmts(stmts, &segments, false, true)
                .is_found();
            let root = segments[0];
            let rest = segments[1..].join(".");
            for stmt in stmts {
                match stmt {
                    Statement::ExportNamedDeclaration(export) => {
                        for spec in &export.specifiers {
                            if spec.exported.name() == root {
                                found = true;
                                let mut remapped = vec![spec.local.name().as_str()];
                                remapped.extend_from_slice(&segments[1..]);
                                self.resolve_type_path(&remapped, false);
                            }
                        }
                    }
                    Statement::ExportFromDeclaration(export) => {
                        for spec in &export.specifiers {
                            if spec.exported.name() == root {
                                found = true;
                                let target = format!("{}.{rest}", spec.local.name());
                                push_unique_external(
                                    &mut self.external_extends,
                                    &mut self.seen_external,
                                    export.source.value.as_str(),
                                    &target,
                                );
                            }
                        }
                    }
                    Statement::ExportAllDeclaration(export) => {
                        if let Some(exported_alias) = &export.exported {
                            if exported_alias.name() == root {
                                found = true;
                                push_unique_external(
                                    &mut self.external_extends,
                                    &mut self.seen_external,
                                    export.source.value.as_str(),
                                    &rest,
                                );
                            }
                        }
                    }
                    _ => {}
                }
            }
            if !found {
                for stmt in stmts {
                    let Statement::ExportAllDeclaration(export) = stmt else {
                        continue;
                    };
                    if export.exported.is_none() {
                        push_unique_external(
                            &mut self.external_extends,
                            &mut self.seen_external,
                            export.source.value.as_str(),
                            exported_path,
                        );
                    }
                }
            }
            return;
        }

        let exported_name = exported_path;
        let mut found_direct = false;

        for stmt in stmts {
            match stmt {
                Statement::TSExportAssignment(assign)
                    if exported_name == EXPORT_EQUALS_SENTINEL || exported_name == "default" =>
                {
                    if let Expression::Identifier(ident) = &assign.expression {
                        found_direct = true;
                        self.resolve_type_path(&[ident.name.as_str()], false);
                    }
                }
                Statement::ExportDeclaration(export) => match &export.declaration {
                    Declaration::TSInterfaceDeclaration(iface)
                        if iface.id.name == exported_name =>
                    {
                        found_direct = true;
                        self.visit_interface(iface, false);
                    }
                    Declaration::TSTypeAliasDeclaration(alias)
                        if alias.id.name == exported_name =>
                    {
                        found_direct = true;
                        self.visit_type_alias(alias, false);
                    }
                    _ => {}
                },
                Statement::ExportDefaultDeclaration(export) if exported_name == "default" => {
                    match &export.declaration {
                        ExportDefaultDeclarationKind::TSInterfaceDeclaration(iface) => {
                            found_direct = true;
                            self.visit_interface(iface, false);
                        }
                        ExportDefaultDeclarationKind::Identifier(ident) => {
                            found_direct = true;
                            self.resolve_type_path(&[ident.name.as_str()], false);
                        }
                        _ => {}
                    }
                }
                Statement::ExportNamedDeclaration(export) => {
                    for spec in &export.specifiers {
                        if spec.exported.name() == exported_name {
                            found_direct = true;
                            self.resolve_type_path(&[spec.local.name().as_str()], false);
                        }
                    }
                }
                Statement::ExportFromDeclaration(export) => {
                    for spec in &export.specifiers {
                        if spec.exported.name() == exported_name {
                            found_direct = true;
                            push_unique_external(
                                &mut self.external_extends,
                                &mut self.seen_external,
                                export.source.value.as_str(),
                                spec.local.name().as_str(),
                            );
                        }
                    }
                }
                _ => {}
            }
        }

        // If not declared or explicitly re-exported, forward through `export * from '...'`.
        if !found_direct {
            for stmt in stmts {
                let Statement::ExportAllDeclaration(export) = stmt else {
                    continue;
                };
                if export.exported.is_none() {
                    push_unique_external(
                        &mut self.external_extends,
                        &mut self.seen_external,
                        export.source.value.as_str(),
                        exported_name,
                    );
                }
            }
        }
    }
}

fn visit_global_tag_name_maps_in_stmts<'a>(
    stmts: &'a [Statement<'a>],
    collector: &mut FileTypeCollector<'a>,
) {
    for stmt in stmts {
        let Statement::TSInterfaceDeclaration(iface) = stmt else {
            continue;
        };
        if iface.id.name == "HTMLElementTagNameMap" {
            collector.visit_interface(iface, /* in_global_scope */ true);
        }
    }
}

/// Extract custom element tag contributions declared on global `HTMLElementTagNameMap`
/// augmentations in `program`.
pub(crate) fn extract_custom_element_contributions(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
    source_text: &str,
    is_module_by_extension: bool,
) -> CustomElementTagContributions {
    if !source_text.contains("HTMLElementTagNameMap") {
        return CustomElementTagContributions::default();
    }

    let mut collector = FileTypeCollector::new(program, module_record, is_module_by_extension);

    if !collector.is_module {
        visit_global_tag_name_maps_in_stmts(&program.body, &mut collector);
    }

    for stmt in &program.body {
        match stmt {
            Statement::TSGlobalDeclaration(global_decl) => {
                visit_global_tag_name_maps_in_stmts(&global_decl.body.body, &mut collector);
            }
            Statement::TSExternalModuleDeclaration(mod_decl) => {
                let Some(block) = &mod_decl.body else {
                    continue;
                };
                collector.scope_stack.push(&block.body);
                for inner in &block.body {
                    let Statement::TSGlobalDeclaration(global_decl) = inner else {
                        continue;
                    };
                    visit_global_tag_name_maps_in_stmts(&global_decl.body.body, &mut collector);
                }
                collector.scope_stack.pop();
            }
            _ => {}
        }
    }

    collector.finish()
}

/// Extract custom element tag contributions from an exported interface, type alias, or namespace
/// member (`exported_path`, which may be dotted like `Ns.CustomTagMap`) in `program`.
pub(crate) fn extract_tags_from_exported_type(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
    exported_path: &str,
    is_module_by_extension: bool,
) -> CustomElementTagContributions {
    let mut collector = FileTypeCollector::new(program, module_record, is_module_by_extension);
    collector.collect_exported_type_in_stmts(&program.body, exported_path);
    collector.finish()
}

/// Extract custom element tag contributions from an exported type inside an ambient
/// `declare module 'module_specifier' { ... }` block in `program`.
pub(crate) fn extract_tags_from_ambient_module_export(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
    module_specifier: &str,
    exported_path: &str,
    is_module_by_extension: bool,
) -> CustomElementTagContributions {
    let mut collector = FileTypeCollector::new(program, module_record, is_module_by_extension);
    for stmt in &program.body {
        let Statement::TSExternalModuleDeclaration(mod_decl) = stmt else {
            continue;
        };
        if mod_decl.id.value.as_str() != module_specifier {
            continue;
        }
        let Some(block) = &mod_decl.body else {
            continue;
        };
        collector.scope_stack.push(&block.body);
        collector.collect_exported_type_in_stmts(&block.body, exported_path);
        collector.scope_stack.pop();
    }
    collector.finish()
}

/// Extract custom element tag contributions from an ambient global interface, type alias, or
/// namespace member (e.g. `["google", "maps", "HTMLElementTagNameMap"]` or `["MyTagMap"]`)
/// declared in global scope within `program`.
pub(crate) fn extract_tags_from_ambient_type(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
    path: &[&str],
    is_module_by_extension: bool,
) -> CustomElementTagContributions {
    if path.is_empty() {
        return CustomElementTagContributions::default();
    }
    let mut collector = FileTypeCollector::new(program, module_record, is_module_by_extension);
    if path.len() == 1 {
        collector.collect_type_in_global_blocks(path[0]);
    } else {
        collector.collect_qualified_in_global_blocks(path);
    }
    collector.finish()
}

struct ImportTypeCollector {
    specifiers: Vec<String>,
    seen: HashSet<String>,
}

impl<'a> Visit<'a> for ImportTypeCollector {
    fn visit_ts_import_type(&mut self, it: &TSImportType<'a>) {
        let spec = it.source.value.as_str();
        if self.seen.insert(spec.to_string()) {
            self.specifiers.push(spec.to_string());
        }
        oxc_ast_visit::walk::walk_ts_import_type(self, it);
    }
}

/// Extract static, `import = require(...)`, and `import(...)` module specifiers referenced by a
/// `.d.ts` file (used to follow transitive `.d.ts` barrels such as `import '@material/web/all.js'`).
pub(crate) fn extract_dts_import_specifiers(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
    source_text: &str,
) -> Vec<String> {
    let mut specifiers = Vec::new();
    let mut seen = HashSet::new();
    for atom in module_record.requested_modules.keys() {
        let s = atom.as_str();
        if seen.insert(s.to_string()) {
            specifiers.push(s.to_string());
        }
    }
    let mut collect_import_equals = |stmts: &[Statement<'_>]| {
        for stmt in stmts {
            let decl = match stmt {
                Statement::TSImportEqualsDeclaration(decl) => decl.as_ref(),
                Statement::ExportDeclaration(export) => match &export.declaration {
                    Declaration::TSImportEqualsDeclaration(decl) => decl.as_ref(),
                    _ => continue,
                },
                _ => continue,
            };
            if let TSModuleReference::ExternalModuleReference(ext) = &decl.module_reference {
                let s = ext.expression.value.as_str();
                if seen.insert(s.to_string()) {
                    specifiers.push(s.to_string());
                }
            }
        }
    };
    collect_import_equals(&program.body);
    for stmt in &program.body {
        if let Statement::TSExternalModuleDeclaration(mod_decl) = stmt {
            if let Some(block) = &mod_decl.body {
                collect_import_equals(&block.body);
            }
        }
    }
    if source_text.contains("import(") {
        let mut visitor = ImportTypeCollector { specifiers, seen };
        visitor.visit_program(program);
        return visitor.specifiers;
    }
    specifiers
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    fn extract(source: &str, is_dts: bool) -> CustomElementTagContributions {
        extract_with_ext(source, is_dts, false)
    }

    fn extract_with_ext(
        source: &str,
        is_dts: bool,
        is_module_by_extension: bool,
    ) -> CustomElementTagContributions {
        let allocator = Allocator::default();
        let source_type = if is_dts {
            SourceType::d_ts()
        } else {
            SourceType::ts()
        };
        let ret = Parser::new(&allocator, source, source_type).parse();
        extract_custom_element_contributions(
            &ret.program,
            &ret.module_record,
            source,
            is_module_by_extension,
        )
    }

    #[test]
    fn extracts_declare_global_in_module_ts_and_dts() {
        let src = r#"
            export class MyWidgetElement extends HTMLElement {}
            declare global {
              interface HTMLElementTagNameMap {
                'my-widget': MyWidgetElement;
                'My-Upper': HTMLElement;
                '-bad-leading-dash': HTMLElement;
                '1-bad-digit': HTMLElement;
                'opt-widget'?: MyWidgetElement;
                'nullish-widget': MyWidgetElement | undefined;
                div: HTMLDivElement;
              }
            }
        "#;
        assert_eq!(extract(src, false).tags, vec!["my-widget"]);
        assert_eq!(extract(src, true).tags, vec!["my-widget"]);
    }

    #[test]
    fn extracts_top_level_script_interface_and_ignores_module_scoped_and_dmts() {
        let script = r#"
            interface HTMLElementTagNameMap {
              'script-el': HTMLElement;
            }
        "#;
        assert_eq!(extract(script, true).tags, vec!["script-el"]);
        // `.d.mts` / `.d.cts` are always external modules even without `import`/`export`.
        assert!(extract_with_ext(script, true, true).tags.is_empty());

        let module = r#"
            export interface HTMLElementTagNameMap {
              'local-only': HTMLElement;
            }
        "#;
        assert!(extract(module, false).tags.is_empty());
        assert!(extract(module, true).tags.is_empty());
    }

    #[test]
    fn extracts_ambient_module_global_block_with_enclosing_module_scope() {
        let src = r#"
            declare module 'some-pkg' {
              interface PkgTags {
                'pkg-sibling': HTMLElement;
              }
              const PKG_TAG = 'pkg-const';
              global {
                interface HTMLElementTagNameMap extends PkgTags {
                  'ambient-el': HTMLElement;
                  [PKG_TAG]: HTMLElement;
                }
              }
            }
        "#;
        assert_eq!(
            extract(src, true).tags,
            vec!["ambient-el", "pkg-const", "pkg-sibling"]
        );
    }

    #[test]
    fn resolves_local_and_records_external_extends() {
        let src = r#"
            import {RemoteTags} from './remote';
            import * as Ns from './ns';
            import Cjs = require('./cjs');
            interface LocalTags {
              'local-el': HTMLElement;
            }
            type AliasTags = { 'alias-el': HTMLElement } & LocalTags;
            declare global {
              interface HTMLElementTagNameMap extends AliasTags, RemoteTags, Ns.Tags, Cjs, Cjs.Sub {}
            }
        "#;
        let res = extract(src, false);
        assert_eq!(res.tags, vec!["alias-el", "local-el"]);
        assert_eq!(
            res.external_extends,
            vec![
                ("./remote".to_string(), "RemoteTags".to_string()),
                ("./ns".to_string(), "Tags".to_string()),
                ("./cjs".to_string(), EXPORT_EQUALS_SENTINEL.to_string()),
                ("./cjs".to_string(), "Sub".to_string()),
            ]
        );
    }

    #[test]
    fn resolves_nested_ambient_namespace_with_sibling_extends_and_cross_file_merge() {
        let src = r#"
            declare namespace google.maps {
              interface CoreTags {
                'gmp-core': HTMLElement;
              }
              interface HTMLElementTagNameMap extends CoreTags {
                'gmp-map': HTMLElement;
              }
            }
            interface HTMLElementTagNameMap
              extends google.maps.HTMLElementTagNameMap, external.ns.Map {}
        "#;
        let res = extract(src, true);
        assert_eq!(res.tags, vec!["gmp-map", "gmp-core"]);
        assert_eq!(
            res.ambient_extends,
            vec![
                vec![
                    "google".to_string(),
                    "maps".to_string(),
                    "HTMLElementTagNameMap".to_string(),
                ],
                vec!["external".to_string(), "ns".to_string(), "Map".to_string()],
            ]
        );
    }

    #[test]
    fn resolves_sound_const_and_rejects_widened_keys() {
        let src = r#"
            const WIDGET_TAG = 'const-widget' as const;
            const WIDENED_TAG: string = 'widened-bad';
            const CAST_WIDENED = 'cast-bad' as string;
            const CAST_RENAMED = 'orig-bad' as 'renamed-good';
            const PLAIN_OBJ = { Bad: 'plain-bad' };
            const CONST_OBJ = { Good: 'const-obj-good' } as const;
            declare const DECL_TAG: 'decl-widget';
            declare const DECL_OBJ: { readonly Typed: 'decl-obj-good' };
            enum CustomTags {
              Banner = 'enum-banner',
            }
            declare global {
              interface HTMLElementTagNameMap {
                [WIDGET_TAG]: HTMLElement;
                [WIDENED_TAG]: HTMLElement;
                [CAST_WIDENED]: HTMLElement;
                [CAST_RENAMED]: HTMLElement;
                [PLAIN_OBJ.Bad]: HTMLElement;
                [CONST_OBJ.Good]: HTMLElement;
                [DECL_TAG]: HTMLElement;
                [DECL_OBJ.Typed]: HTMLElement;
                [CustomTags.Banner]: HTMLElement;
              }
            }
        "#;
        assert_eq!(
            extract(src, false).tags,
            vec![
                "const-widget",
                "renamed-good",
                "const-obj-good",
                "decl-widget",
                "decl-obj-good",
                "enum-banner",
            ]
        );
    }

    #[test]
    fn resolves_sound_utility_mapped_and_import_types_and_bails_on_unsound_omit() {
        let src = r#"
            import {RemoteMap, DropKey} from './remote';
            type TagNames = 'rec-a' | 'rec-b';
            type RecTags = Record<TagNames, HTMLElement>;
            type MappedTags = { [K in 'mapped-a' | 'mapped-b']: HTMLElement };
            interface Base { 'keep-el': HTMLElement; 'drop-el': HTMLElement; }
            type OmittedTags = Omit<Base, 'drop-el'>;
            type UnsoundOmitExternal = Omit<RemoteMap, 'drop-el'>;
            type UnsoundOmitDynamicKey = Omit<Base, DropKey>;
            type PartialSkipped = Partial<{ 'partial-skip': HTMLElement }>;
            type ImportedTags = import('./remote').Ns.RemoteMap;
            declare global {
              interface HTMLElementTagNameMap
                extends Required<RecTags>,
                  Readonly<MappedTags>,
                  OmittedTags,
                  Base,
                  UnsoundOmitExternal,
                  UnsoundOmitDynamicKey,
                  PartialSkipped,
                  ImportedTags {}
            }
        "#;
        let res = extract(src, false);
        // `OmittedTags` keeps 'keep-el', and the subsequent `Base` (diamond extends) still adds 'drop-el'.
        // Neither `UnsoundOmitExternal` nor `PartialSkipped` leaks any tags or external extends.
        assert_eq!(
            res.tags,
            vec!["rec-a", "rec-b", "mapped-a", "mapped-b", "keep-el", "drop-el"]
        );
        assert_eq!(
            res.external_extends,
            vec![("./remote".to_string(), "Ns.RemoteMap".to_string())]
        );
    }

    #[test]
    fn does_not_leak_generic_type_params_into_ambient_extends() {
        let src = r#"
            export {};
            interface Wrap<T> extends T {
              'wrap-el': HTMLElement;
            }
            type MapOf<K extends string> = Record<K, HTMLElement>;
            declare global {
              interface HTMLElementTagNameMap extends Wrap<{ 'inner-el': HTMLElement }>, MapOf<'k-el'> {}
            }
        "#;
        let res = extract(src, false);
        assert_eq!(res.tags, vec!["wrap-el"]);
        assert!(
            res.ambient_extends.is_empty(),
            "generic type params must not leak into ambient_extends: {:?}",
            res.ambient_extends
        );

        // Even in script scope, a global `type` alias cannot declaration-merge across files and
        // its generic parameter must not leak into `ambient_extends`.
        let script_src = r#"
            type MapOf<K extends string> = Record<K, HTMLElement>;
            interface HTMLElementTagNameMap extends MapOf<'k-el'> {}
        "#;
        let script_res = extract(script_src, false);
        assert!(
            script_res.ambient_extends.is_empty(),
            "global type alias and type param must not leak into ambient_extends: {:?}",
            script_res.ambient_extends
        );
    }

    #[test]
    fn respects_module_import_shadowing_over_declare_global() {
        let src = r#"
            import {Base} from './external';
            interface LocalBase extends Base {}
            declare global {
              interface Base {
                'wrong-global': HTMLElement;
              }
              interface HTMLElementTagNameMap extends LocalBase {}
            }
        "#;
        let res = extract(src, false);
        assert!(res.tags.is_empty());
        assert_eq!(
            res.external_extends,
            vec![("./external".to_string(), "Base".to_string())]
        );
    }

    #[test]
    fn extracts_triple_slash_references_with_inline_block_comments() {
        let src = r#"
            /* license */ /// <reference path="./inline.d.ts" />
            /* multi
               line */
            /// <reference path="./extra.d.ts" />
            /// <reference types='google.maps' />
            /* comment before code */ export declare class Foo {}
            /// <reference path="./ignored-after-code.d.ts" />
        "#;
        let refs = extract_triple_slash_references(src);
        assert_eq!(refs.paths, vec!["./inline.d.ts", "./extra.d.ts"]);
        assert_eq!(refs.types, vec!["google.maps"]);
    }
}
