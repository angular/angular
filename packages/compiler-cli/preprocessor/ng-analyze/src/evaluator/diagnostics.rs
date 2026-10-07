//! Human-readable rendering of evaluation failures.
//!
//! Deliberately small: the full upstream `diagnostics.ts` machinery (`describeResolvedType`,
//! `traceDynamicValue` with related-information spans) is deferred.
// TODO(parity): related-information diagnostic chains once the evaluator feeds a diagnostics
// channel.

use crate::analyzer::ImportKind;
use crate::evaluator::value::{
    DynamicReason, DynamicValue, HoleKey, IncompleteDep, IncompleteValue, UnresolvedReference,
};
use std::fmt;

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
