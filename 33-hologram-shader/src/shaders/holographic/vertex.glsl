void main() {
    // Position
    // Separate it so we can change the modelMatrix
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Final position
    vec4 projectionMatrix = projectionMatrix * viewMatrix * modelPosition;
}
