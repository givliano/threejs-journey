import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import CustomObject from './CustomObject';

extend({ OrbitControls });

export default function Experience() {
    const cubeRef = useRef();
    const groupRef = useRef();

    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta;
        // groupRef.current.rotation.y += delta;
    });

    const { camera, gl } = useThree();

    return (
        <>
            <orbitControls 
                args={[ camera, gl.domElement ]}
            />

            <directionalLight 
                position={[ 1, 2, 3 ]}
                intensity={4.5}
            />

            <group ref={ groupRef }>
                <mesh 
                    ref={cubeRef}
                    position={ [ 3, 0, 0 ] }
                    scale={ 1.5 }
                >
                    <boxGeometry scale={ 1.5 } />
                    <meshStandardMaterial color="mediumpurple" />
                </mesh>

                <mesh
                    position={ [ -3, 0, 0 ] }
                >
                    <sphereGeometry />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </group>

            <mesh
                position-y={ -1 }
                rotation-x={ - Math.PI / 2}
                scale={ 10 }
            >
                <planeGeometry args={[ 5, 5, 64, 64 ]}/>
                <meshStandardMaterial color="green" />
            </mesh>

            <CustomObject />
        </>
    )
}
