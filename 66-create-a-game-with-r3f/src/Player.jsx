import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef } from "react";

export default function Player() {
    const body = useRef();
    const { rapier, world } = useRapier();

    // NOTE retrieve the keys and actions with the hook
    // `subscribeKeys` allow us to list to changes in the state
    const [ subscribeKeys, getKeys ] = useKeyboardControls();

    const jump = () => {
        // NOTE get the position of the center of the ball to cast the ray, to test for the height
        const origin = body.current.translation();
        origin.y -= 0.31; // set the origin at right below the ball (which has diameter of 0.6)
        // NOTE the direction of the ray (downward, to the floor).
        const direction = { x: 0, y: -1, z: 0 };
        const ray = new rapier.Ray(origin, direction); // Raycaster
        // `10` is max distance for the ray, `true` is to consider the floor solid
        const hit = world.castRay(ray, 10, true); 

        // `toi` is the distance to the floor
        if (hit.toi < 0.15) {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
        }
    }

    useEffect(() => {
        const unsubscribeJump = subscribeKeys(
            // SELECTOR
            // Listen to the event in the state
            (state) => state.jump,
            // Event handler
            (value) => {
                if (value) jump();
            }
        );

        return () => {
            // Clean up the handler when hot reloading in dev mode.
            unsubscribeJump();
        }
    }, []);

    // NOTE runs on each frame
    useFrame((state, delta) => {
        const { forward, backward, leftward, rightward }= getKeys();

        // Provide both at the beginning to avoid multiple registers from the keys
        const impulse = { x: 0, y: 0, z: 0 };
        // NOTE torque refers to the rotation of the ball, so we use the X axle
        const torque = { x: 0, y: 0, z: 0 };

        // NOTE adjust to frame rate with random scalars that look good
        const impulseStrength = 0.6 * delta;
        const torqueStrength = 0.2 * delta;

        if (forward) {
            impulse.z = - (impulse.z + impulseStrength);
            torque.x = - (torque.x + torqueStrength);
        }

        if (rightward) {
            impulse.x = impulse.x + impulseStrength;
            torque.z = - (torque.z + torqueStrength);
        }

        if (leftward) {
            impulse.x = - (impulse.x + impulseStrength);
            torque.z = torque.z + torqueStrength;
        }

        if (backward) {
            impulse.z = impulse.z + impulseStrength;
            torque.x = torque.x + torqueStrength;
        }

        body.current.applyImpulse(impulse);
        body.current.applyTorqueImpulse(torque);
    });

    return (
        <RigidBody 
            ref={ body }
            canSleep 
            colliders="ball" 
            restitution={ 0.2 } 
            friction={ 1 } 
            // NOTE the damping will reduce the forces being applied
            // and can be set for the rotation and for the translation separatly
            linearDamping={ 0.5 }
            angularDamping={ 0.5 }


            position={[ 0, 1, 0 ]}
        >
            <mesh castShadow>
                <icosahedronGeometry args={[ 0.3, 1 ]} />
                <meshStandardMaterial flatShading color="mediumpurple" />
            </mesh>
        </RigidBody>
    );
}
