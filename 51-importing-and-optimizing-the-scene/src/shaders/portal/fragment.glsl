uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

varying vec2 vUv;

#include ../includes/perlinNoise2d.glsl

void main()
{
  // Displace the UV coordinates
  vec2 displacedUv = vUv + cnoise(vec3(vUv * 5.0, uTime * 0.1));

  // Perlin noise
  float strength = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));

  // Outer glow
  float outerGlow = distance(vUv, vec2(0.5)) * 5.0 - 1.4; // make it white at the border and dark in the center
  strength += outerGlow;

  // Apply a cool step
  strength += step(- 0.2, strength) * 0.8;

  // The noise can be above 1.0 and below 1.0, so we clamp it
  strength = clamp(strength, 0.0, 1.0);

  // FInal color
  vec3 color = mix(uColorStart, uColorEnd, strength);

  gl_FragColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}
