uniform float uTime;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    // Normal
    // We must normalize it again, because between vertices, normals are being
    // interpolated, and you don't end up necessarily with a vector of length 1.0
    // when you interpolate two normals of length 1.0;
    vec3 normal = normalize(vNormal);

    // invert the normals if its the back of the mesh (relative to the camera)
    // since its fresnel effect would be 2 with transparency
    // we also have to remove the depth being written in the depthbuffer by the material
    if (!gl_FrontFacing) {
        normal *= -1.0;
    }
    // Stripes
    // Multiply by 20.0 makes the texture smaller
    // repeat when reaches 1.0
    // Think of modulo as: you send a value as the first parameter
    // and when that value reaches the second parameter it goes back to 0.0
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    // Make the stripes sharper using an exponential function
    stripes = pow(stripes, 3.0);

    // FRESNEL
    // Final color
    // For transparent we need to set the pattern at the alpha channel
    // and set the transparency at the material
    // Holograms are represented with their outside looking
    // brighter than their inside
    // We can do that using the `normal` and the `view` angle
    // We want a value to be `1.0` when the view angle is perpendicular to the normal
    // and `0.0` when the view angle is aligned with the normal. This way the outside
    // of the mesh is brighter
    // this the the `Fresnel` effect

    // vector subtraction allows us to find the news
    // vector between the camera vector and the normal vector
    // to compare the values is:
    // * 1 if its the same direction
    // * 0 if its perpendicular
    // * -1 if they are opposite
    // in between values are interpolated
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0; // add 1 because we don't care for a -1 value
    fresnel = pow(fresnel, 2.0);

    // FALLOFF (smoothing the edges of the material)
    float falloff = smoothstep(0.8, 0.0, fresnel);

    // HOLOGRAPHIC EFFECT
    float holographic = stripes * fresnel;
    // strenghten the fresnel effect
    holographic += fresnel * 1.25;
    holographic *= falloff;

    gl_FragColor = vec4(uColor, holographic);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
