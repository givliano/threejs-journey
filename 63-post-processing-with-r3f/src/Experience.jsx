import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { Bloom, DepthOfField, EffectComposer, Glitch, Noise, SSR, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing';
import Drunk from './Drunk';
import { useRef } from 'react';
import { useControls } from 'leva';

export default function Experience()
{
    const drunkRef = useRef();

    const drunkProps = useControls('Drunk Effect', {
        frequency: { value: 2, min: 1, max: 20 },
        amplitude: { value: 0.1, min: 0, max: 1 }
    });

    return <>

        <color args={[ 'white' ]} attach="background" />

        <EffectComposer disableNormalPass>
            {/* NOTE we must use a lib to add the renders to the image, as a `blend`
                so each render is built on top of the last one
            */}
            {/* <Vignette  */}
            {/*     offset={ 0.3 } */}
            {/*     darkness={ 0.9 } */}
            {/*     blendFunction={ BlendFunction.NORMAL } */}
            {/* /> */}

            {/* <Glitch  */}
            {/*     delay={[ 0.5, 1 ]} */}
            {/*     duration={[ 0.1, 0.3 ]} */}
            {/*     strength={[ 0.2, 0.4 ]} */}
            {/*     mode={ GlitchMode.CONSTANT_WILD } */}
            {/* /> */}
            {/**/}

            {/* <Noise */}
            {/*     blendFunction={ BlendFunction.SOFT_LIGHT } */}
            {/* /> */}

            {/* <Bloom */}
            {/*     luminanceThreshold={ 0.7 } */}
            {/*     mipmapBlur */}
            {/*     intensity={ 5 } */}
            {/* /> */}

            {/* <DepthOfField */}
            {/*     focusDistance={ 0.025 } */}
            {/*     focalLength={ 0.025 } */}
            {/*     bokehScale={ 6 } */}
            {/* /> */}

            {/* <SSR /> */}

            <Drunk
                ref={ drunkRef }
                { ...drunkProps }
                blendFunction={ BlendFunction.DARKEN }
            />
            <ToneMapping />
        </EffectComposer>
        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />

        <mesh castShadow position-x={ - 2 }>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
        </mesh>

        <mesh castShadow position-x={ 2 } scale={ 1.5 }>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>

        <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" />
        </mesh>

    </>
}
