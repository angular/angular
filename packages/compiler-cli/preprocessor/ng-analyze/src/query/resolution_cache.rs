use std::collections::{HashMap, HashSet};
use std::sync::RwLock;

use crate::host::{HostError, ImportKind, ResolveRequest, ResolvedModule};
use crate::query::FileId;

/// Per-importer lookup key inside [`ResolutionCache`].
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub(crate) struct ResolutionLookupKey {
    pub specifier: String,
    pub kind: ImportKind,
    pub type_only: bool,
    pub attributes: Vec<(String, String)>,
}

impl ResolutionLookupKey {
    pub fn from_request(req: &ResolveRequest) -> Self {
        Self {
            specifier: req.specifier.clone(),
            kind: req.kind,
            type_only: req.type_only,
            attributes: req.attributes.clone(),
        }
    }
}

/// Outcome of one [`crate::host::AnalysisHost::resolve`] lookup as the engine memoizes it: the
/// resolved module with its interned [`FileId`], `Ok(None)` when the specifier does not resolve,
/// or the host's failure.
pub(crate) type CachedResolution = Result<Option<(FileId, ResolvedModule)>, HostError>;

/// A memoized outcome and the generation ([`ResolutionCacheInner::generation`]) it was recorded
/// in.
struct CachedEntry {
    generation: u64,
    outcome: CachedResolution,
}

#[derive(Default)]
struct ResolutionCacheInner {
    /// Counts structure changes ([`ResolutionCache::clear_for_structure_change`]). An entry
    /// recorded in an earlier generation is stale: it is no longer served, but it is kept so that
    /// [`Self::importers_by_target`] still covers an importer whose queries stayed cached and so
    /// do not resolve again.
    generation: u64,
    /// `(importer FileId, ResolutionLookupKey)` -> cached resolution outcome.
    by_importer: HashMap<FileId, HashMap<ResolutionLookupKey, CachedEntry>>,
    /// Reverse index from resolved target `FileId` to every importer `FileId` with a cached
    /// resolution pointing to it, whether or not that entry is still served, so deleting a file
    /// evicts importers whose resolution became stale.
    importers_by_target: HashMap<FileId, HashSet<FileId>>,
    /// Importers with at least one failed (`Ok(None)` or `Err`) resolution, mapped to the failed
    /// specifiers. Creating a file evicts these importers so previously unresolved imports re-run.
    unresolved_by_importer: HashMap<FileId, HashSet<String>>,
}

/// Engine-level module resolution cache and unresolved-import index.
#[derive(Default)]
pub(crate) struct ResolutionCache {
    inner: RwLock<ResolutionCacheInner>,
}

impl ResolutionCache {
    pub fn new() -> Self {
        Self::default()
    }

    /// The current generation. A lookup reads it before asking the host and passes it to
    /// [`Self::insert`], so that an answer obtained across a structure change is not memoized.
    pub fn generation(&self) -> u64 {
        self.inner.read().unwrap().generation
    }

    /// The outcome of `importer`'s lookup `key` memoized in the current generation, if there is
    /// one.
    pub fn get(&self, importer: FileId, key: &ResolutionLookupKey) -> Option<CachedResolution> {
        let read = self.inner.read().unwrap();
        let entry = read.by_importer.get(&importer)?.get(key)?;
        (entry.generation == read.generation).then(|| entry.outcome.clone())
    }

    /// Memoize `outcome` for `importer`'s lookup `key`, indexing `importer` under the target it
    /// resolved to, or among the importers with a failed lookup.
    ///
    /// `generation` is the one read ([`Self::generation`]) before the host was asked. The outcome
    /// is dropped when a structure change has superseded it since.
    pub fn insert(
        &self,
        importer: FileId,
        key: ResolutionLookupKey,
        outcome: CachedResolution,
        generation: u64,
    ) {
        let mut guard = self.inner.write().unwrap();
        let inner = &mut *guard;
        if generation != inner.generation {
            return;
        }

        let entries = inner.by_importer.entry(importer).or_default();
        let entry = CachedEntry {
            generation,
            outcome: outcome.clone(),
        };
        let previous = entries.insert(key.clone(), entry);
        if let Some(CachedEntry {
            outcome: Ok(Some((old_target, _))),
            ..
        }) = previous
        {
            // The replaced target stays indexed while another lookup of `importer` resolves to it.
            let still_used = entries
                .values()
                .any(|cached| matches!(&cached.outcome, Ok(Some((t, _))) if *t == old_target));
            if !still_used {
                unlink_importer(&mut inner.importers_by_target, old_target, importer);
            }
        }

        match &outcome {
            Ok(Some((target_id, _))) => {
                inner
                    .importers_by_target
                    .entry(*target_id)
                    .or_default()
                    .insert(importer);
            }
            Ok(None) | Err(_) => {
                inner
                    .unresolved_by_importer
                    .entry(importer)
                    .or_default()
                    .insert(key.specifier);
            }
        }
    }

    /// Drop every cached resolution and unresolved-specifier entry recorded for `importer`.
    pub fn remove_importer(&self, importer: FileId) {
        let mut guard = self.inner.write().unwrap();
        remove_importer_locked(&mut guard, importer);
    }

    /// Drop cached resolutions for every importer that resolved a specifier to `target_id` and
    /// return those importer IDs so their dependent queries can re-resolve.
    pub fn remove_deleted_target(&self, target_id: FileId) -> HashSet<FileId> {
        let mut guard = self.inner.write().unwrap();
        let inner = &mut *guard;
        let importers = inner
            .importers_by_target
            .remove(&target_id)
            .unwrap_or_default();
        for &importer in &importers {
            remove_importer_locked(inner, importer);
        }
        importers
    }

    /// Stop serving every cached resolution after files were created or deleted, and return every
    /// importer that had recorded at least one failed resolution.
    ///
    /// The entries are kept as stale rather than dropped. An importer whose queries stay cached
    /// does not resolve again, and [`Self::remove_deleted_target`] must still find it when the
    /// file it resolved to is deleted later.
    pub fn clear_for_structure_change(&self) -> HashSet<FileId> {
        let mut guard = self.inner.write().unwrap();
        let inner = &mut *guard;
        inner.generation += 1;
        std::mem::take(&mut inner.unresolved_by_importer)
            .into_keys()
            .collect()
    }
}

fn remove_importer_locked(inner: &mut ResolutionCacheInner, importer: FileId) {
    inner.unresolved_by_importer.remove(&importer);
    let Some(entries) = inner.by_importer.remove(&importer) else {
        return;
    };
    for entry in entries.values() {
        let Ok(Some((target_id, _))) = &entry.outcome else {
            continue;
        };
        unlink_importer(&mut inner.importers_by_target, *target_id, importer);
    }
}

/// Remove `importer` from the importers recorded for `target`, dropping the entry once no
/// importer is left.
fn unlink_importer(
    importers_by_target: &mut HashMap<FileId, HashSet<FileId>>,
    target: FileId,
    importer: FileId,
) {
    let Some(importers) = importers_by_target.get_mut(&target) else {
        return;
    };
    importers.remove(&importer);
    if importers.is_empty() {
        importers_by_target.remove(&target);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::host::{IdKind, ModuleFormat, ModuleId};

    fn resolved_module(id: &str) -> ResolvedModule {
        ResolvedModule {
            id: ModuleId::new(id),
            id_kind: IdKind::Path,
            format: Some(ModuleFormat::Ts),
            external: false,
            code: None,
        }
    }

    #[test]
    fn distinguishes_kind_type_only_and_attributes_in_lookup_key() {
        let cache = ResolutionCache::new();
        let importer: FileId = 1;

        let static_req = ResolveRequest::new("/app/a.ts", "./b", ImportKind::Static);
        let type_only_req = ResolveRequest::new("/app/a.ts", "./b", ImportKind::Static)
            .with_type_only(true);
        let reexport_req = ResolveRequest::new("/app/a.ts", "./b", ImportKind::ReExport);
        let attr_req = ResolveRequest::new("/app/a.ts", "./b", ImportKind::Static)
            .with_attributes(vec![("type".to_owned(), "json".to_owned())]);

        let static_key = ResolutionLookupKey::from_request(&static_req);
        let type_only_key = ResolutionLookupKey::from_request(&type_only_req);
        let reexport_key = ResolutionLookupKey::from_request(&reexport_req);
        let attr_key = ResolutionLookupKey::from_request(&attr_req);

        cache.insert(
            importer,
            static_key.clone(),
            Ok(Some((2, resolved_module("/app/b.ts")))),
            cache.generation(),
        );
        cache.insert(importer, type_only_key.clone(), Ok(None), cache.generation());

        assert!(matches!(
            cache.get(importer, &static_key),
            Some(Ok(Some((2, _))))
        ));
        assert!(matches!(
            cache.get(importer, &type_only_key),
            Some(Ok(None))
        ));
        assert!(cache.get(importer, &reexport_key).is_none());
        assert!(cache.get(importer, &attr_key).is_none());
    }

    #[test]
    fn tracks_unresolved_importers_and_deleted_targets() {
        let cache = ResolutionCache::new();
        let importer_ok: FileId = 10;
        let importer_missing: FileId = 11;
        let target: FileId = 20;

        let ok_key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/ok.ts",
            "./lib",
            ImportKind::Static,
        ));
        let missing_key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/missing.ts",
            "./nope",
            ImportKind::Static,
        ));

        cache.insert(
            importer_ok,
            ok_key.clone(),
            Ok(Some((target, resolved_module("/app/lib.ts")))),
            cache.generation(),
        );
        cache.insert(
            importer_missing,
            missing_key.clone(),
            Ok(None),
            cache.generation(),
        );

        let deleted_importers = cache.remove_deleted_target(target);
        assert_eq!(deleted_importers, HashSet::from([importer_ok]));
        assert!(cache.get(importer_ok, &ok_key).is_none());
        assert!(cache.get(importer_missing, &missing_key).is_some());

        let unresolved_importers = cache.clear_for_structure_change();
        assert_eq!(unresolved_importers, HashSet::from([importer_missing]));
        assert!(cache.get(importer_missing, &missing_key).is_none());
    }

    #[test]
    fn remove_importer_cleans_target_and_unresolved_indexes() {
        let cache = ResolutionCache::new();
        let importer: FileId = 5;
        let target: FileId = 6;

        let ok_key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/a.ts",
            "./b",
            ImportKind::Static,
        ));
        let missing_key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/a.ts",
            "./missing",
            ImportKind::Static,
        ));

        cache.insert(
            importer,
            ok_key,
            Ok(Some((target, resolved_module("/app/b.ts")))),
            cache.generation(),
        );
        cache.insert(importer, missing_key, Ok(None), cache.generation());

        cache.remove_importer(importer);
        assert!(cache.remove_deleted_target(target).is_empty());
        assert!(cache.clear_for_structure_change().is_empty());
    }

    #[test]
    fn replacing_a_resolution_unlinks_its_previous_target_once_unused() {
        let cache = ResolutionCache::new();
        let importer: FileId = 7;
        let old_target: FileId = 8;
        let new_target: FileId = 9;

        let static_key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/a.ts",
            "./b",
            ImportKind::Static,
        ));
        let reexport_key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/a.ts",
            "./b",
            ImportKind::ReExport,
        ));
        let old = || -> CachedResolution { Ok(Some((old_target, resolved_module("/app/b.ts")))) };
        let new = || -> CachedResolution {
            Ok(Some((new_target, resolved_module("/app/b/index.ts"))))
        };

        // Another lookup of the importer still resolves to the previous target.
        cache.insert(importer, static_key.clone(), old(), cache.generation());
        cache.insert(importer, reexport_key, old(), cache.generation());
        cache.insert(importer, static_key.clone(), new(), cache.generation());
        assert_eq!(
            cache.remove_deleted_target(old_target),
            HashSet::from([importer])
        );
        assert!(cache.remove_deleted_target(new_target).is_empty());

        // No other lookup does.
        cache.insert(importer, static_key.clone(), old(), cache.generation());
        cache.insert(importer, static_key, new(), cache.generation());
        assert!(cache.remove_deleted_target(old_target).is_empty());
        assert_eq!(
            cache.remove_deleted_target(new_target),
            HashSet::from([importer])
        );
    }

    #[test]
    fn structure_change_stops_serving_resolutions_but_keeps_the_target_index() {
        let cache = ResolutionCache::new();
        let importer: FileId = 30;
        let target: FileId = 31;

        let key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/a.ts",
            "./b",
            ImportKind::Static,
        ));

        cache.insert(
            importer,
            key.clone(),
            Ok(Some((target, resolved_module("/app/b.ts")))),
            cache.generation(),
        );
        assert!(cache.clear_for_structure_change().is_empty());

        // The importer's queries stay cached, so it does not resolve again: the stale entry is
        // all that still ties it to the target.
        assert!(cache.get(importer, &key).is_none());
        assert_eq!(
            cache.remove_deleted_target(target),
            HashSet::from([importer])
        );
    }

    #[test]
    fn resolving_again_after_a_structure_change_replaces_the_stale_entry() {
        let cache = ResolutionCache::new();
        let importer: FileId = 32;
        let old_target: FileId = 33;
        let new_target: FileId = 34;

        let key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/a.ts",
            "./b",
            ImportKind::Static,
        ));

        cache.insert(
            importer,
            key.clone(),
            Ok(Some((old_target, resolved_module("/app/b.ts")))),
            cache.generation(),
        );
        assert!(cache.clear_for_structure_change().is_empty());
        cache.insert(
            importer,
            key.clone(),
            Ok(Some((new_target, resolved_module("/app/b/index.ts")))),
            cache.generation(),
        );

        assert!(matches!(
            cache.get(importer, &key),
            Some(Ok(Some((target, _)))) if target == new_target
        ));
        assert!(cache.remove_deleted_target(old_target).is_empty());
        assert_eq!(
            cache.remove_deleted_target(new_target),
            HashSet::from([importer])
        );
    }

    #[test]
    fn outcome_from_before_a_structure_change_is_not_memoized() {
        let cache = ResolutionCache::new();
        let importer: FileId = 40;
        let target: FileId = 41;

        let key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            "/app/a.ts",
            "./b",
            ImportKind::Static,
        ));

        // The lookup started, then files were created or deleted before the host answered.
        let generation = cache.generation();
        assert!(cache.clear_for_structure_change().is_empty());
        cache.insert(
            importer,
            key.clone(),
            Ok(Some((target, resolved_module("/app/b.ts")))),
            generation,
        );

        assert!(cache.get(importer, &key).is_none());
        assert!(cache.remove_deleted_target(target).is_empty());
    }
}
