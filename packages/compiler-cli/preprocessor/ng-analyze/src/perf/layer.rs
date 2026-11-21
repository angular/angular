//! [`NgPerfLayer`]: records one `X` slice per span enter/exit on the thread's track, flows from a
//! query's requester to its first poll, and per-kind totals.

use super::{Counter, RustSummary, SlowQuery, SpanStats, ASYNC_TARGET, QUERY_TARGET};
use crate::query::keys::QueryKey;
use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering::Relaxed};
use std::sync::{Arc, Mutex, OnceLock, Weak};
use tracing::field::{Field, Visit};
use tracing::span::{Attributes, Id, Record};
use tracing::subscriber::Interest;
use tracing::{Metadata, Subscriber};
use tracing_subscriber::layer::{Context, Layer, SubscriberExt};
use tracing_subscriber::registry::LookupSpan;

static LAYER: OnceLock<NgPerfLayer> = OnceLock::new();

/// Installs the global subscriber, not recording yet. Later calls are no-ops.
pub fn install() {
    if LAYER.get().is_some() {
        return;
    }
    let layer = NgPerfLayer::new(Clock::Real(std::time::Instant::now()));
    let subscriber = tracing_subscriber::Registry::default().with(layer.clone());
    if tracing::subscriber::set_global_default(subscriber).is_ok() {
        let _ = LAYER.set(layer);
    }
}

/// Starts or stops recording, if [`install`] ran.
pub fn set_recording(on: bool, detail: bool) {
    if let Some(layer) = LAYER.get() {
        layer.set_recording(on, detail);
    }
}

/// Drains timeline events, totals and counters. `None` unless recording. `file_path` names the
/// files of the slowest queries.
pub fn take(file_path: &dyn Fn(u32) -> Option<String>) -> Option<PerfTake> {
    LAYER
        .get()
        .filter(|l| l.recording())
        .map(|l| l.take(file_path))
}

/// Now in µs on the clock of the events, or `None` until [`install`]. The `now` RPC returns it,
/// so Node can align the clocks with a round trip that carries no payload.
pub fn now_us() -> Option<f64> {
    LAYER.get().map(|l| us(l.now()))
}

/// Adds `n` to `counter`. Just a load and branch unless recording.
#[inline]
pub fn count(counter: Counter, n: u64) {
    if let Some(layer) = LAYER.get() {
        layer.count(counter, n);
    }
}

/// Counts a query cache hit for the query kind `name`.
#[inline]
pub fn count_cache_hit(name: &'static str) {
    if let Some(layer) = LAYER.get() {
        layer.count_cache_hit(name);
    }
}

thread_local! {
    static POOL_INDEX: Cell<Option<usize>> = const { Cell::new(None) };
    /// This thread's buffer and the layer it belongs to. Rebound if another layer shows up,
    /// which only happens in tests.
    static THREAD_BUF: RefCell<Option<(Weak<State>, Arc<Mutex<ThreadBuf>>)>> =
        const { RefCell::new(None) };
}

/// `ThreadPoolBuilder::after_start` hook, so worker tids are stable across runs.
pub fn set_pool_thread_index(index: usize) {
    POOL_INDEX.with(|i| i.set(Some(index)));
}

/// Reply of the `takePerf` RPC. Times are µs since the layer's fixed epoch.
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PerfTake {
    pub pid: u32,
    pub events: Vec<TraceEvent>,
    pub summary: RustSummary,
}

/// A Chrome trace event, without `pid`, which Node adds. `M` events have `ts` 0.
#[derive(Clone, Debug, PartialEq, serde::Serialize)]
pub struct TraceEvent {
    pub name: Name,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cat: Option<Cat>,
    pub ph: &'static str,
    pub tid: u32,
    pub ts: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dur: Option<f64>,
    /// Flow id, for `s`/`f`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id2: Option<LocalId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bp: Option<&'static str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<Args>,
}

/// Prefix of every span and flow event name, added when serializing.
const NAME_PREFIX: &str = "ngp.rust.";

/// An event name. Span names are the short PascalCase literals at the call sites (or
/// `QueryKey::name()`), serialized as `ngp.rust.<name>`; `M` event names are serialized as is.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Name {
    Span(&'static str),
    Meta(&'static str),
}

impl Name {
    /// The name without the prefix, as used for summary keys.
    pub fn as_str(self) -> &'static str {
        match self {
            Name::Span(name) | Name::Meta(name) => name,
        }
    }
}

impl serde::Serialize for Name {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match *self {
            Name::Span(name) => serializer.collect_str(&format_args!("{NAME_PREFIX}{name}")),
            Name::Meta(name) => serializer.serialize_str(name),
        }
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, serde::Serialize)]
pub enum Cat {
    /// Query slices and flows.
    #[serde(rename = "ngp.query")]
    Query,
    /// Detail-mode query latency slices.
    #[serde(rename = "ngp.query.async")]
    QueryAsync,
    #[default]
    #[serde(rename = "ngp.rust")]
    Rust,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize)]
pub struct LocalId {
    pub local: u64,
}

#[derive(Clone, Debug, Default, PartialEq, serde::Serialize)]
pub struct Args {
    /// Query execution id.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q: Option<u64>,
    /// Query key, in detail mode.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<String>,
    /// Process or thread name, for `M` events.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl TraceEvent {
    fn new(ph: &'static str, cat: Cat, name: &'static str, tid: u32, ts_ns: u64) -> Self {
        Self {
            name: Name::Span(name),
            cat: Some(cat),
            ph,
            tid,
            ts: us(ts_ns),
            dur: None,
            id: None,
            id2: None,
            bp: None,
            args: None,
        }
    }

    fn metadata(name: &'static str, tid: u32, value: String) -> Self {
        let args = Args {
            name: Some(value),
            ..Args::default()
        };
        Self {
            name: Name::Meta(name),
            cat: None,
            ph: "M",
            tid,
            ts: 0.0,
            dur: None,
            id: None,
            id2: None,
            bp: None,
            args: Some(args),
        }
    }
}

fn us(ns: u64) -> f64 {
    ns as f64 / 1000.0
}

pub(super) enum Clock {
    Real(std::time::Instant),
    #[cfg(test)]
    Fake(Arc<AtomicU64>),
}

impl Clock {
    fn now_ns(&self) -> u64 {
        match self {
            Clock::Real(epoch) => epoch.elapsed().as_nanos() as u64,
            #[cfg(test)]
            Clock::Fake(now) => now.load(Relaxed),
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Kind {
    Query,
    Async,
    Sync,
}

impl Kind {
    /// Category of poll slices, and of `b`/`e` latency slices.
    fn cats(self) -> (Cat, Cat) {
        match self {
            Kind::Query => (Cat::Query, Cat::QueryAsync),
            _ => (Cat::Rust, Cat::Rust),
        }
    }

    fn of(meta: &Metadata<'_>) -> Option<Kind> {
        let target = meta.target();
        if !meta.is_span() {
            None
        } else if target == QUERY_TARGET {
            Some(Kind::Query)
        } else if target == ASYNC_TARGET {
            Some(Kind::Async)
        } else if target.starts_with("ng_analyze") || target.starts_with("oxc_resolver") {
            Some(Kind::Sync)
        } else {
            None
        }
    }
}

/// Display name of a span. Our own are PascalCase literals; oxc_resolver's snake_case names are
/// mapped so that every event follows `ngp.rust.<PascalCase>`.
fn span_name(meta: &Metadata<'_>) -> &'static str {
    match meta.name() {
        "resolve" => "Resolve",
        "resolve_dts" => "ResolveDts",
        "find_tsconfig" => "FindTsconfig",
        name => name,
    }
}

struct SpanData {
    kind: Kind,
    /// The span name, or a query's `kind` field.
    name: &'static str,
    seq: u64,
    created: u64,
    first_enter: Option<u64>,
    done: Option<u64>,
    busy: u64,
    self_ns: u64,
    /// Has a flow from its requester.
    flow: bool,
    /// Has a `b`/`e` latency slice.
    latency: bool,
    key: Option<String>,
    /// A query's `file` field.
    file: Option<u32>,
}

struct Frame {
    id: Id,
    start: u64,
    child: u64,
    /// The enter `Instrumented` does to drop a completed future; not recorded.
    skip: bool,
}

#[derive(Default)]
struct KindAgg {
    count: u64,
    busy: u64,
    self_ns: u64,
    queued: u64,
    wall: u64,
    cancelled: u64,
    slowest: Vec<Slow>,
}

/// Executions kept per kind in `slowest`.
const SLOWEST: usize = 5;

/// A completed query execution, in ns.
struct Slow {
    seq: u64,
    busy: u64,
    self_ns: u64,
    wall: u64,
    file: Option<u32>,
    key: Option<String>,
}

/// Keeps the `SLOWEST` executions with the most busy time.
fn keep_slowest(slowest: &mut Vec<Slow>, slow: Slow) {
    if slowest.len() < SLOWEST {
        slowest.push(slow);
    } else if let Some(min) = slowest.iter_mut().min_by_key(|s| s.busy) {
        if slow.busy > min.busy {
            *min = slow;
        }
    }
}

struct ThreadBuf {
    tid: u32,
    name: String,
    stack: Vec<Frame>,
    events: Vec<TraceEvent>,
    queries: HashMap<&'static str, KindAgg>,
    spans: HashMap<&'static str, (u64, u64)>,
    counters: [u64; Counter::NAMES.len()],
    cache_hits: HashMap<&'static str, u64>,
}

pub(super) struct State {
    recording: AtomicBool,
    detail: AtomicBool,
    clock: Clock,
    next_seq: AtomicU64,
    next_tid: AtomicU32,
    threads: Mutex<Vec<Arc<Mutex<ThreadBuf>>>>,
}

#[derive(Clone)]
pub(super) struct NgPerfLayer(Arc<State>);

impl NgPerfLayer {
    pub(super) fn new(clock: Clock) -> Self {
        Self(Arc::new(State {
            recording: AtomicBool::new(false),
            detail: AtomicBool::new(false),
            clock,
            next_seq: AtomicU64::new(1),
            next_tid: AtomicU32::new(1001),
            threads: Mutex::new(Vec::new()),
        }))
    }

    pub(super) fn set_recording(&self, on: bool, detail: bool) {
        if on && !self.recording() {
            // Drop what spans still open at the last take recorded since.
            drop(self.take(&|_| None));
        }
        self.0.detail.store(detail, Relaxed);
        self.0.recording.store(on, Relaxed);
    }

    #[inline]
    pub(super) fn recording(&self) -> bool {
        self.0.recording.load(Relaxed)
    }

    #[inline]
    pub(super) fn count(&self, counter: Counter, n: u64) {
        if self.recording() {
            self.with_buf(|buf| buf.counters[counter as usize] += n);
        }
    }

    #[inline]
    pub(super) fn count_cache_hit(&self, name: &'static str) {
        if self.recording() {
            self.with_buf(|buf| *buf.cache_hits.entry(name).or_default() += 1);
        }
    }

    fn now(&self) -> u64 {
        self.0.clock.now_ns()
    }

    /// Runs `f` on this thread's buffer. Only `take` contends for the lock.
    fn with_buf(&self, f: impl FnOnce(&mut ThreadBuf)) {
        // `try_with`: spans may still close while thread-locals are being destroyed.
        let _ = THREAD_BUF.try_with(|slot| {
            let mut slot = slot.borrow_mut();
            // The `Weak` keeps the allocation, so the address can't be reused by another layer.
            if !matches!(&*slot, Some((state, _)) if state.as_ptr() == Arc::as_ptr(&self.0)) {
                let buf = Arc::new(Mutex::new(self.new_thread_buf()));
                self.0.threads.lock().unwrap().push(buf.clone());
                *slot = Some((Arc::downgrade(&self.0), buf));
            }
            let (_, buf) = slot.as_ref().unwrap();
            f(&mut buf.lock().unwrap());
        });
    }

    fn new_thread_buf(&self) -> ThreadBuf {
        let tid = match POOL_INDEX.with(Cell::get) {
            Some(index) => index as u32 + 1,
            None => self.0.next_tid.fetch_add(1, Relaxed),
        };
        let name = std::thread::current()
            .name()
            .map_or_else(|| format!("thread-{tid}"), str::to_owned);
        ThreadBuf {
            tid,
            name,
            stack: Vec::new(),
            events: Vec::new(),
            queries: HashMap::new(),
            spans: HashMap::new(),
            counters: [0; Counter::NAMES.len()],
            cache_hits: HashMap::new(),
        }
    }

    /// Drains the timeline, totals and counters.
    pub(super) fn take(&self, file_path: &dyn Fn(u32) -> Option<String>) -> PerfTake {
        let mut threads = Vec::new();
        let mut events = Vec::new();
        let mut counters = [0; Counter::NAMES.len()];
        let mut summary = RustSummary::default();
        let mut slowest: HashMap<&'static str, Vec<Slow>> = HashMap::new();
        for buf in self.0.threads.lock().unwrap().iter() {
            let mut buf = buf.lock().unwrap();
            threads.push((buf.tid, buf.name.clone()));
            events.append(&mut buf.events);
            for (total, n) in counters.iter_mut().zip(&mut buf.counters) {
                *total += std::mem::take(n);
            }
            for (name, hits) in buf.cache_hits.drain() {
                summary.queries.entry(name).or_default().cache_hits += hits;
            }
            for (name, agg) in buf.queries.drain() {
                let stats = summary.queries.entry(name).or_default();
                stats.count += agg.count;
                stats.busy_us += agg.busy / 1000;
                stats.self_us += agg.self_ns / 1000;
                stats.queued_us += agg.queued / 1000;
                stats.wall_us += agg.wall / 1000;
                stats.cancelled += agg.cancelled;
                slowest
                    .entry(name)
                    .or_insert_with(Vec::new)
                    .extend(agg.slowest);
            }
            for (name, (count, self_ns)) in buf.spans.drain() {
                let stats = summary.spans.entry(name).or_insert(SpanStats::default());
                stats.count += count;
                stats.self_us += self_ns / 1000;
            }
        }
        summary.counters = Counter::NAMES.into_iter().zip(counters).collect();
        // Paths are only looked up for the winners.
        for (name, mut list) in slowest {
            list.sort_by(|a, b| b.busy.cmp(&a.busy));
            list.truncate(SLOWEST);
            summary.queries.entry(name).or_default().slowest = list
                .into_iter()
                .map(|s| SlowQuery {
                    q: s.seq,
                    busy_us: s.busy / 1000,
                    self_us: s.self_ns / 1000,
                    wall_us: s.wall / 1000,
                    file: s.file.and_then(file_path),
                    key: s.key,
                })
                .collect();
        }
        threads.sort();
        let mut all = vec![TraceEvent::metadata("process_name", 0, "ng-analyze".into())];
        all.extend(
            threads
                .into_iter()
                .map(|(tid, name)| TraceEvent::metadata("thread_name", tid, name)),
        );
        all.append(&mut events);
        PerfTake {
            pid: std::process::id(),
            events: all,
            summary,
        }
    }
}

fn key_args(key: &Option<String>) -> Option<Args> {
    key.clone().map(|key| Args {
        key: Some(key),
        ..Args::default()
    })
}

/// Reads a query span's `kind` and `file`, and its `key` in detail mode.
#[derive(Default)]
struct QueryFields {
    detail: bool,
    name: Option<&'static str>,
    key: Option<String>,
    file: Option<u32>,
}

impl Visit for QueryFields {
    fn record_u64(&mut self, field: &Field, value: u64) {
        match field.name() {
            // An index into `QueryKey::KIND_NAMES`, so the name is `'static` without copying.
            "kind" => self.name = QueryKey::KIND_NAMES.get(value as usize).copied(),
            "file" => self.file = u32::try_from(value).ok(),
            _ => {}
        }
    }

    fn record_debug(&mut self, field: &Field, value: &dyn std::fmt::Debug) {
        if self.detail && field.name() == "key" {
            self.key = Some(format!("{value:?}"));
        }
    }
}

impl<S> Layer<S> for NgPerfLayer
where
    S: Subscriber + for<'a> LookupSpan<'a>,
{
    fn register_callsite(&self, meta: &'static Metadata<'static>) -> Interest {
        if Kind::of(meta).is_some() {
            Interest::sometimes()
        } else {
            Interest::never()
        }
    }

    fn enabled(&self, meta: &Metadata<'_>, _ctx: Context<'_, S>) -> bool {
        self.recording() && Kind::of(meta).is_some()
    }

    fn on_new_span(&self, attrs: &Attributes<'_>, id: &Id, ctx: Context<'_, S>) {
        let Some(span) = ctx.span(id) else { return };
        let meta = attrs.metadata();
        let Some(kind) = Kind::of(meta) else { return };
        let now = self.now();
        let seq = self.0.next_seq.fetch_add(1, Relaxed);
        let query = kind == Kind::Query;
        let detail = query && self.0.detail.load(Relaxed);
        let latency = kind == Kind::Async || detail;
        let mut fields = QueryFields {
            detail,
            ..QueryFields::default()
        };
        if query {
            attrs.record(&mut fields);
        }
        let name = fields.name.unwrap_or_else(|| span_name(meta));
        let (key, file) = (fields.key, fields.file);
        let mut flow = false;
        self.with_buf(|buf| {
            if query {
                // Created inside a slice on this thread: link it to the query's first poll.
                if !buf.stack.is_empty() {
                    flow = true;
                    let mut e = TraceEvent::new("s", Cat::Query, "Query", buf.tid, now);
                    e.id = Some(seq);
                    buf.events.push(e);
                }
            }
            if latency {
                let mut e = TraceEvent::new("b", kind.cats().1, name, buf.tid, now);
                e.id2 = Some(LocalId { local: seq });
                e.args = key_args(&key);
                buf.events.push(e);
            }
        });
        span.extensions_mut().insert(SpanData {
            kind,
            name,
            seq,
            created: now,
            first_enter: None,
            done: None,
            busy: 0,
            self_ns: 0,
            flow,
            latency,
            key,
            file,
        });
    }

    fn on_record(&self, id: &Id, values: &Record<'_>, ctx: Context<'_, S>) {
        struct Done(bool);
        impl Visit for Done {
            fn record_bool(&mut self, field: &Field, value: bool) {
                self.0 |= field.name() == "done" && value;
            }
            fn record_debug(&mut self, _: &Field, _: &dyn std::fmt::Debug) {}
        }
        let mut done = Done(false);
        values.record(&mut done);
        if !done.0 {
            return;
        }
        let Some(span) = ctx.span(id) else { return };
        let mut ext = span.extensions_mut();
        if let Some(data) = ext.get_mut::<SpanData>() {
            data.done.get_or_insert(self.now());
        }
    }

    fn on_enter(&self, id: &Id, ctx: Context<'_, S>) {
        let Some(span) = ctx.span(id) else { return };
        let mut ext = span.extensions_mut();
        let Some(data) = ext.get_mut::<SpanData>() else {
            return;
        };
        let now = self.now();
        let first = data.first_enter.is_none();
        if first {
            data.first_enter = Some(now);
        }
        let (flow, seq, skip) = (first && data.flow, data.seq, data.done.is_some());
        self.with_buf(|buf| {
            if flow {
                let mut e = TraceEvent::new("f", Cat::Query, "Query", buf.tid, now);
                e.id = Some(seq);
                e.bp = Some("e");
                buf.events.push(e);
            }
            buf.stack.push(Frame {
                id: id.clone(),
                start: now,
                child: 0,
                skip,
            });
        });
    }

    fn on_exit(&self, id: &Id, ctx: Context<'_, S>) {
        let Some(span) = ctx.span(id) else { return };
        let mut ext = span.extensions_mut();
        let Some(data) = ext.get_mut::<SpanData>() else {
            return;
        };
        let now = self.now();
        self.with_buf(|buf| {
            let Some(pos) = buf.stack.iter().rposition(|f| f.id == *id) else {
                return;
            };
            let frame = buf.stack.remove(pos);
            if frame.skip {
                return;
            }
            let dur = now.saturating_sub(frame.start);
            if let Some(parent) = buf.stack.last_mut() {
                parent.child += dur;
            }
            data.busy += dur;
            data.self_ns += dur.saturating_sub(frame.child);
            let mut e = TraceEvent::new("X", data.kind.cats().0, data.name, buf.tid, frame.start);
            e.dur = Some(us(dur));
            if data.kind == Kind::Query {
                e.args = Some(Args {
                    q: Some(data.seq),
                    key: data.key.clone(),
                    ..Args::default()
                });
            }
            buf.events.push(e);
        });
    }

    fn on_close(&self, id: Id, ctx: Context<'_, S>) {
        let Some(span) = ctx.span(&id) else { return };
        let data = span.extensions_mut().remove::<SpanData>();
        let Some(data) = data else { return };
        let now = self.now();
        let name = data.name;
        self.with_buf(|buf| {
            if data.kind == Kind::Query {
                let agg = buf.queries.entry(name).or_default();
                agg.busy += data.busy;
                agg.self_ns += data.self_ns;
                if let Some(first) = data.first_enter {
                    agg.queued += first.saturating_sub(data.created);
                }
                match data.done {
                    Some(done) => {
                        let wall = done.saturating_sub(data.created);
                        agg.count += 1;
                        agg.wall += wall;
                        let slow = Slow {
                            seq: data.seq,
                            busy: data.busy,
                            self_ns: data.self_ns,
                            wall,
                            file: data.file,
                            key: data.key,
                        };
                        keep_slowest(&mut agg.slowest, slow);
                    }
                    None => agg.cancelled += 1,
                }
            } else {
                let agg = buf.spans.entry(name).or_default();
                agg.0 += 1;
                agg.1 += data.self_ns;
            }
            if data.latency {
                let end = data.done.unwrap_or(now);
                let mut e = TraceEvent::new("e", data.kind.cats().1, name, buf.tid, end);
                e.id2 = Some(LocalId { local: data.seq });
                buf.events.push(e);
            }
        });
    }
}
