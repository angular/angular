//! Extracts custom element tag names declared on TypeScript's global
//! `HTMLElementTagNameMap` interface.
//!
//! Mirrors `collectKnownCustomElements` in `ngtsc` (`packages/compiler-cli/src/ngtsc/typecheck/src/checker.ts`):
//! collects lowercase tag names containing `-` from global `HTMLElementTagNameMap` declarations,
//! including `declare global { interface HTMLElementTagNameMap { ... } }`, top-level script
//! declarations, ambient module `global { ... }` blocks, `extends` heritage clauses (including
//! local/imported/ambient namespaces, utility/mapped types, and `import()` types), computed `const`
//! / `enum` string keys, and `/// <reference ... />` directives.

use std::borrow::Cow;
use std::collections::{HashMap, HashSet};

use oxc_ast::ast::{
    Declaration, ExportDefaultDeclarationKind, Expression, Program, PropertyKey, Statement,
    TSEnumDeclaration, TSEnumMemberName, TSImportTypeQualifier, TSInterfaceDeclaration, TSLiteral,
    TSModuleReference, TSNamespaceDeclaration, TSNamespaceDeclarationBody, TSSignature, TSType,
    TSTypeName, TSTypeParameterInstantiation, VariableDeclarationKind,
};
use oxc_syntax::module_record::{ImportImportName, ModuleRecord};

use super::utils::{extract_literal_string, extract_property_key};

/// Custom element tag contributions discovered in a single `.ts` or `.d.ts` file.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub(crate) struct CustomElementTagContributions {
    /// Lowercase custom element tag names containing `-` declared directly on global
    /// `HTMLElementTagNameMap` (or inherited from same-file interfaces/type aliases/namespaces).
    pub tags: Vec<String>,
    /// Imported base types referenced in `HTMLElementTagNameMap extends ...` as
    /// `(module_specifier, exported_path)` (where `exported_path` may be dotted, e.g. `Ns.Tags`)
    /// for cross-file resolution by the query engine.
    pub external_extends: Vec<(String, String)>,
    /// Unresolved ambient/global type paths (e.g. `["google", "maps", "HTMLElementTagNameMap"]`
    /// or `["MyAmbientTagMap"]`) that may be declared in another ambient `.d.ts` or script file.
    pub ambient_extends: Vec<Vec<String>>,
}

impl CustomElementTagContributions {
    pub(crate) fn is_empty(&self) -> bool {
        self.tags.is_empty() && self.external_extends.is_empty() && self.ambient_extends.is_empty()
    }
}

/// Triple-slash `/// <reference path="..." />` and `/// <reference types="..." />` directives
/// extracted from the top of a `.ts` or `.d.ts` file without invoking the JS/TS parser.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub(crate) struct TripleSlashReferences {
    pub paths: Vec<String>,
    pub types: Vec<String>,
}

impl TripleSlashReferences {
    pub(crate) fn is_empty(&self) -> bool {
        self.paths.is_empty() && self.types.is_empty()
    }
}

/// Single-pass scan result for a `.d.ts` file, cached by `(path, SourceKey)` in
/// `shared_dts_parse_cache`.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub(crate) struct DtsCustomElementScan {
    pub contributions: CustomElementTagContributions,
    /// Static / `import = require(...)` module specifiers imported or re-exported by this `.d.ts`.
    pub import_specifiers: Vec<String>,
    /// Triple-slash `/// <reference path/types ... />` directives at the top of this `.d.ts`.
    pub references: TripleSlashReferences,
}

/// Whether `name` is a candidate custom element tag name matching `ngtsc`'s
/// `HTMLElementTagNameMap` filter (`prop.name.includes('-') && prop.name === prop.name.toLowerCase()`).
fn is_custom_element_tag(name: &str) -> bool {
    name.contains('-') && name.to_lowercase() == name
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
        if !value.is_empty() {
            return Some(value);
        }
        return None;
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
        if in_block_comment {
            if let Some(end) = line.find("*/") {
                in_block_comment = false;
                line = line[end + 2..].trim();
                if line.is_empty() {
                    continue;
                }
            } else {
                continue;
            }
        }
        if line.is_empty() {
            continue;
        }
        if let Some(after_open) = line.strip_prefix("/*") {
            if !after_open.contains("*/") {
                in_block_comment = true;
            }
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
    }
    refs
}

fn unwrap_literal_string_expr(expr: &Expression<'_>) -> Option<String> {
    match expr {
        Expression::TSAsExpression(as_expr) => unwrap_literal_string_expr(&as_expr.expression),
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
                    let val = declarator
                        .init
                        .as_ref()
                        .and_then(unwrap_literal_string_expr)
                        .or_else(|| {
                            declarator
                                .type_annotation
                                .as_ref()
                                .and_then(|ann| extract_ts_literal_string(&ann.type_annotation))
                        });
                    if let Some(val) = val {
                        out.insert(ident.name.to_string(), val);
                        continue;
                    }
                    // Also handle `const TAGS = { Foo: 'my-foo' } as const` and
                    // `declare const TAGS: { readonly Foo: 'my-foo' }`.
                    if let Some(init) = &declarator.init {
                        collect_const_object_expr_strings(ident.name.as_str(), init, out);
                    }
                    if let Some(ann) = &declarator.type_annotation {
                        collect_const_object_type_strings(
                            ident.name.as_str(),
                            &ann.type_annotation,
                            out,
                        );
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

fn collect_const_object_expr_strings(
    obj_name: &str,
    expr: &Expression<'_>,
    out: &mut HashMap<String, String>,
) {
    let unwrapped = match expr {
        Expression::ParenthesizedExpression(p) => &p.expression,
        Expression::TSAsExpression(a) => &a.expression,
        Expression::TSSatisfiesExpression(s) => &s.expression,
        other => other,
    };
    let Expression::ObjectExpression(obj) = unwrapped else {
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
}

fn build_import_lookup<'a>(
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
    out: &mut Vec<&'a [Statement<'a>]>,
) {
    let Some((&first, rest)) = ns_path.split_first() else {
        return;
    };
    for stmt in stmts {
        let decl = match stmt {
            Statement::TSNamespaceDeclaration(decl) => decl.as_ref(),
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
            collect_namespace_blocks(&block.body, rest, out);
        }
        (TSNamespaceDeclarationBody::TSNamespaceDeclaration(_), None) => {}
    }
}

struct FileTypeCollector<'a> {
    program: &'a Program<'a>,
    is_module: bool,
    imports: HashMap<&'a str, ImportedBinding<'a>>,
    const_strings: HashMap<String, String>,
    tags: Vec<String>,
    seen_tags: HashSet<String>,
    external_extends: Vec<(String, String)>,
    seen_external: HashSet<(String, String)>,
    ambient_extends: Vec<Vec<String>>,
    seen_ambient: HashSet<Vec<String>>,
    visited_local: HashSet<(bool, String)>,
}

impl<'a> FileTypeCollector<'a> {
    fn new(program: &'a Program<'a>, module_record: &'a ModuleRecord<'a>) -> Self {
        let is_module = crate::query::engine::is_external_module_dts(program, module_record);
        let mut const_strings = HashMap::new();
        collect_const_strings_in_stmts(&program.body, &mut const_strings);
        for stmt in &program.body {
            if let Statement::TSGlobalDeclaration(global_decl) = stmt {
                collect_const_strings_in_stmts(&global_decl.body.body, &mut const_strings);
            }
        }
        Self {
            program,
            is_module,
            imports: build_import_lookup(module_record),
            const_strings,
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

    fn extract_signature_key(
        &self,
        key: &'a PropertyKey<'a>,
        computed: bool,
    ) -> Option<Cow<'a, str>> {
        if !computed {
            return extract_property_key(key);
        }
        if let Some(static_name) = key.static_name() {
            return Some(static_name);
        }
        match key {
            PropertyKey::Identifier(ident) => self
                .const_strings
                .get(ident.name.as_str())
                .cloned()
                .map(Cow::Owned),
            PropertyKey::StaticMemberExpression(mem) => {
                let Expression::Identifier(obj) = &mem.object else {
                    return None;
                };
                let lookup = format!("{}.{}", obj.name, mem.property.name);
                self.const_strings.get(&lookup).cloned().map(Cow::Owned)
            }
            _ => None,
        }
    }

    fn collect_tags_from_signatures(&mut self, signatures: &[TSSignature<'a>]) {
        for sig in signatures {
            let TSSignature::TSPropertySignature(prop) = sig else {
                continue;
            };
            let Some(name) = self.extract_signature_key(&prop.key, prop.computed) else {
                continue;
            };
            push_unique_tag(&mut self.tags, &mut self.seen_tags, &name);
        }
    }

    fn visit_interface(&mut self, iface: &TSInterfaceDeclaration<'a>, in_global_scope: bool) {
        self.collect_tags_from_signatures(&iface.body.body);
        for heritage in &iface.extends {
            self.visit_type_name_with_args(
                &heritage.type_name,
                heritage.type_arguments.as_deref(),
                in_global_scope,
            );
        }
    }

    fn visit_type_name_with_args(
        &mut self,
        type_name: &TSTypeName<'a>,
        type_arguments: Option<&TSTypeParameterInstantiation<'a>>,
        in_global_scope: bool,
    ) {
        if let (TSTypeName::IdentifierReference(ident), Some(args)) = (type_name, type_arguments) {
            let name = ident.name.as_str();
            if !self.has_local_or_imported_binding(name) {
                match name {
                    "Partial" | "Required" | "Readonly" => {
                        if let Some(first) = args.params.first() {
                            self.visit_ts_type(first, in_global_scope);
                            return;
                        }
                    }
                    "Record" => {
                        if let Some(key_ty) = args.params.first() {
                            let mut keys = Vec::new();
                            let mut visited = HashSet::new();
                            self.extract_string_keys_from_type(
                                key_ty,
                                in_global_scope,
                                &mut keys,
                                &mut visited,
                            );
                            for key in keys {
                                push_unique_tag(&mut self.tags, &mut self.seen_tags, &key);
                            }
                            return;
                        }
                    }
                    "Pick" => {
                        if let Some(key_ty) = args.params.get(1) {
                            let mut keys = Vec::new();
                            let mut visited = HashSet::new();
                            self.extract_string_keys_from_type(
                                key_ty,
                                in_global_scope,
                                &mut keys,
                                &mut visited,
                            );
                            for key in keys {
                                push_unique_tag(&mut self.tags, &mut self.seen_tags, &key);
                            }
                            return;
                        }
                    }
                    "Omit" => {
                        if let (Some(base_ty), Some(key_ty)) =
                            (args.params.first(), args.params.get(1))
                        {
                            let mut excluded = Vec::new();
                            let mut visited = HashSet::new();
                            self.extract_string_keys_from_type(
                                key_ty,
                                in_global_scope,
                                &mut excluded,
                                &mut visited,
                            );
                            let excluded_set: HashSet<String> = excluded.into_iter().collect();
                            let start_len = self.tags.len();
                            let prev_seen = self.seen_tags.clone();
                            self.visit_ts_type(base_ty, in_global_scope);
                            if !excluded_set.is_empty() {
                                let added: Vec<String> = self.tags.drain(start_len..).collect();
                                self.seen_tags = prev_seen;
                                for tag in added {
                                    if !excluded_set.contains(&tag) {
                                        push_unique_tag(&mut self.tags, &mut self.seen_tags, &tag);
                                    }
                                }
                            }
                            return;
                        }
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

    fn extract_string_keys_from_type(
        &self,
        ty: &TSType<'a>,
        in_global_scope: bool,
        out: &mut Vec<String>,
        visited_aliases: &mut HashSet<String>,
    ) {
        match ty {
            TSType::TSLiteralType(_) => {
                if let Some(s) = extract_ts_literal_string(ty) {
                    out.push(s);
                }
            }
            TSType::TSUnionType(union) => {
                for member in &union.types {
                    self.extract_string_keys_from_type(
                        member,
                        in_global_scope,
                        out,
                        visited_aliases,
                    );
                }
            }
            TSType::TSParenthesizedType(paren) => {
                self.extract_string_keys_from_type(
                    &paren.type_annotation,
                    in_global_scope,
                    out,
                    visited_aliases,
                );
            }
            TSType::TSTypeReference(type_ref) => {
                let TSTypeName::IdentifierReference(ident) = &type_ref.type_name else {
                    return;
                };
                let name = ident.name.as_str();
                if !visited_aliases.insert(name.to_string()) {
                    return;
                }
                if let Some(alias_ty) = self.find_local_type_alias(name, in_global_scope) {
                    self.extract_string_keys_from_type(
                        alias_ty,
                        in_global_scope,
                        out,
                        visited_aliases,
                    );
                }
            }
            TSType::TSTypeQuery(query) => {
                if let oxc_ast::ast::TSTypeQueryExprName::IdentifierReference(ident) =
                    &query.expr_name
                {
                    if let Some(val) = self.const_strings.get(ident.name.as_str()) {
                        out.push(val.clone());
                    }
                }
            }
            _ => {}
        }
    }

    fn find_local_type_alias(&self, name: &str, in_global_scope: bool) -> Option<&'a TSType<'a>> {
        let search_stmts = |stmts: &'a [Statement<'a>]| -> Option<&'a TSType<'a>> {
            for stmt in stmts {
                match stmt {
                    Statement::TSTypeAliasDeclaration(alias) if alias.id.name == name => {
                        return Some(&alias.type_annotation);
                    }
                    Statement::ExportDeclaration(export) => {
                        if let Declaration::TSTypeAliasDeclaration(alias) = &export.declaration {
                            if alias.id.name == name {
                                return Some(&alias.type_annotation);
                            }
                        }
                    }
                    _ => {}
                }
            }
            None
        };
        let search_global = || -> Option<&'a TSType<'a>> {
            if !self.is_module {
                if let Some(ty) = search_stmts(&self.program.body) {
                    return Some(ty);
                }
            }
            for stmt in &self.program.body {
                if let Statement::TSGlobalDeclaration(g) = stmt {
                    if let Some(ty) = search_stmts(&g.body.body) {
                        return Some(ty);
                    }
                }
            }
            None
        };
        if in_global_scope {
            search_global().or_else(|| {
                self.is_module
                    .then(|| search_stmts(&self.program.body))
                    .flatten()
            })
        } else {
            search_stmts(&self.program.body).or_else(search_global)
        }
    }

    fn has_local_or_imported_binding(&self, name: &str) -> bool {
        if self.imports.contains_key(name) {
            return true;
        }
        self.stmts_declare_type(&self.program.body, name)
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

    fn visit_ts_type(&mut self, ty: &TSType<'a>, in_global_scope: bool) {
        match ty {
            TSType::TSTypeLiteral(lit) => {
                self.collect_tags_from_signatures(&lit.members);
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
                let mut keys = Vec::new();
                let mut visited = HashSet::new();
                self.extract_string_keys_from_type(
                    &mapped.constraint,
                    in_global_scope,
                    &mut keys,
                    &mut visited,
                );
                for key in keys {
                    push_unique_tag(&mut self.tags, &mut self.seen_tags, &key);
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
        let cache_key = (in_global_scope, segments.join("."));
        if !self.visited_local.insert(cache_key) {
            return;
        }

        if segments.len() == 1 {
            let name = segments[0];
            if in_global_scope {
                // Inside `declare global { ... }`: global declarations in this file shadow
                // module-scope names, then fall back to module-scope locals / imports, then
                // cross-file ambient declarations.
                if self.collect_type_in_global_blocks(name) {
                    return;
                }
                if self.is_module
                    && self.collect_direct_type_in_stmts(&self.program.body, name, false)
                {
                    return;
                }
                if self.is_module {
                    if let Some(ImportedBinding::Named(spec, exported)) = self.imports.get(name) {
                        push_unique_external(
                            &mut self.external_extends,
                            &mut self.seen_external,
                            spec,
                            exported,
                        );
                        return;
                    }
                }
            } else {
                // In module scope: module-scope declarations and explicit ES imports shadow
                // ambient `declare global` declarations.
                if self.collect_direct_type_in_stmts(&self.program.body, name, false) {
                    return;
                }
                if let Some(ImportedBinding::Named(spec, exported)) = self.imports.get(name) {
                    push_unique_external(
                        &mut self.external_extends,
                        &mut self.seen_external,
                        spec,
                        exported,
                    );
                    return;
                }
                if self.collect_type_in_global_blocks(name) {
                    return;
                }
            }
            push_unique_ambient(
                &mut self.ambient_extends,
                &mut self.seen_ambient,
                vec![name.to_string()],
            );
            return;
        }

        // Qualified type name `a.b.c`: check local namespaces and imports in scope order, then
        // record as a cross-file ambient namespace path if unresolved in this file.
        let first = segments[0];
        let rest = &segments[1..];
        let found_local = if in_global_scope {
            self.collect_qualified_in_global_blocks(segments)
                || (self.is_module
                    && self.collect_qualified_in_stmts(&self.program.body, segments, false))
        } else {
            self.collect_qualified_in_stmts(&self.program.body, segments, false)
                || self.try_record_imported_qualified(first, rest)
                || self.collect_qualified_in_global_blocks(segments)
        };
        if found_local {
            return;
        }
        if in_global_scope && self.is_module && self.try_record_imported_qualified(first, rest) {
            return;
        }
        push_unique_ambient(
            &mut self.ambient_extends,
            &mut self.seen_ambient,
            segments.iter().map(|s| (*s).to_string()).collect(),
        );
    }

    fn try_record_imported_qualified(&mut self, first: &str, rest: &[&str]) -> bool {
        match self.imports.get(first) {
            Some(ImportedBinding::Namespace(spec)) => {
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

    fn collect_type_in_global_blocks(&mut self, target: &str) -> bool {
        let mut found = false;
        if !self.is_module && self.collect_direct_type_in_stmts(&self.program.body, target, true) {
            found = true;
        }
        for stmt in &self.program.body {
            match stmt {
                Statement::TSGlobalDeclaration(global_decl) => {
                    if self.collect_direct_type_in_stmts(&global_decl.body.body, target, true) {
                        found = true;
                    }
                }
                Statement::TSExternalModuleDeclaration(mod_decl) => {
                    let Some(block) = &mod_decl.body else {
                        continue;
                    };
                    for inner in &block.body {
                        if let Statement::TSGlobalDeclaration(global_decl) = inner {
                            if self.collect_direct_type_in_stmts(
                                &global_decl.body.body,
                                target,
                                true,
                            ) {
                                found = true;
                            }
                        }
                    }
                }
                _ => {}
            }
        }
        found
    }

    fn collect_qualified_in_global_blocks(&mut self, segments: &[&str]) -> bool {
        let mut found = false;
        if !self.is_module && self.collect_qualified_in_stmts(&self.program.body, segments, true) {
            found = true;
        }
        for stmt in &self.program.body {
            match stmt {
                Statement::TSGlobalDeclaration(global_decl) => {
                    if self.collect_qualified_in_stmts(&global_decl.body.body, segments, true) {
                        found = true;
                    }
                }
                Statement::TSExternalModuleDeclaration(mod_decl) => {
                    let Some(block) = &mod_decl.body else {
                        continue;
                    };
                    for inner in &block.body {
                        if let Statement::TSGlobalDeclaration(global_decl) = inner {
                            if self.collect_qualified_in_stmts(
                                &global_decl.body.body,
                                segments,
                                true,
                            ) {
                                found = true;
                            }
                        }
                    }
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
    ) -> bool {
        let Some((&target, ns_path)) = segments.split_last() else {
            return false;
        };
        let mut blocks = Vec::new();
        collect_namespace_blocks(stmts, ns_path, &mut blocks);
        let mut found = false;
        for block_stmts in blocks {
            if self.collect_direct_type_in_stmts(block_stmts, target, in_global_scope) {
                found = true;
            }
        }
        found
    }

    fn collect_direct_type_in_stmts(
        &mut self,
        stmts: &'a [Statement<'a>],
        target: &str,
        in_global_scope: bool,
    ) -> bool {
        let mut found = false;
        for stmt in stmts {
            match stmt {
                Statement::TSInterfaceDeclaration(iface) if iface.id.name == target => {
                    found = true;
                    self.visit_interface(iface, in_global_scope);
                }
                Statement::TSTypeAliasDeclaration(alias) if alias.id.name == target => {
                    found = true;
                    self.visit_ts_type(&alias.type_annotation, in_global_scope);
                }
                Statement::ExportDeclaration(export) => match &export.declaration {
                    Declaration::TSInterfaceDeclaration(iface) if iface.id.name == target => {
                        found = true;
                        self.visit_interface(iface, in_global_scope);
                    }
                    Declaration::TSTypeAliasDeclaration(alias) if alias.id.name == target => {
                        found = true;
                        self.visit_ts_type(&alias.type_annotation, in_global_scope);
                    }
                    _ => {}
                },
                Statement::ExportDefaultDeclaration(export) => {
                    if let ExportDefaultDeclarationKind::TSInterfaceDeclaration(iface) =
                        &export.declaration
                    {
                        if iface.id.name == target {
                            found = true;
                            self.visit_interface(iface, in_global_scope);
                        }
                    }
                }
                _ => {}
            }
        }
        found
    }
}

fn visit_global_tag_name_maps_in_stmts<'a>(
    stmts: &'a [Statement<'a>],
    collector: &mut FileTypeCollector<'a>,
) {
    for stmt in stmts {
        let iface = match stmt {
            Statement::TSInterfaceDeclaration(iface) => iface.as_ref(),
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::TSInterfaceDeclaration(iface) => iface.as_ref(),
                _ => continue,
            },
            _ => continue,
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
) -> CustomElementTagContributions {
    if !source_text.contains("HTMLElementTagNameMap") {
        return CustomElementTagContributions::default();
    }

    let mut collector = FileTypeCollector::new(program, module_record);

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
                for inner in &block.body {
                    let Statement::TSGlobalDeclaration(global_decl) = inner else {
                        continue;
                    };
                    visit_global_tag_name_maps_in_stmts(&global_decl.body.body, &mut collector);
                }
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
) -> CustomElementTagContributions {
    let mut collector = FileTypeCollector::new(program, module_record);
    let segments: Vec<&str> = exported_path.split('.').collect();
    if segments.len() > 1 {
        if collector.collect_qualified_in_stmts(&program.body, &segments, false) {
            return collector.finish();
        }
        // Check `export {LocalNs as ExportedNs}` or `export {Ns} from '...'` for the root segment.
        let root = segments[0];
        let rest = segments[1..].join(".");
        for stmt in &program.body {
            match stmt {
                Statement::ExportNamedDeclaration(export) => {
                    for spec in &export.specifiers {
                        if spec.exported.name() == root {
                            let mut remapped = vec![spec.local.name().as_str()];
                            remapped.extend_from_slice(&segments[1..]);
                            collector.resolve_type_path(&remapped, false);
                            return collector.finish();
                        }
                    }
                }
                Statement::ExportFromDeclaration(export) => {
                    for spec in &export.specifiers {
                        if spec.exported.name() == root {
                            let target = format!("{}.{rest}", spec.local.name());
                            push_unique_external(
                                &mut collector.external_extends,
                                &mut collector.seen_external,
                                export.source.value.as_str(),
                                &target,
                            );
                            return collector.finish();
                        }
                    }
                }
                Statement::ExportAllDeclaration(export) if export.exported.is_none() => {
                    push_unique_external(
                        &mut collector.external_extends,
                        &mut collector.seen_external,
                        export.source.value.as_str(),
                        exported_path,
                    );
                }
                _ => {}
            }
        }
        return collector.finish();
    }

    let exported_name = exported_path;
    let mut found_direct = false;

    for stmt in &program.body {
        match stmt {
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::TSInterfaceDeclaration(iface) if iface.id.name == exported_name => {
                    found_direct = true;
                    collector.visit_interface(iface, false);
                }
                Declaration::TSTypeAliasDeclaration(alias) if alias.id.name == exported_name => {
                    found_direct = true;
                    collector.visit_ts_type(&alias.type_annotation, false);
                }
                _ => {}
            },
            Statement::ExportDefaultDeclaration(export) if exported_name == "default" => {
                match &export.declaration {
                    ExportDefaultDeclarationKind::TSInterfaceDeclaration(iface) => {
                        found_direct = true;
                        collector.visit_interface(iface, false);
                    }
                    ExportDefaultDeclarationKind::Identifier(ident) => {
                        found_direct = true;
                        collector.resolve_type_path(&[ident.name.as_str()], false);
                    }
                    _ => {}
                }
            }
            Statement::ExportNamedDeclaration(export) => {
                for spec in &export.specifiers {
                    if spec.exported.name() == exported_name {
                        found_direct = true;
                        collector.resolve_type_path(&[spec.local.name().as_str()], false);
                    }
                }
            }
            Statement::ExportFromDeclaration(export) => {
                for spec in &export.specifiers {
                    if spec.exported.name() == exported_name {
                        found_direct = true;
                        push_unique_external(
                            &mut collector.external_extends,
                            &mut collector.seen_external,
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
        for stmt in &program.body {
            let Statement::ExportAllDeclaration(export) = stmt else {
                continue;
            };
            if export.exported.is_none() {
                push_unique_external(
                    &mut collector.external_extends,
                    &mut collector.seen_external,
                    export.source.value.as_str(),
                    exported_name,
                );
            }
        }
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
) -> CustomElementTagContributions {
    if path.is_empty() {
        return CustomElementTagContributions::default();
    }
    let mut collector = FileTypeCollector::new(program, module_record);
    if path.len() == 1 {
        collector.collect_type_in_global_blocks(path[0]);
    } else {
        collector.collect_qualified_in_global_blocks(path);
    }
    collector.finish()
}

/// Extract static module specifiers imported or re-exported by a `.d.ts` file (used to follow
/// transitive `.d.ts` barrels such as `import '@material/web/all.js'`).
pub(crate) fn extract_dts_import_specifiers(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
) -> Vec<String> {
    let mut specifiers = Vec::new();
    let mut seen = HashSet::new();
    for atom in module_record.requested_modules.keys() {
        let s = atom.as_str();
        if seen.insert(s.to_string()) {
            specifiers.push(s.to_string());
        }
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
            let s = ext.expression.value.as_str();
            if seen.insert(s.to_string()) {
                specifiers.push(s.to_string());
            }
        }
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
        let allocator = Allocator::default();
        let source_type = if is_dts {
            SourceType::d_ts()
        } else {
            SourceType::ts()
        };
        let ret = Parser::new(&allocator, source, source_type).parse();
        extract_custom_element_contributions(&ret.program, &ret.module_record, source)
    }

    #[test]
    fn extracts_declare_global_in_module_ts_and_dts() {
        let src = r#"
            export declare class MyWidget extends HTMLElement { label: string; }
            declare global {
              interface HTMLElementTagNameMap {
                'my-widget': MyWidget;
                "other-el": HTMLElement;
                [`tmpl-el`]: HTMLElement;
                ['computed-el']: HTMLElement;
                div: HTMLDivElement;
                'Mixed-Case': HTMLElement;
              }
            }
        "#;
        let res = extract(src, true);
        assert_eq!(
            res.tags,
            vec!["my-widget", "other-el", "tmpl-el", "computed-el"]
        );
        assert!(res.external_extends.is_empty());

        let res_ts = extract(src, false);
        assert_eq!(
            res_ts.tags,
            vec!["my-widget", "other-el", "tmpl-el", "computed-el"]
        );
    }

    #[test]
    fn extracts_top_level_script_interface_and_ignores_module_scoped() {
        let script = r#"
            interface MyEl extends HTMLElement {}
            interface HTMLElementTagNameMap {
              'script-el': MyEl;
            }
        "#;
        assert_eq!(extract(script, true).tags, vec!["script-el"]);

        let module = r#"
            export interface HTMLElementTagNameMap {
              'not-global': HTMLElement;
            }
        "#;
        assert!(extract(module, true).tags.is_empty());
    }

    #[test]
    fn extracts_ambient_module_global_block() {
        let src = r#"
            declare module 'my-wc-pkg' {
              export class PkgEl extends HTMLElement {}
              global {
                interface HTMLElementTagNameMap {
                  'pkg-el': PkgEl;
                }
              }
            }
        "#;
        assert_eq!(extract(src, true).tags, vec!["pkg-el"]);
    }

    #[test]
    fn resolves_local_and_records_external_extends() {
        let src = r#"
            import {ExternalTags} from './external';
            import * as ns from './ns';
            interface LocalBase {
              'base-el': HTMLElement;
            }
            type LocalAlias = {
              'alias-el': HTMLElement;
            } & LocalBase;
            declare global {
              interface HTMLElementTagNameMap extends LocalAlias, ExternalTags, ns.NsTags {
                'direct-el': HTMLElement;
              }
            }
        "#;
        let res = extract(src, false);
        assert_eq!(res.tags, vec!["direct-el", "alias-el", "base-el"]);
        assert_eq!(
            res.external_extends,
            vec![
                ("./external".to_string(), "ExternalTags".to_string()),
                ("./ns".to_string(), "NsTags".to_string()),
            ]
        );
    }

    #[test]
    fn resolves_nested_ambient_namespace_extends() {
        let src = r#"
            declare namespace google.maps {
              export interface HTMLElementTagNameMap {
                'gmp-map': HTMLElement;
                'gmp-advanced-marker': HTMLElement;
              }
            }
            declare interface HTMLElementTagNameMap extends google.maps.HTMLElementTagNameMap {}
        "#;
        let res = extract(src, true);
        assert_eq!(res.tags, vec!["gmp-map", "gmp-advanced-marker"]);
        assert!(res.ambient_extends.is_empty());
    }

    #[test]
    fn resolves_computed_const_and_enum_keys() {
        let src = r#"
            export const WIDGET_TAG = 'const-widget' as const;
            declare const DECL_TAG: 'decl-widget';
            enum CustomTags {
              Banner = 'enum-banner',
            }
            declare const mySym: unique symbol;
            declare global {
              interface HTMLElementTagNameMap {
                [WIDGET_TAG]: HTMLElement;
                [DECL_TAG]: HTMLElement;
                [CustomTags.Banner]: HTMLElement;
                [mySym]: HTMLElement;
              }
            }
        "#;
        assert_eq!(
            extract(src, false).tags,
            vec!["const-widget", "decl-widget", "enum-banner"]
        );
    }

    #[test]
    fn resolves_utility_mapped_and_import_types() {
        let src = r#"
            type TagNames = 'rec-a' | 'rec-b';
            type RecTags = Record<TagNames, HTMLElement>;
            type MappedTags = { [K in 'mapped-a' | 'mapped-b']: HTMLElement };
            type OmittedTags = Omit<{ 'keep-el': HTMLElement; 'drop-el': HTMLElement }, 'drop-el'>;
            type ImportedTags = import('./remote').Ns.RemoteMap;
            declare global {
              interface HTMLElementTagNameMap
                extends Partial<RecTags>, Readonly<MappedTags>, OmittedTags, ImportedTags {}
            }
        "#;
        let res = extract(src, false);
        assert_eq!(
            res.tags,
            vec!["rec-a", "rec-b", "mapped-a", "mapped-b", "keep-el"]
        );
        assert_eq!(
            res.external_extends,
            vec![("./remote".to_string(), "Ns.RemoteMap".to_string())]
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
    fn extracts_triple_slash_references() {
        let src = r#"
            // leading comment
            /// <reference path="./extra.d.ts" />
            /// <reference types='google.maps' />
            export declare class Foo {}
            /// <reference path="./ignored-after-code.d.ts" />
        "#;
        let refs = extract_triple_slash_references(src);
        assert_eq!(refs.paths, vec!["./extra.d.ts"]);
        assert_eq!(refs.types, vec!["google.maps"]);
    }
}
