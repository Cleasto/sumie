var brushCanvas;
var brushContext;

var oldScale = 0.0;
var oldestScale = 0.0;

var oldDir = {x:0, y:0};
var oldestDir = {x:0, y:0};

var oldestPoint = {x:-1, y:-1};
var oldPoint = {x:-1, y:-1};
var currentPoint = {x:-1, y:-1};

var mousePressed = false;
var maxStrokeLength = 80; //From experiments of fast stylus dragging
var radius = 60;

function beginLineBatch(context)
{
	// Add error checking to see if we have already begun
	context.beginPath();
}

function batchDrawLine(u, v, context)
{
	context.moveTo(u.x, u.y);
	context.lineTo(v.x, v.y);
}

function endLineBatch(context)
{
	context.stroke();
}

function onMouseDown(e)
{
	mousePressed = true;
	currentPoint.x = e.clientX;
	currentPoint.y = e.clientY;
	oldPoint.x = currentPoint.x;
	oldPoint.y = currentPoint.y;
	oldestPoint.x = oldPoint.x;
	oldestPoint.y = oldPoint.y;
}

function onMouseUp(e)
{
	mousePressed = false;
}

function onMouseMove(e)
{
	oldestPoint.x = oldPoint.x;
	oldestPoint.y = oldPoint.y;
	oldPoint.x = currentPoint.x;
	oldPoint.y = currentPoint.y;
	currentPoint.x = e.clientX;
	currentPoint.y = e.clientY;
}

function onMouseOut()
{
	mousePressed = false;
}

function calculateRadius(scale)
{
	var val = 1 - Math.sqrt(1-scale) * radius;
	return clamp(val, radius, radius);
}

function calculateIterations(radius)
{
	// Make iterations proportional to radius
	//var val = (1-radius) * 400;
	//return clamp(val, 50, 400);

	//return Math.PI * radius * radius * 0.05;
	return radius * 2;
}

function drawBrushCircle(pos, dir, scale)
{
	var radius = calculateRadius(scale);
	//document.getElementById("debug").innerHTML = "Radius: " + radius;
	var iterations = calculateIterations(radius);
	//document.getElementById("debug").innerHTML = "Iterations: " + iterations;
	var perpDir = {x:-dir.y, y:dir.x};
	brushContext.lineWidth = lerp(0.005, 0.09, (1-scale));
	beginLineBatch(brushContext);
	for (var i = 0; i < iterations; i++)
	{
		var randPoint = {x:0, y:0};
		randPoint.x = pos.x + (Math.random() * 2 * radius) - radius;
		randPoint.y = pos.y + (Math.random() * 2 * radius) - radius;
		var centerToPoint = {x:randPoint.x-pos.x, y:randPoint.y - pos.y};

		// Only keep points inside the circle
		if(lengthSquared(centerToPoint) > (radius * radius))
		{
			continue;
		}

		// var jitterDirX = xDir * (Math.random() * scale * 10 + 4);
		// var jitterDirY = yDir * (Math.random() * scale * 10 + 4);

		var rand1 = Math.random() - 0.5;
		var rand2 = Math.random() - 0.5;
		var jitterDir = {
			x:dir.x + (rand1 * perpDir.x * (1-scale)), 
			y:dir.y + (rand2 * perpDir.y * (1-scale))};

		// var jitterDirX = xDir;// + (1-scale) * perpDirX;
		// var jitterDirY = yDir;// + (1-scale) * perpDirY;

		var maxBrushLength = 25;
		var brushLength = (scale * scale) * maxBrushLength;
		brushLength = clamp(brushLength, 0.05 * maxBrushLength, maxBrushLength);


		jitterDir.x *= brushLength;
		jitterDir.y *= brushLength;

		batchDrawLine(
			{x:randPoint.x - jitterDir.x, y:randPoint.y - jitterDir.y},
			{x:randPoint.x + jitterDir.x, y:randPoint.y + jitterDir.y}, 
			brushContext);
	}
	endLineBatch(brushContext);
}

function drawBrushStroke()
{
	if(!mousePressed)
	{
		return;
	}

	var dir = {x:0, y:0};
	dir.x = currentPoint.x - oldPoint.x;
	dir.y = currentPoint.y - oldPoint.y;
	var len = length(dir);
	if (len == 0)
	{
		drawBrushCircle(
			currentPoint,
			currentPoint.y,
			Math.random(),
			Math.random(),
			0.0);
		return;
	}

	dir.x /= len;
	dir.y /= len;

	var scale = len / maxStrokeLength;
	scale = clamp(scale, 0.0, 1.0);

	var mid1 = {x:(oldPoint.x + oldestPoint.x) * 0.5, y:(oldPoint.y + oldestPoint.y) * 0.5};
	var mid2 = {x:(oldPoint.x + currentPoint.x) * 0.5, y:(oldPoint.y + currentPoint.y) * 0.5};

	var midScale1 = (oldScale + oldestScale) * 0.5;
	var midScale2 = (oldScale + scale) * 0.5;

	var midDir1 = {x:(oldDir.x + oldestDir.x) * 0.5, y:(oldDir.y + oldestDir.y) * 0.5};
	var midDir2 = {x:(oldDir.x + dir.x) * 0.5, y:(oldDir.y + dir.y) * 0.5};

	var pixelFreq = 1;
	var count = len / pixelFreq;
	for (var i = 0; i <= count; i++)
	{
		var amt = i / count;

		var drawPos = quadCurveVector(mid1, oldPoint, mid2, amt);
		var drawDir = normalize(quadCurveVector(midDir1, oldDir, midDir2, amt));
		var drawScale = quadCurve(midScale1, oldScale, midScale2, amt);

		drawBrushCircle(
			drawPos,
			drawDir,
			drawScale);
	}

	oldestScale = oldScale;
	oldScale = scale;

	oldestDir = oldDir;
	olddir = dir;
}

var drawLoop = function() {
	drawBrushStroke();
	setTimeout(drawLoop, 10);
};

window.document.addEventListener("DOMContentLoaded", function()
{
	brushCanvas = document.getElementById("brushCanvas");
	brushContext = brushCanvas.getContext("2d");
	brushContext.lineCap = "round";
	brushContext.lineJoin = "round";
	brushContext.lineWidth = 0.1;
	drawLoop();
});