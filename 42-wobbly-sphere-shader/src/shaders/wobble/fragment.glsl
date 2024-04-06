uniform vec3 uColorA;
uniform vec3 uColorB;

// varying vec2 vUv;
varying float vWobble;

void main()
{
  // This loses the shading in the material (darker parts, shadows, etc).
  // csm_FragColor.rgb = vec3(1.0, 0.5, 0.5);
  // This preserves the shading
  // csm_DiffuseColor.rgb = vec3(vUv, 1.0);

  // Create stripes around the ball
  // Add `0.5` to offset where the 0 and the 1 from the `sin` are, which creates a `stair like effect`.
  // csm_Metalness = step(0.0, sin(vUv.x * 100.0 + 0.5));
  // Create a mirror like effect on the stripes
  // csm_Roughness = 1.0 - csm_Metalness;

  // COLOR
  // csm_FragColor.rgb = vec3(vWobble);
  // CUrrently vWobble goes from -1.0 to 1.0, so we remap with smoothstep it to go from 0.0 to 1.0.
  float colorMix = smoothstep(- 1.0, 1.0, vWobble);
  csm_DiffuseColor.rgb = mix(uColorA, uColorB, colorMix);

  // Mirror step if vWobble is higher than 0.25 it will be pure mirror
  // csm_Metalness = step(0.25, vWobble);
  // csm_Roughness = 1.0 - csm_Metalness;

  // Make the tip of the wobble shinier
  csm_Roughness = 1.0 - colorMix;
}
