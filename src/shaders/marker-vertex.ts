export const markerVertexShader = /* glsl */ `
attribute vec3 aFlatPosition;
attribute vec3 aSpherePosition;
attribute float aSize;
attribute float aPhase;
uniform float uMorph;
uniform float uTime;
uniform float uDpr;

varying float vDistToCamera;
varying float vPulse;

void main() {
  vec3 pos = mix(aFlatPosition, aSpherePosition, uMorph);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vDistToCamera = -mvPosition.z;

  float pulse = 0.5 + 0.5 * sin(uTime * 2.0 + aPhase);
  vPulse = pulse;
  gl_PointSize = aSize * (1.0 + pulse * 0.3) * uDpr;
}
`;
