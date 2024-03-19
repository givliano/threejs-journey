uniform vec2 uResolution;
uniform sampler2D uPictureTexture;

varying vec3 vColor;

// Here a vertex is each particle. A particle is consisted of many different fragments (the `pixels`);
void main()
{
    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
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
