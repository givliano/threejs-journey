import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Experience from './Experience';

const root = ReactDOM.createRoot(document.querySelector('#root'))

const cameraSettings = {
    fov: 45,
    near: 0.1,
    far: 200,
    position: [ 3, 2, 6 ]
}

root.render(
    <Canvas
        // dpr={[ 1, 2 ]} // devicePixelRatio like this [min, max] is the default
        gl={{
            antialias: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={cameraSettings}
    >
        <Experience />
    </Canvas>
);
