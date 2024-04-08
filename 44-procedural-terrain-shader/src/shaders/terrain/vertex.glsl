uniform float uPositionFrequency;
uniform float uStrength;
uniform float uWarpFrequency;
uniform float uWarpStrength;
uniform float uTime;

#include ../includes/simplexNoise2d.glsl

// NOTE elevation only varies on the `x` and `z` axes.
float getElevation(vec2 position)
{
    // NOTE create variations for the `elevation`.
    // We want higher frequency to have less effect on the elevation,
    // while making sure the final `elevation` is never higher than `1.0`.
    // Higher than `1.0` would mess the `pow` to create the plateaus.
    float elevation = 0.0;

    vec2 warpedPosition = position;
    warpedPosition += uTime * 0.2;
    warpedPosition += simplexNoise2d(warpedPosition * uPositionFrequency * uWarpFrequency) * uWarpStrength;

    elevation += simplexNoise2d(warpedPosition * uPositionFrequency      ) / 2.0; // max 0.5
    elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 2.0) / 4.0; // max 0.25
    elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 4.0) / 8.0; // 0.125

    // Saves the `sign` before losing it in the exponential function.
    // Used for creating below 0.0 `water` areas.
    float elevationSign = sign(elevation);
    // Create plateus by crushing the lower end values
    // Use `abs` to avoid odd numbers being negative (-0.5 * -0.5 * -0.5 = -0.125)
    elevation = pow(abs(elevation), 2.0) * elevationSign;
    elevation *= uStrength;

    return elevation;
}

void main()
{
    // Neighbours positions
    // NOTE Negative Z so that it goes upwards instead of downwards
    float shift = 0.01;
    vec3 positionA = position + vec3(shift, 0.0, 0.0);
    vec3 positionB = position + vec3(0.0, 0.0, - shift);

    // Elevation
    float elevation = getElevation(csm_Position.xz);
    csm_Position.y += elevation;
    positionA.y += getElevation(positionA.xz);
    positionB.y += getElevation(positionB.xz);

    // Compute normal
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);
}
