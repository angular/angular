import { Injectable } from '@angular/core';
import { DocMetadata } from './doc.model';

@Injectable()
export class DocMetadataService {
  metadata: DocMetadata;
}
