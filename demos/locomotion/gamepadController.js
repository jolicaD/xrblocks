/**
 * @file gamepadController.js
 * @description Handles user movement logic based on events from the gamepad UI.
 * 
 * @todo: BUG FIX: Raycaster/Reticle Offset on Movement (Synchronization Issue)
 */

import * as THREE from 'three';
import * as xb from 'xrblocks';

// Import the UI component definition
import { gamepad } from './virtualGamepad.js';

const CONFIG = {
  MOVEMENT_SPEED: 1.5, // Meters per second
  ROTATION_SPEED: 0.8, // Radians per second
};

// Reusable vectors for movement calculations
const tempVector = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();

export class GamepadController extends xb.Script {
  // We declare the necessary dependencies for movement calculation
  static {
    this.dependencies = {
      user: xb.User,
      timer: THREE.Timer,
      camera: THREE.Camera,
    };
  }

  constructor() {
    super();
    this.movementState = {
      'LeftPad-up': false,
      'LeftPad-down': false,
      'LeftPad-left': false,
      'LeftPad-right': false,
    };
    this.gamepadUI = new gamepad({
      onButtonDown: this.onButtonDown.bind(this),
      onButtonUp: this.onButtonUp.bind(this),
    });
    this.add(this.gamepadUI);
  }

  // Injected dependencies become available here
  init({ user, timer, camera, ...args }) {
    super.init(args);
    this.user = user;
    this.timer = timer;
    this.camera = camera;

    //this.camera.add(this.gamepadUI);
    this.camera.add(this.gamepadUI);
  }

  // --- Event Handlers ---

  onButtonDown(key) {
    if (key in this.movementState) {
      this.movementState[key] = true;
      console.log(`Movement Key Down: ${key}`);
    }
  }

  onButtonUp(key) {
    if (key in this.movementState) {
      this.movementState[key] = false;
      console.log(`Movement Key Up: ${key}`);
    }
  }

  // --- Core Movement Logic ---

  update() {
    super.update();

    if (!this.user || !this.timer) return;

    const deltaTime = this.timer.getDelta();
    const distance = CONFIG.MOVEMENT_SPEED * deltaTime;
    const rotation = CONFIG.ROTATION_SPEED * deltaTime;

    // Get the user's root object (where position/rotation is applied)
    const userGroup = this.user.parent;
    if (!userGroup) return;

    // --- Translation (Forward/Backward) ---
    if (this.movementState['LeftPad-up'] || this.movementState['LeftPad-down']) {
      // Use camera quaternion for user-relative direction
      tempQuaternion.copy(this.camera.quaternion);
      
      // Determine forward/backward direction
      tempVector.set(0, 0, this.movementState['LeftPad-up'] ? -1 : 1);
      
      // Flatten movement to the horizontal plane
      tempVector.y = 0;
      tempVector.normalize();

      tempVector.applyQuaternion(tempQuaternion);

      // Apply movement
      userGroup.position.addScaledVector(tempVector, distance);
    }
    
    // --- Yaw movement ---
    if (this.movementState['LeftPad-left'] || this.movementState['LeftPad-right']) {
      const angle = this.movementState['LeftPad-left'] ? rotation : -rotation;
      userGroup.rotateY(angle);
    }

    userGroup.updateMatrixWorld(true);
  }
  
}