import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

// 1. INTERFACES
interface Point {
  x: number;
  y: number;
}

interface Destination {
  id: string;
  name: string;
  position: Point;
  videoUrl: string;
  display: string;
}

interface RoadSegment {
  id: string;
  orientation: 'horizontal' | 'vertical';
  fixedCoordinate: number;
  start: number;
  end: number;
}

type WalkingDirection = 'left' | 'right' | 'up' | 'down' | null;

const STAND = 'assets/images/v21-event/mascot.png';
const WALK_LEFT_1 = 'assets/images/v21-event/mascot-left-1.png';
const WALK_LEFT_2 = 'assets/images/v21-event/mascot-left-2.png';
const WALK_RIGHT_1 = 'assets/images/v21-event/mascot-right-1.png';
const WALK_RIGHT_2 = 'assets/images/v21-event/mascot-right-2.png';
const WALK_UP_1 = 'assets/images/v21-event/mascot-up-1.png';
const WALK_UP_2 = 'assets/images/v21-event/mascot-up-2.png';
const WALK_DOWN_1 = 'assets/images/v21-event/mascot-down-1.png';
const WALK_DOWN_2 = 'assets/images/v21-event/mascot-down-2.png';

// Define all unique coordinates as constants for readability and maintanence.
const START_X = 0.45;
const LEFT_X = 0.19;
const RIGHT_X = 0.85;
const PALM_TREE_X = LEFT_X;
const RED_DOOR_X = LEFT_X; // Aligned with Palm Tree for a straight vertical path
const VOLCANO_X = RIGHT_X;
const CASTLE_X = RIGHT_X;

const BOTTOM_Y = 0.6;
const TOP_Y = 0.2;
const RED_DOOR_Y = TOP_Y;
const VOLCANO_Y = TOP_Y;
const PALM_TREE_Y = BOTTOM_Y;
const START_Y = BOTTOM_Y;
const CASTLE_Y = 0.7;

// 2. GAME DATA CONSTANTS
const STARTING_POINT: Point = {x: START_X, y: START_Y};

const DESTINATIONS: Destination[] = [
  {
    id: 'd1',
    name: 'Palm Tree',
    position: {x: PALM_TREE_X, y: PALM_TREE_Y},
    videoUrl: 'https://www.youtube.com/embed/FteCOhQb4Ow',
    display: "What's new in Angular AI",
  },
  {
    id: 'd2',
    name: 'Red Door',
    position: {x: RED_DOOR_X, y: RED_DOOR_Y},
    videoUrl: 'https://www.youtube.com/embed/Cegc5JtWbrI',
    display: 'Meet Angular Aria',
  },
  {
    id: 'd3',
    name: 'Volcano',
    position: {x: VOLCANO_X, y: VOLCANO_Y},
    videoUrl: 'https://www.youtube.com/embed/7v8mIW9_NXw',
    display: 'Introducing Signal Forms',
  },
  {
    id: 'd4',
    name: 'Castle',
    position: {x: CASTLE_X, y: CASTLE_Y},
    videoUrl: 'https://www.youtube.com/embed/wiWUpCsJ9Os',
    display: "Say hello to Angular's new Mascot!",
  },
];

const ALL_ROAD_SEGMENTS: RoadSegment[] = [
  // Road 1 (Dest 1 <-> Start)
  {
    id: 'r1',
    orientation: 'horizontal',
    fixedCoordinate: PALM_TREE_Y,
    start: PALM_TREE_X,
    end: START_X,
  },
  // Road 2 (Palm Tree <-> Red Door)
  {
    id: 'r2',
    orientation: 'vertical',
    fixedCoordinate: PALM_TREE_X,
    start: RED_DOOR_Y,
    end: PALM_TREE_Y,
  },
  // Road 3 (Dest 2 <-> Dest 3)
  {
    id: 'r3',
    orientation: 'horizontal',
    fixedCoordinate: RED_DOOR_Y,
    start: RED_DOOR_X,
    end: VOLCANO_X,
  },
  // Road 4 (Dest 3 <-> Dest 4)
  {id: 'r4', orientation: 'vertical', fixedCoordinate: VOLCANO_X, start: VOLCANO_Y, end: CASTLE_Y},
];

// 3. GAME MECHANICS CONSTANTS
const MOVE_STEP = 0.0025;
const ANIMATION_SPEED = 28; // Higher is slower. Update image every 10 frames.
// How far off a road's axis the character can be
const MOVE_TOLERANCE = 0.002;
// How close to a destination to "arrive" (must be very small)
const DESTINATION_TOLERANCE = 0.005;

@Component({
  selector: 'app-root',
  template: `
    <div
      class="game-container"
      [style.background-image]="'url(assets/images/v21-event/world-map.png)'"
    >
      <!-- Keys -->
      <div class="keys-container">
        @for (key of keysToShow(); track key) {
          <img
            src="assets/images/v21-event/key.png"
            class="key-icon"
            animate.enter="key-enter-animation"
          />
        }
        @if (showMascot()) {
          <img
            src="assets/images/v21-event/mascot.png"
            class="mascot-icon"
            animate.enter="key-enter-animation"
          />
        }
      </div>

      <!-- Character -->
      @if (!isDialogOpen()) {
        <div
          class="character"
          [style.left.%]="characterXPercent()"
          [style.top.%]="characterYPercent()"
          [style.background-image]="'url(' + characterImageUrl() + ')'"
        ></div>
      }

      <!-- Destinations -->
      @for (dest of destinations(); track dest.id) {
        <div
          class="destination-hotspot"
          [style.left.%]="dest.position.x * 100"
          [style.top.%]="dest.position.y * 100"
          [class.glowing]="activeDestination()?.id === dest.id"
        ></div>
      }

      <!-- D-Pad Controls -->
      <div class="d-pad">
        <button
          class="d-pad-button up"
          (mousedown)="handleButtonPress('ArrowUp')"
          (mouseup)="handleButtonRelease('ArrowUp')"
          (mouseleave)="handleButtonRelease('ArrowUp')"
          (touchstart)="handleButtonPress('ArrowUp')"
          (touchend)="handleButtonRelease('ArrowUp')"
        >
          &#x25B2;
        </button>
        <button
          class="d-pad-button left"
          (mousedown)="handleButtonPress('ArrowLeft')"
          (mouseup)="handleButtonRelease('ArrowLeft')"
          (mouseleave)="handleButtonRelease('ArrowLeft')"
          (touchstart)="handleButtonPress('ArrowLeft')"
          (touchend)="handleButtonRelease('ArrowLeft')"
        >
          &#x25C0;
        </button>
        <button
          class="d-pad-button right"
          (mousedown)="handleButtonPress('ArrowRight')"
          (mouseup)="handleButtonRelease('ArrowRight')"
          (mouseleave)="handleButtonRelease('ArrowRight')"
          (touchstart)="handleButtonPress('ArrowRight')"
          (touchend)="handleButtonRelease('ArrowRight')"
        >
          &#x25B6;
        </button>
        <button
          class="d-pad-button down"
          (mousedown)="handleButtonPress('ArrowDown')"
          (mouseup)="handleButtonRelease('ArrowDown')"
          (mouseleave)="handleButtonRelease('ArrowDown')"
          (touchstart)="handleButtonPress('ArrowDown')"
          (touchend)="handleButtonRelease('ArrowDown')"
        >
          &#x25BC;
        </button>
      </div>

      <!-- Info Sign -->
      @if (!isDialogOpen()) {
        <img [src]="infoSignImageUrl()" alt="Info Sign" class="info-sign" />
      }

      <!-- Dialog Box -->
      @if (isDialogOpen()) {
        <div class="dialog-overlay" (click)="closeDialog()">
          <div class="dialog-content" (click)="$event.stopPropagation()">
            <button class="close-icon" (click)="closeDialog()">&times;</button>
            <h2>{{ activeDestination()?.display }}</h2>
            @if (safeVideoUrl(); as url) {
              <iframe
                credentialless
                [src]="url"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
                allowfullscreen
              ></iframe>
            }
            <button class="close-button" (click)="closeDialog()">Close</button>
          </div>
        </div>
      }
      <!-- Explore Button -->
      @if (activeDestination() && (activeDestination()?.id !== 'd4' || allKeysCollected())) {
        <button class="explore-button" (click)="isDialogOpen.set(true)">Enter</button>
      }
    </div>
  `,
  styles: [
    `
      .keys-container {
        position: absolute;
        top: 1cqw;
        left: 1cqw;
        display: flex;
        z-index: 20;
      }

      .key-icon {
        width: 4cqw;
        height: 5cqw;
      }

      .mascot-icon {
        width: 4cqw;
        height: 5cqw;
        margin-left: 1cqw;
      }

      .key-enter-animation {
        animation: growIn 0.5s ease-in-out;
      }

      @keyframes growIn {
        from {
          transform: scale(0.1);
        }
        to {
          transform: scale(1);
        }
      }

      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .game-container {
        width: 100%;
        aspect-ratio: 16 / 9;
        position: relative;
        overflow: hidden;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-color: #3a3a3a; /* Fallback color */
        container-type: inline-size;
        container-name: game-container;
      }

      .character {
        z-index: 10;
        position: absolute;
        width: 9cqw;
        height: 9cqw;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transform: translate(-50%, -60%);
      }

      .destination-hotspot {
        position: absolute;
        width: 4cqw;
        height: 4cqw;
        border-radius: 50%;
        transform: translate(-50%, -10%);
        transition: all 0.3s ease;
      }

      .destination-hotspot.glowing {
        background-color: rgba(255, 0, 242, 0.5);
        box-shadow: 0 0 5px 15px rgba(255, 0, 242, 0.7);
      }

      .d-pad {
        position: absolute;
        bottom: 2cqw;
        left: 2cqw;
        width: 12cqw;
        height: 12cqw;
        display: grid;
        grid-template-areas:
          '. up .'
          'left . right'
          '. down .';
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.5cqw;
        z-index: 20;
      }

      .d-pad-button {
        background-color: rgba(0, 0, 0, 0.5);
        border: none;
        border-radius: 0.5cqw;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
        touch-action: manipulation; /* Prevent double tap zoom */
        color: white;
        font-size: 2.5cqw;
        font-weight: bold;
      }

      .d-pad-button:hover,
      .d-pad-button:active {
        background-color: rgba(0, 0, 0, 0.8);
      }

      .d-pad-button.up {
        grid-area: up;
      }
      .d-pad-button.down {
        grid-area: down;
      }
      .d-pad-button.left {
        grid-area: left;
      }
      .d-pad-button.right {
        grid-area: right;
      }

      .info-sign {
        position: absolute;
        top: 69%;
        left: 50%;
        transform: translate(-50%, 0%);
        width: 50cqw;
        height: 18cqw;
        object-fit: contain; /* Ensures the image fits within the bounds */
      }

      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 1000;
      }

      .dialog-content {
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -80%);
        background: white;
        border-radius: 5px;
        color: black;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        width: 60%;
        height: 76%;
        padding: 1rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .dialog-content h2 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-family: 'Jersey 10', sans-serif;
      }

      .dialog-content iframe {
        width: 100%;
        flex-grow: 1;
        border: none;
        border-radius: 8px;
      }

      .close-button {
        margin-top: 1rem;
        padding: 10px 20px;
        border: none;
        background-color: #5c44e4;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s ease;
      }

      .close-button:hover {
        background-color: #8514f5;
      }

      .close-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        background: transparent;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #888;
        padding: 5px;
        line-height: 1;
      }

      .close-icon:hover {
        color: #000;
      }

      .explore-button {
        position: absolute;
        bottom: 2cqw;
        right: 2cqw;
        padding: 1.5cqw 3cqw;
        background-color: #e90464;
        color: white;
        border: 2px solid white; /* White border */
        border-radius: 1cqw;
        font-size: 2cqw;
        font-weight: bold;
        cursor: pointer;
        transition:
          background-color 0.2s,
          opacity 0.3s ease-in-out,
          visibility 0.3s ease-in-out;
        z-index: 20;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      }

      .explore-button:hover {
        background-color: #c20354;
      }

      /* When activeDestination() is true, the button is in the DOM */
      @if (activeDestination()) {
        .explore-button {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeydown($event)',
    '(window:keyup)': 'handleKeyup($event)',
  },
})
export class App {
  characterPosition = signal<Point>(STARTING_POINT);
  isDialogOpen = signal<boolean>(false);
  visitedKeyDestinations = signal<Set<string>>(new Set());
  keysToShow = computed(() => Array.from(this.visitedKeyDestinations()));
  allKeysCollected = computed(() => this.keysToShow().length === 3);
  showMascot = signal(false);
  destinations = signal<Destination[]>(DESTINATIONS);
  walkingDirection = signal<WalkingDirection>(null);
  walkFrame = signal(0);
  characterImageUrl = computed(() => {
    if (this.activeDestination()) {
      return STAND;
    }

    const direction = this.walkingDirection();
    const frame = this.walkFrame();
    const animationFrame = Math.floor(frame / ANIMATION_SPEED) % 2;
    switch (direction) {
      case 'left':
        return animationFrame === 0 ? WALK_LEFT_1 : WALK_LEFT_2;
      case 'right':
        return animationFrame === 0 ? WALK_RIGHT_1 : WALK_RIGHT_2;
      case 'up':
        return animationFrame === 0 ? WALK_UP_1 : WALK_UP_2;
      case 'down':
        return animationFrame === 0 ? WALK_DOWN_1 : WALK_DOWN_2;
      default:
        return STAND;
    }
  });
  safeVideoUrl = signal<SafeResourceUrl | null>(null);
  pressedKeys = signal<Set<string>>(new Set());

  infoSignImageUrl = computed(() => {
    const activeDest = this.activeDestination();
    if (this.allKeysCollected() && this.showMascot()) {
      return 'assets/images/v21-event/congrats-sign.png';
    } else if (!activeDest) {
      return 'assets/images/v21-event/welcome-sign.png';
    } else if (activeDest.name === 'Castle') {
      return this.allKeysCollected()
        ? 'assets/images/v21-event/castle-sign.png'
        : 'assets/images/v21-event/entry-denied-sign.png';
    } else {
      return 'assets/images/v21-event/enter-sign.png';
    }
  });

  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      const destination = this.activeDestination();
      if (destination?.videoUrl) {
        this.safeVideoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(destination.videoUrl));
      } else {
        this.safeVideoUrl.set(null);
      }
    });

    this.gameLoop();
  }

  gameLoop() {
    const keys = this.pressedKeys();
    if (!this.isDialogOpen()) {
      const currentPos = this.characterPosition();
      let newPos = {...currentPos};
      let moveDirection: 'horizontal' | 'vertical' | null = null;

      if (keys.has('ArrowUp')) {
        newPos.y -= MOVE_STEP;
        moveDirection = 'vertical';
        this.walkingDirection.set('up');
      } else if (keys.has('ArrowDown')) {
        newPos.y += MOVE_STEP;
        moveDirection = 'vertical';
        this.walkingDirection.set('down');
      } else if (keys.has('ArrowLeft')) {
        newPos.x -= MOVE_STEP;
        moveDirection = 'horizontal';
        this.walkingDirection.set('left');
      } else if (keys.has('ArrowRight')) {
        newPos.x += MOVE_STEP;
        moveDirection = 'horizontal';
        this.walkingDirection.set('right');
      } else {
        this.walkingDirection.set(null);
      }

      if (moveDirection && this.isMoveAllowed(currentPos, newPos, moveDirection)) {
        this.characterPosition.set(newPos);
        this.walkFrame.update((frame) => frame + 1);
      }
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  // 5. COMPUTED SIGNALS (DERIVED STATE)
  characterXPercent = computed(() => this.characterPosition().x * 100);
  characterYPercent = computed(() => this.characterPosition().y * 100);

  activeDestination = computed<Destination | null>(() => {
    const pos = this.characterPosition();
    for (const dest of this.destinations()) {
      const distance = Math.sqrt(
        Math.pow(pos.x - dest.position.x, 2) + Math.pow(pos.y - dest.position.y, 2),
      );
      if (distance < DESTINATION_TOLERANCE) {
        return dest;
      }
    }
    return null;
  });

  // 6. EVENT HANDLERS & METHODS
  handleKeydown(event: KeyboardEvent) {
    if (this.isDialogOpen() && event.key !== 'Escape') {
      return;
    }

    this.preventArrowDefault(event);
    this.pressedKeys.update((keys) => keys.add(event.key));

    if (
      event.key === 'Enter' &&
      this.activeDestination() &&
      (this.activeDestination()?.id !== 'd4' || this.allKeysCollected())
    ) {
      this.isDialogOpen.set(true);
    }
    if (event.key === 'Escape' && this.isDialogOpen()) {
      this.closeDialog();
    }
  }

  handleKeyup(event: KeyboardEvent) {
    this.preventArrowDefault(event);
    this.pressedKeys.update((keys) => {
      keys.delete(event.key);
      return keys;
    });
  }

  preventArrowDefault(event: KeyboardEvent) {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrowKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  handleButtonPress(key: string) {
    this.pressedKeys.update((keys) => keys.add(key));
  }

  handleButtonRelease(key: string) {
    this.pressedKeys.update((keys) => {
      keys.delete(key);
      return keys;
    });
  }

  closeDialog(): void {
    const activeDest = this.activeDestination();
    if (activeDest && ['d1', 'd2', 'd3'].includes(activeDest.id)) {
      this.visitedKeyDestinations.update((visited) => {
        if (!visited.has(activeDest.id)) {
          visited.add(activeDest.id);
          return new Set(visited); // Return new Set to trigger update
        }
        return visited;
      });
    }

    if (activeDest?.id === 'd4' && this.allKeysCollected()) {
      this.showMascot.set(true);
    }

    this.isDialogOpen.set(false);
  }

  private isMoveAllowed(
    currentPos: Point,
    newPos: Point,
    direction: 'horizontal' | 'vertical',
  ): boolean {
    // Find the road the character is currently on by checking the axis perpendicular to movement.
    let currentRoad: RoadSegment | null = null;
    let minDistance = Infinity;

    for (const road of ALL_ROAD_SEGMENTS) {
      if (direction === 'horizontal' && road.orientation === 'horizontal') {
        const distance = Math.abs(currentPos.y - road.fixedCoordinate);
        if (distance < minDistance) {
          minDistance = distance;
          currentRoad = road;
        }
      } else if (direction === 'vertical' && road.orientation === 'vertical') {
        const distance = Math.abs(currentPos.x - road.fixedCoordinate);
        if (distance < minDistance) {
          minDistance = distance;
          currentRoad = road;
        }
      }
    }

    // If no road is close enough, movement is not allowed.
    if (!currentRoad || minDistance > MOVE_TOLERANCE) {
      return false;
    }

    // Check if the new position is within the bounds of the identified road.
    if (currentRoad.orientation === 'horizontal') {
      return (
        newPos.x >= Math.min(currentRoad.start, currentRoad.end) - MOVE_TOLERANCE &&
        newPos.x <= Math.max(currentRoad.start, currentRoad.end) + MOVE_TOLERANCE
      );
    } else {
      // Vertical
      return (
        newPos.y >= Math.min(currentRoad.start, currentRoad.end) - MOVE_TOLERANCE &&
        newPos.y <= Math.max(currentRoad.start, currentRoad.end) + MOVE_TOLERANCE
      );
    }
  }
}
