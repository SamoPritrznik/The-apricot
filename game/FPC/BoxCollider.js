import { vec3 } from '../../lib/gl-matrix-module.js';
import { GLTFLoader } from '../external/GLTFLoader.js';
import { Node } from '../../common/engine/Node.js';

export class BoxCollider {
    static cube = null;

    constructor (node, isTrigger = false, triggerFunc = null) {
        this.node = node;
        this.isTrigger = isTrigger;
        this.triggerFunc = triggerFunc;
        this.destroyed = false;
        //console.log(this.node);

        const scale = this.node.scale;

        //scale[0] = 
        
        /*this.node = new Node({
            translation: this.startPoint,
            scale: this.scalePoint,
            mesh: BoxCollider.cube.mesh
        });*/
        //console.log(BoxCollider.cube.clone);

        //console.log(this.node);
        this.node.aabb = [[-1,-1,-1], [1, 1, 1]];
    }

    destroy() {
        this.destroyed = true;
        this.node.destroyed = true;
        this.node = null;
    }

    static async init() {
        this.loader = new GLTFLoader();
        await this.loader.load('../common/models/cube.gltf');

        BoxCollider.cube = await this.loader.loadNode('Cube');

        
    }
    

}