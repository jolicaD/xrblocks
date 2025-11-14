import 'xrblocks/addons/simulator/SimulatorAddons.js';

import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-simd-compat@0.17.0';
import * as xb from 'xrblocks';

import {Drone} from './Drone.js';
import {gamepad} from './gamepad.js';


const options = new xb.Options();
options.depth = new xb.DepthOptions(xb.xrDepthMeshPhysicsOptions);
options.depth.depthMesh.updateFullResolutionGeometry = true;
options.xrButton = {
  ...options.xrButton,
  startText: '<i id="xrlogo"></i> LET THE FUN BEGIN',
  endText: '<i id="xrlogo"></i> MISSION COMPLETE'
};
options.physics.RAPIER = RAPIER;

document.addEventListener('DOMContentLoaded', async function() {
  const droneInstance = new Drone();
  const gamepadInstance = new gamepad();
  droneInstance.gamepadControls.connectGamepad(gamepadInstance);
  xb.add(droneInstance, gamepadInstance);

  await xb.init(options);
});
