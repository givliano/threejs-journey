varying vec2 vUv;
uniform float uTime;
varying float vTime;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
    vTime = uTime;
}
