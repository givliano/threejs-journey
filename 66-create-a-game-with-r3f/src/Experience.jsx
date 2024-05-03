import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './Player';
import useGame from './stores/useGame';

export default function Experience() {
    const blocksCount = useGame((state) => state.blocksCount);
    const blockSeed = useGame((state) => state.blockSeed);

    return (
        <>
            <color args={[ '#bdedfc' ]} attack="background" />

            <Physics debug={ false }>
                <Lights />
                <Level count={ blocksCount } seed={ blockSeed } />
                <Player />
            </Physics>

        </>
    );
}
