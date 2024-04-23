import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import Model from './Model';
import Placeholder from './Placeholder';
import Hamburger from './Hamburger';
import Fox from './Fox';

export default function Experience()
{
    return (
        <>
            <Perf position="top-left" />

            <OrbitControls makeDefault />
            {/* NOTE use shadow-normalBias to remove `shadow acne` */}
            <directionalLight castShadow shadow-normalBias={ 0.5 } position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
            <ambientLight intensity={ 1.5 } />

            <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
                <planeGeometry />
                <meshStandardMaterial color="greenyellow" />
            </mesh>

            <Suspense fallback={<Placeholder position-y={ 0.5 } scale={[ 2, 3, 2 ]}/>}>
                {/* <Model /> */}
                <Hamburger scale={ 0.35 }/>
            </Suspense>

            <Fox />
        </>
    );
}
