uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main() {
  // Create another variable because its easier than altering one
  vec2 smokeUv = vUv;
  // Make the resolution worse by making the texture bigger
  smokeUv.x *= 0.5;
  smokeUv.y *= 0.3;
  smokeUv.y += uTime;
  if (smokeUv.y > 1.0) {
    smokeUv.y = 0.0;
  }
  // Smoke
  // we only get the `r` channel because it is a grayscale image,
  // so rgb are all the same.
  float smoke = texture(uPerlinTexture, smokeUv).r;

  // To use white as color and the texture to make it transparent
  // we must make the material allow transparency by setting it in THREE
  gl_FragColor = vec4(1.0, 1.0, 1.0, smoke);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
