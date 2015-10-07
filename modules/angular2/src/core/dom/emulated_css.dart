/**
 * Emulates browser CSS API.
 *
 * WARNING: this is a very incomplete emulation; it only has enough to support
 *          Angular's CSS scoping (a.k.a. shimming).
 */
library angular2.dom.emulated_css;

import 'package:csslib/parser.dart' as cssp;
import 'package:csslib/visitor.dart' as cssv;

/// Parses [css] string and emits the list of top-level CSS rules in it via
/// data structures that mimick browser CSS APIs.
List<EmulatedCssRule> parseAndEmulateCssRules(String css) {
  var stylesheet = cssp.parse(css);
  return emulateRules(stylesheet.topLevels);
}

/// Converts `csslib` [rules] to their emulated counterparts.
List<EmulatedCssRule> emulateRules(Iterable<cssv.TreeNode> rules) {
  return rules
    .map((cssv.TreeNode node) {
      if (node is cssv.RuleSet) {
        if (node.declarationGroup.span.text.isEmpty) {
          // Skip CSS matchers with no bodies
          return null;
        }
        return new EmulatedCssStyleRule(node);
      } else if (node is cssv.MediaDirective) {
        return new EmulatedCssMedialRule(node);
      } else if (node is cssv.ImportDirective) {
        return new EmulatedCssImportRule(node);
      }
    })
    .where((r) => r != null)
    .toList();
}

/// Emulates [CSSRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSRule)
abstract class EmulatedCssRule {
  int type;
  String cssText;
}

/// Emulates [CSSStyleRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule)
class EmulatedCssStyleRule extends EmulatedCssRule {
  String selectorText;
  EmulatedCssStyleDeclaration style;

  EmulatedCssStyleRule(cssv.RuleSet ruleSet) {
    final declarationText = new StringBuffer();
    ruleSet.declarationGroup.declarations.forEach((d) {
      if (d is! cssv.Declaration) {
        // Nested selectors not supported
        return;
      }
      // TODO: expression spans are currently broken in csslib; see:
      //       https://github.com/dart-lang/csslib/pull/14
      var declarationSpan = d.span.text;
      var colonIdx = declarationSpan.indexOf(':');
      var expression = declarationSpan.substring(colonIdx + 1);
      declarationText.write('${d.property}: ${expression};');
    });

    final style = new EmulatedCssStyleDeclaration()
      ..cssText = declarationText.toString();

    this
      ..type = 1
      ..cssText = ruleSet.span.text
      ..selectorText = ruleSet.selectorGroup.span.text
      ..style = style;
  }
}

/// Emulates [CSSStyleDeclaration](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)
class EmulatedCssStyleDeclaration {
  final String content = '';
  String cssText;
}

/// Emulates [CSSMediaRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSMediaRule)
class EmulatedCssMedialRule extends EmulatedCssRule {
  List<EmulatedCssStyleRule> cssRules;
  EmulatedMediaList media;

  EmulatedCssMedialRule(cssv.MediaDirective directive) {
    this
      ..type = 4
      ..media = new EmulatedMediaList(directive)
      ..cssText = directive.span.text
      ..cssRules = emulateRules(directive.rulesets);
  }
}

/// Emulates [MediaList](https://developer.mozilla.org/en-US/docs/Web/API/MediaList)
class EmulatedMediaList {
  String mediaText;

  EmulatedMediaList(cssv.MediaDirective directive) {
    this.mediaText = directive.mediaQueries
        .map((q) => q.span.text).join(' and ');
  }
}

/// Emulates [CSSImportRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSImportRule)
class EmulatedCssImportRule extends EmulatedCssRule {
  EmulatedCssImportRule(cssv.ImportDirective directive) {
    this
      ..type = 3
      ..cssText = '@${directive.span.text};';
  }
}
