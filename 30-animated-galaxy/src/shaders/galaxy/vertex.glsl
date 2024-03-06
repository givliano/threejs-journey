uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main()
{
    // POSITION
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // SPIN (works because galaxy is at center of the scene)
    // We calculate the particle angle and its distance to the center
    // We increase the angle according to the `uTime` and the distance
    // We update the position according to that new angle

    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    // makes the further particles from the center move slower than
    // the ones close to the center
    // uTime is too strong so we make it lower by the multiplication
    float angleOffset = (1.0 / distanceToCenter) * (uTime * 0.2);
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // Randomness
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    modelPosition.y += uTime;
    gl_Position = projectionPosition;

    // SIZE
    gl_PointSize = uSize * aScale;
    // apply size attenuation as in the three.js docs
    // so particles close to screen are bigger
    // 1.0 is the `scale`
    // `viewPosition` is the mvPosition aka movelViewPosition
    gl_PointSize *= (1.0 / - viewPosition.z);

    // COLOR
    vColor = color;

  }
