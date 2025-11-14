import * as xb from 'xrblocks';

const GAMEPAD_KEY_MAP = {
  'LeftPad-up': 'DRONE_FORWARD',
  'LeftPad-down': 'DRONE_BACKWARD',
  'LeftPad-right': 'DRONE_RIGHT',
  'LeftPad-left': 'DRONE_LEFT',
  
  'Button-A': 'DRONE_UP',      
  'Button-B': 'DRONE_UP',
  'Button-X': 'DRONE_DOWN',      
  'Button-Y': 'DRONE_DOWN',
};

export class DroneGamepadHandler extends xb.Script {
  _onKeyDown = this.onKeyDown.bind(this);
  _onKeyUp = this.onKeyUp.bind(this);
  downKeys = new Set();
  gamepadActiveKeys = new Set();

  init(core) {
    super.init(core);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  // --- Physical Keyboard Handlers ---
  onKeyDown(event) {
    this.downKeys.add(event.code);
  }

  onKeyUp(event) {
    this.downKeys.delete(event.code);
  }

  // --- Virtual Gamepad Handler ---
  connectGamepad(gamepadInstance) {
      gamepadInstance.onButtonDown = (key) => {
          const mappedKey = GAMEPAD_KEY_MAP[key];
          if (mappedKey) {
              // Add the key to keep movement active queue
              this.gamepadActiveKeys.add(mappedKey);
              console.log(`${mappedKey} Pressed`);
          }
      };
      
      gamepadInstance.onButtonUp = (key) => {
          const mappedKey = GAMEPAD_KEY_MAP[key];
          if (mappedKey) {
              // Delete the key to stop movement
              this.gamepadActiveKeys.delete(mappedKey);
              console.log(`${mappedKey} Released`);
          }
      };
  }

  getDroneForwardForce() {
    // Keyboard forces: UP (backward: -1) - DOWN (forward: +1)
    const kbForce = this.downKeys.has(xb.Keycodes.DOWN) -
        this.downKeys.has(xb.Keycodes.UP);
    
    // Gamepad forces: DRONE_FORWARD (+1) - DRONE_BACKWARD (-1)
    const gpForce = this.gamepadActiveKeys.has('DRONE_BACKWARD') -
        this.gamepadActiveKeys.has('DRONE_FORWARD');

    return kbForce + gpForce;
  }

  getDroneRightForce() {
    // Keyboard forces: RIGHT (+1) - LEFT (-1)
     const kbForce = this.downKeys.has(xb.Keycodes.RIGHT) -
        this.downKeys.has(xb.Keycodes.LEFT);
    
    // Gamepad forces: DRONE_RIGHT (+1) - DRONE_LEFT (-1)
    const gpForce = this.gamepadActiveKeys.has('DRONE_RIGHT') -
        this.gamepadActiveKeys.has('DRONE_LEFT');

    return kbForce + gpForce;
  }

  getDroneUpForce() {
    // Keyboard forces: PAGE_UP (+1) - PAGE_DOWN (-1)
    const kbForce = this.downKeys.has(xb.Keycodes.PAGE_UP) -
        this.downKeys.has(xb.Keycodes.PAGE_DOWN);
    
    // Gamepad forces: DRONE_UP (+1) - DRONE_DOWN (-1)
    const gpForce = this.gamepadActiveKeys.has('DRONE_UP') -
        this.gamepadActiveKeys.has('DRONE_DOWN');

    return kbForce + gpForce;
  }
}