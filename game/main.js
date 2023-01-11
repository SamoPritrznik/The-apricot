import { GUI } from '../../lib/dat.gui.module.js';
import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

import { Application } from '../common/engine/Application.js';
import { Node } from '../../common/engine/Node.js';

import { GLTFLoader } from './external/GLTFLoader.js';

import { Renderer } from './FPC/Renderer.js';
import { FirstPersonController } from './FPC/FirstPersonController.js';

import { BoxCollider } from './FPC/BoxCollider.js';

import { shaders } from './external/shaders.js';
import { PerspectiveCamera } from './external/PerspectiveCamera.js';

import { CollisionManager } from './FPC/CollisionManager.js';

class App extends Application {

    async start() {
        const gl = this.gl;

        await BoxCollider.init();

        this.loader = new GLTFLoader();
        await this.loader.load('../../../common/models/map.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        //this.camera = await this.loader.loadNode('Camera');

        this.camera = new Node({ camera: new PerspectiveCamera() });
       

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }

        //collisions
        this.collisionManager = new CollisionManager(this.camera);
        this.collisionManager.addCollidersToScene(this.scene);
        
        this.renderer = new Renderer(this.gl);
        this.renderer.person = this.camera;
        this.renderer.prepareScene(this.scene);

        this.controller = new FirstPersonController(this.camera, this.gl.canvas);

    }

    update(time, dt) {
        this.controller.update(dt);
        this.collisionManager.update(dt);

        let lol = document.getElementById("background");
        lol.play();
        lol.volume = 0.2;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        this.camera.camera.aspect = width / height;
        this.camera.camera.updateProjectionMatrix();
    }

}

const canvas = document.querySelector('canvas');
const app = new App(canvas);
await app.init();

document.querySelector('.loader-container').remove();