uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun ORIENTATION
    // How much the face of the mesh is oriented towards the sun direction
    float sunOrientation = dot(uSunDirection, normal);

    // Atmosphere
    float atmosphereDayMix = smoothstep(- 0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    // Lower the alpha where the atmosphere is in the dark.
    // We need it to lower fast at the very edge of the sphere but also on the night side
    // From the center of the earth to the edge of the atmosphere is 1, for the fresnel
    // From the edge of the earth until the edge of the atmosphere is 0 for the fallof
    // Its like the hologram lesson
    color += atmosphereColor;

    // Edge alpha
    float edgeAlpha = dot(viewDirection, normal);
    // Push the gradient to the edge with remap
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    // Day alpha
    float dayAlpha = smoothstep(- 0.5, 0.0, sunOrientation);

    float alpha = edgeAlpha * dayAlpha;

    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
