import {DocCollection, Processor} from 'dgeni';
import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';

const INTERNAL_METHODS = [
  // Lifecycle methods
  'ngOnInit',
  'ngOnChanges',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngOnDestroy',

  // ControlValueAccessor methods
  'writeValue',
  'registerOnChange',
  'registerOnTouched',
  'setDisabledState',

  // Don't ever need to document constructors
  'constructor',

  // tabIndex exists on all elements, no need to document it
  'tabIndex',
];

/**
 * Processor to filter out symbols that should not be shown in the Material docs.
 */
export class DocsPrivateFilter implements Processor {
  name = 'docs-private-filter';
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    return docs.filter(doc => this.isPublicDoc(doc));
  }

  /** Marks the given API doc with a property that describes its public state. */
  private isPublicDoc(doc: ApiDoc) {
    if (this.hasDocsPrivateTag(doc) || doc.name.startsWith('_')) {
      return false;
    } else if (doc instanceof MemberDoc) {
      return !this.isInternalMember(doc);
    } else if (doc instanceof ClassExportDoc) {
      doc.members = doc.members.filter(memberDoc => this.isPublicDoc(memberDoc));
    }
    return true;
  }

  /** Whether the given method member is listed as an internal member. */
  private isInternalMember(memberDoc: MemberDoc) {
    return INTERNAL_METHODS.includes(memberDoc.name);
  }

  /** Whether the given doc has a @docs-private tag set. */
  private hasDocsPrivateTag(doc: any) {
    const tags = doc.tags && doc.tags.tags;
    return tags ? tags.find((d: any) => d.tagName == 'docs-private') : false;
  }
}
