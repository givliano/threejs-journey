uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

#include ../includes/simplexNoise4d.glsl

// add minimal code for fragment shader code to paint each pixel read
// also, add one file for each variable
void main() {
  float time = uTime * 0.2;
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
  vec4 base = texture(uBase, uv); // get the texture data at the uv;

  // Dead (particle)
  if (particle.a >= 1.0)
  {
    // FIXES FOR INACTIVE TABS: MOD and FRACT
    // we don't put it back to 0.0 in reset, we put it somewhere else.
    particle.a = mod(particle.a, 1.0);
    // particle.a = fract(particle.a);
    // We need to get the original position from the `baseParticlesTexture` uniform in `uBase`.
    particle.xyz = base.xyz;
  }
  else 
  {
    // Control the strength of the Flow Field
    // Add 1.0 to get a different value from the simplexes below in the flowField
    // multiply the base by 2.0 to animate bigger chunks
    float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
    // We remap the uFlowFieldInfluence value from 0.0 to 1.0 to +1.0 to -1.0
    float influence = (uFlowFieldInfluence - 0.5) * (- 2.0);
    // Avoid a - 1.0 value in the strength
    strength = smoothstep(influence, 1.0, strength);

    // Flow field
    // the direction the particles should move
    // offset the y and the z so that we send different values and then we dont get a diagonal.
    // To avoid the particles getting stuck in a local loop we add a fourth value in the Simples noise
    vec3 flowField = vec3(
      simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time)),
      simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
      simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
    );
    // Its a direction, so we should normalize it like it always should be
    flowField = normalize(flowField);
    particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength; // use Delta Time to fix framerate

    // DECAY
    // we will use the `alpha` channel to save the "life" of the particle
    // it will start at `0.0`
    // it will increase with each frame
    // when reaching `1.0`, it will reset itself to the initial position and have its
    // `a` back to `0.0`
    // we will use a condition to know when the particle is dead.
    particle.a += uDeltaTime * 0.3;
  }

  // gl_FragColor ALAWYS at end
  gl_FragColor = particle;
}
