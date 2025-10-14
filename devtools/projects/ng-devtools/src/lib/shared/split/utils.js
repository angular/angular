/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export function getPointFromEvent(event) {
  // TouchEvent
  if (event.changedTouches !== undefined && event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }
  // MouseEvent
  else if (event.clientX !== undefined && event.clientY !== undefined) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
  return null;
}
export function getElementPixelSize(elRef, direction) {
  const rect = elRef.nativeElement.getBoundingClientRect();
  return direction === 'horizontal' ? rect.width : rect.height;
}
export function getInputBoolean(v) {
  return typeof v === 'boolean' ? v : v === 'false' ? false : true;
}
export function getInputPositiveNumber(v, defaultValue) {
  if (v === null || v === undefined) return defaultValue;
  v = Number(v);
  return !isNaN(v) && v >= 0 ? v : defaultValue;
}
export function isUserSizesValid(unit, sizes) {
  // All sizes have to be not null and total should be 100
  if (unit === 'percent') {
    const total = sizes.reduce((total, s) => (s !== null ? total + s : total), 0);
    return sizes.every((s) => s !== null) && total > 99.9 && total < 100.1;
  }
  // A size at null is mandatory but only one.
  if (unit === 'pixel') {
    return sizes.filter((s) => s === null).length === 1;
  }
}
export function getAreaMinSize(a) {
  if (a.size === null) {
    return null;
  }
  if (a.component.lockSize === true) {
    return a.size;
  }
  if (a.component.minSize === null) {
    return null;
  }
  if (a.component.minSize > a.size) {
    return a.size;
  }
  return a.component.minSize;
}
export function getAreaMaxSize(a) {
  if (a.size === null) {
    return null;
  }
  if (a.component.lockSize === true) {
    return a.size;
  }
  if (a.component.maxSize === null) {
    return null;
  }
  if (a.component.maxSize < a.size) {
    return a.size;
  }
  return a.component.maxSize;
}
export function getGutterSideAbsorptionCapacity(unit, sideAreas, pixels, allAreasSizePixel) {
  return sideAreas.reduce(
    (acc, area) => {
      const res = getAreaAbsorptionCapacity(unit, area, acc.remain, allAreasSizePixel);
      acc.list.push(res);
      acc.remain = res.pixelRemain;
      return acc;
    },
    {remain: pixels, list: []},
  );
}
function getAreaAbsorptionCapacity(unit, areaSnapshot, pixels, allAreasSizePixel) {
  // No pain no gain
  if (pixels === 0) {
    return {
      areaSnapshot,
      pixelAbsorb: 0,
      percentAfterAbsorption: areaSnapshot.sizePercentAtStart,
      pixelRemain: 0,
    };
  }
  // Area start at zero and need to be reduced, not possible
  if (areaSnapshot.sizePixelAtStart === 0 && pixels < 0) {
    return {
      areaSnapshot,
      pixelAbsorb: 0,
      percentAfterAbsorption: 0,
      pixelRemain: pixels,
    };
  }
  if (unit === 'percent') {
    return getAreaAbsorptionCapacityPercent(areaSnapshot, pixels, allAreasSizePixel);
  }
  if (unit === 'pixel') {
    return getAreaAbsorptionCapacityPixel(areaSnapshot, pixels, allAreasSizePixel);
  }
}
function getAreaAbsorptionCapacityPercent(areaSnapshot, pixels, allAreasSizePixel) {
  const tempPixelSize = areaSnapshot.sizePixelAtStart + pixels;
  const tempPercentSize = (tempPixelSize / allAreasSizePixel) * 100;
  // ENLARGE AREA
  if (pixels > 0) {
    // If maxSize & newSize bigger than it > absorb to max and return remaining pixels
    if (areaSnapshot.area.maxSize !== null && tempPercentSize > areaSnapshot.area.maxSize) {
      // Use area.area.maxSize as newPercentSize and return calculate pixels remaining
      const maxSizePixel = (areaSnapshot.area.maxSize / 100) * allAreasSizePixel;
      return {
        areaSnapshot,
        pixelAbsorb: maxSizePixel,
        percentAfterAbsorption: areaSnapshot.area.maxSize,
        pixelRemain: areaSnapshot.sizePixelAtStart + pixels - maxSizePixel,
      };
    }
    return {
      areaSnapshot,
      pixelAbsorb: pixels,
      percentAfterAbsorption: tempPercentSize > 100 ? 100 : tempPercentSize,
      pixelRemain: 0,
    };
  }
  // REDUCE AREA
  else if (pixels < 0) {
    // If minSize & newSize smaller than it > absorb to min and return remaining pixels
    if (areaSnapshot.area.minSize !== null && tempPercentSize < areaSnapshot.area.minSize) {
      // Use area.area.minSize as newPercentSize and return calculate pixels remaining
      const minSizePixel = (areaSnapshot.area.minSize / 100) * allAreasSizePixel;
      return {
        areaSnapshot,
        pixelAbsorb: minSizePixel,
        percentAfterAbsorption: areaSnapshot.area.minSize,
        pixelRemain: areaSnapshot.sizePixelAtStart + pixels - minSizePixel,
      };
    }
    // If reduced under zero > return remaining pixels
    else if (tempPercentSize < 0) {
      // Use 0 as newPercentSize and return calculate pixels remaining
      return {
        areaSnapshot,
        pixelAbsorb: -areaSnapshot.sizePixelAtStart,
        percentAfterAbsorption: 0,
        pixelRemain: pixels + areaSnapshot.sizePixelAtStart,
      };
    }
    return {
      areaSnapshot,
      pixelAbsorb: pixels,
      percentAfterAbsorption: tempPercentSize,
      pixelRemain: 0,
    };
  }
}
function getAreaAbsorptionCapacityPixel(areaSnapshot, pixels, containerSizePixel) {
  const tempPixelSize = areaSnapshot.sizePixelAtStart + pixels;
  // ENLARGE AREA
  if (pixels > 0) {
    // If maxSize & newSize bigger than it > absorb to max and return remaining pixels
    if (areaSnapshot.area.maxSize !== null && tempPixelSize > areaSnapshot.area.maxSize) {
      return {
        areaSnapshot,
        pixelAbsorb: areaSnapshot.area.maxSize - areaSnapshot.sizePixelAtStart,
        percentAfterAbsorption: -1,
        pixelRemain: tempPixelSize - areaSnapshot.area.maxSize,
      };
    }
    return {
      areaSnapshot,
      pixelAbsorb: pixels,
      percentAfterAbsorption: -1,
      pixelRemain: 0,
    };
  }
  // REDUCE AREA
  else if (pixels < 0) {
    // If minSize & newSize smaller than it > absorb to min and return remaining pixels
    if (areaSnapshot.area.minSize !== null && tempPixelSize < areaSnapshot.area.minSize) {
      return {
        areaSnapshot,
        pixelAbsorb: areaSnapshot.area.minSize + pixels - tempPixelSize,
        percentAfterAbsorption: -1,
        pixelRemain: tempPixelSize - areaSnapshot.area.minSize,
      };
    }
    // If reduced under zero > return remaining pixels
    else if (tempPixelSize < 0) {
      return {
        areaSnapshot,
        pixelAbsorb: -areaSnapshot.sizePixelAtStart,
        percentAfterAbsorption: -1,
        pixelRemain: pixels + areaSnapshot.sizePixelAtStart,
      };
    }
    return {
      areaSnapshot,
      pixelAbsorb: pixels,
      percentAfterAbsorption: -1,
      pixelRemain: 0,
    };
  }
}
export function updateAreaSize(unit, item) {
  if (unit === 'percent') {
    item.areaSnapshot.area.size = item.percentAfterAbsorption;
  } else if (unit === 'pixel') {
    // Update size except for the wildcard size area
    if (item.areaSnapshot.area.size !== null) {
      item.areaSnapshot.area.size = item.areaSnapshot.sizePixelAtStart + item.pixelAbsorb;
    }
  }
}
//# sourceMappingURL=utils.js.map
