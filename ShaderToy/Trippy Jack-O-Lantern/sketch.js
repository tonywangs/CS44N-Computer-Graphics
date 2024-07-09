float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdEquilateralTriangle( in vec2 p, in float r )
{
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0*r, 0.0 );
    return -length(p)*sign(p.y);
}

float sdUnevenCapsule( vec2 p, float r1, float r2, float h )
{
    p.x = abs(p.x);
    float b = (r1-r2)/h;
    float a = sqrt(1.0-b*b);
    float k = dot(p,vec2(-b,a));
    if( k < 0.0 ) return length(p) - r1;
    if( k > a*h ) return length(p-vec2(0.0,h)) - r2;
    return dot(p, vec2(a,b) ) - r1;
}

float sdEllipse( in vec2 p, in vec2 ab )
{
    p = abs(p); if( p.x > p.y ) {p=p.yx;ab=ab.yx;}
    float l = ab.y*ab.y - ab.x*ab.x;
    float m = ab.x*p.x/l;      float m2 = m*m; 
    float n = ab.y*p.y/l;      float n2 = n*n; 
    float c = (m2+n2-1.0)/3.0; float c3 = c*c*c;
    float q = c3 + m2*n2*2.0;
    float d = c3 + m2*n2;
    float g = m + m*n2;
    float co;
    if( d<0.0 )
    {
        float h = acos(q/c3)/3.0;
        float s = cos(h);
        float t = sin(h)*sqrt(3.0);
        float rx = sqrt( -c*(s + t + 2.0) + m2 );
        float ry = sqrt( -c*(s - t + 2.0) + m2 );
        co = (ry+sign(l)*rx+abs(g)/(rx*ry)- m)/2.0;
    }
    else
    {
        float h = 2.0*m*n*sqrt( d );
        float s = sign(q+h)*pow(abs(q+h), 1.0/3.0);
        float u = sign(q-h)*pow(abs(q-h), 1.0/3.0);
        float rx = -s - u - c*4.0 + 2.0*m2;
        float ry = (s - u)*sqrt(3.0);
        float rm = sqrt( rx*rx + ry*ry );
        co = (ry/sqrt(rm-rx)+2.0*g/rm-m)/2.0;
    }
    vec2 r = ab * vec2(co, sqrt(1.0-co*co));
    return length(r-p) * sign(p.y-r.y);
}

float sdRectangle( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

// Draw a Jack'o Lantern
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    vec2 r =  2.0*vec2(fragCoord.xy - 0.5*iResolution.xy)/iResolution.y;

    // Background
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    // ground
    col = mix(col, 0.5*vec3(150./255., 75./255., 0.), 1.-smoothstep(0.19, 0.25, uv.y));
    
    // Body 
    col = mix(col, vec3(0.9,0.5,0.), smoothstep(0.,0.03, -sdCircle(r, 0.9)));
    
    vec3 cInside = vec3(1., 1., 0.);
    vec2 rMirrorX = vec2(abs(r.x), r.y); 
    vec2 rMirrorY = vec2(r.x, abs(r.y)); 
    
    // Carve eyes
    float eyes = smoothstep(0., 0.01, -sdCircle(rMirrorX - vec2(0.35, 0.4), 0.1));
    col = mix(col, cInside, eyes);
    
    // Carve nose
    float nose     = smoothstep(0., 0.01, -sdEquilateralTriangle(r, 0.2));
    float noseSide = smoothstep(0., 0.01, -sdEllipse(r, vec2(0.2,0.1)));
    nose = max(nose,noseSide);
    col  = mix(col, cInside, nose);
    
    // Carve mouth
    float mouth = smoothstep(0., 0.01, -sdEllipse(r - vec2(0., -0.5), vec2(0.5, 0.05)));
    col = mix(col, cInside, mouth);
    
    
    // Carve stem
    float stem = smoothstep(0., 0.03, -sdRectangle(r-vec2(0.0, 1.0), vec2(0.2, 0.3)));
    col = mix(col, vec3(150./255., 75./255., 0.), stem);
    
    // Output to screen
    fragColor = vec4(col,1.0);
}
