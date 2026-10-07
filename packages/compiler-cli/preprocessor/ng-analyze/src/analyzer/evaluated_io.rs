//! Input and output declarations read through the partial evaluator: a decorator's
//! `inputs`/`outputs` arrays and the arguments of `@Input(...)`/`@Output(...)`.
//!
//! Mirror of ngtsc's `parseInputsArray`, `parseOutputsArray` and the decorator halves of
//! `tryParseInputFieldMapping` / `tryParseDecoratorOutput`. Each value is evaluated, so it may
//! be written inline, reached through a constant or a spread, or imported from another file.
//! Syntax mode folds every value it can read into [`DirectiveData::fields`] straight away; one
//! still waiting on a constant from another file is kept in [`EvaluatedIo`] and folded once
//! Stage 2 has completed it.

use oxc_span::Span;

use crate::analyzer::class_data::{
    AngularField, DirectiveData, InputData, OutputData, TransformData, ValueIssue,
};
use crate::evaluator::{Resolved, ResolvedValue};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum IoKind {
    Input,
    Output,
}

/// A decorator's `inputs` or `outputs` array as the partial evaluator sees it.
#[derive(Clone, Debug)]
pub struct IoMetadataArray {
    pub kind: IoKind,
    pub value: Resolved<ResolvedValue>,
    /// The property's value expression: where ngtsc reports a malformed array, and the
    /// declaration span of each entry that names no class member.
    pub span: Span,
    /// Transforms of `inputs` entries written as object literals in this file, by class
    /// property name. The transform is emitted from its source text, which only an entry
    /// written here has.
    // TODO(parity): ngtsc also accepts a transform on an entry reached through a constant
    // (`inputs: [ENTRY]`), which has no source text in this file to emit.
    pub transforms: Vec<(String, TransformData)>,
}

/// The argument of an `@Input(...)` or `@Output(...)` member decorator.
#[derive(Clone, Debug)]
pub struct MemberIoOptions {
    pub kind: IoKind,
    /// The decorated class member.
    pub member: String,
    pub value: Resolved<ResolvedValue>,
    /// The decorator: where ngtsc reports an argument of the wrong shape.
    pub decorator_span: Span,
}

/// A class member an `inputs`/`outputs` entry may name: the declaration an entry binds to,
/// and the modifiers the type-check block needs for it.
#[derive(Clone, Debug)]
pub struct ClassMemberFacts {
    pub name: String,
    pub span: Span,
    pub is_restricted: bool,
    pub is_literal: bool,
}

/// Input/output declarations still waiting on constants from other files. Stage 2 completes
/// them and folds the result into `DirectiveData::fields` with [`DirectiveData::fold_pending_io`].
#[derive(Clone, Debug, Default)]
pub struct EvaluatedIo {
    pub arrays: Vec<IoMetadataArray>,
    pub member_options: Vec<MemberIoOptions>,
    /// The class's members, kept to bind the entries of a pending array to their declarations.
    pub members: Vec<ClassMemberFacts>,
}

impl EvaluatedIo {
    pub fn is_empty(&self) -> bool {
        self.arrays.is_empty() && self.member_options.is_empty()
    }

    pub fn contains_incomplete(&self) -> bool {
        self.arrays.iter().any(|a| a.value.contains_incomplete())
            || self
                .member_options
                .iter()
                .any(|o| o.value.contains_incomplete())
    }

    pub async fn complete_with<Fs: crate::ResourceResolverFs + Clone + 'static>(
        &mut self,
        ctx: &crate::query::QueryContext<Fs>,
        foreign: &[&dyn crate::evaluator::ForeignFunctionResolver],
    ) {
        for array in &mut self.arrays {
            array.value.complete_with(ctx, foreign).await;
        }
        for options in &mut self.member_options {
            options.value.complete_with(ctx, foreign).await;
        }
    }

    pub fn demote(&mut self) {
        for array in &mut self.arrays {
            array.value.demote();
        }
        for options in &mut self.member_options {
            options.value.demote();
        }
    }
}

/// A metadata value read as the shape its field requires.
pub enum Read<T> {
    Ready(T),
    /// A part the read needs is still a hole for a constant in another file.
    Pending,
    /// ngtsc's `VALUE_HAS_WRONG_TYPE` message for the value.
    Invalid(String),
}

/// One `inputs`/`outputs` entry, reduced to the fields of ngtsc's `InputMapping`.
pub struct IoEntry {
    pub class_property: String,
    pub binding: String,
    pub required: bool,
}

/// `@Input(...)`'s argument, reduced to what it declares.
pub struct InputOptionsValue {
    pub alias: Option<String>,
    pub required: bool,
}

/// ngtsc's `parseMappingString`: `'field'` or `'field: binding'`. Like JavaScript's
/// `split(':', 2)`, anything after a second colon is dropped.
fn parse_mapping_string(value: &str) -> (String, String) {
    let mut parts = value.split(':').map(str::trim);
    let class_property = parts.next().unwrap_or_default().to_string();
    let binding = parts
        .next()
        .map_or_else(|| class_property.clone(), str::to_string);
    (class_property, binding)
}

fn as_str(value: &ResolvedValue) -> Option<&str> {
    match value.unwrap_named() {
        ResolvedValue::String(s) => Some(s),
        _ => None,
    }
}

/// ngtsc's `parseInputsArray`.
pub fn read_inputs_array(value: &ResolvedValue) -> Read<Vec<IoEntry>> {
    let items = match value.unwrap_named() {
        ResolvedValue::Array(items) => items,
        other if other.contains_incomplete() => return Read::Pending,
        _ => return Read::Invalid("Failed to resolve @Directive.inputs to an array".to_string()),
    };
    let mut entries = Vec::with_capacity(items.len());
    for (position, item) in items.iter().enumerate() {
        match read_inputs_entry(item, position) {
            Read::Ready(entry) => entries.push(entry),
            Read::Pending => return Read::Pending,
            Read::Invalid(message) => return Read::Invalid(message),
        }
    }
    Read::Ready(entries)
}

fn read_inputs_entry(item: &ResolvedValue, position: usize) -> Read<IoEntry> {
    if let Some(mapping) = as_str(item) {
        let (class_property, binding) = parse_mapping_string(mapping);
        return Read::Ready(IoEntry {
            class_property,
            binding,
            required: false,
        });
    }
    let ResolvedValue::Map(config) = item.unwrap_named() else {
        if item.contains_incomplete() {
            return Read::Pending;
        }
        return Read::Invalid(
            "@Directive.inputs array can only contain strings or object literals".to_string(),
        );
    };

    // Only `name`, `alias` and `required` are read here, so a hole elsewhere in the entry (a
    // `transform` imported from a library, say) does not hold the entry back.
    let name = config.get("name");
    let alias = config.get("alias");
    let required = config.get("required");
    if [name, alias, required]
        .into_iter()
        .flatten()
        .any(ResolvedValue::contains_incomplete)
    {
        return Read::Pending;
    }
    let Some(name) = name.and_then(as_str) else {
        return Read::Invalid(format!(
            "Value at position {position} of @Directive.inputs array must have a \"name\" property"
        ));
    };
    Read::Ready(IoEntry {
        class_property: name.to_string(),
        binding: alias.and_then(as_str).unwrap_or(name).to_string(),
        required: matches!(
            required.map(ResolvedValue::unwrap_named),
            Some(ResolvedValue::Boolean(true))
        ),
    })
}

/// ngtsc's `parseOutputsArray`, via `parseFieldStringArrayValue` and `parseMappingStringArray`.
pub fn read_outputs_array(value: &ResolvedValue) -> Read<Vec<IoEntry>> {
    let items = match value.unwrap_named() {
        ResolvedValue::Array(items) => items,
        other if other.contains_incomplete() => return Read::Pending,
        _ => {
            return Read::Invalid(
                "Failed to resolve @Directive.outputs to a string array".to_string(),
            )
        }
    };
    let mut entries = Vec::with_capacity(items.len());
    for (position, item) in items.iter().enumerate() {
        let Some(mapping) = as_str(item) else {
            if item.contains_incomplete() {
                return Read::Pending;
            }
            return Read::Invalid(format!(
                "Failed to resolve outputs at position {position} to a string"
            ));
        };
        let (class_property, binding) = parse_mapping_string(mapping);
        entries.push(IoEntry {
            class_property,
            binding,
            required: false,
        });
    }
    Read::Ready(entries)
}

/// The argument of `@Input(...)`, as ngtsc's `tryParseInputFieldMapping` reads it: a string is
/// the alias, an object may carry `alias` and `required`.
pub fn read_input_options(value: &ResolvedValue) -> Read<InputOptionsValue> {
    if let Some(alias) = as_str(value) {
        return Read::Ready(InputOptionsValue {
            alias: Some(alias.to_string()),
            required: false,
        });
    }
    let ResolvedValue::Map(options) = value.unwrap_named() else {
        if value.contains_incomplete() {
            return Read::Pending;
        }
        return Read::Invalid(
            "@Input decorator argument must resolve to a string or an object literal".to_string(),
        );
    };
    let alias = options.get("alias");
    let required = options.get("required");
    if [alias, required]
        .into_iter()
        .flatten()
        .any(ResolvedValue::contains_incomplete)
    {
        return Read::Pending;
    }
    Read::Ready(InputOptionsValue {
        alias: alias.and_then(as_str).map(str::to_string),
        required: matches!(
            required.map(ResolvedValue::unwrap_named),
            Some(ResolvedValue::Boolean(true))
        ),
    })
}

/// The argument of `@Output(...)`, as ngtsc's `tryParseDecoratorOutput` reads it.
pub fn read_output_alias(value: &ResolvedValue) -> Read<String> {
    if let Some(alias) = as_str(value) {
        return Read::Ready(alias.to_string());
    }
    if value.contains_incomplete() {
        return Read::Pending;
    }
    Read::Invalid("@Output decorator argument must resolve to a string".to_string())
}

/// Bind a metadata-declared field to the class member it names, the way a field declared on
/// the member itself is bound.
fn bind_to_member(field: &mut AngularField, members: &[ClassMemberFacts]) {
    let (name, property_span, decorator_span) = match field {
        AngularField::Input(i) => (&i.name, &mut i.property_span, &mut i.decorator_span),
        AngularField::Output(o) => (&o.name, &mut o.property_span, &mut o.decorator_span),
        _ => return,
    };
    let Some(member) = members.iter().find(|m| &m.name == name) else {
        return;
    };
    *property_span = Some(member.span);
    *decorator_span = None;
    if let AngularField::Input(input) = field {
        input.is_restricted = member.is_restricted;
        input.is_literal = member.is_literal;
    }
}

fn same_field(a: &AngularField, b: &AngularField) -> bool {
    match (a, b) {
        (AngularField::Input(a), AngularField::Input(b)) => a.name == b.name,
        (AngularField::Output(a), AngularField::Output(b)) => a.name == b.name,
        _ => false,
    }
}

fn entry_field(array: &IoMetadataArray, entry: IoEntry) -> AngularField {
    let alias = (entry.binding != entry.class_property).then_some(entry.binding);
    match array.kind {
        IoKind::Input => {
            let transform = array
                .transforms
                .iter()
                .find(|(name, _)| name == &entry.class_property)
                .map(|(_, transform)| transform.clone());
            AngularField::Input(InputData {
                name: entry.class_property,
                alias,
                required: entry.required,
                is_signal: false,
                decorator_span: Some(array.span),
                property_span: None,
                transform,
                is_restricted: false,
                is_literal: false,
            })
        }
        IoKind::Output => AngularField::Output(OutputData {
            name: entry.class_property,
            alias,
            decorator_span: Some(array.span),
            property_span: None,
            is_signal: false,
        }),
    }
}

impl DirectiveData {
    /// Fold an evaluated `inputs`/`outputs` array into `fields`. Returns `false`, leaving
    /// `fields` untouched, while the array still waits on another file.
    ///
    /// ngtsc builds the mapping as `{...fromMetadata, ...fromMembers}`: the array's entries come
    /// first, a later entry for the same property replaces an earlier one in place, and a
    /// member declaring the same property itself wins over both.
    pub(crate) fn fold_io_array(
        &mut self,
        array: &IoMetadataArray,
        members: &[ClassMemberFacts],
    ) -> bool {
        let read = match array.kind {
            IoKind::Input => read_inputs_array(array.value.raw()),
            IoKind::Output => read_outputs_array(array.value.raw()),
        };
        let entries = match read {
            Read::Ready(entries) => entries,
            Read::Pending => return false,
            Read::Invalid(message) => {
                self.io_issues.push(ValueIssue {
                    span: array.span,
                    message,
                });
                return true;
            }
        };

        let mut folded: Vec<AngularField> = Vec::with_capacity(entries.len() + self.fields.len());
        for entry in entries {
            let mut field = entry_field(array, entry);
            if self
                .fields
                .iter()
                .any(|existing| same_field(existing, &field))
            {
                continue;
            }
            bind_to_member(&mut field, members);
            match folded
                .iter_mut()
                .find(|existing| same_field(existing, &field))
            {
                Some(existing) => *existing = field,
                None => folded.push(field),
            }
        }
        folded.append(&mut self.fields);
        self.fields = folded;
        true
    }

    /// Apply an evaluated `@Input(...)`/`@Output(...)` argument to the member's field.
    /// Returns `false` while the argument still waits on another file.
    pub(crate) fn fold_member_options(&mut self, options: &MemberIoOptions) -> bool {
        let issue = match options.kind {
            IoKind::Input => match read_input_options(options.value.raw()) {
                Read::Ready(value) => {
                    let input = self.fields.iter_mut().find_map(|f| match f {
                        AngularField::Input(i) if i.name == options.member => Some(i),
                        _ => None,
                    });
                    if let Some(input) = input {
                        input.alias = value.alias;
                        input.required = value.required;
                    }
                    return true;
                }
                Read::Pending => return false,
                Read::Invalid(message) => message,
            },
            IoKind::Output => match read_output_alias(options.value.raw()) {
                Read::Ready(alias) => {
                    let output = self.fields.iter_mut().find_map(|f| match f {
                        AngularField::Output(o) if o.name == options.member => Some(o),
                        _ => None,
                    });
                    if let Some(output) = output {
                        output.alias = Some(alias);
                    }
                    return true;
                }
                Read::Pending => return false,
                Read::Invalid(message) => message,
            },
        };
        self.io_issues.push(ValueIssue {
            span: options.decorator_span,
            message: issue,
        });
        true
    }

    /// Bind every field an `inputs`/`outputs` array declared to the class member it names.
    pub(crate) fn bind_metadata_fields_to_members(&mut self, members: &[ClassMemberFacts]) {
        for field in &mut self.fields {
            let declared_by_metadata = match field {
                AngularField::Input(i) => i.property_span.is_none(),
                AngularField::Output(o) => o.property_span.is_none(),
                _ => false,
            };
            if declared_by_metadata {
                bind_to_member(field, members);
            }
        }
    }

    /// Fold whatever `evaluated_io` holds that can now be read, keeping the rest for later.
    pub(crate) fn fold_pending_io(&mut self) {
        let Some(mut pending) = self.evaluated_io.take() else {
            return;
        };
        let options = std::mem::take(&mut pending.member_options);
        for option in options {
            if !self.fold_member_options(&option) {
                pending.member_options.push(option);
            }
        }
        let arrays = std::mem::take(&mut pending.arrays);
        for array in arrays {
            if !self.fold_io_array(&array, &pending.members) {
                pending.arrays.push(array);
            }
        }
        if !pending.is_empty() {
            self.evaluated_io = Some(pending);
        }
    }

    /// The `NG1010` issues the declarations still in `evaluated_io` would raise if their
    /// holes stayed unresolved — what syntax mode, which never completes them, reports.
    pub(crate) fn unresolved_io_issues(&self) -> Vec<ValueIssue> {
        let Some(pending) = &self.evaluated_io else {
            return Vec::new();
        };
        let mut demoted = pending.as_ref().clone();
        demoted.demote();
        let mut probe = DirectiveData {
            evaluated_io: Some(Box::new(demoted)),
            ..Default::default()
        };
        probe.fold_pending_io();
        probe.io_issues
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn strings(values: &[&str]) -> ResolvedValue {
        ResolvedValue::Array(
            values
                .iter()
                .map(|v| ResolvedValue::String(v.to_string()))
                .collect(),
        )
    }

    fn entries(read: Read<Vec<IoEntry>>) -> Vec<(String, String, bool)> {
        match read {
            Read::Ready(entries) => entries
                .into_iter()
                .map(|e| (e.class_property, e.binding, e.required))
                .collect(),
            Read::Pending => panic!("unexpected pending read"),
            Read::Invalid(message) => panic!("unexpected invalid read: {message}"),
        }
    }

    fn invalid<T>(read: Read<T>) -> String {
        match read {
            Read::Invalid(message) => message,
            _ => panic!("expected an invalid read"),
        }
    }

    #[test]
    fn mapping_strings_follow_split_with_a_limit() {
        assert_eq!(
            parse_mapping_string(" a : b "),
            ("a".to_string(), "b".to_string())
        );
        assert_eq!(
            parse_mapping_string("a"),
            ("a".to_string(), "a".to_string())
        );
        // `'a:b:c'.split(':', 2)` is `['a', 'b']`.
        assert_eq!(
            parse_mapping_string("a:b:c"),
            ("a".to_string(), "b".to_string())
        );
    }

    #[test]
    fn inputs_array_reads_strings_and_objects() {
        let mut config = crate::evaluator::ValueMap::new();
        config.insert("name".to_string(), ResolvedValue::String("x".into()));
        config.insert("alias".to_string(), ResolvedValue::String("y".into()));
        config.insert("required".to_string(), ResolvedValue::Boolean(true));
        // A hole in a part the read does not need is not waited on.
        config.insert(
            "transform".to_string(),
            ResolvedValue::dynamic(0, Span::new(0, 0), crate::evaluator::DynamicReason::Unknown),
        );
        let value = ResolvedValue::Array(vec![
            ResolvedValue::String("a".into()),
            ResolvedValue::String("b: c".into()),
            ResolvedValue::Map(config),
        ]);
        assert_eq!(
            entries(read_inputs_array(&value)),
            vec![
                ("a".to_string(), "a".to_string(), false),
                ("b".to_string(), "c".to_string(), false),
                ("x".to_string(), "y".to_string(), true),
            ]
        );
    }

    #[test]
    fn inputs_array_reports_ngtsc_messages() {
        assert_eq!(
            invalid(read_inputs_array(&ResolvedValue::String("a".into()))),
            "Failed to resolve @Directive.inputs to an array"
        );
        assert_eq!(
            invalid(read_inputs_array(&ResolvedValue::Array(vec![
                ResolvedValue::String("a".into()),
                ResolvedValue::Number(1.0),
            ]))),
            "@Directive.inputs array can only contain strings or object literals"
        );
        let mut nameless = crate::evaluator::ValueMap::new();
        nameless.insert("alias".to_string(), ResolvedValue::String("y".into()));
        assert_eq!(
            invalid(read_inputs_array(&ResolvedValue::Array(vec![
                ResolvedValue::Map(nameless)
            ]))),
            "Value at position 0 of @Directive.inputs array must have a \"name\" property"
        );
    }

    #[test]
    fn outputs_array_requires_strings() {
        assert_eq!(
            entries(read_outputs_array(&strings(&["a", "b: c"]))),
            vec![
                ("a".to_string(), "a".to_string(), false),
                ("b".to_string(), "c".to_string(), false),
            ]
        );
        assert_eq!(
            invalid(read_outputs_array(&ResolvedValue::Array(vec![
                ResolvedValue::String("a".into()),
                ResolvedValue::Boolean(true),
            ]))),
            "Failed to resolve outputs at position 1 to a string"
        );
    }

    #[test]
    fn member_arguments() {
        let Read::Ready(options) = read_input_options(&ResolvedValue::String("a".into())) else {
            panic!("expected a string alias to read");
        };
        assert_eq!(options.alias.as_deref(), Some("a"));
        assert_eq!(
            invalid(read_input_options(&ResolvedValue::Number(1.0))),
            "@Input decorator argument must resolve to a string or an object literal"
        );
        assert_eq!(
            invalid(read_output_alias(&ResolvedValue::Number(1.0))),
            "@Output decorator argument must resolve to a string"
        );
    }

    fn engine_for(
        files: &[(&str, &str)],
        entry: &str,
    ) -> std::sync::Arc<crate::query::engine::QueryEngine<crate::fs::OverlayFileSystem>> {
        use std::sync::Arc;
        let fs = crate::test_utils::create_test_fs(files);
        let resolver = Arc::new(oxc_resolver::ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..oxc_resolver::ResolveOptions::default()
            },
        ));
        let registry = Arc::new(crate::resource_registry::ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![std::path::PathBuf::from(
            entry,
        )]));
        crate::query::engine::QueryEngine::new_default(fs, resolver, registry, entrypoints)
    }

    fn wire_inputs(fields: &[crate::AngularFieldMetadata]) -> Vec<(String, Option<String>, bool)> {
        fields
            .iter()
            .filter_map(|f| f.input.as_ref())
            .map(|i| (i.name.clone(), i.alias.clone(), i.property_span.is_some()))
            .collect()
    }

    #[test]
    fn imported_io_declarations_reach_the_symbol_table() {
        let names_ts = r#"
            export const INPUTS = ['value', 'size: sizeAlias'];
            export const LABEL = 'labelAlias';
        "#;
        let field_ts = r#"
            import { Directive, Input } from '@angular/core';
            import { INPUTS, LABEL } from './names';
            const LOCAL = ['local: localAlias'];
            @Directive({ selector: '[field]', inputs: [...INPUTS, ...LOCAL] })
            export class Field {
                value = '';
                size = 0;
                local = '';
                @Input(LABEL) label = '';
            }
        "#;
        let engine = engine_for(
            &[("/app/names.ts", names_ts), ("/app/field.ts", field_ts)],
            "/app/field.ts",
        );
        let field_id = engine.intern_path("/app/field.ts");
        let ctx = crate::query::QueryContext::new(engine);
        let (syntax, evaluated) = futures::executor::block_on(async {
            (
                ctx.analyze_file_syntax(field_id).await,
                ctx.analyze_file_evaluated(field_id).await,
            )
        });

        // Within the file, the array and the alias both wait on `./names`.
        let crate::analyzer::DecoratorData::Directive(directive) = &syntax.classes[0].decorator
        else {
            panic!("expected a directive");
        };
        let pending = directive
            .evaluated_io
            .as_ref()
            .expect("pending declarations");
        assert_eq!(pending.arrays.len(), 1);
        assert_eq!(pending.member_options.len(), 1);
        assert_eq!(
            wire_inputs(syntax.class_index["Field"].fields.as_deref().unwrap()),
            vec![("label".to_string(), None, true)]
        );

        // Evaluated across files, every entry is a declared input bound to its member, with the
        // array's entries ahead of the member's own declaration.
        assert_eq!(
            wire_inputs(evaluated.class_index["Field"].fields.as_deref().unwrap()),
            vec![
                ("value".to_string(), None, true),
                ("size".to_string(), Some("sizeAlias".to_string()), true),
                ("local".to_string(), Some("localAlias".to_string()), true),
                ("label".to_string(), Some("labelAlias".to_string()), true),
            ]
        );
    }

    #[test]
    fn member_declaration_wins_over_an_imported_array_entry() {
        let names_ts = "export const INPUTS = ['value: fromArray'];";
        let field_ts = r#"
            import { Directive, Input } from '@angular/core';
            import { INPUTS } from './names';
            @Directive({ selector: '[field]', inputs: INPUTS })
            export class Field {
                @Input('fromMember') value = '';
            }
        "#;
        let engine = engine_for(
            &[("/app/names.ts", names_ts), ("/app/field.ts", field_ts)],
            "/app/field.ts",
        );
        let field_id = engine.intern_path("/app/field.ts");
        let ctx = crate::query::QueryContext::new(engine);
        let evaluated = futures::executor::block_on(ctx.analyze_file_evaluated(field_id));
        assert_eq!(
            wire_inputs(evaluated.class_index["Field"].fields.as_deref().unwrap()),
            vec![("value".to_string(), Some("fromMember".to_string()), true)]
        );
    }
}
