uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl

void main()
{
    // To make the difference between two vectors we subtract them
    // more information at the 40 minutes of the class
    // also, we need the direction (normalized), not the position (can be hudeO)
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 color = uColor;

    // LIGHTS
    // Lights in vertex shader are a bit more performant, however, they are prone
    // to artifacts.
    vec3 light = vec3(0.0);

    light += ambientLight(
        vec3(1.0, 0.0, 0.0), // Light color
        0.03                 // Light intensity
    );

    light += directionalLight(
        vec3(0.1, 0.1, 1.0), // Light color
        1.0,                 // Light intensity
        vNormal,             // Normal
        vec3(0.0, 0.0, 3.0), // Light position
        viewDirection,       // View Direction
        20.0                 // Specular power
    );

    // We dont add the light to the color, the objects `color` must be `multiplied`
    // by the light
    color *= light;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
