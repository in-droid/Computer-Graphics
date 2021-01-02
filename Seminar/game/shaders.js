const phong = {
    vertex : `#version 300 es
    layout (location = 0) in vec3 aPosition;
    layout (location = 1) in vec2 aTexCoord;
    layout (location = 2) in vec3 aNormal;

    uniform mat4 uMvpMatrix;
    uniform mat4 uProjection;
    uniform vec3 uLightPosition;
    uniform vec3 uLightAttenuation;

    out vec3 vEye;
    out vec3 vLight;
    out vec3 vNormal;
    out vec2 vTexCoord;
    out float vAttenuation;
    void main() {
        vec3 vertexPosition = (uMvpMatrix * vec4(aPosition, 1)).xyz;
        vec3 lightPosition = (uMvpMatrix * vec4(uLightPosition, 1)).xyz;
        vEye = -vertexPosition;
        vLight = lightPosition - vertexPosition;
        vNormal = (uMvpMatrix * vec4(aNormal, 0)).xyz;
        vTexCoord = aTexCoord;

        float d = distance(vertexPosition, lightPosition);
        vec3 attenuation = uLightAttenuation * vec3(1, d, d * d);
        vAttenuation = 1.0 / dot(attenuation, vec3(1, 1, 1));
        gl_Position = uMvpMatrix * vec4(aPosition, 1);
    }
`,
    fragment : `#version 300 es
    precision mediump float;

    uniform mediump sampler2D uTexture;

    uniform vec3 uAmbientColor;
    uniform vec3 uDiffuseColor;
    uniform vec3 uSpecularColor;
    uniform int  uAnimated;
    uniform float uChange;

    uniform float uShininess;

    in vec3 vEye;
    in vec3 vLight;
    in vec3 vNormal;
    in vec2 vTexCoord;
    in float vAttenuation;

    out vec4 oColor;

    void main() {
        vec3 N = normalize(vNormal);
        vec3 L = normalize(vLight);
        vec3 E = normalize(vEye);
        vec3 R = normalize(reflect(L, N));

        float lambert = max(0.0, dot(L, N));
        float phong = pow(max(0.0, dot(E, R)), uShininess);

        vec3 ambient = uAmbientColor;
        vec3 diffuse = uDiffuseColor * lambert;
        vec3 specular = uSpecularColor * phong;

        vec3 light = (ambient + diffuse + specular) * vAttenuation;
        if(uAnimated == 0) {
            oColor = texture(uTexture, vTexCoord) * vec4(light, 1);
        }
        else {
            float change = 0.5+abs(sin(uChange))*1.0;
            vec4 col = vec4(0, 50, 255, 1);
            oColor = mix(texture(uTexture, vTexCoord) * vec4(light, 1), col, change * 0.001);
        }
    }
    `,
}

const simple = {
    vertex : `#version 300 es
    layout (location = 0) in vec4 aPosition;
    layout (location = 1) in vec2 aTexCoord;
    uniform mat4 uMvpMatrix;
    out vec2 vTexCoord;
    void main() {
        vTexCoord = aTexCoord;
        gl_Position = uMvpMatrix * aPosition;
    }
    `,

    fragment : `#version 300 es
    precision mediump float;
    uniform mediump sampler2D uTexture;
    in vec2 vTexCoord;
    out vec4 oColor;
    void main() {
        oColor = texture(uTexture, vTexCoord);
    }
    `,
}

export default {
    simple, phong
};
/*
export default {
    phong: { vertex, fragment }
};
*/
//#gl_Position = uMvpMatrix * vec4(aPosition, 1);
// gl_Position = uProjection * vec4(vertexPosition, 1);