// `value` the value you want to remap
// `originMin` and `originMax`: the start and end of the original range
// `destinationMin` and `destinationMax`: the start and end of the destination range
// doesn't clamp the value, so it goes above 0.1 if not clampped
float remap(
    float value,
    float originMin,
    float originMax,
    float destinationMin,
    float destinationMax
)
{
    return destinationMin + ((value - originMin) * (destinationMax - destinationMin)) / (originMax - originMin);
}
