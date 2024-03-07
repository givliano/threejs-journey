varying vec2 vUv;
varying vec3 vPosition;

void main() {
    // Position
    // Separate it so we can change the modelMatrix
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Final position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vUv = uv;
    // By sending the position from the `modelPosition` the gradients are
    // fixed in the screen (like CRT lines in a tv). If we send the position
    // it will be relative to the meshes themselves.
    vPosition = modelPosition.xyz; // called swizzling
}
