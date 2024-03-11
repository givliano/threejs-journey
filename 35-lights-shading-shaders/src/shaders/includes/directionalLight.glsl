// Directional Light
// Similar to ambient light, but the intensity varies according to the orientation
// of the face and the direction of the light
// if the face faces the light it will receive the full power
// if the face is at a perfect 90deg angle it won't receive any
// values in between are interpolated
// 
// We must compare the face orientation (the normal of the obkect)
// to the light direction.
// We send the light position and calculate the orientation from it (its easier than calculating the direction)
// The difference and why we want the direction in the end is that the direction is `normalized`
// It also has the `specular` which is the light itself reflecting on the surface of the object
// for the `specular` we will compare the view vector to the light. the more they are aligned, the more specular we'll get
vec3 directionalLight(
    vec3 lightColor, 
    float lightIntensity, 
    vec3 normal, 
    vec3 lightPosition,
    vec3 viewDirection, 
    float specularPower
)
{
    vec3 lightDirection = normalize(lightPosition);
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

    // since lights can be colored it will be a vec3
    // lightColot and lightIntensity must affect the shading and the specular
    return lightColor * lightIntensity * (shading + specular);
}
