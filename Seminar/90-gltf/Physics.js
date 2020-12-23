
const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;

export default class Physics {

    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.nodes = new Map();
        this.world = new OIMO.World({
            timestep: 1/60,
            iterations: 8,
            broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
            worldscale: 1, // scale full world
            random: true,  // randomize sample
            info: false,   // calculate statistic or not
            gravity: [0, 0, 1]
        });
        const tNode = camera.matrix;
        //const rotNode = quat.create();
        const posNode = vec3.create()
        this.physicalCamera = this.world.add({
            type : 'box', // type of shape : sphere, box, cylinder
            size: [1, 1, 3], // size of shape
            pos: posNode, // start position in degree
            rot: camera.rotationAngle, // start rotation in degree
            move: true, // dynamic or statique
            density: 1,
               // restitution:0.1,
            friction: 1,
            kinematic: true,
           // material: 'kinematic'
        })
        for(const node of this.scene.nodes) { /////HOW TO FIND THE NODE IN THE SCENME
            let scale;
            const tNode = node.matrix;
            const rotNode = quat.create();
            const posNode = vec3.create();
            let scaleNode = vec3.create();

            mat4.getTranslation(posNode, tNode);
            mat4.getScaling(scaleNode, tNode);
            mat4.getRotation(rotNode, tNode);
            //console.log(rotNode);
            let mov = node.camera !== null;
            let typeN, density, kinematic, material;
            if(node.plane){
                typeN = 'plane';
               // scaleNode = undefined;
                density = 1000;
            }
            else {
                typeN = 'box';
                density = 1;

            }
            /*
            if(node.camera){
                scale = [1, 1, 6];
                kinematic = true;
                material = 'kinematic';
                console.log(node);
            }
            else {*/
                scale = scaleNode;
                kinematic = false;
           // }

           // console.log(posNode[0], posNode);

            this.nodes.set(
                node,
                this.world.add({
                type: typeN, // type of shape : sphere, box, cylinder
                size: scale, // size of shape
                pos: posNode, // start position in degree
                rot: node.rotationAngle, // start rotation in degree
                move: mov, // dynamic or statique
                density: 1,
               // restitution:0.1,
                friction: 0.2,
                kinematic: kinematic,
                material: material
                //  restitution: 0.2,
                //   belongsTo: 1, // The bits of the collision groups to which the shape belongs.
                 //   collidesWith: 0xffffffff; // The bits of the collision groups with which the shape collides.
            }
           ));
           console.log(this.scene.nodes);
           console.log(this.nodes);

        }
        /*
        this.scene.traverse(node => {
            const tNode = node.getGlobalTransform();
            const posNode = mat4.getTranslation(vec3.create(), tNode);
            const scaleNode = mat4.getScaling(vec3.create(), tNode);
            const rotNode = mat4.getRotation(vec3.create(), tNode);
            //console.log(rotNode, scaleNode, posNode);

            this.nodes.set(
                node,
                this.world.add({
                type:'box', // type of shape : sphere, box, cylinder
                size: scaleNode, // size of shape
                pos: posNode, // start position in degree
                rot: rotNode, // start rotation in degree
                move:true // dynamic or statique
                // density: 1,
                //  friction: 0.2,
                //  restitution: 0.2,
                //   belongsTo: 1, // The bits of the collision groups to which the shape belongs.
                 //   collidesWith: 0xffffffff; // The bits of the collision groups with which the shape collides.
            }
           ));

        });
        */
        //console.log(this.nodes);



    }

    update(dt) {
        /*
        for(const [viewNode, physicsNode] of this.nodes) {
            if(viewNode.velocity) {
                console.log(viewNode.rotation);
                console.log(physicsNode.getQuaternion());
            }
            let newPosition = physicsNode.getPosition();
            const newRotation = physicsNode.getQuaternion();
            //console.log(newPosition);
            //if(viewNode.camera !== null) {
                   // newPosition.y = 0;
                   vec3.set(viewNode.translation, newPosition.x, newPosition.y, newPosition.z);
               // quat.set(viewNode.rotation, newRotation.x, newRotation.y, newRotation.z, newRotation.w);
                //viewNode.updateTransform();
           // }
           // vec3.set(viewNode.rotation, newRotation[0], newRotation[1], newRotation[2]);
            //console.log(physicsNode.type);
           // console.log(viewNode.rotation);
            //viewNode.updateMatrix();
        }
        */
        //console.log(this.physicalCamera.getPosition());
        const pos = this.physicalCamera.getPosition();
        console.log(pos);
        vec3.set(this.camera.translation, pos.x, pos.y, pos.z);
        this.world.step();
        this.camera.updateMatrix();

        /*
        this.scene.traverse(node => {
            if (node.velocity) {
                console.log(node);
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateTransform();
                this.scene.traverse(other => {
                    if (node !== other) {
                        console.log("VMRO");
                        this.resolveCollision(node, other);
                    }
                });
            }
        });
        */
    }


}
