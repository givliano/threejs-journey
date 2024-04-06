uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;
// varying vec2 vUv;
attribute vec4 tangent;

varying float vWobble;

#include ../includes/simplexNoise4d.glsl

float getWobble(vec3 position)
{
  // Create the `warping` effect
  vec3 warpedPosition = position;
  warpedPosition += simplexNoise4d(
    vec4(
      position * uWarpPositionFrequency,
      uTime * uWarpTimeFrequency
    )
  ) * uWarpStrength;;

  // IMPLEMENT WOBBLE
  // Use the 3D position as the base input and use the fourth dimension
  // to make it vary in time (4D)
  return simplexNoise4d(vec4(
    warpedPosition * uPositionFrequency, // XYZ
    uTime * uTimeFrequency         // W
  )) * uStrength;
}

void main()
{
  // csm_Position.y += sin(csm_Position.x * 3.0) * 0.5;

  // Varyings
  // vUv = uv;

  // Cross gives the cross vector, like the right hand rule
  vec3 biTangent = cross(normal, tangent.xyz);

  // Neighbours position
  // Tangent for neighbours A
  // Bitangent for neighbour B
  // First, how far to look for neighbours?
  // This is the float shift variable
  float shift = 0.01;
  vec3 positionA = csm_Position + tangent.xyz * shift;
  vec3 positionB = csm_Position + biTangent.xyz * shift;

  // WOBBLE
  float wobble = getWobble(csm_Position);

  // Multiply by the normal to move according to it.
  // Like in the `raging sea` lesson, there will be a problem with the shades,
  // because the normals are calculate from the `base geometry`. So we need to use
  // the same technique as in that class, the `neighbours technique`, to compute the normal.
  // Things are more complicated because its not a `plane`, but a `sphere`. We want to make it
  // work with any imported geometry.
  // Fortunately, when it comes to 3D geometries, the two vectors going toward the neighbours
  // we are looking for are well known: `TANGENT` and `BITANGENT`.
  // If the `normal` goes up towards the screen, the `tangent` would go UP and the `bitangent` would go right.
  // THREE.JS already created a `tangent` attribute.
  csm_Position += wobble * normal;
  positionA += getWobble(positionA) * normal;
  positionB += getWobble(positionB) * normal;
  // To get a vector between one vector and another vector we subtract them
  
  // COmpute normal
  // Normalize because we want the direction
  // Get the direction from the position to the neighbor
  vec3 toA = normalize(positionA - csm_Position);
  vec3 toB = normalize(positionB - csm_Position);
  // The vector perpendicular to `toA` and `toB` directions is the `new normal`!
  csm_Normal = cross(toA, toB);

  // Divide by uStrength to get the original range before multiplying by the uStrength (0.0 to 1.0);
  vWobble = wobble / uStrength;

  // NOTE
  // To handle shadows, three.js renders the scene seen from the light in an
  // off-screen texture (FBO) with all the materials replaced by a `MeshDepthMaterial`
  // Using that render, three.js determines if the surface is in the shade or not.
  // We need to manually update the `MeshDepthMaterial` for the shadows to work perfectly.
  // We enhance it like the normal material with CSM
}
