varying vec3 vPosition;

void main()
{
  // csm_Position is before any transformations, so it will follow the object

  vPosition = csm_Position.xyz;
}
