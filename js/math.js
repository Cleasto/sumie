function length(v)
{
	return Math.sqrt(v.x * v.x + v.y * v.y);
}

function lengthSquared(v)
{
	return v.x * v.x + v.y * v.y;
}

function normalize(v)
{
	var vecLen = length(v);
	if(vecLen > 0.0)
	{
		v.x /= vecLen;
		v.y /= vecLen;
	}
	return v;
}

function lerp(a, b, t)
{
	return a + (b-a) * t;
}

function lerpVector(u, v, t)
{
	return {x:lerp(u.x, v.x, t), y:lerp(u.y, v.y, t)};
}

function quadCurve(a, b, c, t)
{
	return a * (1-t) * (1-t) + 2 * (1-t) * t * b + t * t * c;
}

function quadCurveVector(u, v, w, t)
{
	return {x:quadCurve(u.x, v.x, w.x, t), y:quadCurve(u.y, v.y, w.y, t)};
}

function clamp(value, min, max)
{
	return Math.max(min, Math.min(value, max));
}