use super::layer::{Cat, Clock, NgPerfLayer, PerfTake, TraceEvent};
use super::{Counter, KindStats, SpanStats, ASYNC_TARGET, QUERY_TARGET};
use crate::query::keys::QueryKey;
use crate::query::ReferenceId;
use oxc_semantic::SymbolId;
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering::Relaxed};
use std::sync::Arc;
use tracing::Dispatch;
use tracing_subscriber::layer::SubscriberExt;

struct Harness {
    layer: NgPerfLayer,
    dispatch: Dispatch,
    clock: Arc<AtomicU64>,
}

impl Harness {
    fn new(detail: bool) -> Self {
        let clock = Arc::new(AtomicU64::new(0));
        let layer = NgPerfLayer::new(Clock::Fake(clock.clone()));
        layer.set_recording(true, detail);
        let dispatch = Dispatch::new(tracing_subscriber::Registry::default().with(layer.clone()));
        Self {
            layer,
            dispatch,
            clock,
        }
    }

    /// Sets the fake clock, in µs.
    fn at(&self, us: u64) {
        self.clock.store(us * 1000, Relaxed);
    }

    fn on_thread<T: Send>(&self, name: &str, f: impl FnOnce() -> T + Send) -> T {
        std::thread::scope(|s| {
            std::thread::Builder::new()
                .name(name.to_string())
                .spawn_scoped(s, || tracing::dispatcher::with_default(&self.dispatch, f))
                .unwrap()
                .join()
                .unwrap()
        })
    }
}

/// The span `QueryEngine::execute` creates.
fn query(key: &QueryKey) -> tracing::Span {
    tracing::info_span!(
        target: QUERY_TARGET,
        "query",
        kind = key.kind_index() as u64,
        file = key.perf_file_id(),
        key = ?key,
        done = tracing::field::Empty,
    )
}

fn no_paths(_: u32) -> Option<String> {
    None
}

fn tid_of(take: &PerfTake, name: &str) -> u32 {
    take.events
        .iter()
        .find(|e| {
            e.name.as_str() == "thread_name"
                && e.args.as_ref().unwrap().name.as_deref() == Some(name)
        })
        .unwrap()
        .tid
}

fn find<'a>(take: &'a PerfTake, ph: &str, name: &str) -> Vec<&'a TraceEvent> {
    take.events
        .iter()
        .filter(|e| e.ph == ph && e.name.as_str() == name)
        .collect()
}

fn key(e: &TraceEvent) -> Option<&str> {
    e.args.as_ref()?.key.as_deref()
}

/// The query execution id of an `X` slice.
fn q(e: &TraceEvent) -> Option<u64> {
    e.args.as_ref()?.q
}

/// Two queries polled on two threads, with a nested sync span and a dependency span.
fn record(h: &Harness) {
    let (syntax, parse) = h.on_thread("a", || {
        h.at(0);
        let syntax = query(&QueryKey::AnalyzeFileSyntax(1));
        h.at(10);
        let poll = syntax.enter();
        h.at(12);
        let sync = tracing::info_span!("EmitWire").entered();
        h.at(15);
        // Requested inside the `emitWire` slice: flow start here.
        let parse = query(&QueryKey::ParseFile(1));
        let resolve = tracing::info_span!(target: "oxc_resolver", "resolve").entered();
        h.at(16);
        drop(resolve);
        h.at(17);
        drop(sync);
        h.at(20);
        drop(poll);
        // Dropped before completing.
        drop(query(&QueryKey::ParseFile(2)));
        (syntax, parse)
    });
    h.on_thread("b", move || {
        h.at(30);
        parse.in_scope(|| h.at(34));
        parse.record("done", true);
        drop(parse);
        h.at(40);
        syntax.in_scope(|| h.at(43));
        syntax.record("done", true);
        h.at(50);
        let analyze = tracing::info_span!(target: ASYNC_TARGET, "Analyze");
        analyze.in_scope(|| h.at(52));
        drop(analyze);
        drop(syntax);
    });
}

#[test]
fn records_per_thread_slices_flows_and_totals() {
    let h = Harness::new(false);
    record(&h);
    let take = h.layer.take(&no_paths);
    let (a, b) = (tid_of(&take, "a"), tid_of(&take, "b"));
    assert_ne!(a, b);

    let syntax = find(&take, "X", "AnalyzeFileSyntax");
    assert_eq!(syntax.len(), 2, "one slice per poll");
    assert_eq!(
        (syntax[0].tid, syntax[0].ts, syntax[0].dur),
        (a, 10.0, Some(10.0))
    );
    assert_eq!(
        (syntax[1].tid, syntax[1].ts, syntax[1].dur),
        (b, 40.0, Some(3.0))
    );
    assert!(syntax.iter().all(|e| e.cat == Some(Cat::Query)));
    assert_eq!(q(syntax[0]), q(syntax[1]));

    // The sync span nests inside the poll slice on the same track.
    let sync = find(&take, "X", "EmitWire");
    assert_eq!((sync[0].tid, sync[0].ts, sync[0].dur), (a, 12.0, Some(5.0)));
    assert_eq!((sync[0].cat, &sync[0].args), (Some(Cat::Rust), &None));
    // So do dependency spans.
    let resolve = find(&take, "X", "Resolve");
    assert_eq!(
        (resolve[0].tid, resolve[0].ts, resolve[0].dur),
        (a, 15.0, Some(1.0))
    );

    // Flow from the requester's slice on `a` to the first poll on `b`.
    let parse = find(&take, "X", "ParseFile");
    let (s, f) = (find(&take, "s", "Query"), find(&take, "f", "Query"));
    assert_eq!(s.len(), 1);
    assert_eq!(
        (s[0].tid, s[0].ts, s[0].id, s[0].bp),
        (a, 15.0, q(parse[0]), None)
    );
    assert_eq!(
        (f[0].tid, f[0].ts, f[0].id, f[0].bp),
        (b, 30.0, q(parse[0]), Some("e"))
    );

    // Async spans get a latency slice besides their poll slices; queries don't outside detail.
    let (begin, end) = (find(&take, "b", "Analyze"), find(&take, "e", "Analyze"));
    assert_eq!((begin[0].ts, begin[0].cat), (50.0, Some(Cat::Rust)));
    assert_eq!((end[0].ts, end[0].id2), (52.0, begin[0].id2));
    assert!(find(&take, "b", "ParseFile").is_empty());
    assert!(take.events.iter().all(|e| key(e).is_none()));

    // Thread names, then the timeline.
    let names: Vec<_> = take.events.iter().take_while(|e| e.ph == "M").collect();
    assert_eq!(names[0].name.as_str(), "process_name");
    assert_eq!(names.len(), 3);

    let q = &take.summary.queries;
    assert_eq!(
        KindStats {
            slowest: Vec::new(),
            ..q["AnalyzeFileSyntax"].clone()
        },
        KindStats {
            count: 1,
            busy_us: 13,
            self_us: 8,
            queued_us: 10,
            wall_us: 43,
            ..Default::default()
        }
    );
    assert_eq!(
        KindStats {
            slowest: Vec::new(),
            ..q["ParseFile"].clone()
        },
        KindStats {
            count: 1,
            busy_us: 4,
            self_us: 4,
            queued_us: 15,
            wall_us: 19,
            cancelled: 1,
            ..Default::default()
        }
    );
    let s = &take.summary.spans;
    assert_eq!(
        s["EmitWire"],
        SpanStats {
            count: 1,
            self_us: 4
        }
    );
    assert_eq!(
        s["Resolve"],
        SpanStats {
            count: 1,
            self_us: 1
        }
    );
    assert_eq!(
        s["Analyze"],
        SpanStats {
            count: 1,
            self_us: 2
        }
    );
}

#[test]
fn take_drains_events_and_resets_totals() {
    let h = Harness::new(false);
    record(&h);
    h.layer.count(Counter::FsReads, 2);
    h.on_thread("c", || h.layer.count(Counter::FsReads, 3));
    let first = h.layer.take(&no_paths);
    assert!(!first.events.is_empty());
    assert_eq!(first.summary.counters["FsReads"], 5);
    h.at(100);
    let second = h.layer.take(&no_paths);
    assert!(second.events.iter().all(|e| e.ph == "M"));
    assert_eq!(second.summary.counters["FsReads"], 0);
    assert!(second.summary.queries.is_empty() && second.summary.spans.is_empty());
    let names = |t: &PerfTake| t.events.iter().filter(|e| e.ph == "M").count();
    assert_eq!(names(&second), names(&first));
    assert_eq!(second.pid, std::process::id());
}

#[test]
fn detail_mode_adds_query_latency_slices_and_keys() {
    let h = Harness::new(true);
    record(&h);
    let take = h.layer.take(&no_paths);
    let begin = find(&take, "b", "ParseFile");
    assert_eq!(begin.len(), 2);
    assert_eq!(key(begin[0]), Some("ParseFile(1)"));
    let end = find(&take, "e", "ParseFile");
    assert_eq!(end.iter().map(|e| e.ts).fold(0.0, f64::max), 34.0);
    assert!(begin
        .iter()
        .chain(&end)
        .all(|e| e.cat == Some(Cat::QueryAsync)));
    let poll = find(&take, "X", "AnalyzeFileSyntax");
    assert_eq!(key(poll[0]), Some("AnalyzeFileSyntax(1)"));
}

#[test]
fn records_only_while_recording() {
    let h = Harness::new(false);
    record(&h);
    h.layer.count(Counter::FsReads, 1);
    h.layer.count_cache_hit("ParseFile");
    let take = h.layer.take(&no_paths);
    assert!(!take.events.is_empty());
    assert_eq!(take.summary.counters["FsReads"], 1);
    assert_eq!(take.summary.queries["ParseFile"].cache_hits, 1);

    h.layer.set_recording(false, false);
    record(&h);
    h.layer.count(Counter::FsReads, 1);
    h.layer.count_cache_hit("ParseFile");
    let take = h.layer.take(&no_paths);
    assert!(take.events.iter().all(|e| e.ph == "M"));
    assert_eq!(take.summary.counters["FsReads"], 0);
    assert!(take.summary.queries.is_empty() && take.summary.spans.is_empty());

    h.layer.set_recording(true, true);
    record(&h);
    let take = h.layer.take(&no_paths);
    assert_eq!(find(&take, "X", "AnalyzeFileSyntax").len(), 2);
    assert_eq!(find(&take, "b", "ParseFile").len(), 2);
}

#[test]
fn query_keys_are_only_formatted_in_detail_mode() {
    struct Key<'a>(&'a AtomicUsize);
    impl std::fmt::Debug for Key<'_> {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            self.0.fetch_add(1, Relaxed);
            f.write_str("Key")
        }
    }
    let formatted = AtomicUsize::new(0);
    let run = |h: &Harness| {
        h.on_thread("a", || {
            let key = Key(&formatted);
            drop(tracing::info_span!(target: QUERY_TARGET, "query", kind = 0u64, key = ?key));
        })
    };
    let h = Harness::new(false);
    run(&h);
    h.layer.set_recording(false, false);
    run(&h);
    assert_eq!(formatted.load(Relaxed), 0);
    h.layer.set_recording(true, true);
    run(&h);
    assert_eq!(formatted.load(Relaxed), 1);
}

#[test]
fn take_serializes_to_chrome_trace_events() {
    let h = Harness::new(true);
    h.on_thread("a", || {
        h.at(1);
        let span = query(&QueryKey::ParseFile(3));
        span.in_scope(|| h.at(3));
    });
    let json = serde_json::to_value(h.layer.take(&no_paths)).unwrap();
    let events = json["events"].as_array().unwrap();
    let tid = events[1]["tid"].clone();
    assert_eq!(
        events[..2],
        [
            serde_json::json!({"name": "process_name", "ph": "M", "tid": 0, "ts": 0.0, "args": {"name": "ng-analyze"}}),
            serde_json::json!({"name": "thread_name", "ph": "M", "tid": tid, "ts": 0.0, "args": {"name": "a"}}),
        ]
    );
    let x = events.iter().find(|e| e["ph"] == "X").unwrap();
    let id = x["args"]["q"].clone();
    assert_eq!(
        *x,
        serde_json::json!({
            "name": "ngp.rust.ParseFile", "cat": "ngp.query", "ph": "X", "tid": tid, "ts": 1.0, "dur": 2.0,
            "args": {"q": id, "key": "ParseFile(3)"},
        })
    );
    let begin = events.iter().find(|e| e["ph"] == "b").unwrap();
    assert_eq!(
        *begin,
        serde_json::json!({
            "name": "ngp.rust.ParseFile", "cat": "ngp.query.async", "ph": "b", "tid": tid, "ts": 1.0,
            "id2": {"local": id}, "args": {"key": "ParseFile(3)"},
        })
    );
    assert!(json["pid"].is_number());
    assert_eq!(json["summary"]["queries"]["ParseFile"]["cancelled"], 1);
}

#[test]
fn keeps_the_slowest_executions_per_kind_with_paths() {
    let h = Harness::new(false);
    h.on_thread("a", || {
        // ParseFile(i) is busy for i µs; ParseFile(3) twice.
        for (i, busy) in [(1, 1), (2, 2), (3, 30), (4, 4), (5, 5), (6, 6), (3, 3)] {
            let span = query(&QueryKey::ParseFile(i));
            h.at(100 * i as u64);
            span.in_scope(|| h.at(100 * i as u64 + busy));
            span.record("done", true);
        }
        let span = query(&QueryKey::ProgramFiles);
        span.in_scope(|| h.at(2000));
        span.record("done", true);
    });
    let take = h
        .layer
        .take(&|id| (id != 6).then(|| format!("/src/f{id}.ts")));
    let slowest = &take.summary.queries["ParseFile"].slowest;
    let busy: Vec<_> = slowest.iter().map(|s| s.busy_us).collect();
    assert_eq!(busy, [30, 6, 5, 4, 3]);
    assert_eq!(slowest[0].file.as_deref(), Some("/src/f3.ts"));
    // The resolver may not know a file.
    assert_eq!(slowest[1].file, None);
    assert!(slowest.iter().all(|s| s.key.is_none()));
    // `q` matches the execution's slices.
    let x = find(&take, "X", "ParseFile");
    let top = x.iter().find(|e| e.dur == Some(30.0)).unwrap();
    assert_eq!(q(top), Some(slowest[0].q));
    // Kinds without a file still rank.
    let programs = &take.summary.queries["ProgramFiles"].slowest;
    assert_eq!((programs.len(), programs[0].file.as_deref()), (1, None));

    // Detail mode adds the key; take() starts over.
    h.layer.set_recording(true, true);
    h.on_thread("a", || {
        let span = query(&QueryKey::ModuleExportMap(9));
        span.in_scope(|| {});
        span.record("done", true);
    });
    let take = h.layer.take(&no_paths);
    let slow = &take.summary.queries["ModuleExportMap"].slowest[0];
    assert_eq!(slow.key.as_deref(), Some("ModuleExportMap(9)"));
    assert!(!take.summary.queries.contains_key("ParseFile"));
}

#[test]
fn slowest_executions_serialize_into_the_summary() {
    let h = Harness::new(false);
    h.on_thread("a", || {
        let span = query(&QueryKey::ParseFile(1));
        h.at(1);
        span.in_scope(|| h.at(4));
        span.record("done", true);
    });
    let json = serde_json::to_value(h.layer.take(&|_| Some("/a.d.ts".into()))).unwrap();
    let parse = &json["summary"]["queries"]["ParseFile"];
    let q = parse["slowest"][0]["q"].clone();
    assert_eq!(
        parse["slowest"],
        serde_json::json!([{"q": q, "busyUs": 3, "selfUs": 3, "wallUs": 4, "file": "/a.d.ts"}])
    );
}

#[test]
fn ngmodule_scope_queries_attribute_declaring_file_without_changing_file_id() {
    let exports_key = QueryKey::NgModuleExportsScope(ReferenceId::new(4, SymbolId::from(1)));
    let imports_key = QueryKey::NgModuleImportsScope(ReferenceId::new(7, SymbolId::from(2)));
    assert_eq!(exports_key.file_id(), None);
    assert_eq!(imports_key.file_id(), None);

    let h = Harness::new(false);
    h.on_thread("a", || {
        let exports_span = query(&exports_key);
        h.at(10);
        exports_span.in_scope(|| h.at(15));
        exports_span.record("done", true);

        let imports_span = query(&imports_key);
        h.at(20);
        imports_span.in_scope(|| h.at(28));
        imports_span.record("done", true);
    });
    let take = h.layer.take(&|id| Some(format!("/src/f{id}.ts")));
    assert_eq!(
        take.summary.queries["NgModuleExportsScope"].slowest[0]
            .file
            .as_deref(),
        Some("/src/f4.ts")
    );
    assert_eq!(
        take.summary.queries["NgModuleImportsScope"].slowest[0]
            .file
            .as_deref(),
        Some("/src/f7.ts")
    );
}
