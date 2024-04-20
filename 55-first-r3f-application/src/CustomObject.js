import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CustomObject() {
   const verticesCount = 10 * 3;

   const geometryRef = useRef();
   
   const positions = useMemo(() => {
      // 10 triangles, 3 vertices by triangle, 3 cordinates per vertice
      const positions = new Float32Array(verticesCount * 3); 

      for (let i = 0; i < verticesCount * 3; i++) {
         positions[i] = (Math.random() - 0.5) * 3;
      }

      return positions;
   }, []);

   useEffect(() => {
      geometryRef.current.computeVertexNormals();
   })

   return (
      <mesh>
         <bufferGeometry ref={geometryRef}>
            <bufferAttribute
               // buffer attribute will attach itself to `geometry.attribute.position`
               attach="attributes-position" 
               count={ verticesCount }
               itemSize={ 3 }
               array={ positions }
            />
         </bufferGeometry>
         <meshStandardMaterial 
            color="red" 
            side={ THREE.DoubleSide }
         />
      </mesh>
   );
}
