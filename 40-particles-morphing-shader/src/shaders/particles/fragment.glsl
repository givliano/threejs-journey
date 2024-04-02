varying vec3 vColor;

void main()
{
    vec2 uv = gl_PointCoord;
    // use the `length` technique to create a dot at the center of the fragment
    float distanceToCenter = length(uv - 0.5);
    // distanceToCenter goes from 0 in the center to 0.5 at the edge
    // this `alpha` generating a circular particle which illuminates only until the edge
    // at the middle of the sides (so it is round) is always like this:
    // a small number divided by the distanceToCenter and then subtracted by twice the small number.
    // This can be seen on class 40 at minute 12
    float alpha = 0.05 / distanceToCenter - 0.1;

    gl_FragColor = vec4(vColor, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
