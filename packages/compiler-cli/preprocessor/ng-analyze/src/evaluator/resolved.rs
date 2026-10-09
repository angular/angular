//! [`Resolved<T>`]: a partially evaluated value whose consumer expects a `T`.
//!
//! Created from a Syntax-mode evaluation (may contain `Incomplete` holes); Stage 2 either
//! *completes* it (postcondition hole-free) or *demotes* it (holes → `Dynamic`).
//!
//! - [`Resolved::get_optional`] — `Incomplete`, `Dynamic`, and shape mismatches lower to `None`.
//! - [`Resolved::get_required`] — any unresolved state is an error.
//! - [`Resolved::get_checked`] — `Err` on lingering `Incomplete` (driver bug); `Dynamic` → `None`.

use std::marker::PhantomData;

use crate::evaluator::value::{demote_incomplete_to_dynamic, ResolvedValue};

/// Marker error: a hole-free read encountered `Incomplete` holes (Stage 2 invariant violation).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct StillIncomplete;

/// Why a required-field read failed.
#[derive(Clone, Debug, PartialEq)]
pub enum UnresolvedCause {
    /// The value still contains cross-file holes (normal at the syntax stage; an invariant
    /// violation after semantic resolution).
    Incomplete,
    /// The value is genuinely not statically evaluable.
    Dynamic,
    /// The value resolved, but not to the expected shape.
    WrongShape,
}

/// How to read a hole-free [`ResolvedValue`] as a `T`. `None` = dynamic or shape mismatch.
pub trait FromResolved: Sized {
    fn from_value(value: &ResolvedValue, origin: crate::query::FileId) -> Option<Self>;
}

impl FromResolved for String {
    /// Strict string match without coercing numbers, booleans, or `EnumValue`s.
    // TODO(parity): widen per-field where ngtsc accepts string-coercible values.
    fn from_value(value: &ResolvedValue, _origin: crate::query::FileId) -> Option<Self> {
        match value.unwrap_named() {
            ResolvedValue::String(s) => Some(s.clone()),
            _ => None,
        }
    }
}

impl FromResolved for bool {
    /// Only a value that folded to a boolean, as ngtsc's `typeof value !== 'boolean'` checks
    /// require.
    fn from_value(value: &ResolvedValue, _origin: crate::query::FileId) -> Option<Self> {
        match value.unwrap_named() {
            ResolvedValue::Boolean(b) => Some(*b),
            _ => None,
        }
    }
}

/// `exportAs` after partial evaluation. ngtsc requires the value to be a string and splits it
/// on commas, trimming each name.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ExportAsNames(pub Vec<String>);

impl FromResolved for ExportAsNames {
    fn from_value(value: &ResolvedValue, _origin: crate::query::FileId) -> Option<Self> {
        let ResolvedValue::String(names) = value.unwrap_named() else {
            return None;
        };
        Some(ExportAsNames(
            names
                .split(',')
                .map(|name| name.trim().to_string())
                .collect(),
        ))
    }
}

/// A value that must be an array of strings, as `@Directive.outputs` and `@Component.styleUrls`
/// are read.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct StringList(pub Vec<String>);

impl FromResolved for StringList {
    fn from_value(value: &ResolvedValue, _origin: crate::query::FileId) -> Option<Self> {
        let ResolvedValue::Array(items) = value.unwrap_named() else {
            return None;
        };
        items
            .iter()
            .map(|item| match item.unwrap_named() {
                ResolvedValue::String(s) => Some(s.clone()),
                _ => None,
            })
            .collect::<Option<Vec<_>>>()
            .map(StringList)
    }
}

/// `@Component.styles` after partial evaluation: ngtsc's `parseDirectiveStyles` accepts a
/// single string or an array of strings.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct InlineStyles(pub Vec<String>);

impl FromResolved for InlineStyles {
    fn from_value(value: &ResolvedValue, origin: crate::query::FileId) -> Option<Self> {
        if let ResolvedValue::String(style) = value.unwrap_named() {
            return Some(InlineStyles(vec![style.clone()]));
        }
        StringList::from_value(value, origin).map(|list| InlineStyles(list.0))
    }
}

/// The numeric value of a `ViewEncapsulation` member reached through the partial evaluator.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ViewEncapsulationValue(pub i32);

/// The numeric value of a `ChangeDetectionStrategy` member reached through the partial
/// evaluator.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ChangeDetectionStrategyValue(pub i32);

/// Read `value` as a member of the `@angular/core` enum named `enum_name`, mirroring ngtsc's
/// `resolveEnumValue` + `isAngularCoreReferenceWithPotentialAliasing` (stripping any bundler `$N`
/// suffix and requiring `@angular/core` ownership).
/// https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/evaluation.ts#L20-L45
fn core_enum_member_number(value: &ResolvedValue, enum_name: &str) -> Option<i32> {
    let ResolvedValue::EnumValue(ev) = value.unwrap_named() else {
        return None;
    };
    let declared = ev.enum_ref.name.as_str();
    let stripped = match declared.rfind('$') {
        Some(pos)
            if pos + 1 < declared.len()
                && declared[pos + 1..].bytes().all(|b| b.is_ascii_digit()) =>
        {
            &declared[..pos]
        }
        _ => declared,
    };
    if stripped != enum_name {
        return None;
    }
    // `ownedByModuleGuess === '@angular/core'`: same-named user enums are rejected, and no guess
    // (never crossed a package boundary) counts as not-core.
    let owned_by_core = ev
        .enum_ref
        .owning_reference
        .as_ref()
        .is_some_and(|o| o.specifier() == "@angular/core");
    if !owned_by_core {
        return None;
    }
    match ev.resolved {
        ResolvedValue::Number(n) => Some(n as i32),
        _ => None,
    }
}

/// True when the evaluator reduced `value` to a member of *some* enum, `@angular/core`'s or
/// not — the "the evaluator answered and the answer was rejected" case.
pub fn is_enum_member_value(value: &ResolvedValue) -> bool {
    matches!(value.unwrap_named(), ResolvedValue::EnumValue(_))
}

impl FromResolved for ViewEncapsulationValue {
    fn from_value(value: &ResolvedValue, _origin: crate::query::FileId) -> Option<Self> {
        core_enum_member_number(value, "ViewEncapsulation").map(ViewEncapsulationValue)
    }
}

impl From<ViewEncapsulationValue> for i32 {
    fn from(value: ViewEncapsulationValue) -> Self {
        value.0
    }
}

impl FromResolved for ChangeDetectionStrategyValue {
    fn from_value(value: &ResolvedValue, _origin: crate::query::FileId) -> Option<Self> {
        core_enum_member_number(value, "ChangeDetectionStrategy").map(ChangeDetectionStrategyValue)
    }
}

impl From<ChangeDetectionStrategyValue> for i32 {
    fn from(value: ChangeDetectionStrategyValue) -> Self {
        value.0
    }
}

/// The value of one `host` metadata entry after partial evaluation (`string | Expression`).
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L2021-L2047
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum HostMetadataValue {
    /// Folded to a string.
    Static(String),
    /// Not statically evaluable; span of the offending node within [`Resolved::origin`] (emitted
    /// verbatim as `WrappedNodeExpr`).
    Dynamic(oxc_span::Span),
}

/// A `host` metadata object reduced by the partial evaluator, in source order.
///
/// TODO(parity): entries that resolve to neither a string nor a same-file dynamic node are dropped;
/// ngtsc raises `ErrorCode.VALUE_HAS_WRONG_TYPE` and emits no definition. Such values are already
/// TS type errors (`host` is `{[key: string]: string}`), so dropping approximates "no output".
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct HostMetadata(pub Vec<(String, HostMetadataValue)>);

impl FromResolved for HostMetadata {
    fn from_value(value: &ResolvedValue, origin: crate::query::FileId) -> Option<Self> {
        let ResolvedValue::Map(map) = value.unwrap_named() else {
            return None;
        };
        let mut entries = Vec::with_capacity(map.len());
        for (key, value) in map.iter() {
            let Some(value) = host_metadata_value(value, origin) else {
                continue;
            };
            entries.push((key.clone(), value));
        }
        Some(HostMetadata(entries))
    }
}

fn host_metadata_value(
    value: &ResolvedValue,
    origin: crate::query::FileId,
) -> Option<HostMetadataValue> {
    match value.unwrap_named() {
        ResolvedValue::String(s) => Some(HostMetadataValue::Static(s.clone())),
        ResolvedValue::EnumValue(member) => match member.resolved.unwrap_named() {
            ResolvedValue::String(s) => Some(HostMetadataValue::Static(s.clone())),
            _ => None,
        },
        // `anchor_on_hole` re-anchors cross-file dynamics on the local reference, so imported
        // constants land here too.
        ResolvedValue::Dynamic(dynamic) if dynamic.file == origin => {
            Some(HostMetadataValue::Dynamic(dynamic.span))
        }
        // The syntax wire is projected before Stage 2; emit the hole verbatim, matching what the
        // semantic wire emits once it demotes to `Dynamic`.
        ResolvedValue::Incomplete(hole) if hole.file == origin => {
            Some(HostMetadataValue::Dynamic(hole.span))
        }
        // TODO(parity): dynamic entries inside an imported `host` object have no local span and
        // are dropped. ngtsc emits the foreign node, which refers to a binding not in scope here.
        _ => None,
    }
}

/// A decorator query's predicate reduced to selector strings (`string[]` arm of
/// `R3QueryMetadata.predicate`). Each entry is kept unsplit until `getQueryPredicate` splits on
/// commas at compile time.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct QuerySelectors(pub Vec<String>);

impl FromResolved for QuerySelectors {
    /// `None` means the predicate is emitted verbatim as an expression (`Reference`,
    /// `DynamicValue`, or syntax-mode hole).
    ///
    /// TODO(parity): non-string/non-reference values also lower to `None` instead of raising
    /// `VALUE_HAS_WRONG_TYPE`.
    fn from_value(value: &ResolvedValue, _origin: crate::query::FileId) -> Option<Self> {
        match value.unwrap_named() {
            ResolvedValue::String(s) => Some(QuerySelectors(vec![s.clone()])),
            ResolvedValue::Array(items) => items
                .iter()
                .map(|item| match item.unwrap_named() {
                    ResolvedValue::String(s) => Some(s.clone()),
                    _ => None,
                })
                .collect::<Option<Vec<_>>>()
                .map(QuerySelectors),
            _ => None,
        }
    }
}

/// `@Component.styles` as ngtsc's `parseDirectiveStyles` reads it: a string or an array of
/// strings, normalized to a list.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ComponentStyles(pub Vec<String>);

/// The `NG1010` cases ngtsc reports for `@Component.styles`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ComponentStylesError {
    /// The value is neither a string nor an array.
    NotStringOrArray,
    /// The first array entry that is not a string.
    EntryNotString(usize),
}

impl ComponentStyles {
    pub fn parse(value: &ResolvedValue) -> Result<Self, ComponentStylesError> {
        match value.unwrap_named() {
            ResolvedValue::String(s) => Ok(ComponentStyles(vec![s.clone()])),
            ResolvedValue::Array(items) => items
                .iter()
                .enumerate()
                .map(|(index, item)| match item.unwrap_named() {
                    ResolvedValue::String(s) => Ok(s.clone()),
                    _ => Err(ComponentStylesError::EntryNotString(index)),
                })
                .collect::<Result<Vec<_>, _>>()
                .map(ComponentStyles),
            _ => Err(ComponentStylesError::NotStringOrArray),
        }
    }
}

impl FromResolved for ComponentStyles {
    /// All-or-nothing: a single bad entry yields `None` rather than a partial list.
    fn from_value(value: &ResolvedValue, _origin: crate::query::FileId) -> Option<Self> {
        Self::parse(value).ok()
    }
}

impl FromResolved for Vec<crate::types::analysis::Reference> {
    fn from_value(value: &ResolvedValue, origin: crate::query::FileId) -> Option<Self> {
        let mut refs = Vec::new();
        if collect_references(value, origin, &mut refs) {
            Some(refs)
        } else {
            None
        }
    }
}

/// Build the analyzer-facing `Reference` from an unresolved import hole.
fn reference_from_import_hole(
    hole_file: crate::query::FileId,
    target: &crate::evaluator::value::UnresolvedReference,
    origin: crate::query::FileId,
) -> crate::types::analysis::Reference {
    let name = match &target.symbol {
        crate::analyzer::ImportKind::Named(s) => s.clone(),
        crate::analyzer::ImportKind::Default => "default".to_string(),
        crate::analyzer::ImportKind::Namespace => "*".to_string(),
    };
    let mut aliases = std::collections::HashMap::new();
    if let Some(local_name) = &target.local_name {
        aliases.insert(origin, local_name.clone());
    }
    crate::types::analysis::Reference {
        file: hole_file,
        owning_reference: Some(
            crate::types::analysis::OwningReference::from_source_specifier(
                target.specifier.clone(),
                name.clone(),
            ),
        ),
        name,
        aliases,
        is_default_export: matches!(target.symbol, crate::analyzer::ImportKind::Default),
    }
}

fn to_reference(r: &crate::evaluator::value::ValueReference) -> crate::types::analysis::Reference {
    crate::types::analysis::Reference::from_value_reference(r)
}

fn collect_references(
    value: &ResolvedValue,
    origin: crate::query::FileId,
    out: &mut Vec<crate::types::analysis::Reference>,
) -> bool {
    match value {
        ResolvedValue::Named { value: inner, .. } => collect_references(inner, origin, out),
        ResolvedValue::Array(items) => {
            for item in items {
                if !collect_references(item, origin, out) {
                    return false;
                }
            }
            true
        }
        ResolvedValue::Reference(r) => {
            out.push(to_reference(r));
            true
        }
        ResolvedValue::Incomplete(hole) => {
            if !hole.transparent {
                return false;
            }
            match &hole.dep {
                crate::evaluator::value::IncompleteDep::Reference(target) => {
                    out.push(reference_from_import_hole(hole.file, target, origin));
                    true
                }
                crate::evaluator::value::IncompleteDep::Member { base, .. } => {
                    out.push(to_reference(base));
                    true
                }
                crate::evaluator::value::IncompleteDep::Call { callee, .. } => {
                    out.push(to_reference(callee));
                    true
                }
            }
        }
        ResolvedValue::Synthetic(
            crate::evaluator::value::SyntheticValue::ModuleWithProviders { ng_module, .. },
        ) => {
            out.push(to_reference(ng_module));
            true
        }
        ResolvedValue::Map(map) => {
            if let Some(ng_module) = map.get("ngModule") {
                collect_references(ng_module, origin, out)
            } else {
                false
            }
        }
        ResolvedValue::Dynamic(d) => {
            let crate::evaluator::value::DynamicReason::UnresolvedImport(unresolved) = &d.reason
            else {
                return false;
            };
            out.push(reference_from_import_hole(d.file, unresolved, origin));
            true
        }
        _ => false,
    }
}

/// Destructure an evaluated `hostDirectives` array into entries (`extractHostDirectives` in ngtsc `shared.ts`).
impl FromResolved for Vec<crate::types::analysis::HostDirectiveEntry> {
    fn from_value(value: &ResolvedValue, origin: crate::query::FileId) -> Option<Self> {
        let ResolvedValue::Array(items) = value.unwrap_named() else {
            return None;
        };
        let mut entries = Vec::with_capacity(items.len());
        for item in items {
            let Some(entry) = host_directive_entry(item, origin) else {
                // Defer to Stage 2 if any hole remains; otherwise skip invalid entries.
                if value.contains_incomplete() {
                    return None;
                }
                continue;
            };
            entries.push(entry);
        }
        Some(entries)
    }
}

fn host_directive_entry(
    value: &ResolvedValue,
    origin: crate::query::FileId,
) -> Option<crate::types::analysis::HostDirectiveEntry> {
    let (directive_value, inputs, outputs) = match value.unwrap_named() {
        ResolvedValue::Map(map) => {
            if map
                .get("inputs")
                .is_some_and(ResolvedValue::contains_incomplete)
                || map
                    .get("outputs")
                    .is_some_and(ResolvedValue::contains_incomplete)
            {
                return None;
            }
            (
                map.get("directive")?,
                host_directive_mapping(map.get("inputs")),
                host_directive_mapping(map.get("outputs")),
            )
        }
        _ => (value, None, None),
    };

    let (directive, is_forward_ref) = host_directive_reference(directive_value, origin)?;
    Some(crate::types::analysis::HostDirectiveEntry {
        directive,
        is_forward_ref,
        inputs,
        outputs,
    })
}

/// Extract the host directive class reference and `isForwardReference` flag.
fn host_directive_reference(
    value: &ResolvedValue,
    origin: crate::query::FileId,
) -> Option<(crate::types::analysis::Reference, bool)> {
    match value.unwrap_named() {
        ResolvedValue::Reference(reference) => Some((
            crate::types::analysis::Reference::from_value_reference(reference),
            reference.synthetic,
        )),
        ResolvedValue::Incomplete(hole) if hole.transparent => match &hole.dep {
            crate::evaluator::value::IncompleteDep::Reference(target) => Some((
                reference_from_import_hole(hole.file, target, origin),
                hole.synthetic,
            )),
            _ => None,
        },
        ResolvedValue::Dynamic(d) => {
            let crate::evaluator::value::DynamicReason::UnresolvedImport(target) = &d.reason else {
                return None;
            };
            Some((reference_from_import_hole(d.file, target, origin), false))
        }
        _ => None,
    }
}

/// Parse `'field'` or `'field: alias'` mapping entries (`parseMappingStringArray` in ngtsc `shared.ts`).
/// Returns `Some(vec![])` for a present-but-empty array so the emitter preserves the object form.
fn host_directive_mapping(
    value: Option<&ResolvedValue>,
) -> Option<Vec<crate::types::metadata::HostDirectiveBinding>> {
    let ResolvedValue::Array(items) = value?.unwrap_named() else {
        return None;
    };
    let mut list = Vec::with_capacity(items.len());
    for item in items {
        let ResolvedValue::String(text) = item.unwrap_named() else {
            return None;
        };
        let mut parts = text.split(':');
        let field = parts.next().unwrap_or("").trim();
        let alias = parts.next().map(str::trim).unwrap_or(field);
        list.push(crate::types::metadata::HostDirectiveBinding {
            public_name: field.to_string(),
            binding_name: alias.to_string(),
        });
    }
    Some(list)
}

/// A Stage-1 partial evaluation whose consumer expects a `T`.
///
/// `PhantomData<fn() -> T>` keeps `Send`/`Sync` independent of `T`.
#[derive(Clone, Debug)]
pub struct Resolved<T> {
    value: ResolvedValue,
    pub origin: crate::query::FileId,
    _expect: PhantomData<fn() -> T>,
}

impl<T> Resolved<T> {
    /// Wrap a Syntax-mode evaluation result capturing precisely its origin file.
    pub fn from_syntax(value: ResolvedValue, origin: crate::query::FileId) -> Self {
        Self {
            value,
            origin,
            _expect: PhantomData,
        }
    }

    /// The raw evaluator value — for the semantic driver and tests.
    pub fn raw(&self) -> &ResolvedValue {
        &self.value
    }

    pub fn contains_incomplete(&self) -> bool {
        self.value.contains_incomplete()
    }

    /// Completely resolve this value in-place by filling all its holes from `ctx` directly.
    pub async fn complete_with<Fs: crate::ResourceResolverFs + Clone + 'static>(
        &mut self,
        ctx: &crate::query::QueryContext<Fs>,
        foreign: &[&dyn crate::evaluator::ForeignFunctionResolver],
    ) {
        if !self.value.contains_incomplete() {
            return;
        }
        self.value = crate::evaluator::evaluate_value_completely(ctx, &self.value, foreign).await;
    }

    /// Demote remaining holes to `Dynamic` in place — Stage-2 invariant enforcement for
    /// fields not driven through the semantic driver.
    pub fn demote(&mut self) {
        let value = std::mem::replace(&mut self.value, ResolvedValue::Undefined);
        self.value = demote_incomplete_to_dynamic(value);
    }

    /// Update/overwrite the evaluated value.
    pub fn set_value(&mut self, value: ResolvedValue) {
        self.value = value;
    }

    pub fn mutate_references<F>(&mut self, f: &mut F)
    where
        F: FnMut(&mut crate::evaluator::value::ValueReference),
    {
        self.value.mutate_references(f);
    }
}

impl<T: FromResolved> Resolved<T> {
    /// Optional-field read: `Incomplete`, `Dynamic`, and shape mismatch all lower to `None`.
    pub fn get_optional(&self) -> Option<T> {
        T::from_value(&self.value, self.origin)
    }

    /// Required-field read: the field is needed to compile, so any unresolved state is an
    /// error — in both wire projections.
    pub fn get_required(&self) -> Result<T, UnresolvedCause> {
        if self.value.contains_incomplete() {
            return Err(UnresolvedCause::Incomplete);
        }
        if self.value.is_dynamic() {
            return Err(UnresolvedCause::Dynamic);
        }
        T::from_value(&self.value, self.origin).ok_or(UnresolvedCause::WrongShape)
    }

    /// Optional-field read under the semantic invariant: `Err` only on lingering
    /// `Incomplete`; `Dynamic` (and mismatch) lower to `None`.
    pub fn get_checked(&self) -> Result<Option<T>, StillIncomplete> {
        if self.value.contains_incomplete() {
            return Err(StillIncomplete);
        }
        Ok(T::from_value(&self.value, self.origin))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::analyzer::ImportKind;
    use crate::evaluator::value::{IncompleteDep, UnresolvedReference};

    fn incomplete_value() -> ResolvedValue {
        ResolvedValue::incomplete(
            0,
            oxc_span::Span::new(0, 0),
            None,
            IncompleteDep::Reference(UnresolvedReference {
                importer: 0,
                specifier: "./x".to_string(),
                symbol: ImportKind::Named("X".to_string()),
                local_name: Some("X".to_string()),
                is_namespace_member: false,
            }),
        )
    }

    fn dynamic_value() -> ResolvedValue {
        ResolvedValue::dynamic(
            0,
            oxc_span::Span::new(0, 0),
            crate::evaluator::DynamicReason::Unknown,
        )
    }

    fn core_enum_value(
        declared_name: &str,
        member: &str,
        resolved: ResolvedValue,
        owning_specifier: Option<&str>,
    ) -> ResolvedValue {
        ResolvedValue::EnumValue(Box::new(crate::evaluator::value::EnumValue {
            enum_ref: crate::evaluator::value::ValueReference {
                file: 1,
                name: declared_name.to_string(),
                member: None,
                reference_id: None,
                span: oxc_span::Span::new(0, 0),
                kind: crate::evaluator::value::DeclKind::Enum,
                owning_reference: owning_specifier.map(|specifier| {
                    crate::types::analysis::OwningReference::from_source_specifier(
                        specifier,
                        declared_name,
                    )
                }),
                synthetic: false,
                aliases: Vec::new(),
                is_default_export: false,
            },
            name: member.to_string(),
            resolved,
        }))
    }

    #[test]
    fn host_metadata_reads_strings_enums_and_unevaluable_nodes() {
        let mut map = crate::evaluator::ValueMap::default();
        map.insert("data-str".to_string(), ResolvedValue::String("v".into()));
        map.insert(
            "data-enum".to_string(),
            core_enum_value(
                "E",
                "Val",
                ResolvedValue::String("enum-value".into()),
                Some("./e"),
            ),
        );
        map.insert(
            "data-dyn".to_string(),
            ResolvedValue::dynamic(
                0,
                oxc_span::Span::new(4, 9),
                crate::evaluator::DynamicReason::Unknown,
            ),
        );
        // Syntax-mode hole: same-file span, emitted verbatim until Stage 2 closes it.
        map.insert("data-hole".to_string(), incomplete_value());
        // ngtsc reports these as `VALUE_HAS_WRONG_TYPE`; with no diagnostics channel they drop.
        map.insert("data-num".to_string(), ResolvedValue::Number(1.0));
        map.insert("data-bool".to_string(), ResolvedValue::Boolean(true));
        // A node in another file has no text this file could emit.
        map.insert(
            "data-foreign".to_string(),
            ResolvedValue::dynamic(
                7,
                oxc_span::Span::new(0, 1),
                crate::evaluator::DynamicReason::Unknown,
            ),
        );

        let resolved: Resolved<HostMetadata> = Resolved::from_syntax(ResolvedValue::Map(map), 0);
        assert_eq!(
            resolved.get_optional(),
            Some(HostMetadata(vec![
                (
                    "data-str".to_string(),
                    HostMetadataValue::Static("v".to_string())
                ),
                (
                    "data-enum".to_string(),
                    HostMetadataValue::Static("enum-value".to_string())
                ),
                (
                    "data-dyn".to_string(),
                    HostMetadataValue::Dynamic(oxc_span::Span::new(4, 9))
                ),
                (
                    "data-hole".to_string(),
                    HostMetadataValue::Dynamic(oxc_span::Span::new(0, 0))
                ),
            ]))
        );
    }

    #[test]
    fn host_metadata_requires_an_object() {
        // ngtsc's "Decorator host metadata must be an object" check.
        let dynamic: Resolved<HostMetadata> = Resolved::from_syntax(dynamic_value(), 0);
        assert_eq!(dynamic.get_optional(), None);
        let string: Resolved<HostMetadata> =
            Resolved::from_syntax(ResolvedValue::String("nope".into()), 0);
        assert_eq!(string.get_optional(), None);
    }

    #[test]
    fn core_enum_member_reads() {
        let read =
            |value: &ResolvedValue| ViewEncapsulationValue::from_value(value, 0).map(|v| v.0);
        // The plain @angular/core enum member.
        assert_eq!(
            read(&core_enum_value(
                "ViewEncapsulation",
                "None",
                ResolvedValue::Number(2.0),
                Some("@angular/core"),
            )),
            Some(2)
        );
        // A bundler-aliased declaration name (`ViewEncapsulation$1`) still matches.
        assert_eq!(
            read(&core_enum_value(
                "ViewEncapsulation$1",
                "ShadowDom",
                ResolvedValue::Number(3.0),
                Some("@angular/core"),
            )),
            Some(3)
        );
        // A user enum that merely shares the name is not @angular/core's.
        assert_eq!(
            read(&core_enum_value(
                "ViewEncapsulation",
                "None",
                ResolvedValue::Number(99.0),
                None,
            )),
            None
        );
        assert_eq!(
            read(&core_enum_value(
                "ViewEncapsulation",
                "None",
                ResolvedValue::Number(99.0),
                Some("some-other-lib"),
            )),
            None
        );
        // Wrong enum name, or a member that did not fold to a number.
        assert_eq!(
            read(&core_enum_value(
                "ChangeDetectionStrategy",
                "OnPush",
                ResolvedValue::Number(0.0),
                Some("@angular/core"),
            )),
            None
        );
        assert_eq!(
            read(&core_enum_value(
                "ViewEncapsulation",
                "None",
                ResolvedValue::String("None".to_string()),
                Some("@angular/core"),
            )),
            None
        );
    }

    #[test]
    fn query_selectors_read_strings_and_string_arrays() {
        let read = |value: ResolvedValue| {
            Resolved::<QuerySelectors>::from_syntax(value, 0)
                .get_optional()
                .map(|s| s.0)
        };
        let string = |s: &str| ResolvedValue::String(s.to_string());

        assert_eq!(read(string("a, b")), Some(vec!["a, b".to_string()]));
        // Array elements stay whole; `getQueryPredicate` does the comma split.
        assert_eq!(
            read(ResolvedValue::Array(vec![string("x,y"), string("z")])),
            Some(vec!["x,y".to_string(), "z".to_string()])
        );
        assert_eq!(read(ResolvedValue::Array(Vec::new())), Some(Vec::new()));
        // A string reached through a named constant.
        assert_eq!(
            read(ResolvedValue::Named {
                span: oxc_span::Span::new(0, 0),
                value: Box::new(string("sel")),
                synthetic: false,
            }),
            Some(vec!["sel".to_string()])
        );

        // Everything else is emitted as the expression it was written as.
        assert_eq!(read(dynamic_value()), None);
        assert_eq!(read(incomplete_value()), None);
        assert_eq!(
            read(ResolvedValue::Array(vec![string("a"), incomplete_value()])),
            None
        );
        assert_eq!(read(ResolvedValue::Number(1.0)), None);
    }

    #[test]
    fn component_styles_read_strings_and_string_arrays() {
        let string = |s: &str| ResolvedValue::String(s.to_string());
        let parse = |value: ResolvedValue| ComponentStyles::parse(&value).map(|s| s.0);

        assert_eq!(parse(string(".a{}")), Ok(vec![".a{}".to_string()]));
        assert_eq!(
            parse(ResolvedValue::Array(vec![string(".a{}"), string(".b{}")])),
            Ok(vec![".a{}".to_string(), ".b{}".to_string()])
        );
        assert_eq!(parse(ResolvedValue::Array(Vec::new())), Ok(Vec::new()));
        // Named constants, at the root and per entry.
        let named = |value: ResolvedValue| ResolvedValue::Named {
            span: oxc_span::Span::new(0, 0),
            value: Box::new(value),
            synthetic: false,
        };
        assert_eq!(
            parse(named(ResolvedValue::Array(vec![named(string(".c{}"))]))),
            Ok(vec![".c{}".to_string()])
        );

        // The first non-string entry is reported.
        assert_eq!(
            parse(ResolvedValue::Array(vec![
                string(".a{}"),
                dynamic_value(),
                ResolvedValue::Number(1.0),
            ])),
            Err(ComponentStylesError::EntryNotString(1))
        );
        assert_eq!(
            parse(ResolvedValue::Array(vec![incomplete_value()])),
            Err(ComponentStylesError::EntryNotString(0))
        );
        assert_eq!(
            parse(dynamic_value()),
            Err(ComponentStylesError::NotStringOrArray)
        );
        assert_eq!(
            parse(ResolvedValue::Number(1.0)),
            Err(ComponentStylesError::NotStringOrArray)
        );

        // No partial list.
        let partial: Resolved<ComponentStyles> = Resolved::from_syntax(
            ResolvedValue::Array(vec![string(".a{}"), dynamic_value()]),
            0,
        );
        assert_eq!(partial.get_optional(), None);
    }

    #[test]
    fn tri_state_reads() {
        let resolved: Resolved<String> =
            Resolved::from_syntax(ResolvedValue::String("sel".into()), 0);
        assert_eq!(resolved.get_optional(), Some("sel".to_string()));
        assert_eq!(resolved.get_required(), Ok("sel".to_string()));
        assert_eq!(resolved.get_checked(), Ok(Some("sel".to_string())));

        let incomplete: Resolved<String> = Resolved::from_syntax(incomplete_value(), 0);
        assert_eq!(incomplete.get_optional(), None);
        assert_eq!(incomplete.get_required(), Err(UnresolvedCause::Incomplete));
        assert_eq!(incomplete.get_checked(), Err(StillIncomplete));

        let dynamic: Resolved<String> = Resolved::from_syntax(dynamic_value(), 0);
        assert_eq!(dynamic.get_optional(), None);
        assert_eq!(dynamic.get_required(), Err(UnresolvedCause::Dynamic));
        assert_eq!(dynamic.get_checked(), Ok(None));

        // Shape mismatch: a number where a string is expected.
        let wrong: Resolved<String> = Resolved::from_syntax(ResolvedValue::Number(3.0), 0);
        assert_eq!(wrong.get_optional(), None);
        assert_eq!(wrong.get_required(), Err(UnresolvedCause::WrongShape));
        assert_eq!(wrong.get_checked(), Ok(None));
    }

    #[test]
    fn demote_clears_holes_and_is_idempotent() {
        let mut resolved: Resolved<String> =
            Resolved::from_syntax(ResolvedValue::Array(vec![incomplete_value()]), 0);
        assert!(resolved.contains_incomplete());
        resolved.demote();
        assert!(!resolved.contains_incomplete());
        let after_first = resolved.raw().clone();
        resolved.demote();
        assert_eq!(resolved.raw(), &after_first);
    }

    #[test]
    fn cross_file_selector_resolves_completely() {
        use std::path::PathBuf;
        use std::sync::Arc;
        let lib_ts = "export const PREFIX = 'my-';";
        let dir_ts = r#"
            import { Directive } from '@angular/core';
            import { PREFIX } from './lib';
            @Directive({ selector: PREFIX + 'button' })
            export class CustomButton {}
        "#;
        let fs =
            crate::test_utils::create_test_fs(&[("/app/lib.ts", lib_ts), ("/app/dir.ts", dir_ts)]);
        let resolver = Arc::new(oxc_resolver::ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..oxc_resolver::ResolveOptions::default()
            },
        ));
        let registry = Arc::new(crate::resource_registry::ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from("/app/dir.ts")]));
        let engine =
            crate::query::engine::QueryEngine::new_default(fs, resolver, registry, entrypoints);

        let dir_id = engine.intern_path("/app/dir.ts");
        let ctx = crate::query::QueryContext::new(engine);
        let value = futures::executor::block_on(async move {
            let syntax = ctx.analyze_file_syntax(dir_id).await;
            let class_syntax = &syntax.classes[0];
            let mut selector: Resolved<String> = match &class_syntax.decorator {
                crate::analyzer::DecoratorData::Directive(d) => d.selector.clone(),
                crate::analyzer::DecoratorData::Component(c) => c.directive.selector.clone(),
                _ => None,
            }
            .expect("selector must exist");
            selector.complete_with(&ctx, &[]).await;
            selector
        });
        assert_eq!(value.get_required(), Ok("my-button".to_string()));
    }

    #[test]
    fn cross_file_host_directives_resolve_completely() {
        use std::path::PathBuf;
        use std::sync::Arc;
        // Two things here need Stage 2: the `hostDirectives` array itself lives in another
        // file, and `freeRef` is a cross-file *value alias* of `forwardRef` -- which upstream
        // accepts because it recognizes `forwardRef` on the resolved callee's provenance.
        let lib_ts = r#"
            import { forwardRef } from '@angular/core';
            export class Dep {}
            export const HOST_DIRS = [Dep, { directive: Dep, inputs: ['a: b'] }];
            export const freeRef = forwardRef;
        "#;
        let dir_ts = r#"
            import { Directive } from '@angular/core';
            import { HOST_DIRS } from './lib';
            @Directive({ selector: '[a]', hostDirectives: HOST_DIRS })
            export class UsesImportedArray {}
        "#;
        let alias_ts = r#"
            import { Directive } from '@angular/core';
            import { freeRef } from './lib';
            @Directive({ selector: '[b]', hostDirectives: [freeRef(() => Late)] })
            export class UsesAliasedForwardRef {}
            export class Late {}
        "#;
        let fs = crate::test_utils::create_test_fs(&[
            ("/app/lib.ts", lib_ts),
            ("/app/dir.ts", dir_ts),
            ("/app/alias.ts", alias_ts),
            // `forwardRef` must resolve to a declaration for its provenance to be checkable.
            (
                "/app/node_modules/@angular/core/index.d.ts",
                "export declare function forwardRef<T>(fn: () => T): T;\nexport declare function Directive(opts: any): any;",
            ),
        ]);
        let resolver = Arc::new(oxc_resolver::ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..oxc_resolver::ResolveOptions::default()
            },
        ));
        let registry = Arc::new(crate::resource_registry::ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![
            PathBuf::from("/app/dir.ts"),
            PathBuf::from("/app/alias.ts"),
        ]));
        let engine =
            crate::query::engine::QueryEngine::new_default(fs, resolver, registry, entrypoints);
        let ctx = crate::query::QueryContext::new(engine);

        let entries_of = |path: &'static str| {
            let ctx = &ctx;
            async move {
                let file_id = ctx.engine.intern_path(std::path::Path::new(path));
                let syntax = ctx.analyze_file_syntax(file_id).await;
                let crate::analyzer::DecoratorData::Directive(d) = &syntax.classes[0].decorator
                else {
                    panic!("expected a directive in {path}");
                };
                let mut slot = d
                    .host_directives
                    .clone()
                    .expect("hostDirectives must be present");
                let foreign = crate::analyzer::resolvers::angular_foreign_resolvers();
                slot.complete_with(ctx, foreign).await;
                slot.get_optional().expect("hostDirectives should reduce")
            }
        };

        let (imported, aliased) = futures::executor::block_on(async {
            (
                entries_of("/app/dir.ts").await,
                entries_of("/app/alias.ts").await,
            )
        });

        // The imported array resolves to both of its entries, mapping included.
        let names: Vec<_> = imported.iter().map(|e| e.directive.name()).collect();
        assert_eq!(names, vec!["Dep", "Dep"]);
        assert!(imported.iter().all(|e| !e.is_forward_ref));
        let bindings = imported[1].inputs.as_ref().expect("inputs should parse");
        assert_eq!(bindings[0].public_name, "a");
        assert_eq!(bindings[0].binding_name, "b");

        // The aliased `forwardRef` unwraps to its argument and stays marked as a forward ref.
        let [alias_entry] = aliased.as_slice() else {
            panic!("expected exactly one host directive");
        };
        assert_eq!(alias_entry.directive.name(), "Late");
        assert!(alias_entry.is_forward_ref);
    }
}
