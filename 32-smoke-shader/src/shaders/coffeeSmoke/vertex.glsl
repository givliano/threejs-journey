uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

#include ../includes/rotate2D.glsl

void main()
{
    vec3 newPosition = position;

    // Twist
    // Picks a value halfway width of the texture, according to the height
    // then lower its value by 1/5 and animate it with time
    float twistPerlin = texture(
        uPerlinTexture, 
        vec2(0.5, (uv.y * 0.2 - uTime * 0.005))
    ).r;
    float angle = twistPerlin * 10.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    // Follows the same idea as the twist
    // But going from - 0.5 to 0.5 since its a wind
    vec2 windOffset = vec2(
        texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5, 
        texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
    );
    // applies the power * 2 function to make it slower at the bottom
    // and stronger at the top
    windOffset *= pow(uv.y, 2.0) * 10.0;

    newPosition.xz += windOffset;

    
    // Final position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}
