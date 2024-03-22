uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

attribute float aIntensity;
attribute float aAngle;

varying vec3 vColor;

// Here a vertex is each particle. A particle is consisted of many different fragments (the `pixels`);
void main()
{
    // Displacement
    vec3 newPosition = position;
    float displacementIntensity = texture(uDisplacementTexture, uv).r;
    // Ignore everything below 0.1 to avoid the bug from canvas fade off never going full to 0.0
    // Also make everything above 0.3 be considered 1.0 so that particles stay up
    displacementIntensity = smoothstep(0.1, 0.3, displacementIntensity);

    // move them on the xyz axes
    vec3 displacement = vec3(
        // we send the same angle as `sin` and `cos` to get a circle
        cos(aAngle) * 0.2,
        sin(aAngle) * 0.2,
        1.0
    );
    displacement = normalize(displacement);
    // If the pixel is black the dispalcement is 0.0
    // if the pixel is white the displacement is 1.0
    displacement *= displacementIntensity;
    displacement *= 3.0; // makes the effect bigger
    displacement *= aIntensity;

    newPosition += displacement;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Picture
    // Use the `texture()` to pick the color from `uPictureTexture` at the `uv`
    // coordinates and swizzle the `r` channel
    float pictureIntensity = texture(uPictureTexture, uv).r;

    // Point size
    gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = vec3(pow(pictureIntensity, 2.0)); // `pow` to crush the values
}
