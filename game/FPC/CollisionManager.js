import { BoxCollider } from "./BoxCollider.js";
import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

export class CollisionManager {
    constructor(player) {
        this.colliders = [];
        this.player = player;
        this.endGame = 0;
        


        this.player.aabb = [[-0.5, -2, -0.5], [0.5, 2, 0.5]];
    }

    update(dt) {
        this.colliders.forEach(collider => {
            if(!collider.destroyed) this.resolveCollision(this.player, collider);
        });
        
    }

    addCollidersToScene(scene) {
        scene.traverse((node) => {
            if(node.collision) {
                let box1 = new BoxCollider(node);
                
                this.colliders.push(box1);
            }

            if(node.apricot) {
                //console.log(node);
                
                let box1 = new BoxCollider(node, true, () => {
                    let so = document.getElementById("bing chilling");
                    so.volume = 1;
                    so.play();
                    this.endGame++;
                    if(this.endGame == 4) window.location.href = "../../over.html";
                    console.log(this.endGame);
                });
                
                this.colliders.push(box1);
            }

            if(node.scare) {
                let box1 = new BoxCollider(node, true, () => {
                    let lo = document.getElementById("jumpscare1");
                    lo.classList.remove("hidden");
                    let sp = document.getElementById("jssound");
                    sp.volume = 0.2;
                    sp.play();
                    setTimeout(() => {
                        lo.classList.add("hidden");
                    }, 2000);
                });

                this.colliders.push(box1);
            }
        });

        this.colliders.forEach(element => {
            scene.addNode(element.node);
        });
    }

    resolveCollision(a, b) {
        // Get global space AABBs.
        const aBox = this.getTransformedAABB(a);
        
        const bBox = this.getTransformedAABB(b.node);
        /*if(b.node.apricot) {
            console.log(bBox);
            console.log(b.node);
            debugger;
        }*/

        // Check if there is collision.
        const isColliding = this.aabbIntersection(aBox, bBox);
        
        if (!isColliding) {
            return;
        }

        //console.log("colliding");

        if(b.isTrigger && b.triggerFunc) {
            b.triggerFunc();
            b.destroy();
            return;
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
        const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        const move = vec3.create();
        vec3.add(move, a.translation, minDirection);
        a.translation = move;
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    getTransformedAABB(node) {
        // Transform all vertices of the AABB from local to global space.
        const transform = node.globalMatrix;
        const min = node.aabb[0]; const max = node.aabb[1];
        //console.log(min, max, node.aabb);
        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, transform));

        // Find new min and max by component.
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }
}