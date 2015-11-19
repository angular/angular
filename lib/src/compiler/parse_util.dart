library angular2.src.compiler.parse_util;

class ParseLocation {
  ParseSourceFile file;
  num offset;
  num line;
  num col;
  ParseLocation(this.file, this.offset, this.line, this.col) {}
  String toString() {
    return '''${ this . file . url}@${ this . line}:${ this . col}''';
  }
}

class ParseSourceFile {
  String content;
  String url;
  ParseSourceFile(this.content, this.url) {}
}

abstract class ParseError {
  ParseLocation location;
  String msg;
  ParseError(this.location, this.msg) {}
  String toString() {
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
    var context = source.substring(ctxStart, this.location.offset) +
        "[ERROR ->]" +
        source.substring(this.location.offset, ctxEnd + 1);
    return '''${ this . msg} ("${ context}"): ${ this . location}''';
  }
}

class ParseSourceSpan {
  ParseLocation start;
  ParseLocation end;
  ParseSourceSpan(this.start, this.end) {}
  String toString() {
    return this
        .start
        .file
        .content
        .substring(this.start.offset, this.end.offset);
  }
}
