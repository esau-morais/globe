export const atmosphereFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float fresnel = 1.0 - dot(vNormal, vViewDir);
  float intensity = pow(fresnel, 5.0) * uIntensity;
  gl_FragColor = vec4(uColor, intensity);
}
`;
