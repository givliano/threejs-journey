uniform float uSize;

attribute float aScale;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    // SIZE
    gl_PointSize = uSize * aScale;
    // apply size attenuation as in the three.js docs
    // so particles close to screen are bigger
    // 1.0 is the `scale`
    // `viewPosition` is the mvPosition aka movelViewPosition
    gl_PointSize *= (1.0 / - viewPosition.z);
}
