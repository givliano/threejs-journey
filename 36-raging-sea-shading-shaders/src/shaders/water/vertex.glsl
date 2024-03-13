uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;

uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/perlinClassic3D.glsl

// the normals are coming from the fragment in the plane, so they are all pointing upwards
// The reason is that we are using the normal from the geometry attributes and those normals 
// aren’t affected by the waves we can’t just update the attribute because it needs to change 
// on each frame according to the waves we calculate in the vertex shader.
// We need to compute the new orientation ourselves.
//     THEORY
// There are multiple ways of computing a normal and it depends on a lot of things, but in the case of a grid, 
// we can use the neighbours technique.
//
// We are going to ignore the normal attribute sent with the geometry and, instead, we are going to calculate 
// the theoretical position of neighbours to calculate the normal.
//
// One neighbour will be further away on the x axis (let’s call it A) and another neighbour will be 
// further away on the z axis (let’s call it B):
// We then update the elevation of those neighbours exactly like we did for the current vertex:
//
// We calculate a vector going from the vertex to the A (let’s call it toA), then the vector going from the 
// vertex to B (let’s call it toB):
// Our computed normal should be the vector perpendicular to both toA and toB and the good news is that 
// there is a function named cross product doing exactly that:
// A normal is a perpendicular vector to the two vectors

// Computing normals depends on the initial `data` and we wouldn't have been able to use the neighbors technique
// if we hadn't beeng using a grid like a `plane`, `flat plane` etc

// Currently it costs a lot because we are calling the perlin noise around 12 times, so keep an eye on the performance.
float waveElevation(vec3 position) 
{
    // To put elements floating in the ocean we can just use this `elevation` part in JS,
    // skipping the for loop
    float elevation = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
                      sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
                      uBigWavesElevation;

    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        elevation -= abs(perlinClassic3D(vec3(position.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
    }

    return elevation;
}

void main()
{
    // Base position
    float shift = 0.01; // how far the neighbors will be
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0); // first neighbor with shift added
    // second neighbor with shift added. negative `z` for the `cross product`.
    // there are 2 perpendicular vector to each pair. With the cross product we 
    // only get the perpendicular vector we want
    // We are pushing the neighbor in the minus Z direction
    // By the right hand rule if its a positive z the normal would go
    // downward instead of upward
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0,  - shift);

    // Elevation
    float elevation = waveElevation(modelPosition.xyz);
    modelPosition.y += elevation;
    modelPositionA.y += waveElevation(modelPositionA);
    modelPositionB.y += waveElevation(modelPositionB);

    // Calculate neighbours directions
    // Compute normal
    vec3 toA = normalize(modelPositionA - modelPosition.xyz);
    vec3 toB = normalize(modelPositionB - modelPosition.xyz);
    vec3 computedNormal = cross(toA, toB);

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Varyings
    vElevation = elevation;
    // vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vNormal = computedNormal;
    vPosition = modelPosition.xyz;
}
