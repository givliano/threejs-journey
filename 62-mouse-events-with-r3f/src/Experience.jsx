import { useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useRef } from 'react'

export default function Experience()
{
    const cube = useRef()
    const hamburger = useGLTF('./hamburger.glb');
    
    useFrame((state, delta) =>
    {
        cube.current.rotation.y += delta * 0.2
    })

    const eventHandler = () => {
        cube.current.material.color.set(`hsl(${Math.random() * 360}, 100%, 75%)`);
    }

    return <>

        <OrbitControls makeDefault />

        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />

        <mesh position-x={ - 2 } onClick={ (e) => e.stopPropagation() }>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
        </mesh>

        <mesh 
            onClick={ eventHandler }
            onPointerEnter={ () => document.body.style.cursor = 'pointer' }
            onPointerLeave={ () => document.body.style.cursor = 'default' }
            ref={ cube } 
            position-x={ 2 } 
            scale={ 1.5 }
        >
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>

        <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" />
        </mesh>

        {/* NOTE the `primitive` is a simple placeholder for the actual object */}
        <primitive
            object={ hamburger.scene }
            scale={ 0.25 }
            position-y={ 0.5 }
            // NOTE onClick event handlers can be heavy on the CPU if the objects are of a complex geometry.
            // We can use `boundingSpheres meshBounds` to make it simnples
            // Or the `Bvh` module from drei
            onClick={((e) => {
                console.log(e.object.name);
                e.stopPropagation();
            })}
        />

    </>
}
