vec2 rotate2D(vec2 value, float angle)
{
    float c = cos(angle);
    float s = sin(angle);
    mat2 m = mat2(
            c, -s,
            s, c
        );

    return m * value;
}
