const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 3) in vec2 aTexCoord;

uniform mat4 uModelViewProjection;
uniform mat4 uModelMatrix;

out vec3 vPosition;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    
    vPosition = (uModelMatrix * vec4(aPosition.xyz, 1)).xyz;
    vNormal = mat3(uModelMatrix) * aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uModelViewProjection * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;
precision mediump sampler2D;

uniform sampler2D uBaseColorTexture;
uniform vec4 uBaseColorFactor;
uniform bool useLight;

uniform vec3 uCameraPosition;
struct Light {
    vec3 position;
    vec3 attenuation;
    vec3 color;
};

struct Material {
    float diffuse;
    float specular;
    float shininess;
};

uniform Light uLight;
uniform Material uMaterial;


in vec2 vTexCoord;
in vec3 vPosition;
in vec3 vNormal;

out vec4 oColor;

void main() {
    vec4 baseColor = vec4(texture(uBaseColorTexture, vTexCoord).rgb, 1);

    vec3 surfacePosition = vPosition;

    float d = distance(surfacePosition, uLight.position);
    float attenuation = 1.0 / dot(uLight.attenuation, vec3(1, d, d * d));

    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLight.position - surfacePosition);
    vec3 V = normalize(uCameraPosition - surfacePosition);
    vec3 R = normalize(reflect(-L, N));

    float lambert = max(0.0, dot(L, N)) * uMaterial.diffuse;
    float phong = pow(max(0.0, dot(V, R)), uMaterial.shininess) * uMaterial.specular;

    vec3 diffuseLight = lambert * attenuation * uLight.color;
    vec3 specularLight = phong * attenuation * uLight.color;

    const float gamma = 2.2;
    vec3 albedo = pow(baseColor.rgb, vec3(gamma));
    vec3 finalColor = albedo * diffuseLight + specularLight;

    oColor = baseColor * uBaseColorFactor;
    if(useLight) {
        oColor = pow(vec4(finalColor, 1), vec4(1.0 / gamma));
    }
}
`;

export const shaders = {
    simple: { vertex, fragment }
};
