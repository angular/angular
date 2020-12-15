.ɵɵelementStart(0, "div") // SOURCE: "/escaped_chars.html" <div>\r\n  
…
// NOTE: the `\\r\\n` at the end of the next line will be unescaped to `\r\n`. If it was just `\r\n` it would get unescaped to the actual characters.
.ɵɵtext(1, " Some Message Encoded character: \uD83D\uDE80\\n") // SOURCE: "/escaped_chars.html" Some Message\r\n  Encoded character: 🚀\\r\\n
…
.ɵɵelementEnd() // SOURCE: "/escaped_chars.html" </div>
