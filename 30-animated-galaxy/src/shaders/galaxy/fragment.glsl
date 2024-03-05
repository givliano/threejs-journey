void main()
{
    // Disc pattern
    // algorithm to get the distance between the center and the border
    // so that we draw the particle properly instead of a square
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // get circles shape
    // strength = step(0.5, strength); // gets the square with the circled center in black
    // strength = 1.0 - strength; // get the circled center

    // Diffuse point pattern
    // It's a LINEAR DIFFUSE algorithm
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength *= 2.0; // make it go from 0.5 to 1.0 to achieve maximum amplitude (normalize it)
    // strength = 1.0 - strength;

    // Light Point Pattern
    // get the distance and invert it
    // LOOKS BETTER because its not a linear diffuse, fades faster
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    gl_FragColor = vec4(vec3(strength), 1.0);
    #include <colorspace_fragment>;
}
