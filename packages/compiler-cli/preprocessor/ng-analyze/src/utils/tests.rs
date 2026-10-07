use crate::types::metadata::SpanMetadata;
use oxc_ast_visit::utf8_to_utf16::Utf8ToUtf16;

#[test]
fn test_convert_span_utf16() {
    // "José" has 4 characters. 'é' is 2 bytes in UTF-8 (0xC3 0xA9), but 1 char in UTF-16.
    // "Jos" is 3 bytes/chars.
    // "José" in UTF-8: 4A 6F 73 C3 A9 (5 bytes)
    // "José" in UTF-16: 4A 6F 73 E9 (4 units)

    let source = "José";
    let converter = Utf8ToUtf16::new(source);

    // Span covering 'é' (last char)
    // start byte: 3, end byte: 5
    let span = oxc_span::Span::new(3, 5);
    let converted = SpanMetadata::new(span, &converter);
    assert_eq!(converted.start, 3);
    assert_eq!(converted.end, 4);

    // "😊" is 4 bytes in UTF-8 (F0 9F 98 8A), and 2 units in UTF-16 (D83D DE0A).
    let source_emoji = "A😊B";
    let converter_emoji = Utf8ToUtf16::new(source_emoji);

    // Span covering '😊'
    let span_emoji = oxc_span::Span::new(1, 5);
    let converted_emoji = SpanMetadata::new(span_emoji, &converter_emoji);
    assert_eq!(converted_emoji.start, 1);
    assert_eq!(converted_emoji.end, 3); // 1 + 2 surrogates

    // Span covering 'B'
    let span_b = oxc_span::Span::new(5, 6);
    let converted_b = SpanMetadata::new(span_b, &converter_emoji);
    assert_eq!(converted_b.start, 3); // 1 ('A') + 2 ('😊')
    assert_eq!(converted_b.end, 4);
}

#[test]
fn test_is_ts_file() {
    use std::path::Path;
    assert!(super::is_ts_file(Path::new("foo.ts")));
    assert!(super::is_ts_file(Path::new("foo.d.ts")));
    assert!(super::is_ts_file(Path::new("foo.js")));
    assert!(super::is_ts_file(Path::new("foo.tsx")));
    assert!(!super::is_ts_file(Path::new("foo.css")));
    assert!(!super::is_ts_file(Path::new("foo.scss")));
    assert!(!super::is_ts_file(Path::new("foo.html")));
    assert!(!super::is_ts_file(Path::new("foo.ng.html")));
}
