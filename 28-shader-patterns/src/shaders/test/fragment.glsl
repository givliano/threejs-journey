varying vec2 vUv;

void main()
{
    gl_FragColor = vec4(1.0 * vUv.x, (0.0 + vUv.y), (1.0 + vUv.y), 1.0);

}
