import { useRef } from 'react';
import { 
    Float,
    Html,
    MeshReflectorMaterial,
    Text,
    PivotControls, 
    TransformControls, 
    OrbitControls 
} from '@react-three/drei';

export default function Experience()
{

    const cube = useRef();
    const sphere = useRef();

    return <>
        <OrbitControls makeDefault />

        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />

        <PivotControls 
            anchor={[ 0, 0, 0 ]}
            depthTest={ false }
            lineWidth={ 4 }
            axisColors={[ 0x9381ff, 0xff4d6d, 0x7ae582 ]}
            scale={ 100 }
            fixed={ true }
        >
            <mesh 
                ref={ sphere }
                position-x={ - 2 }
            >
                <sphereGeometry />
                <meshStandardMaterial color="orange" />
                <Html 
                    position={[ 1, 1, 0 ]}
                    wrapperClass="label"
                    center
                    distanceFactor={ 6 }
                    occlude={[ sphere, cube ]}
                >
                    That's a sphere
                </Html>
            </mesh>
        </PivotControls>
        <mesh ref={cube} position-x={ 2 } scale={ 1.5 }>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>
        <TransformControls object={cube} mode="translate" / >

        <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <MeshReflectorMaterial
                resolution={ 512 }
                blur={[ 1000, 1000 ]}
                mixBlur={ 1 }
                mirror={ 0.8 }
            />
        </mesh>

        <Float
            speed={ 5 }
            floatIntensity={ 2 }
        >
            <Text 
                font="./bangers-v20-latin-regular.woff"
                fontSize={ 1 }
                color="salmon"
                position-y={ 2 }
                maxWidth={ 2 }
                textAlign="center"
            >
                I LOVE R3F
            </Text>
        </Float>

    </>
}
