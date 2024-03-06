varying vec2 vUv;

void main() 
{
  // Final position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vUv = uv;
}
