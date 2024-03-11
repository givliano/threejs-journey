varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Varying
    // WE CANT JUST SEND THE NORMALS LIGHT THIS WITHOUT TRANSFORMING THEM WITH THE MATRIX
    // Otherwise the light will follow the objects rotation
    // MODEL NORMAL
    // we set the fourth value as `0.0` because it is not a homogeneous vector
    // and shouldn't be applied the translation transformation
    // we only want the `rotation` transformation to be applied (we will deal with the scaling transformation later);
    // we then swizzle `xyz`:w
    // bear in mind that the dot product can return values below 0.0 and we don't want them (they cause bugs/artifacts)
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    vNormal = modelNormal.xyz;
    vPosition = modelPosition.xyz;
}

