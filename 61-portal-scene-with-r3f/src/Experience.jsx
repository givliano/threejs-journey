import { 
    shaderMaterial,
    useGLTF, 
    OrbitControls, 
    useTexture, 
    Center, 
    Sparkles 
} from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import portalVertexShader from './shaders/portal/vertex.glsl';
import portalFragmentShader from './shaders/portal/fragment.glsl';

const PortalMaterial = shaderMaterial(
    {
        uTime: 0,
        uColorStart: new THREE.Color('#ffffff'),
        uColorEnd: new THREE.Color('#000000')
    },
    portalVertexShader,
    portalFragmentShader
);

extend({ PortalMaterial });

export default function Experience()
{
    // NOTE R3F adds tonemapping by default, and we need to remove it since our 
    // scene in blender already has it.
    const  { nodes }= useGLTF('./model/portal.glb');
    const bakedTexture = useTexture('./model/baked.jpg');
    bakedTexture.flipY = false;

    const portalMaterial = useRef();

    useFrame((state, delta) => {
        portalMaterial.current.uTime += delta;
    })

    return <>

        <color args={[ '#201919' ]} attach="background" />

        <OrbitControls makeDefault />

        <Center>
            {/* NOTE we are not going to use the `<primitive>` because we want to apply our */}
            {/* own material to the `Mesh`. But we do need the geometry. */}
            <mesh geometry={ nodes.baked.geometry }>
                <meshBasicMaterial map={ bakedTexture } />
            </mesh>

            <mesh 
                geometry={ nodes.poleLightA.geometry } 
                position={ nodes.poleLightA.position }
                // rotation={ nodes.polelightA.rotation }
                // scale={ nodes.poleLightA.scale }
            >
                <meshBasicMaterial color="#ffffe5" />
            </mesh>

            <mesh 
                geometry={ nodes.poleLightB.geometry } 
                position={ nodes.poleLightB.position }
                // rotation={ nodes.polelightA.rotation }
                // scale={ nodes.poleLightA.scale }
            >
                <meshBasicMaterial color="#ffffe5" />
            </mesh>

            <mesh
                geometry={ nodes.portalLight.geometry }
                position={ nodes.portalLight.position }
                rotation={ nodes.portalLight.rotation }
            >
                <portalMaterial ref={ portalMaterial } />
            </mesh>

            <Sparkles 
                size={ 6 }
                scale={[ 4, 2, 4 ]}
                position-y={ 1 }
                speed={ 0.2 }
                count={ 50 }
            />
        </Center>
    </>
}
