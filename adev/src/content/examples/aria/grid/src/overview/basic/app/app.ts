import {Component} from '@angular/core';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';

interface Cell {
  rowSpan: number;
  colSpan: number;
  emoji: string;
  explode: boolean;
}

const bomb = '💣';
const emojis = ['🥳', '🤩', '🎉', '🚀', '🔥', '💯', '🦄', '🤯', '💖', '✨', bomb];

function randomSpan(): number {
  const spanChanceTable = [...Array(10).fill(1), ...Array(4).fill(2), ...Array(1).fill(3)];
  const randomIndex = Math.floor(Math.random() * spanChanceTable.length);
  return spanChanceTable[randomIndex];
}

function generateValidGrid(rowCount: number, colCount: number): Cell[][] {
  const grid: Cell[][] = [];
  const visitedCoords = new Set<string>();
  for (let r = 0; r < rowCount; r++) {
    const row = [];
    for (let c = 0; c < colCount; c++) {
      if (visitedCoords.has(`${r},${c}`)) {
        continue;
      }

      const rowSpan = Math.min(randomSpan(), rowCount - r);
      const maxColSpan = Math.min(randomSpan(), colCount - c);
      let colSpan = 1;
      while (colSpan < maxColSpan) {
        if (visitedCoords.has(`${r},${c + colSpan}`)) break;
        colSpan += 1;
      }

      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      row.push({
        rowSpan,
        colSpan,
        emoji,
        explode: emoji === bomb,
      });

      for (let rs = 0; rs < rowSpan; rs++) {
        for (let cs = 0; cs < colSpan; cs++) {
          visitedCoords.add(`${r + rs},${c + cs}`);
        }
      }
    }
    grid.push(row);
  }
  return grid;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Grid, GridRow, GridCell, GridCellWidget],
})
export class App {
  readonly gridData: Cell[][] = generateValidGrid(6, 6);
}
