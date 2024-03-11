// Ambient light
// a uniform light on the surface of the objects, regardless of their orientation
// not realistc
// in small doses, it helps ligthen up the part of the objects in the shader
vec3 ambientLight(vec3 lightColor, float lightIntensity)
{
    // since lights can be colored it will be a vec3
    return lightColor * lightIntensity;
}
