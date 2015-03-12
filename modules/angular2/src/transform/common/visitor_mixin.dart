library angular2.src.transform.common;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:analyzer/src/generated/scanner.dart';

/// Visitor providing common methods for concrete implementations.
class VisitorMixin {
  PrintWriter writer;

  /**
   * Visit the given function body, printing the prefix before if given body is not empty.
   *
   * @param prefix the prefix to be printed if there is a node to visit
   * @param body the function body to be visited
   */
  void visitFunctionWithPrefix(String prefix, FunctionBody body) {
    if (body is! EmptyFunctionBody) {
      writer.print(prefix);
    }
    visitNode(body);
  }

  /// Safely visit [node].
  void visitNode(AstNode node) {
    if (node != null) {
      node.accept(this);
    }
  }

  /// Print a list of [nodes] without any separation.
  void visitNodeList(NodeList<AstNode> nodes) {
    visitNodeListWithSeparator(nodes, "");
  }

  /// Print a list of [nodes], separated by the given [separator].
  void visitNodeListWithSeparator(NodeList<AstNode> nodes, String separator) {
    if (nodes != null) {
      int size = nodes.length;
      for (int i = 0; i < size; i++) {
        if (i > 0) {
          writer.print(separator);
        }
        nodes[i].accept(this);
      }
    }
  }

  /// Print a list of [nodes], separated by the given [separator] and
  /// preceded by the given [prefix].
  void visitNodeListWithSeparatorAndPrefix(
      String prefix, NodeList<AstNode> nodes, String separator) {
    if (nodes != null) {
      int size = nodes.length;
      if (size > 0) {
        writer.print(prefix);
        for (int i = 0; i < size; i++) {
          if (i > 0) {
            writer.print(separator);
          }
          nodes[i].accept(this);
        }
      }
    }
  }

  /// Print a list of [nodes], separated by the given [separator] and
  /// succeeded by the given [suffix].
  void visitNodeListWithSeparatorAndSuffix(
      NodeList<AstNode> nodes, String separator, String suffix) {
    if (nodes != null) {
      int size = nodes.length;
      if (size > 0) {
        for (int i = 0; i < size; i++) {
          if (i > 0) {
            writer.print(separator);
          }
          nodes[i].accept(this);
        }
        writer.print(suffix);
      }
    }
  }

  /// If [node] is null does nothing. Otherwise, prints [prefix], then
  /// visits [node].
  void visitNodeWithPrefix(String prefix, AstNode node) {
    if (node != null) {
      writer.print(prefix);
      node.accept(this);
    }
  }

  /// If [node] is null does nothing. Otherwise, visits [node], then prints
  /// [suffix].
  void visitNodeWithSuffix(AstNode node, String suffix) {
    if (node != null) {
      node.accept(this);
      writer.print(suffix);
    }
  }

  /// Safely visit [node], printing [suffix] after the node if it is
  /// non-`null`.
  void visitTokenWithSuffix(Token token, String suffix) {
    if (token != null) {
      writer.print(token.lexeme);
      writer.print(suffix);
    }
  }
}
