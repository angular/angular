const blockC = require('./region-matchers/block-c');
const html = require('./region-matchers/html');
const inlineC = require('./region-matchers/inline-c');
const inlineCOnly = require('./region-matchers/inline-c-only');
const inlineHash = require('./region-matchers/inline-hash');
const DEFAULT_PLASTER = '. . .';
const {mapObject} = require('../../helpers/utils');
const removeEslintComments = require('./removeEslintComments');

module.exports = function regionParser() {
  regionParserImpl.regionMatchers = {
    ts: inlineC,
    js: inlineC,
    mjs: inlineCOnly,
    es6: inlineC,
    html: html,
    svg: html,
    css: blockC,
    conf: inlineHash,
    yaml: inlineHash,
    yml: inlineHash,
    sh: inlineHash,
    jade: inlineCOnly,
    pug: inlineCOnly,
    json: inlineCOnly,
    'json.annotated': inlineCOnly
  };

  return regionParserImpl;

  /**
   * @param contents string
   * @param fileType string
   * @returns {contents: string, regions: {[regionName: string]: string}}
   */
  function regionParserImpl(contents, fileType) {
    const regionMatcher = regionParserImpl.regionMatchers[fileType];
    const openRegions = [];
    const regionMap = {};

    if (regionMatcher) {
      let plaster = regionMatcher.createPlasterComment(DEFAULT_PLASTER);
      const lines = removeEslintComments(contents, fileType).split(/\r?\n/).filter((line, index) => {
        const startRegion = line.match(regionMatcher.regionStartMatcher);
        const endRegion = line.match(regionMatcher.regionEndMatcher);
        const updatePlaster = line.match(regionMatcher.plasterMatcher);

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
                throw new RegionParserError(
                    `Tried to open a region, named "${regionName}", that is already open`, index);
              }
              region.open = true;
              if (plaster) {
                // Use the same indent as the docregion marker
                const indent = startRegion[0].split(/[^ ]/, 1);
                region.lines.push(indent + plaster);
              }
            } else {
              regionMap[regionName] = {lines: [], open: true};
            }
            openRegions.push(regionName);
          });

          // end region processing
        } else if (endRegion) {
          if (openRegions.length === 0) {
            throw new RegionParserError('Tried to close a region when none are open', index);
          }
          // close down the specified region (or most recent if no name is given)
          const regionNames = getRegionNames(endRegion[1]);
          if (regionNames.length === 0) {
            regionNames.push(openRegions[openRegions.length - 1]);
          }

          regionNames.forEach(regionName => {
            const region = regionMap[regionName];
            if (!region || !region.open) {
              throw new RegionParserError(
                  `Tried to close a region, named "${regionName}", that is not open`, index);
            }
            region.open = false;
            removeLast(openRegions, regionName);
          });

          // doc plaster processing
        } else if (updatePlaster) {
          const plasterString = updatePlaster[1].trim();
          plaster = plasterString ? regionMatcher.createPlasterComment(plasterString) : '';

          // simple line of content processing
        } else {
          openRegions.forEach(regionName => regionMap[regionName].lines.push(line));
          // do not filter out this line from the content
          return true;
        }

        // this line contained an annotation so let's filter it out
        return false;
      });
      if (!regionMap['']) {
        regionMap[''] = {lines};
      }
      return {
        contents: lines.join('\n'),
        regions: mapObject(regionMap, (regionName, region) => leftAlign(region.lines).join('\n'))
      };
    } else {
      return {contents, regions: {}};
    }
  }
};

function getRegionNames(input) {
  return (input.trim() === '') ? [] : input.split(',').map(name => name.trim());
}

function removeLast(array, item) {
  const index = array.lastIndexOf(item);
  array.splice(index, 1);
}

function leftAlign(lines) {
  let indent = Number.MAX_VALUE;
  lines.forEach(line => {
    const lineIndent = line.search(/\S/);
    if (lineIndent !== -1) {
      indent = Math.min(lineIndent, indent);
    }
  });
  return lines.map(line => line.slice(indent));
}

function RegionParserError(message, index) {
  const lineNum = index + 1;
  this.message = `regionParser: ${message} (at line ${lineNum}).`;
  this.lineNum = lineNum;
  this.stack = (new Error()).stack;
}
RegionParserError.prototype = Object.create(Error.prototype);
RegionParserError.prototype.constructor = RegionParserError;
