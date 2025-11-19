import * as xb from 'xrblocks';

import { gamepad } from './virtualGamepad.js'
import { GamepadController } from './gamepadController.js';

const options = new xb.Options();
options.reticles.enabled = true;
options.visualizeRays = true;

function start() {
  xb.add(new GamepadController());
  xb.init(options);
}

document.addEventListener('DOMContentLoaded', function() {
  start();
});
