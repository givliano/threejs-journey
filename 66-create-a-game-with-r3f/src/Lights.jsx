import { useFrame } from "@react-three/fiber";
import { useRef } from "react"

export default function Lights() {

    const light = useRef();

    useFrame((state) => {
        // Make the light follow the camera, so that we can hame more flexibility
        // Add a `1` to make the angle of the light right
        // subtract 4 for style reasons
        light.current.position.z = state.camera.position.z + 1 - 4;
        // Adjust the target of the light so that it faces the right direction
        light.current.target.position.z = state.camera.position.z - 4;
        // the `light` is in the scene, but its `target` is not, so we must
        // update it manually
        light.current.target.updateMatrixWorld();
    })
    return (
        <>
            <directionalLight
                ref={ light }
                castShadow
                position={ [ 4, 4, 1 ] }
                intensity={ 4.5 }
                shadow-mapSize={ [ 1024, 1024 ] }
                shadow-camera-near={ 1 }
                shadow-camera-far={ 10 }
                shadow-camera-top={ 10 }
                shadow-camera-right={ 10 }
                shadow-camera-bottom={ - 10 }
                shadow-camera-left={ - 10 }
            />
            <ambientLight intensity={ 1.5 } />
        </>
    );
}
