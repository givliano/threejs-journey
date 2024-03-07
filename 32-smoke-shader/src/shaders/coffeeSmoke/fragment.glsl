uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main() {
    // Create another variable because its easier than altering one
    vec2 smokeUv = vUv;
    // Make the resolution worse by making the texture bigger
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.02;
    // Smoke
    // we only get the `r` channel because it is a grayscale image,
    // so rgb are all the same.
    float smoke = texture(uPerlinTexture, smokeUv).r;

    // Remap smoke to make threshold for transparent higher
    smoke = smoothstep(0.4, 1.0, smoke);

    // Makes edges of texture smooth
    //smoke = 1.0;
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.4, vUv.y);

    // To use white as color and the texture to make it transparent
    // we must make the material allow transparency by setting it in THREE
    gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
