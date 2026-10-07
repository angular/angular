use crate::query::FileId;
use oxc_semantic::SymbolId;

/// Composite identifier uniquely identifying a symbol across files.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub struct ReferenceId {
    pub file: FileId,
    pub symbol: SymbolId,
}

impl ReferenceId {
    pub fn new(file: FileId, symbol: SymbolId) -> Self {
        Self { file, symbol }
    }
}
