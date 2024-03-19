void main()
{
    vec2 uv = gl_PointCoord;
    // Get the distance of the FRAGMENT to the center of the PARTICLE
    float distanceToCenter = distance(uv, vec2(0.5));
    // its the same thing as below, but better
    // float distanceToCenter = length(uv - vec2(0.5));
    // DISCARD: prevent the fragment from being drawn
    // it can have a performance impact because for the gpu to know if something
    // is in front of each other the discared fragment can be a trouble
    if (distanceToCenter > 0.5) discard;

    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
