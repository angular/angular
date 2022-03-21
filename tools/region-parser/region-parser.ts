import {blockC} from './region-matchers/block-c';
import {html} from './region-matchers/html';
import {inlineC} from './region-matchers/inline-c';

export type Region = {lines: string[]; open: boolean};
export type RegionMap = {[regionName: string]: Region};

export function regionParser(contents: string, fileType: string) {
  return regionParserImpl(contents, fileType);
}

/**
 * @param contents string
 * @param fileType string
 * @returns {contents: string, regions: {[regionName: string]: string}}
 */
function regionParserImpl(
  contents: string,
  fileType: string,
): {contents: string; regions: {[regionName: string]: string}} {
  const regionMatchers: {[fileType: string]: {[region: string]: RegExp}} = {
    ts: inlineC,
    js: inlineC,
    es6: inlineC,
    html: html,
    css: blockC,
    json: inlineC,
    'json.annotated': inlineC,
  };
  const regionMatcher = regionMatchers[fileType];
  const openRegions: string[] = [];
  const regionMap: RegionMap = {};

  if (regionMatcher) {
    const lines = contents.split(/\r?\n/).filter(line => {
      // debugger;
      const startRegion = line.match(regionMatcher.regionStartMatcher);
      const endRegion = line.match(regionMatcher.regionEndMatcher);

      // start region processing
      if (startRegion) {
        // open up the specified region
        const regionNames = getRegionNames(startRegion[1]);
        if (regionNames.length === 0) {
          regionNames.push('');
        }
        regionNames.forEach(regionName => {
          const region = regionMap[regionName];
          if (region) {
            if (region.open) {
              throw new Error(
                `Tried to open a region, named "${regionName}", that is already open`,
              );
            }
            region.open = true;
          } else {
            regionMap[regionName] = {lines: [], open: true};
          }
          openRegions.push(regionName);
        });

        // end region processing
      } else if (endRegion) {
        if (openRegions.length === 0) {
          throw new Error('Tried to close a region when none are open');
        }
        // close down the specified region (or most recent if no name is given)
        const regionNames = getRegionNames(endRegion[1]);
        if (regionNames.length === 0) {
          regionNames.push(openRegions[openRegions.length - 1]);
        }

        regionNames.forEach(regionName => {
          const region = regionMap[regionName];
          if (!region || !region.open) {
            throw new Error(`Tried to close a region, named "${regionName}", that is not open`);
          }
          region.open = false;
          removeLast(openRegions, regionName);
        });
      } else {
        openRegions.forEach(regionName => regionMap[regionName].lines.push(line));
        // do not filter out this line from the content
        return true;
      }

      // this line contained an annotation so let's filter it out
      return false;
    });
    if (!regionMap['']) {
      regionMap[''] = {lines, open: false};
    }
    return {
      contents: lines.join('\n'),
      regions: mapObject(regionMap, (regionName: string, region: Region) =>
        leftAlign(region.lines).join('\n'),
      ),
    };
  } else {
    return {contents, regions: {}};
  }
}

function mapObject(obj: RegionMap, mapper: (regionName: string, region: Region) => string) {
  const mappedObj: {[regionName: string]: string} = {};
  Object.keys(obj).forEach((key: string) => {
    mappedObj[key] = mapper(key, obj[key]);
  });
  return mappedObj;
}

function getRegionNames(input: string): string[] {
  return input.trim() === '' ? [] : input.split(',').map(name => name.trim());
}

function removeLast(array: string[], item: string) {
  const index = array.lastIndexOf(item);
  array.splice(index, 1);
}

function leftAlign(lines: string[]): string[] {
  let indent = Number.MAX_VALUE;
  lines.forEach(line => {
    const lineIndent = line.search(/\S/);
    if (lineIndent !== -1) {
      indent = Math.min(lineIndent, indent);
    }
  });
  return lines.map(line => line.slice(indent));
}
