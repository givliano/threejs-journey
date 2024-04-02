uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
uniform vec3 uColorA;
uniform vec3 uColorB;

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;

#include ../includes/simplexNoise3d.glsl

void main()
{
    // Mixed position
    // Mixes between the first model and the last model so that the noise is
    // applied to both
    float noiseOrigin = simplexNoise3d(position * 0.2);
    float noiseTarget = simplexNoise3d(aPositionTarget * 0.2);
    float noise = mix(noiseOrigin, noiseTarget, uProgress);
    // Simplex noise range is from -1.0 to 1.0, which is not ideal for us working between 0.0 and 1.0
    // smoothstep takes the input values and then outputs something from 0.0 to 1.0
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.4; // the duration of the animation in itself
    float delay = (1.0 - duration) * noise; // gets a random delay to start the animation
    float end = delay + duration; // the end of the animation

    // Use the animation delay and end
    float progress = smoothstep(delay, end, uProgress);
    vec3 mixedPosition = mix(position, aPositionTarget, progress);

    // Final position
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varying
    vColor = mix(uColorA, uColorB, noise);
}
