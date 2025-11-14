/**
 * @file virtualGamepad.js
 * @description This script defines a virtual gamepad component for XR
 * environments using the XR Blocks SDK. It creates a responsive gamepad UI with
 * directional pads and action buttons.
 */


import * as THREE from 'three';
import * as xb from 'xrblocks';



// Centralized configuration
const CONFIG = {
  // Panel size
  WIDTH: 0.9,
  HEIGHT: 0.25,
  // Button size is relative to panel dimensions
  BUTTON_SCALE: 0.23,
  // Styling for all buttons
  BUTTON_STYLE: {
    fontColor: '#eeeeee',
    backgroundColor: '#262626',
    defaultOpacity: 0.8,
    hoverOpacity: 1.0,
    selectedOpacity: 1.0,
    radius: 0.45,                 // Rounded corners
    sizeNorm: 0.15 / (0.25 / 2),  // Base size calculation
  },
  // Directional pad icons (Material Icons)
  DPAD_ICONS: {
    up: 'arrow_upward',
    down: 'arrow_downward',
    left: 'arrow_back',
    right: 'arrow_forward',
  },
};


function getClusterLayout(isDpad) {
  const {WIDTH, HEIGHT, BUTTON_SCALE, BUTTON_STYLE} = CONFIG;

  // Normalized positions (relative to panel center)
  const SIDE_OFFSET =
      WIDTH / 2.3;  // Distance from panel center to cluster center
  const HORIZ_SPACING = (WIDTH / 3.1) * BUTTON_SCALE;
  const VERT_SPACING = (HEIGHT + 0.9) * BUTTON_SCALE;

  return {
    centerX: isDpad ? -SIDE_OFFSET : SIDE_OFFSET,
    centerY: 0,
    hOffset: HORIZ_SPACING,
    vOffset: VERT_SPACING,
    size: BUTTON_STYLE.sizeNorm * BUTTON_SCALE,
  };
}


export class gamepad extends xb.SpatialPanel {
  constructor() {
    super({
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT,
      backgroundColor: '#e2c9c9ee',
      draggable: true,
      showHighlights: true,
      dragFacingCamera: true,
      useDefaultPosition: true,
    });

    this.onButtonDown = () => {};
    this.onButtonUp = () => {};

    this.buttonContainer = new xb.View();
    this.buttonContainer.x = 0;
    this.buttonContainer.y = 0;
    this.add(this.buttonContainer);

    this.createGamepadLayout();

    this.updateLayouts();
  }


  // -------------------------------------------------------------------------
  // CORE LAYOUT METHODS
  // -------------------------------------------------------------------------

  createGamepadLayout() {
    this.#createDPadCluster();
    this.#createActionCluster();
  }


  // -------------------------------------------------------------------------
  // COMPONENTS LAYOUT METHODS
  // -------------------------------------------------------------------------

  #createDPadCluster() {
    const layout = getClusterLayout(true);

    const positions = {
      'up': {
        x: layout.centerX,
        y: layout.centerY + layout.vOffset,
        text: CONFIG.DPAD_ICONS.up
      },
      'down': {
        x: layout.centerX,
        y: layout.centerY - layout.vOffset,
        text: CONFIG.DPAD_ICONS.down
      },
      'left': {
        x: layout.centerX - layout.hOffset,
        y: layout.centerY,
        text: CONFIG.DPAD_ICONS.left
      },
      'right': {
        x: layout.centerX + layout.hOffset,
        y: layout.centerY,
        text: CONFIG.DPAD_ICONS.right
      },
    };

    for (const [key, pos] of Object.entries(positions)) {
      this.#createButton(xb.IconButton, {
        x: pos.x,
        y: pos.y,
        size: layout.size,
        text: pos.text,
        key: `LeftPad-${key}`,
        fontSize: 0.35,  // Larger font for D-pad icons
      });
    }
  }


  #createActionCluster() {
    const layout = getClusterLayout(false);

    const positions = {
      'A': {x: layout.centerX, y: layout.centerY + layout.vOffset, text: 'A'},
      'Y': {x: layout.centerX, y: layout.centerY - layout.vOffset, text: 'Y'},
      'X': {x: layout.centerX - layout.hOffset, y: layout.centerY, text: 'X'},
      'B': {x: layout.centerX + layout.hOffset, y: layout.centerY, text: 'B'},
    };


    for (const [key, pos] of Object.entries(positions)) {
      this.#createButton(xb.TextButton, {
        x: pos.x,
        y: pos.y,
        size: layout.size,
        text: pos.text,
        key: `Button-${key}`,
        fontSize: 0.35,  // Smaller font for action letters
      });
    }
  }


  #createButton(ButtonClass, options = {}) {
    const {BUTTON_STYLE} = CONFIG;


    const button = new ButtonClass({
      text: options.text,
      fontSize: options.fontSize,
      fontColor: BUTTON_STYLE.fontColor,
      backgroundColor: BUTTON_STYLE.backgroundColor,
      transparent: false,
      opacity: BUTTON_STYLE.defaultOpacity,
      defaultOpacity: BUTTON_STYLE.defaultOpacity,
      hoverOpacity: BUTTON_STYLE.hoverOpacity,
      selectedOpacity: BUTTON_STYLE.selectedOpacity,
      uRadius: {value: BUTTON_STYLE.radius},
      radius: BUTTON_STYLE.radius,
      width: options.size,
      height: options.size,
    });

    button.x = options.x;
    button.y = options.y;
    button.position.set(options.x, options.y, 0);
    this.buttonContainer.add(button);

    // Bind interaction handlers
    button.onObjectSelectStart = () => this.onButtonDown(options.key);
    button.onObjectSelectEnd = () => this.onButtonUp(options.key);
  }


  init(...args) {
    super.init(...args);

    this.gamepadPanel.position.set(0, 1.2, -2.0);

    // Log the available UI views for debugging or information
    console.log('VirtualGamepad Initialized. UI Views: ', xb.core.ui.views);
  }
};
