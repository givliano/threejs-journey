uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uShadowRepetitions;
uniform vec3 uShadowColor;
uniform float uLightRepetitions;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl

vec3 halftone(
    vec3 color,
    float repetitions,
    vec3 direction,
    float low,
    float high,
    vec3 pointColor,
    vec3 normal
)
{
    float intensity = dot(normal, direction);
    intensity = smoothstep(low, high, intensity);

    // `gl_FragCoord` is a `vec4` where `xy` constitues the "screen" coordinates
    // and `zw` are used for the depth
    // its a huge number so we must divide it by the resolution.y
    // vecause we want the uv to be squares, not the ratio of the screen
    vec2 uv = gl_FragCoord.xy / uResolution.y;
    // for the halftone we want it  in a series of max 1 for the uv (each scalar),
    // so we multiply it to a high value and then use the mod function (which you use when 
    // you want a value to go back to 0 when it reaches the threshold)
    // this number controls how many cell we have vertically in the whole material
    uv *= repetitions;
    uv = mod(uv, 1.0);
    // get the distance of the pixel to the center of the cell, it has to be less than the disc width, print it
    // then subtract from 1.0 to invert it
    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);

     // Mix the `color` variable with the `pointColor` according to the 
    // `point` variable and send the `color` to `gl_FragColor`.
    return mix(color, pointColor, point);
}

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    // Lights
    vec3 light = vec3(0.0);

    light += ambientLight(
        vec3(1.0),
        1.0
    );

    light += directionalLight(
        vec3(1.0, 1.0, 1.0),
        1.0,
        normal,
        vec3(1.0, 1.0, 1.0),
        viewDirection,
        1.0
    );

    color *= light;

    // Halftone
    float repetitions = 50.0;
    // Makes a vector going down to adjust the circles of the halftone
    // similar to the directional light
    // compare the normal to the halftone direction
    // if its at the bottom we want a big point, if its at the top we want a small point
    color = halftone(
        color,
        uShadowRepetitions,
        vec3(0.0, - 1.0, 0.0),
        - 0.8,
        1.5,
        uShadowColor,
        normal
    );

    // halftone for the light
    color = halftone(
        color,
        uLightRepetitions,
        vec3(1.0, 1.0, 0.0),
        - 0.8,
        1.5,
        uLightColor,
        normal
    );

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
