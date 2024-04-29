import { OrbitControls, useGLTF } from '@react-three/drei'
import { BallCollider, CuboidCollider, CylinderCollider, InstancedRigidBodies, Physics, RigidBody } from '@react-three/rapier'
import { Perf } from 'r3f-perf'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three';

export default function Experience()
{
    const [ hitSound ] = useState(() => new Audio('./hit.mp3'));
    const cube = useRef();
    const twister = useRef();

    const cubeJump = () => {
        const mass = cube.current.mass();
        // NOTE `addForce` is for things like wind
        // Shooting something or jumping is an `impulse`
        // We should also avoid moving the object `position` if using physics.
        // Everything should be done via forces and impulses
        cube.current.applyImpulse({ x: 0, y: 5 * mass, z: 0 });
        cube.current.applyTorqueImpulse({ 
            x: Math.random() - 0.5, 
            y: Math.random() - 0.5, 
            z: Math.random() - 0.5 
        });
    };

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        const eulerRotation = new THREE.Euler(0, time * 3, 0);
        const quaternionRotation = new THREE.Quaternion();
        quaternionRotation.setFromEuler(eulerRotation); // use Euler to create a simple quaternion
        twister.current.setNextKinematicRotation(quaternionRotation);

        // NOTE rotate the twister in a circle
        const angle = time * 0.5;
        const x = Math.cos(angle) * 3;
        const z = Math.sin(angle) * 3;
        twister.current.setNextKinematicTranslation({ x, y: -0.8, z });
    });

    const collisionEnter = () => {
        console.log('boom');
        // hitSound.currentTime = 0;
        // hitSound.volume = Math.random();
        // hitSound.play();
    }

    const hamburger = useGLTF('./hamburger.glb');

    const cubesCount = 300;
    const cubes = useRef();

    // NOTE Disabled to create the meshes using RAPIER
    // useEffect(() => {
    //     for (let i = 0; i < cubesCount; i++) {
    //         const matrix = new THREE.Matrix4();
    //         console.log(matrix);
    //         // Set the position, rotation and scale in the matrix
    //         matrix.compose(
    //             new THREE.Vector3(i * 2, 0, 0),
    //             new THREE.Quaternion(),
    //             new THREE.Vector3(1, 1, 1)
    //         );
    //         console.log(matrix);
    //         cubes.current.setMatrixAt(i, matrix);
    //     }
    // }, []);
    //
    const instances = useMemo(() => {
        const instances = [];
        // Provides a `key`, `position` and `rotation` for each `instance`
        for (let i = 0; i < cubesCount; i++) {
            instances.push({
                key: 'instance_' + i,
                position: [ 
                    (Math.random() - 0.5) * 8, 
                    6 + i * 0.2, 
                    (Math.random() - 0.5) * 8 
                ],
                rotation: [ 0, 0, 0 ]
            })
        }
        return instances;
    }, []);

    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />

        {/*
        *  NOTE only objects inside the `Physics` tag will be affected
        *   3js objects are associated with React Three RApier objects
        *   We dont have to specify surface properties, object mass, etc
        *   COLLISION DETECTION:
        *   We can use the `collider` prop to create the shape in physics
        *   For things like a torus we can set the colliders to `hull`,
        *   which will follow the custom shape
        *   But a `trimesh` will be the one to follow the hole inside the torus
        */}
        <Physics /* debug  */gravity={[ 0, - 9.08, 0 ]}>
            <RigidBody colliders="ball">
                <mesh castShadow position={ [ - 1.5, 2, 0 ] }>
                    <sphereGeometry />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </RigidBody>

            {/* <RigidBody  */}
            {/*     colliders={ false }  */}
            {/*     position={ [ 0, 1, 0 ] } */}
            {/*     rotation={[ Math.PI * 0.5, 0, 0 ]} */}
            {/* > */}
            {/*     {/* Create a custom collider  */}
            {/*     <CuboidCollider args={[ 1.5, 1.5, 0.5 ]} /> */}
            {/*     <CuboidCollider  */}
            {/*         args={[ 0.25, 1, 0.25 ]}  */}
            {/*         position={[ 0, 0, 1 ]}  */}
            {/*         rotation={[ - Math.PI * 0.35, 0, 0 ]}  */}
            {/*     /> */}
            {/*     <BallCollider args={[ 1.5 ]} /> */}
            {/*     <mesh  */}
            {/*         castShadow  */}
            {/*     > */}
            {/*         <torusGeometry args={[ 1, 0.5, 16, 32 ]}/> */}
            {/*         <meshStandardMaterial color="mediumpurple" /> */}
            {/*     </mesh> */}
            {/* </RigidBody> */}
            
            <RigidBody 
                ref={ cube } 
                position={[ 1.5, 2, 0 ]}
                gravityScale={ 1 }
                restitution={ 1 }
                friction={ 0 }
                colliders={ false }
                onCollisionEnter={ collisionEnter }
                onCollisionExit={() => console.log('collision exit')}
            >
                <mesh castShadow onClick={cubeJump}>
                    <boxGeometry />
                    <meshStandardMaterial color="mediumpurple" />
                </mesh>
                <CuboidCollider mass={ 2 } args={[ 0.5, 0.5, 0.5 ]} />
            </RigidBody>

            <RigidBody
                ref={ twister }
                position={[ 0, - 0.8, 0 ]}
                friction={ 0 }
                type="kinematicPosition"
            >
                <mesh castShadow scale={[ 0.4, 0.4, 3 ]}>
                    <boxGeometry />
                    <meshStandardMaterial color="red" />
                </mesh>
            </RigidBody>

            <RigidBody type="fixed" restitution={ 0.1 } friction={ 0.7 }>
                <mesh receiveShadow position-y={ - 1.25 }>
                    <boxGeometry args={ [ 10, 0.5, 10 ] } />
                    <meshStandardMaterial color="greenyellow" />
                </mesh>
            </RigidBody>

            <RigidBody colliders={ false } position={[ 0, 4, 0 ]}>
                <primitive object={ hamburger.scene } scale={ 0.25 } />
                <CylinderCollider args={[ 0.5, 1.25 ]} />
            </RigidBody>

            <RigidBody type="fixed">
                <CuboidCollider args={[ 5, 2, 0.5 ]} position={[ 0, 1, 5.25 ]} />
                <CuboidCollider args={[ 5, 2, 0.5 ]} position={[ 0, 1, - 5.25 ]} />
                <CuboidCollider args={[ 0.5, 2, 5 ]} position={[ 5.5, 1, 0 ]} />
                <CuboidCollider args={[ 0.5, 2, 5 ]} position={[ - 5.5, 1, 0 ]} />
            </RigidBody>

            <InstancedRigidBodies instances={ instances }>
                <instancedMesh // NOTE BEST WAY TO ADD MESHES
                    ref={ cubes } 
                    args={[ null, null, cubesCount ]} 
                    castShadow
                >
                    <boxGeometry />
                    <meshStandardMaterial color="tomato" />
                </instancedMesh>
            </InstancedRigidBodies>
        </Physics>


    </>
}
