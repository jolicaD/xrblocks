import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import * as xb from 'xrblocks';

import {DroneGamepadHandler} from './DroneGamepadHandler.js';

const DRONE_FBX_FILE = 'DroneModel/Drone.fbx';

export class Drone extends xb.Script {
  rigidBody = null;
  gamepadControls = new DroneGamepadHandler();

  constructor(moveSpeed = 1.0, rotationSpeed = 0.08) {
    super();
    this.add(this.gamepadControls);
    this.moveSpeed = moveSpeed;
    this.rotationSpeed = rotationSpeed;
    }

  async init(core) {
    this.add(new THREE.HemisphereLight(0xffffff, 0x666666, /*intensity=*/ 3));
    await this.loadDroneModel();
    this.resetDrone();
  }

  onXRSessionStarted() {
    this.resetDrone();
  }

  onSimulatorStarted() {
    this.resetDrone();
  }

  loadDroneModel() {
    return new Promise(
        (resolve) => new FBXLoader().load(DRONE_FBX_FILE, (object) => {
          object.scale.set(0.01, 0.01, 0.01);
          console.log('loaded drone model');
          this.add(object);
          resolve();
        }));
  }

  initPhysics(physics) {
    const RAPIER = physics.RAPIER;
    const blendedWorld = physics.blendedWorld;
    const rigidBodyDesc =
        RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(this.position.x, this.position.y, this.position.z)
            .setRotation(this.quaternion)
            .setAdditionalMass(0.5)
            .setGravityScale(0.0);
    this.rigidBody = blendedWorld.createRigidBody(rigidBodyDesc);
  }

  setPosition(position) {
    this.rigidBody?.setTranslation(position, true);
    this.position.copy(position);
  }

  setRotation(rotation) {
    this.rigidBody?.setRotation(rotation, true);
    this.setRotationFromQuaternion(rotation);
  }

  update() {
    this.updateRigidBody();
  }

  updateRigidBody() {
    const rigidBody = this.rigidBody;
    if (!this.rigidBody) {
      return;
    }

    rigidBody.resetForces(true);
    rigidBody.resetTorques(true);

    const controllerForce = new THREE.Vector3(
        this.gamepadControls.getDroneRightForce(),
        this.gamepadControls.getDroneUpForce(),
        this.gamepadControls.getDroneForwardForce(),
    );
    const rotation = new THREE.Quaternion().copy(rigidBody.rotation());

    const leftControllerAxes = xb.core.input.leftController?.gamepad?.axes;
    const rightControllerAxes = xb.core.input.rightController?.gamepad?.axes;

    if (leftControllerAxes && leftControllerAxes.length >= 4) {
      controllerForce.x += this.moveSpeed * leftControllerAxes[2];
      controllerForce.z += this.moveSpeed * leftControllerAxes[3];
    }
    if (rightControllerAxes && rightControllerAxes.length >= 4) {
      rotation.premultiply(new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          -this.rotationSpeed * rightControllerAxes[2]));
      controllerForce.y -= this.moveSpeed * rightControllerAxes[3];
    }

    // Add keyboard controls.

    // Clamp the controller force to moveSpeed.
    controllerForce.clampLength(0, this.moveSpeed);

    // Rotate the controller force.
    controllerForce.applyQuaternion(rotation);

    // Compute a drag force.
    const linearVelocity = rigidBody.linvel();
    const constantForce = new THREE.Vector3()
                              .copy(linearVelocity)
                              .multiplyScalar(-1)
                              .add(controllerForce);

    rigidBody.addForce(constantForce, true);
    rigidBody.setRotation(rotation);

    this.position.copy(rigidBody.translation());
    this.setRotationFromQuaternion(rigidBody.rotation());
  }

  // Put the drone in front of the camera.
  resetDrone() {
    console.log('Resetting drone');
    const camera = xb.core.camera;
    camera.updateMatrixWorld();
    this.position.set(0, 0, -1).applyMatrix4(camera.matrixWorld);
    this.setPosition(this.position);
    xb.extractYaw(
        this.quaternion.setFromRotationMatrix(camera.matrixWorld),
        this.quaternion);
    this.setRotation(this.quaternion);
  }
}
