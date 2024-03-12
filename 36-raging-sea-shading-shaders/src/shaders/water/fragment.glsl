uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/directionalLight.glsl

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
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



    // Base color
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    // Instead of using a linear gradient for the surface color and depth color
    // we add some "easing" into the transition
    mixStrength = smoothstep(0.0, 1.0, mixStrength);
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // Light
    vec3 light = vec3(0.0);

    light += directionalLight(
        vec3(1.0),              // Light color
        1.0,                    // Light intensity
        normal,                 // Normal
        vec3(-1.0, 0.5, 0.0),   // Light position
        viewDirection,          // View direction
        30.0                    // Specular power
    );

    color *= light;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
