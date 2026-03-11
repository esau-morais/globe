export const dotVertexShader = /* glsl */ `
attribute vec3 aFlatPosition;
attribute vec3 aSpherePosition;
uniform float uMorph;
uniform float uPointSize;

varying float vDistToCamera;

void main() {
  vec3 pos = mix(aFlatPosition, aSpherePosition, uMorph);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vDistToCamera = -mvPosition.z;
  gl_PointSize = uPointSize;
}
`;
