import { BlendFunction, Effect } from 'postprocessing';
import { Uniform } from 'three';

// NOTE we are using the WebGL2 syntax:
// * `const`: the parameter is not writable
// * `in`: it's a copy of the actual variable and changing it won't affect the initial variable
// * `out`: changing this value will change the original variable
//const in vec4 inputColor, // current colot for that pixel defined in previous effect
//const in vec2 uv, // render coordinates
//out vec4 outputColor // what we need to change to apply the effect
//inout vec2 uv // `inout` means we can both read it and write it

const fragmentShader = /* glsl */`
    uniform float frequency;
    uniform float amplitude;
    uniform float offset;

    void mainUv(inout vec2 uv)
    {
        uv.y += sin(uv.x * frequency + offset) * amplitude;
    }

    void mainImage(
        const in vec4 inputColor,
        const in vec2 uv,
        out vec4 outputColor
    )
    {
       outputColor = vec4(0.8, 1.0, 0.5, inputColor.a);
    }
`

export default class DrunkEffect extends Effect {
    // NOTE our shader can be implemented in a function that must be names `mainImage`,
    // return `void` and have the following very specific parameters
    constructor({ frequency, amplitude, blendFunction = BlendFunction.DARKEN }) {
        super(
            'DrunkEffect',
            fragmentShader,
            {
                blendFunction,
                uniforms: new Map([
                    [ 'frequency', new Uniform(frequency) ],
                    [ 'amplitude', new Uniform(amplitude) ],
                    [ 'offset', new Uniform(0) ]
                ])
            }
        );
    }

    update(renderer, inputBuffer, deltaTime) { // base `postprocessing` method called on each frame
        this.uniforms.get('offset').value += deltaTime;
    }
}
