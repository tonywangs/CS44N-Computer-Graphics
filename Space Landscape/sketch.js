const float SAFEMARCH = 0.7;

float opUnion( float d1, float d2 ) {  return min(d1,d2); }
vec4  opUnion(vec4 d1, vec4 d2) {
 return (d1.x < d2.x ? d1 : d2);   
}

float dot2( in vec2 v ) { return dot(v,v); }
float dot2( in vec3 v ) { return dot(v,v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }

vec3 rotate_y(vec3 v, float angle)
{
	float ca = cos(angle); float sa = sin(angle);
	return v*mat3(
		+ca, +.0, -sa,
		+.0,+1.0, +.0,
		+sa, +.0, +ca);
}
vec3 rotate_x(vec3 v, float angle)
{
	float ca = cos(angle); float sa = sin(angle);
	return v*mat3(
		+1.0, +.0, +.0,
		+.0, +ca, -sa,
		+.0, +sa, +ca);
}
vec3 rotate_z(vec3 v, float angle)
{
	float ca = cos(angle); float sa = sin(angle);
	return v*mat3(
		+ca, -sa, +.0,
		+sa, +ca, 0.,
		+.0, +.0, 1.);
}

vec3 hash( vec3 p ) // replace this by something better
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
			  dot(p,vec3(269.5,183.3,246.1)),
			  dot(p,vec3(113.5,271.9,124.6)));

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec3 p )
{
    vec3 i = floor( p );
    vec3 f = fract( p );
	
	vec3 u = f*f*(3.0-2.0*f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}
float fbm(in vec3 pos) {
    mat3 m = mat3( 0.00,  0.80,  0.60,
                    -0.80,  0.36, -0.48,
                    -0.60, -0.48,  0.64 );
    vec3 q = 8.0*pos;
    float f  = 0.5000*noise( q ); q = m*q*2.01;
    f += 0.2500*noise( q ); q = m*q*2.02;
    f += 0.1250*noise( q ); q = m*q*2.03;
    f += 0.0625*noise( q ); q = m*q*2.01;
    return f;
}


float sdSphere( vec3 p, float r )
{
  return length(p)-r;
}
float sdPlane( vec3 p, vec3 n, float h )
{
  // n must be normalized
  return dot(p,n) + h;
}
float sdDeathStar( in vec3 p2, in float ra, float rb, in float d )
{
  // sampling independent computations (only depend on shape)
  float a = (ra*ra - rb*rb + d*d)/(2.0*d);
  float b = sqrt(max(ra*ra-a*a,0.0));
	
  // sampling dependant computations
  vec2 p = vec2( p2.x, length(p2.yz) );
  if( p.x*b-p.y*a > d*max(b-p.y,0.0) )
    return length(p-vec2(a,b));
  else
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}

// SDF representation of our scene. Model things here.
float map(vec3 p) {
    // Space landscape 
    float ground = 4.5 * p.y + 0.1 * sin(p.x * 5.0) + 0.1 * sin(p.z * 5.0); 
    float hill1 = length(p - vec3(0.0, 0.3, 0.0)) - 0.15; 
    float hill2 = length(p - vec3(0.4, 0.3, 0.3)) - 0.1; 
    float hill3 = length(p - vec3(-0.4, 0.3, -0.3)) - 0.1; 
    return min(ground, min(hill1, min(hill2, hill3))); 
}

// SDF and color of nearby surface.
// .x: SDF value
// .yzw: RGB values
vec4 mapV4(vec3 p) {
    float terrain = map(p);
    if (terrain < 0.0) {
        return vec4(terrain, vec3(0.2, 0.8, 0.2)); 
    } else {
        return vec4(terrain, vec3(0.8, 0.7, 0.6)); 
    }
}

vec3 calcNormal( in vec3 p ) // for function f(p)
{
    const float eps = 0.0001; // or some other value
    const vec2 h = vec2(eps,0);
    return normalize( vec3(map(p+h.xyy) - map(p-h.xyy),
                           map(p+h.yxy) - map(p-h.yxy),
                           map(p+h.yyx) - map(p-h.yyx) ) );
}


// March along ray (ro,rd) from t=tmin to tmax and return distance achieved. 
float raymarch(vec3 ro, vec3 rd, float tmin, float tmax) {

    for(float t=tmin; t<tmax; ) {
        vec3 rt = ro + t*rd; // position on ray
        float d = map(rt);   // sdf at position
        if(d<0.00001) {// hit something
            return t;
        }
        t += SAFEMARCH * d;//smaller step for safety
        if(t>=tmax) { // left screen
            return tmax;
        }
    }
    return tmax;// may need more steps
}


// Hard shadow. Returns how much of the light you see, on [0,1].
float shadow(in vec3 ro, in vec3 rd, float tmin, float tmax) {
    float t = raymarch(ro, rd, tmin, tmax);
    if(t < tmax) // hit object
        return 0.0;
    else
        return 1.0;
}

float softshadow(in vec3 ro, in vec3 rd, float mint, float maxt, float k )
{
    float res = 1.0;
    for( float t=mint; t<maxt; )
    {
        vec3 rt = ro + rd*t;
        float h = map(rt);
        if( h<0.00001 )
            return 0.0;
            
        res = min( res, k*h/t );
        t += SAFEMARCH * h;
    }
    return res;
}


vec3 render(vec3 ro, vec3 rd) {

    vec3 col = vec3(0.0);
    vec2 m   = (iMouse.xy-0.5*iResolution.xy)/iResolution.y;

    float maxt = 10.0;
    float t = raymarch(ro, rd, 0.0, maxt);    
    
    if(t >= maxt) {//hit nothing
        // set background color
        col = vec3(0.0);
    }
    else { // shade object
    
        // Intersection point info:
        vec3 p = ro + t*rd;
        vec3 n = calcNormal(p);
        vec3 pCd = mapV4(p).yzw;// object/point color
        

        // LIGHTS!!!
        vec3 pLight0 = vec3(3.*m.x, 3.*m.y, 0.3);
        vec3 Cd0     = vec3(0.9);//light color
        vec3 L0      = normalize(pLight0 - p); // unit vector to point light #0
        //float S0     = shadow(p, L0, 0.01, length(pLight0-p));
        float S0     = softshadow(p, L0, 0.01, length(pLight0-p), 15.0);
        vec3 C0      = clamp(dot(L0,n),0.,1.) * pCd * S0;

        col = C0;
    }
    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv  = fragCoord/iResolution.xy; // on [0,1]x[0,1]
    vec2 pXY = (fragCoord-0.5*iResolution.xy)/iResolution.y; // position on screen
    vec2 m   = (iMouse.xy-0.5*iResolution.xy)/iResolution.y;
    
    // Camera setup:
    vec3 pix = vec3(pXY, 0.0);// z=0 virtual image
    vec3 ro  = vec3(0., 0., 3.0); 
    vec3 rd  = normalize(pix - ro);
    vec3 col = render(ro, rd);

    // Output to screen
    fragColor = vec4(col,1.0);
}
