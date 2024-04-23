import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import { useControls } from 'leva';

export default function Fox() {
    const fox = useGLTF('./Fox/glTF/Fox.gltf');
    const animations = useAnimations(fox.animations, fox.scene);

    const { animationName } = useControls({
        animationName: {
            options: animations.names
        }
    })


    // NOTE trigger animations after the first render
    useEffect(() => {
        const action = animations.actions[animationName];
        // NOTE We must reset so that it works after the fadeOut
        action
            .reset()
            .fadeIn(0.5)
            .play();

        // NOTE Cleanup the old animation
        return () => action.fadeOut(0.5);
    }, [animationName]);

    return <primitive 
        object={ fox.scene } 
        scale={ 0.02 }
        position={[ -2.5, 0, 2.5 ]}
        rotation-y={ 0.3 }
    />;
}
