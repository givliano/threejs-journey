#include ../includes/simplexNoise4d.glsl

// add minimal code for fragment shader code to paint each pixel read
// also, add one file for each variable
void main() {
  // we want to pick the colors from that `uParticles`
  // We need the UV coordinated and we can get them 
  // with the formula `gl_FragCoord.xy` / `resolution.xy`, 
  // The gl_FragCoord is the screen coordinates,
  // the resolution contains the size of the render and so we get `0.0` and `1.0` UV coordinates
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  // Pick the pixels from the `uParticlesTexture`
  // Consider `particle` the `particle coordinates`, the data associated with the particles
  // Each pixel is a particle and its coordinates
  vec4 particle = texture(uParticles, uv);

  // Flow field
  // the direction the particles should move
  // offset the y and the z so that we send different values and then we dont get a diagonal
  vec3 flowField = vec3(
    simplexNoise4d(vec4(particle.xyz + 0.0, 0.0)),
    simplexNoise4d(vec4(particle.xyz + 1.0, 0.0)),
    simplexNoise4d(vec4(particle.xyz + 2.0, 0.0))
  );
  // Its a direction, so we should normalize it like it always should be
  flowField = normalize(flowField);
  particle.xyz += flowField * 0.01;

  gl_FragColor = particle;
}
