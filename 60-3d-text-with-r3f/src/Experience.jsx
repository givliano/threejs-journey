import { useState, useEffect, useRef } from 'react';
import { Text3D, OrbitControls, Center, useMatcapTexture } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const torusGeometry = new THREE.TorusGeometry();
const material = new THREE.MeshMatcapMaterial();

export default function Experience()
{
    const donuts = useRef([]);
    // const donutsGroup = useRef();
    const [ matcapTexture ] = useMatcapTexture('7B5254_E9DCC7_B19986_C8AC91', 256);
    // NOTE outdated way of adding geometries
    // const [ torusGeometry, seTorusGeometry ] = useState();
    // const [ material, setMaterial ] = useState();

    useEffect(() => {
        // NOTE Change the encodnig back after creating it with
        // the default one outside React
        material.encoding = THREE.sRGBEncoding;
        material.needsUpdate = true; // NOTE force the update;

        material.matcap = matcapTexture;
        material.needsUpdate = true; // NOTE force the update;
    }, [])

    useFrame((_, delta) => {
        for (const donut of donuts.current) {
            if (donut) {
                donut.rotation.y += delta * 0.2;
            }
        }
    })

    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        {/* <torusGeometry ref={ seTorusGeometry } /> */}
        {/* <meshMatcapMaterial ref={ setMaterial } matcap={ matcapTexture } /> */}

        <Center>
            <Text3D 
                material={ material }
                font='./fonts/helvetiker_regular.typeface.json'
                size={ 0.75 }
                height={ 0.2 }
                curveSegments={ 12 }
                bevelEnabled
                bevelThickness={ 0.02 }
                bevelSize={ 0.02 }
                bevelOffset={ 0 }
                bevelSegments={ 5 }
            >
                Hello R3F
            </Text3D>
        </Center>

        {/* <group> */}
            { [ ...Array(100) ].map((_, i) => (
                <mesh
                    ref={ (element) => donuts.current[i] = element /**avoid adding infinitely donuts**/}
                    key={ i }
                    geometry={ torusGeometry }
                    material={ material }
                    position={[
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10,
                    ]}
                    scale={ 0.2 + (Math.random() * 0.2) }
                    rotation={[
                        Math.random() * Math.PI,
                        Math.random() * Math.PI,
                        0
                    ]}
                />
            ))}
        {/* </group> */}
    </>
}
