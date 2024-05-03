import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { KeyboardControls } from '@react-three/drei'
import Interface from './Interface';

const root = ReactDOM.createRoot(document.querySelector('#root'))

// NOTE the keyboard controls must wrap every component
// we pass it a map e.g. where `ArrowUp` and `KeyW` makes the player go `forward`
// We use `KeyW` instead of `w` so that it works in different shapes of keyboards (non QWERTY)

root.render(
    <KeyboardControls
        map={[
            { name: 'forward', keys: [ 'ArrowUp', 'KeyW' ]},
            { name: 'backward', keys: [ 'ArrowDown', 'KeyS' ]},
            { name: 'leftward', keys: [ 'ArrowLeft', 'KeyA' ]},
            { name: 'rightward', keys: [ 'ArrowRight', 'KeyD' ]},
            { name: 'jump', keys: [ 'Space' ]},
        ]}
    >
        <Canvas
            shadows
            camera={ {
                fov: 45,
                near: 0.1,
                far: 200,
                position: [ 2.5, 4, 6 ]
            } }
        >
            <Experience />
        </Canvas>

        <Interface />
    </KeyboardControls>
)
