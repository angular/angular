'use strict';var ParseLocation = (function () {
    function ParseLocation(file, offset, line, col) {
        this.file = file;
        this.offset = offset;
        this.line = line;
        this.col = col;
    }
    ParseLocation.prototype.toString = function () { return this.file.url + "@" + this.line + ":" + this.col; };
    return ParseLocation;
})();
exports.ParseLocation = ParseLocation;
var ParseSourceFile = (function () {
    function ParseSourceFile(content, url) {
        this.content = content;
        this.url = url;
    }
    return ParseSourceFile;
})();
exports.ParseSourceFile = ParseSourceFile;
var ParseError = (function () {
    function ParseError(location, msg) {
        this.location = location;
        this.msg = msg;
    }
    ParseError.prototype.toString = function () {
        var source = this.location.file.content;
        var ctxStart = this.location.offset;
        if (ctxStart > source.length - 1) {
            ctxStart = source.length - 1;
        }
        var ctxEnd = ctxStart;
        var ctxLen = 0;
        var ctxLines = 0;
        while (ctxLen < 100 && ctxStart > 0) {
            ctxStart--;
            ctxLen++;
            if (source[ctxStart] == "\n") {
                if (++ctxLines == 3) {
                    break;
                }
            }
        }
        ctxLen = 0;
        ctxLines = 0;
        while (ctxLen < 100 && ctxEnd < source.length - 1) {
            ctxEnd++;
            ctxLen++;
            if (source[ctxEnd] == "\n") {
                if (++ctxLines == 3) {
                    break;
                }
            }
        }
        var context = source.substring(ctxStart, this.location.offset) + '[ERROR ->]' +
            source.substring(this.location.offset, ctxEnd + 1);
        return this.msg + " (\"" + context + "\"): " + this.location;
    };
    return ParseError;
})();
exports.ParseError = ParseError;
var ParseSourceSpan = (function () {
    function ParseSourceSpan(start, end) {
        this.start = start;
        this.end = end;
    }
    ParseSourceSpan.prototype.toString = function () {
        return this.start.file.content.substring(this.start.offset, this.end.offset);
    };
    return ParseSourceSpan;
})();
exports.ParseSourceSpan = ParseSourceSpan;
//# sourceMappingURL=parse_util.js.map