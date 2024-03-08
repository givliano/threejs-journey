uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

#include ../includes/random2D.glsl

void main() {
    // Position
    // Separate it so we can change the modelMatrix
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // ADD GLITCH
    float glitchTime = (uTime - modelPosition.y);
    // random2D sends a value from 0 to 1, so we subtract 0.5 to make it from -0.5 to 0.5
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
    glitchStrength /= 3.0; // divide to lower the number since we are adding 3 sin
    // smoothes the sin wave so that all the negative values are turned into 0
    glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
    glitchStrength *= 0.25;
    modelPosition.x += (random2D(modelPosition.xz + uTime) + 0.5) * glitchStrength;
    modelPosition.z += (random2D(modelPosition.xz + uTime) + 0.5) * glitchStrength;

    // Final position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Varyings
    vUv = uv;
    // By sending the position from the `modelPosition` the gradients are
    // fixed in the screen (like CRT lines in a tv). If we send the position
    // it will be relative to the meshes themselves.
    vPosition = modelPosition.xyz; // called swizzling

    // Model normal
    // update the normals so that the holographic effects at the border
    // of the objects are `fixed` at the border, ignoring the rotation of the
    // meshes.
    // When the fourth value is `1.0`, the vector is `homogeneous`, and all 3
    // transformations (translate, rotate, scale) will be applied
    // When the fourth value is `0.0` the vector is `not homogeneous`, and
    // translation won't be applied.
    // Ideal in the case of a `normal`, because a `normal` it NOT a position,
    // it is a direction
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    vNormal = modelNormal.xyz;
}
