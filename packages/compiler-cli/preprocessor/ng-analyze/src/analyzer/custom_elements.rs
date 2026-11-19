//! Extracts custom element tag names declared on TypeScript's global
//! `HTMLElementTagNameMap` interface.
//!
//! Mirrors `collectKnownCustomElements` in `ngtsc` (`packages/compiler-cli/src/ngtsc/typecheck/src/checker.ts`):
//! collects lowercase tag names containing `-` from global `HTMLElementTagNameMap` declarations,
//! including `declare global { interface HTMLElementTagNameMap { ... } }`, top-level script
//! declarations, ambient module `global { ... }` blocks, and `extends` heritage clauses.

use std::collections::{HashMap, HashSet};

use oxc_ast::ast::{
    Declaration, ExportDefaultDeclarationKind, Program, PropertyKey, Statement,
    TSInterfaceDeclaration, TSModuleReference, TSSignature, TSType, TSTypeName,
};
use oxc_syntax::module_record::{ImportImportName, ModuleRecord};

use super::utils::extract_property_key;

/// Custom element tag contributions discovered in a single `.ts` or `.d.ts` file.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub(crate) struct CustomElementTagContributions {
    /// Lowercase custom element tag names containing `-` declared directly on global
    /// `HTMLElementTagNameMap` (or inherited from same-file interfaces/type aliases).
    pub tags: Vec<String>,
    /// Imported base types referenced in `HTMLElementTagNameMap extends ...` as
    /// `(module_specifier, exported_name)` for cross-file resolution by the query engine.
    pub external_extends: Vec<(String, String)>,
}

impl CustomElementTagContributions {
    pub(crate) fn is_empty(&self) -> bool {
        self.tags.is_empty() && self.external_extends.is_empty()
    }
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
    exported_name: &str,
) {
    let key = (specifier.to_string(), exported_name.to_string());
    if seen.insert(key.clone()) {
        external.push(key);
    }
}

fn extract_signature_key<'a>(
    key: &'a PropertyKey<'a>,
    computed: bool,
) -> Option<std::borrow::Cow<'a, str>> {
    if computed {
        // For computed keys like `[TAG]`, an identifier is a variable reference, not a literal key.
        // Only statically known literals (e.g. `['my-widget']`, `` [`my-widget`] ``) apply.
        return key.static_name();
    }
    extract_property_key(key)
}

fn collect_tags_from_signatures(
    signatures: &[TSSignature<'_>],
    tags: &mut Vec<String>,
    seen_tags: &mut HashSet<String>,
) {
    for sig in signatures {
        let TSSignature::TSPropertySignature(prop) = sig else {
            continue;
        };
        let Some(name) = extract_signature_key(&prop.key, prop.computed) else {
            continue;
        };
        push_unique_tag(tags, seen_tags, &name);
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

struct FileTypeCollector<'a> {
    program: &'a Program<'a>,
    imports: HashMap<&'a str, ImportedBinding<'a>>,
    tags: Vec<String>,
    seen_tags: HashSet<String>,
    external_extends: Vec<(String, String)>,
    seen_external: HashSet<(String, String)>,
    visited_local: HashSet<String>,
}

impl<'a> FileTypeCollector<'a> {
    fn new(program: &'a Program<'a>, module_record: &'a ModuleRecord<'a>) -> Self {
        Self {
            program,
            imports: build_import_lookup(module_record),
            tags: Vec::new(),
            seen_tags: HashSet::new(),
            external_extends: Vec::new(),
            seen_external: HashSet::new(),
            visited_local: HashSet::new(),
        }
    }

    fn finish(self) -> CustomElementTagContributions {
        CustomElementTagContributions {
            tags: self.tags,
            external_extends: self.external_extends,
        }
    }

    fn visit_interface(&mut self, iface: &TSInterfaceDeclaration<'a>) {
        collect_tags_from_signatures(&iface.body.body, &mut self.tags, &mut self.seen_tags);
        for heritage in &iface.extends {
            self.visit_type_name(&heritage.type_name);
        }
    }

    fn visit_type_name(&mut self, type_name: &TSTypeName<'a>) {
        match type_name {
            TSTypeName::IdentifierReference(ident) => {
                self.resolve_type_name(ident.name.as_str());
            }
            TSTypeName::QualifiedName(qual) => {
                let TSTypeName::IdentifierReference(left) = &qual.left else {
                    return;
                };
                if let Some(ImportedBinding::Namespace(spec)) = self.imports.get(left.name.as_str())
                {
                    push_unique_external(
                        &mut self.external_extends,
                        &mut self.seen_external,
                        spec,
                        qual.right.name.as_str(),
                    );
                }
            }
            TSTypeName::ThisExpression(_) => {}
        }
    }

    fn visit_ts_type(&mut self, ty: &TSType<'a>) {
        match ty {
            TSType::TSTypeLiteral(lit) => {
                collect_tags_from_signatures(&lit.members, &mut self.tags, &mut self.seen_tags);
            }
            TSType::TSIntersectionType(inter) => {
                for member in &inter.types {
                    self.visit_ts_type(member);
                }
            }
            TSType::TSParenthesizedType(paren) => {
                self.visit_ts_type(&paren.type_annotation);
            }
            TSType::TSTypeReference(type_ref) => {
                self.visit_type_name(&type_ref.type_name);
            }
            _ => {}
        }
    }

    fn resolve_type_name(&mut self, name: &str) {
        if !self.visited_local.insert(name.to_string()) {
            return;
        }
        let found_local = self.collect_local_type_in_stmts(&self.program.body, name);
        if found_local {
            return;
        }
        if let Some(ImportedBinding::Named(spec, exported)) = self.imports.get(name) {
            push_unique_external(
                &mut self.external_extends,
                &mut self.seen_external,
                spec,
                exported,
            );
        }
    }

    fn collect_local_type_in_stmts(&mut self, stmts: &[Statement<'a>], target: &str) -> bool {
        let mut found = false;
        for stmt in stmts {
            match stmt {
                Statement::TSGlobalDeclaration(global_decl) => {
                    if self.collect_local_type_in_stmts(&global_decl.body.body, target) {
                        found = true;
                    }
                }
                Statement::TSInterfaceDeclaration(iface) if iface.id.name == target => {
                    found = true;
                    self.visit_interface(iface);
                }
                Statement::TSTypeAliasDeclaration(alias) if alias.id.name == target => {
                    found = true;
                    self.visit_ts_type(&alias.type_annotation);
                }
                Statement::ExportDeclaration(export) => match &export.declaration {
                    Declaration::TSInterfaceDeclaration(iface) if iface.id.name == target => {
                        found = true;
                        self.visit_interface(iface);
                    }
                    Declaration::TSTypeAliasDeclaration(alias) if alias.id.name == target => {
                        found = true;
                        self.visit_ts_type(&alias.type_annotation);
                    }
                    _ => {}
                },
                Statement::ExportDefaultDeclaration(export) => {
                    if let ExportDefaultDeclarationKind::TSInterfaceDeclaration(iface) =
                        &export.declaration
                    {
                        if iface.id.name == target {
                            found = true;
                            self.visit_interface(iface);
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
    stmts: &[Statement<'a>],
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
            collector.visit_interface(iface);
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

    if !crate::query::engine::is_external_module_dts(program, module_record) {
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

/// Extract custom element tag contributions from an exported interface or type alias in `program`,
/// used to resolve cross-file `interface HTMLElementTagNameMap extends ImportedTagMap`.
pub(crate) fn extract_tags_from_exported_type(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
    exported_name: &str,
) -> CustomElementTagContributions {
    let mut collector = FileTypeCollector::new(program, module_record);
    let mut found_direct = false;

    for stmt in &program.body {
        match stmt {
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::TSInterfaceDeclaration(iface) if iface.id.name == exported_name => {
                    found_direct = true;
                    collector.visit_interface(iface);
                }
                Declaration::TSTypeAliasDeclaration(alias) if alias.id.name == exported_name => {
                    found_direct = true;
                    collector.visit_ts_type(&alias.type_annotation);
                }
                _ => {}
            },
            Statement::ExportDefaultDeclaration(export) if exported_name == "default" => {
                match &export.declaration {
                    ExportDefaultDeclarationKind::TSInterfaceDeclaration(iface) => {
                        found_direct = true;
                        collector.visit_interface(iface);
                    }
                    ExportDefaultDeclarationKind::Identifier(ident) => {
                        found_direct = true;
                        collector.resolve_type_name(ident.name.as_str());
                    }
                    _ => {}
                }
            }
            Statement::ExportNamedDeclaration(export) => {
                for spec in &export.specifiers {
                    if spec.exported.name() == exported_name {
                        found_direct = true;
                        collector.resolve_type_name(spec.local.name().as_str());
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
    fn ignores_computed_identifier_key() {
        let src = r#"
            declare const myTag: unique symbol;
            declare global {
              interface HTMLElementTagNameMap {
                [myTag]: HTMLElement;
                'real-el': HTMLElement;
              }
            }
        "#;
        assert_eq!(extract(src, true).tags, vec!["real-el"]);
    }
}
