void main()
{
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

    gl_FragColor = vec4(uv, 1.0, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
