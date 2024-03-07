uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    // Stripes
    // Multiply by 20.0 makes the texture smaller
    // repeat when reaches 1.0
    // Think of modulo as: you send a value as the first parameter
    // and when that value reaches the second parameter it goes back to 0.0
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    // Make the stripes sharper using an exponential function
    stripes = pow(stripes, 3.0);
    // Final color
    // For transparent we need to set the pattern at the alpha channel
    // and set the transparency at the material
    // Holograms are represented with their outside looking
    // brighter than their inside
    // We can do that using the `normal` and the `view` angle
    // We want a value to be `1.0` when the view angle is perpendicular to the normal
    // and `0.0` when the view angle is aligned with the normal. This way the outside
    // of the mesh is brighter
    gl_FragColor = vec4(1.0, 1.0, 1.0, stripes);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
