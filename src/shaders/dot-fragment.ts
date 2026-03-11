export const dotFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uMaxDist;

varying float vDistToCamera;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;

  float distFade = clamp(1.0 - (vDistToCamera - uMaxDist * 0.5) / (uMaxDist * 0.5), 0.0, 1.0);
  float alpha = smoothstep(0.5, 0.15, d) * distFade;
  alpha = max(alpha, 0.35 * step(d, 0.35) * distFade);
  gl_FragColor = vec4(uColor * alpha, 1.0);
}
`;
