//! Human-readable rendering of evaluation failures.
// TODO(parity): Port upstream `traceDynamicValue` (related-information spans) once
// `NgDiagnostic` can carry related information.

use crate::analyzer::ImportKind;
use crate::evaluator::value::{
    DynamicReason, DynamicValue, HoleKey, IncompleteDep, IncompleteValue, ResolvedValue,
    UnresolvedReference,
};
use std::fmt;

pub fn describe_resolved_type(value: &ResolvedValue) -> String {
    describe_resolved_type_at(value, 1)
}

fn describe_resolved_type_at(value: &ResolvedValue, max_depth: usize) -> String {
    match value {
        ResolvedValue::Null => "null".to_string(),
        ResolvedValue::Undefined => "undefined".to_string(),
        ResolvedValue::Number(_) => "number".to_string(),
        ResolvedValue::Boolean(_) => "boolean".to_string(),
        ResolvedValue::String(_) => "string".to_string(),
        ResolvedValue::Map(map) => {
            if max_depth == 0 {
                return "object".to_string();
            }
            if map.is_empty() {
                return "{}".to_string();
            }
            let entries: Vec<String> = map
                .iter()
                .map(|(key, entry)| {
                    format!(
                        "{}: {}",
                        quote_key(key),
                        describe_resolved_type_at(entry, max_depth - 1)
                    )
                })
                .collect();
            format!("{{ {} }}", entries.join("; "))
        }
        ResolvedValue::EnumValue(member) => member.enum_ref.name.clone(),
        ResolvedValue::Reference(reference) => reference.name.clone(),
        ResolvedValue::Array(items) => {
            if max_depth == 0 {
                return "Array".to_string();
            }
            let items: Vec<String> = items
                .iter()
                .map(|item| describe_resolved_type_at(item, max_depth - 1))
                .collect();
            format!("[{}]", items.join(", "))
        }
        ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
            "(not statically analyzable)".to_string()
        }
        ResolvedValue::KnownFn(_) => "Function".to_string(),
        ResolvedValue::Synthetic(_) => "unknown".to_string(),
        ResolvedValue::Named { value, .. } => describe_resolved_type_at(value, max_depth),
    }
}

fn quote_key(key: &str) -> String {
    if !key.is_empty() && key.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
        return key.to_string();
    }
    format!("'{}'", key.replace('\'', "\\'"))
}

pub fn wrong_type_detail(value: &ResolvedValue) -> String {
    match value.unwrap_named() {
        ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
            "Value could not be determined statically.".to_string()
        }
        ResolvedValue::Reference(reference) => {
            format!("Value is a reference to '{}'.", reference.name)
        }
        other => format!("Value is of type '{}'.", describe_resolved_type(other)),
    }
}

pub fn wrong_type_message(message: &str, value: &ResolvedValue) -> String {
    format!("{message}\n  {}", wrong_type_detail(value))
}

impl fmt::Display for UnresolvedReference {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match &self.symbol {
            ImportKind::Named(name) => write!(f, "`{}` from '{}'", name, self.specifier),
            ImportKind::Default => write!(f, "the default export of '{}'", self.specifier),
            ImportKind::Namespace => write!(f, "the namespace of '{}'", self.specifier),
        }
    }
}

impl fmt::Display for DynamicReason {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DynamicReason::DynamicInput(inner) => {
                write!(
                    f,
                    "a sub-expression is not statically analyzable: {}",
                    inner.reason
                )
            }
            DynamicReason::DynamicString => {
                write!(f, "a string value could not be determined statically")
            }
            DynamicReason::ExternalReference(reference) => {
                write!(
                    f,
                    "could not evaluate external reference `{}`",
                    reference.name
                )
            }
            DynamicReason::UnsupportedSyntax => {
                write!(f, "syntax is not supported in static evaluation")
            }
            DynamicReason::UnknownIdentifier(name) => write!(f, "unknown identifier `{}`", name),
            DynamicReason::InvalidExpressionType => {
                write!(f, "a value has the wrong type for this operation")
            }
            DynamicReason::ComplexFunctionCall => {
                write!(f, "function body is too complex to evaluate statically")
            }
            DynamicReason::SyntheticInput => {
                write!(f, "a synthesized value cannot be evaluated further")
            }
            DynamicReason::UnresolvedImport(unresolved) => {
                write!(f, "could not resolve import of {}", unresolved)
            }
            DynamicReason::ImportCycle => write!(f, "evaluation followed a cycle of imports"),
            DynamicReason::DepthLimit => {
                write!(f, "evaluation exceeded the cross-file depth limit")
            }
            DynamicReason::ExportNotFound => {
                write!(f, "the named export was not found in the target module")
            }
            DynamicReason::ModuleWithProvidersMissingGeneric { symbol_name } => {
                write!(
                    f,
                    "{symbol_name} returns a ModuleWithProviders type without a generic type argument"
                )
            }
            DynamicReason::Unknown => write!(f, "value is not statically analyzable"),
        }
    }
}

impl fmt::Display for DynamicValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "value at offset {}..{} is not statically analyzable: {}",
            self.span.start, self.span.end, self.reason
        )?;
        let root = self.root_cause();
        if !std::ptr::eq(root, self) {
            write!(
                f,
                " (caused at offset {}..{}: {})",
                root.span.start, root.span.end, root.reason
            )?;
        }
        Ok(())
    }
}

impl fmt::Display for HoleKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            HoleKey::Reference(unresolved) => write!(f, "import of {}", unresolved),
            HoleKey::Member { base, member } => {
                write!(f, "member `{}` of `{}`", member, base.name)
            }
            HoleKey::Call { callee, .. } => match &callee.member {
                Some(member) => write!(f, "call of `{}.{}`", callee.name, member),
                None => write!(f, "call of `{}`", callee.name),
            },
        }
    }
}

impl fmt::Display for IncompleteValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let kind = match &self.dep {
            IncompleteDep::Reference(_) => "unresolved import",
            IncompleteDep::Member { .. } => "unresolved member access",
            IncompleteDep::Call { .. } => "unresolved call",
        };
        write!(
            f,
            "{} at offset {}..{}: {}",
            kind,
            self.span.start,
            self.span.end,
            self.key()
        )
    }
}
