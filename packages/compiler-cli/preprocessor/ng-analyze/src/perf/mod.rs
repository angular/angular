//! Perf tracing for the `takePerf` RPC: `tracing` spans collected by `NgPerfLayer`, plus
//! per-thread counters. Nothing is recorded unless the layer is installed and recording, so
//! otherwise every span macro is a cached-interest check and every counter a load and branch.
//!
//! # What is traced
//!
//! Span names are short PascalCase literals at the call sites; the layer emits them as
//! `ngp.rust.<Name>` and keys the summary by the bare name.
//!
//! - Query spans, one kind per `QueryKey` variant, named by `QueryKey::name()` (`ParseFile`,
//!   `ModuleExportMap`, ...). `QueryEngine::execute` opens one per cache miss; each poll is an
//!   `X` slice (cat `ngp.query`, `args.q` execution id) on the worker thread that ran it, with an
//!   `s`/`f` flow named `Query` from the requesting slice to the first poll.
//! - Sync spans (cat `ngp.rust`, `X` only): `Initialize`, `ResolveTsconfig` and
//!   `ConstructAnalyzer` in `compiler/analyzer.rs`; `ExpandGlobs` in `tsconfig_resolution.rs`;
//!   `Resolve` from `oxc_resolver`'s own `resolve` span.
//! - Async spans ([`ASYNC_TARGET`], cat `ngp.rust`): `Analyze` or `AnalyzeOptimized` around the
//!   coordinator and `EnsureSingletonsFresh` inside it, both in `compiler/analyzer.rs`. They get
//!   per-poll `X` slices plus a `b`/`e` latency slice.
//! - Counters ([`Counter`]), bumped with [`count`] from `fs.rs` and the query engine, and query
//!   cache hits via [`count_cache_hit`].
//!
//! `takePerf` returns `{pid, events, summary}`: `events` are finished Chrome trace events
//! without `pid` (`M` process and thread names first), and `summary` is a [`RustSummary`]
//! (`queries` per kind with the slowest executions, `spans` per sync/async span, `counters`).
//! The Node side adds the summary to the trace as `ngp.rust.Counters` (`C`) and
//! `ngp.rust.Summary` (`i`). `now` returns `{nowUs}` on the events' clock; Node calls it right
//! before `takePerf` to align the clocks, since that round trip carries no payload.

use std::collections::BTreeMap;

#[cfg(not(target_arch = "wasm32"))]
mod layer;
#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests;

#[cfg(not(target_arch = "wasm32"))]
pub use layer::{
    count, count_cache_hit, install, now_us, set_pool_thread_index, set_recording, take, PerfTake,
    TraceEvent,
};

/// Target of query execution spans (see `QueryEngine::execute`). Their `kind` field indexes
/// `QueryKey::KIND_NAMES`.
pub const QUERY_TARGET: &str = "ng_analyze::perf::query";
/// Target of spans that cross awaits outside the query engine. Besides per-poll slices, they get
/// a `b`/`e` latency slice.
pub const ASYNC_TARGET: &str = "ng_analyze::perf::async";

#[derive(Clone, Copy)]
pub enum Counter {
    FsReads,
    FsReadBytes,
    FsStatCalls,
    FsCanonicalizeCalls,
    IsAllowedCacheHits,
    IsAllowedCacheMisses,
    VirtualFileHits,
    TsFilesParsed,
    DtsFilesParsed,
}

impl Counter {
    /// Indexed by `Counter as usize`.
    pub const NAMES: [&'static str; 9] = [
        "FsReads",
        "FsReadBytes",
        "FsStatCalls",
        "FsCanonicalizeCalls",
        "IsAllowedCacheHits",
        "IsAllowedCacheMisses",
        "VirtualFileHits",
        "TsFilesParsed",
        "DtsFilesParsed",
    ];
}

const _: () = assert!(Counter::DtsFilesParsed as usize + 1 == Counter::NAMES.len());

#[cfg(target_arch = "wasm32")]
#[inline]
pub fn count(_: Counter, _: u64) {}

#[cfg(target_arch = "wasm32")]
#[inline]
pub fn count_cache_hit(_: &'static str) {}

/// Per-query-kind totals, in µs.
#[derive(Clone, Debug, Default, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KindStats {
    /// Completed executions (cache misses).
    pub count: u64,
    pub cache_hits: u64,
    /// Time inside polls.
    pub busy_us: u64,
    /// Busy time minus nested spans on the same thread.
    pub self_us: u64,
    /// Creation to first poll.
    pub queued_us: u64,
    /// Creation to completion.
    pub wall_us: u64,
    /// Executions dropped before completing (evicted while in flight).
    pub cancelled: u64,
    /// The executions with the most busy time, slowest first. Busy rather than self time, so
    /// that time in nested spans like `resolve` counts towards the query that caused it.
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub slowest: Vec<SlowQuery>,
}

/// One query execution, in µs.
#[derive(Clone, Debug, Default, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SlowQuery {
    /// Execution id, as in the `X` slices' `args.q`.
    pub q: u64,
    pub busy_us: u64,
    pub self_us: u64,
    pub wall_us: u64,
    /// Path of the file the query is about, if any.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<String>,
}

/// Totals for spans other than queries, in µs.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpanStats {
    pub count: u64,
    pub self_us: u64,
}

#[derive(Debug, Default, PartialEq, serde::Serialize)]
pub struct RustSummary {
    pub queries: BTreeMap<&'static str, KindStats>,
    pub spans: BTreeMap<&'static str, SpanStats>,
    pub counters: BTreeMap<&'static str, u64>,
}
