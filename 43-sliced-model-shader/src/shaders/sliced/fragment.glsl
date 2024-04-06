uniform float uSliceStart;
uniform float uSliceArc;

varying vec3 vPosition;

void main()
{
  // Discard fragments which are positioned INSIDE the area

  // SLICING
  // NOTE
  // We want to slice according tot he radial coordinates
  // Like removing a slice of a cake. The model is aligned with the `z-axis`
  // We can focus on the `x` and the `y` axes with some trigonometry using the `arc tangent`
  // float uSliceStart = 1.0;
  // float uSliceArc = 1.5;

  // Goes from 0 to PI anti-clockwise, and from 0 to -PI clockwise
  float angle = atan(vPosition.y, vPosition.x);

  // Rotate the `angle` so that its `0.0` is where the slicing `should` start.
  angle -= uSliceStart;
  angle = mod(angle, PI2);

  // We can use mod because it returns the difference between a negative value
  // to the `threshold` we want. so mod(-0.25, 1.0) returns 0.75;

  // We can compare `uSliceStart`, `uSliceArc`, `angle`
  // if `angle` is more than `uSliceStart` and `angle` is less than 
  // `usliceStart + uSliceArc`, it means that `angle` is in the sliced area
  // and we can call `discard`
  if (angle > 0.0 && angle < uSliceArc) {
    discard;
  }

  float csm_Slice;
}
