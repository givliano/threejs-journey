// Directional light
// differences: we consider that the light comes from a point (not a direction)
// we want the light to decay
vec3 pointLight(
    vec3 lightColor, 
    float lightIntensity, 
    vec3 normal, 
    vec3 lightPosition,
    vec3 viewDirection, 
    float specularPower,
    vec3 position, // the fragments position
    float lightDecay
)
{
    // Subtract the `position` (fragments position) from `lightPosition` to get the vector from the
    // fragment to the light
    // We need to know how far the surface is from the light
    // since `lightDelta` is a vector from the fragment position to the light, its
    // length is the distance we need
    vec3 lightDelta = lightPosition - position;
    float lightDistance = length(lightDelta);
    vec3 lightDirection = normalize(lightDelta);
    // Returns a reflected vector, like a mirror, but we want it from the light
    // to the object (in this direction), but it returns from the object to the light (not what we want).
    // We must invert it
    // when we want the opposite vector we put minus in front
    vec3 lightReflection = reflect(- lightDirection, normal);

    // Shading
    // Dot products gives what we want, 0 for perpendicular vectors and 1 for straight ones
    float shading = dot(normal, lightDirection);
    shading = max(0.0, shading); // clamp the value between 0.0 and shading

    // Specular
    // The dot product returns - 1.0 when the vector are opposite (the vector from the reflection of the light
    // on the object and the vector from the camera to the object). This is not what we want, which is a 1.0 in
    // this situation. So we invert it. But after inverting it we will get - 1.0 to the back of the object, 
    // thats why there's a specular behind the object if we dont treat it. So we clamp it with `max`.
    float specular = - dot(lightReflection, viewDirection);
    specular = max(0.0, specular);
    // We crush it with the exponential.
    specular = pow(specular, specularPower);

    // Decay
    // we want a value of `1.0` when distance is `0` and reduce it progressively
    float decay = 1.0 - lightDistance * 0.3;
    decay = max(0.0, decay);

    // since lights can be colored it will be a vec3
    // lightColot and lightIntensity must affect the shading and the specular
    return lightColor * lightIntensity * decay * (shading + specular);
}
