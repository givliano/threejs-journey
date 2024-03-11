uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;

#include ../includes/remap.glsl

void main()
{
    float progress = uProgress * aTimeMultiplier;
    vec3 newPosition = position;

    // EXPLOSIONn
    // smoothstep starts slowly and ends slowly
    // explosion starts fast and ends slowly
    // explosion happens from 0.0 to 1.0
    float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
    explodingProgress = clamp(explodingProgress, 0.0, 1.0);
    // invert the power to make it kinda `logarithmic`, really fast
    // at the beginning and then slows down
    // goes from 1.0 to 0
    explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
    newPosition *= explodingProgress;

    // FALLING
    float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
    fallingProgress = clamp(fallingProgress, 0.0, 1.0);
    fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
    // Makes it fall down
    newPosition.y -= fallingProgress * 0.2;

    // SCALLING
    float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
    float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
    float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
    sizeProgress = clamp(sizeProgress, 0.0, 1.0);

    // TWINKLING -> making it simulate the mateiral burnin
    float twinklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
    twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
    // make sin() go from 0.0 to 1.0 instead of -1.0 to 1.0
    // in 3 seconds, so we multiply by 30.0
    float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5;
    //    `twinklingProgress`is 0.0 makes `sizeTwinkling` being 0.0 too,
    // so we must invert it
    // the particles life span should be different, but no higher than the
    // max animation value
    sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;

    // to avoid bugs we are going to hide the particle completely when `gl_PointSize`
    // is below 1.0  pixel by moving them away from the clip space
    if (gl_PointSize < 1.0) {
        gl_Position = vec4(9999.9);
    }

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Final size
    gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling; // Field of view is vertical so only y matters
    // ThreeJS formula for perspective
    gl_PointSize *= 1.0 / -viewPosition.z;
}
