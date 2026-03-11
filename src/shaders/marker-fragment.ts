export const markerFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uSelfColor;
uniform float uMaxDist;

varying float vDistToCamera;
varying float vPulse;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;

  float distFade = clamp(1.0 - (vDistToCamera - uMaxDist * 0.5) / (uMaxDist * 0.5), 0.0, 1.0);

  float core = smoothstep(0.5, 0.0, d);
  float glow = exp(-d * 4.0);
  float alpha = mix(glow, core, 0.5) * distFade;
  alpha *= 0.6 + vPulse * 0.4;

  vec3 color = mix(uColor, vec3(1.0), core * 0.3);
  gl_FragColor = vec4(color, alpha);
}
`;
