import {ProjectFile} from '../../utils/tsurge';

export interface MigrationConfig {
  /**
   * Whether to migrate this component template to self-closing tags.
   */
  shouldMigrate?: (containingFile: ProjectFile) => boolean;

  /**
   * Whether to migrate key separated with space
   */
  migrateSpaceSeparatedKey?: boolean;
}
