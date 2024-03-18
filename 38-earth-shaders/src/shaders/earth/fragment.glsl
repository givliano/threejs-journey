uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(vUv, 1.0);

    // Sun ORIENTATION
    // How much the face of the mesh is oriented towards the sun direction
    float sunOrientation = dot(uSunDirection, normal);
    color = vec3(sunOrientation);

    // Day / night color
    float dayMix = smoothstep(- 0.25, 0.5, sunOrientation);
    // We want to show the day texture on one side and the night on the other
    // Pick the `color` on the `uDayTexture` using the `texture()` method and 
    // the `vUv`, do the same with `uNightTexture`. We only need the `rgb` channels.
    // pick the color according to the vUv
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    // We want to mix day and night according to a factor, so that the factor is `1.0`
    // on the side facing the sun and `0.0` on the other side.
    // Similar to the directional light. So we use the `dot product`.
    // dayMix goes from 0.0 to 1.0, and when it is 1.0 we get the second parameter
    color = mix(nightColor, dayColor, dayMix);

    // Specular clouds color
    // get the data from the `rg` channel by swizzling. The clouds are in the `green channel`.
    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;

    // Clouds
    // There's too much cloud in the texture, and we want less of it. The same thing was
    // done in the coffee lesson shader. We want to smoothstep it
    float cloudsMix = smoothstep(0.5, 1.0, specularCloudsColor.g);
    // The clouds in the dark side are white still. We could make them darker, but
    // they would occlude the city lights. So we use the `dayMix` to only show them on the day part
    cloudsMix *= dayMix;
    // Mix the color with `white` for the clouds data
    color = mix(color, vec3(1.0), cloudsMix);

    // FRESNEL
    // The atmosphere is more visible at the edges of the earth, so we will use the `Fresnel`,
    // like the HOLOGRAM lesson
    // Its a dot product of the viewDirection * normal;
    // if its going towards the camera we want 1.0. The camera vector (viewDirection) is perpendicular 
    // to the normal we want 0.0;
    // Remember that the dot product returns the opposite of what we want in the fresnel effect, so we add 1.0
    // We want to push/crush the value, so we use the power
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);
    
    // Atmosphere
    // It changes because at the poles the light travels more through the atmosphere to hit our camera
    // So we will create a gradient for the day (the part facing the camera at the front), the twilight
    // (the part at the poles - vertical and horizontal) and the night (the part behind). 
    // We will get atmosphere mixes but it won't be exactly the same as the dayMix, but the `white` part 
    // goes a bit beyond the `day` limit.
    float atmosphereDayMix = smoothstep(- 0.5, 1.0, sunOrientation);
    // get the dayColor when the atmosphereDayMix is 1.0
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    // FInal color
    // The atmosphere is way too visible on the night side of the Earth
    // We already have a variable lowering as it transitions to the night and thats the `atmosphereDayMix`
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    // SPECULAR
    // if the camera is aligned to the light reflection we want the reflection from the LIGHT
    // if `reflection` and `viewDirection` are aligned we want a high value, otherwise a small one
    // remember that `dot` send opposite vectors a -1.0 value, we want a 1.0 value. Watch `light shading` lesson
    vec3 reflection = reflect(- uSunDirection, normal);
    float specular = - dot(reflection, viewDirection);
    // Clamp it before applyinf the power
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);
    // Use the data in the texture to avoid the specular over the continents
    specular *= specularCloudsColor.r;

    // We want the `specular` to have the color of `atmosphereColor`, but only when that `specular` is on the edges,
    // to make it more realistic. It is white when the `specular` is at the center of the Earch
    // but at the edges it take the atmosphere color
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    color += specular * specularColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
