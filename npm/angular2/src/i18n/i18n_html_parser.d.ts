import { HtmlParser, HtmlParseTreeResult } from 'angular2/src/compiler/html_parser';
import { ParseError } from 'angular2/src/compiler/parse_util';
import { HtmlAst } from 'angular2/src/compiler/html_ast';
import { Parser } from 'angular2/src/compiler/expression_parser/parser';
/**
 * Creates an i18n-ed version of the parsed template.
 *
 * Algorithm:
 *
 * To understand the algorithm, you need to know how partitioning works.
 * Partitioning is required as we can use two i18n comments to group node siblings together.
 * That is why we cannot just use nodes.
 *
 * Partitioning transforms an array of HtmlAst into an array of Part.
 * A part can optionally contain a root element or a root text node. And it can also contain
 * children.
 * A part can contain i18n property, in which case it needs to be transalted.
 *
 * Example:
 *
 * The following array of nodes will be split into four parts:
 *
 * ```
 * <a>A</a>
 * <b i18n>B</b>
 * <!-- i18n -->
 * <c>C</c>
 * D
 * <!-- /i18n -->
 * E
 * ```
 *
 * Part 1 containing the a tag. It should not be translated.
 * Part 2 containing the b tag. It should be translated.
 * Part 3 containing the c tag and the D text node. It should be translated.
 * Part 4 containing the E text node. It should not be translated.
 *
 *
 * It is also important to understand how we stringify nodes to create a message.
 *
 * We walk the tree and replace every element node with a placeholder. We also replace
 * all expressions in interpolation with placeholders. We also insert a placeholder element
 * to wrap a text node containing interpolation.
 *
 * Example:
 *
 * The following tree:
 *
 * ```
 * <a>A{{I}}</a><b>B</b>
 * ```
 *
 * will be stringified into:
 * ```
 * <ph name="e0"><ph name="t1">A<ph name="0"/></ph></ph><ph name="e2">B</ph>
 * ```
 *
 * This is what the algorithm does:
 *
 * 1. Use the provided html parser to get the html AST of the template.
 * 2. Partition the root nodes, and process each part separately.
 * 3. If a part does not have the i18n attribute, recurse to process children and attributes.
 * 4. If a part has the i18n attribute, merge the translated i18n part with the original tree.
 *
 * This is how the merging works:
 *
 * 1. Use the stringify function to get the message id. Look up the message in the map.
 * 2. Get the translated message. At this point we have two trees: the original tree
 * and the translated tree, where all the elements are replaced with placeholders.
 * 3. Use the original tree to create a mapping Index:number -> HtmlAst.
 * 4. Walk the translated tree.
 * 5. If we encounter a placeholder element, get is name property.
 * 6. Get the type and the index of the node using the name property.
 * 7. If the type is 'e', which means element, then:
 *     - translate the attributes of the original element
 *     - recurse to merge the children
 *     - create a new element using the original element name, original position,
 *     and translated children and attributes
 * 8. If the type if 't', which means text, then:
 *     - get the list of expressions from the original node.
 *     - get the string version of the interpolation subtree
 *     - find all the placeholders in the translated message, and replace them with the
 *     corresponding original expressions
 */
export declare class I18nHtmlParser implements HtmlParser {
    private _htmlParser;
    private _parser;
    private _messagesContent;
    private _messages;
    errors: ParseError[];
    constructor(_htmlParser: HtmlParser, _parser: Parser, _messagesContent: string, _messages: {
        [key: string]: HtmlAst[];
    });
    parse(sourceContent: string, sourceUrl: string, parseExpansionForms?: boolean): HtmlParseTreeResult;
    private _processI18nPart(p);
    private _mergeI18Part(p);
    private _recurseIntoI18nPart(p);
    private _recurse(nodes);
    private _mergeTrees(p, translated, original);
    private _mergeTreesHelper(translated, mapping);
    private _mergeElementOrInterpolation(t, translated, mapping);
    private _getName(t);
    private _mergeTextInterpolation(t, originalNode);
    private _mergeElement(t, originalNode, mapping);
    private _i18nAttributes(el);
    private _replaceInterpolationInAttr(attr, msg);
    private _replacePlaceholdersWithExpressions(message, exps, sourceSpan);
    private _buildExprMap(exps);
    private _convertIntoExpression(name, expMap, sourceSpan);
}
