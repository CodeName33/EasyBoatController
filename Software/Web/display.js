/** @type {HTMLCanvasElement} */
var canvas;
/** @type {CanvasRenderingContext2D} */
var ctx;
const boatImage = document.getElementById("boat");
var display = {
	x: 0,
	y: 0,
	scale: 0.001,
	width: 0,
	height: 0,
};

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns {{x: number, y: number}}
 */
function screenCoordToReal(x, y) {
	return {
		x: display.x + (x - display.width / 2) * display.scale,
		y: display.y - (y - display.height / 2) * display.scale,
	};
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns {{x: number, y: number}}
 */
function realCoordToScreen(x, y) {
	return {
		x: display.width / 2 + (x - display.x) / display.scale,
		y: display.height / 2 - (y - display.y) / display.scale,
	};
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} scale 
 */
function showPoint(x, y, scale)  {
	display.x = x;
	display.y = y;
	display.scale = scale;
}

function createCanvas() {
	var screenspace = document.getElementById("screenspace");
	if (screenspace != null) {
		if (canvas != null) {
			screenspace.removeChild(canvas);
		}
		var rect = screenspace.getBoundingClientRect();
		canvas = document.createElement("canvas");
		canvas.setAttribute("id", "screen");
		canvas.setAttribute("class", "screen");
		display.width = rect.right - rect.left - 4;
		display.height = rect.bottom - rect.top - 4;
		canvas.setAttribute("width", `${display.width}`);
		canvas.setAttribute("height", `${display.height}`);
		screenspace.appendChild(canvas);
		//@ts-ignore
		ctx = canvas.getContext("2d");
		canvas.ondblclick = addPoint;

		canvas.ontouchmove = onTouchMove;
		canvas.ontouchstart = onTouchStart;
		canvas.ontouchend = onTouchEnd;
		canvas.onmousemove = onMouseMove;
		canvas.onwheel = onWheel;
	}
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBoat(boat.x, boat.y, boat.a);
}    

/**
 * 
 * @param {number} X1 
 * @param {number} X2 
 * @param {number} Y1 
 * @param {number} Y2 
 * @returns {number}
 */
function getZoomDistance(X1, X2, Y1, Y2)
{
    var W = Math.abs(X1 - X2);
    var H = Math.abs(Y1 - Y2);
    return Math.sqrt(W * W + H * H);
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 */
function moveViewport(x, y) {
	display.x -= x * display.scale;
	display.y += y * display.scale;
}

/**
 * 
 * @param {WheelEvent} e 
 */
function onWheel(e) {
	var delta = e.deltaY;
	if (delta == undefined) {
		//@ts-ignore
		delta = -e.wheelDelta;
	}

	if (delta != 0) {
		var v = delta > 0 ? 1.1 : 0.9;
		display.scale = display.scale * v;
	}
	//document.getElementById("debug").innerText = delta;
}

/**
 * 
 * @param {MouseEvent} e 
 */
function onMouseMove(e) {
	if (e.buttons & 1) {
		//document.getElementById("debug").innerText = prop_dump(e);
		moveViewport(e.movementX, e.movementY);
	}
	
}

var touchX = 0;
var touchY = 0;
var touchZoomBase = 0;
var touchZoomZoomDistance = 0;
var inMove = false;
var inZoom = false;

/**
 * 
 * @param {TouchEvent} e 
 */
function onTouchEnd(e) {
	inMove = false;
	inZoom = false;
}

/**
 * 
 * @param {TouchEvent} e 
 */
function onTouchStart(e) {
	if (e.touches.length == 1) {
		touchX = e.touches[0].pageX;
        touchY = e.touches[0].pageY;
		inMove = true;
	} else if (e.touches.length == 2) {
		touchZoomZoomDistance = getZoomDistance(e.touches[0].pageX, e.touches[1].pageX, e.touches[0].pageY, e.touches[1].pageY);
		touchZoomBase = display.scale;
		inZoom = true;
	}
}

function getWMax()
{
    return display.width > display.height ? display.width : display.height;
}

/**
 * 
 * @param {TouchEvent} e 
 */
function onTouchMove(e) {
	if (e.touches.length == 1) {
		if (inMove) {
			moveViewport(e.touches[0].pageX - touchX, e.touches[0].pageY - touchY);
			touchX = e.touches[0].pageX;
			touchY = e.touches[0].pageY;
		}
		//e.touches[0].pageX
	} if (e.touches.length == 2) {
		//document.getElementById("debug").innerText = prop_dump(e.touches[0]);
		if (inZoom) {
			var newZoomDistance = getZoomDistance(e.touches[0].pageX, e.touches[1].pageX, e.touches[0].pageY, e.touches[1].pageY);
			var zoom = touchZoomZoomDistance - newZoomDistance;

			
			var newscale = touchZoomBase * (1.0 + (zoom / (getWMax() / 3.0)));
			if (newscale > 0) {
				display.scale = newscale;
			}
		}
		//document.getElementById("debug").innerText = newZoomDistance + " " + zoom + " " + (1.0 + (zoom / (getWMax() / 3.0)));
	}

	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    e.returnValue = false;
    e.stopImmediatePropagation();
}

/**
 * 
 * @param {MouseEvent} e 
 */
function addPoint(e) {
	if (settings.emulation.pointOnDoubleClick) {
		let boundingRect = canvas.getBoundingClientRect();
		let eX = e.clientX - boundingRect.left;
		let eY = e.clientY - boundingRect.top;
		var realCoords = screenCoordToReal(eX, eY);
		if (route.points.length == 0) {
			route.points.push({ x: boat.x, y: boat.y });
		}
		route.points.push({ x: realCoords.x, y: realCoords.y });
	}
}

function scrollToBoat() {
	showPoint(boat.x, boat.y, 0.00002);
}

function scrollToRoute() {
	if (route.points.length > 0) {
		var tx = 0.0;
		var ty = 0.0;
		for (let p of route.points) {
			tx += p.x;
			ty += p.y;
		}
		if (settings.emulation.enabled) {
			boat.x = route.points[0].x;
			boat.y = route.points[0].y + 0.02;
			boat.a = 90;
			boat.emulated.x = boat.x;
			boat.emulated.y = boat.y;
		}
		showPoint(tx / route.points.length, ty / route.points.length, 0.0002);
	}
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} angle 
 */
function drawBoat(x, y, angle) {;
	//const boatPoint = { x: 75, y: 25, w: 80, h: 50, rudder: { x: 13, y: 25 } };
	const boatPoint = { x: 46, y: 24, w: 48, h: 48, rudder: { x: 10, y: 24 } };

	var screenPart = Math.floor(display.width * 0.1);
	var partCoord = screenCoordToReal(display.width / 2 + screenPart, display.height / 2);
	var partDistance = Math.floor(calculateDistance(display.y, display.x, partCoord.y, partCoord.x));
	//console.log("Dist = " + partDistance);

	var scale = display.scale;
	var level = 0;
	if (scale > 0) {
		while (scale < 1) {
			scale *= 10;
			level++;
		}
	}
	
	var linesInterval = parseFloat("0." + "1".padStart(level - 2, "0"));
	//console.log(linesInterval);
	var coordsStart = screenCoordToReal(0,0);
	var coordsEnd = screenCoordToReal(display.width,display.height);
	ctx.strokeStyle = "#303030";
	coordsStart.x = Math.floor(coordsStart.x / linesInterval) * linesInterval;
	if (coordsEnd.x > coordsStart.x) {
		for (var i = coordsStart.x; i <= coordsEnd.x; i+=linesInterval) {
			var c = realCoordToScreen(i, coordsStart.y);
			ctx.moveTo(c.x, 0);
			ctx.lineTo(c.x, display.height);
		}
	}
	coordsStart.y = Math.floor(coordsStart.y / linesInterval) * linesInterval;
	if (coordsEnd.y < coordsStart.y) {
		for (var i = coordsStart.y; i >= coordsEnd.y; i-=linesInterval) {
			var c = realCoordToScreen(coordsStart.x, i);
			ctx.moveTo(0, c.y);
			ctx.lineTo(display.width, c.y);
		}
	}
	ctx.stroke(); 

	//console.log(level);

	ctx.strokeStyle = "#00A0A0";
	ctx.fillStyle = "#00A0A0";
	ctx.beginPath();
	var screenBase = screenPart / 2;
	ctx.moveTo(screenBase, screenBase);
	ctx.lineTo(screenBase + screenPart, screenBase);
	ctx.moveTo(screenBase, screenBase - screenPart / 16);
	ctx.lineTo(screenBase, screenBase + screenPart / 16);
	ctx.moveTo(screenBase + screenPart, screenBase - screenPart / 16);
	ctx.lineTo(screenBase + screenPart, screenBase + screenPart / 16);
	ctx.stroke(); 
	ctx.textAlign = "center";
	ctx.fillText(partDistance + "m", screenBase + screenPart / 2, screenBase - 2);

	var lx = 0;
	var ly = 0;

	var i = 0;
	for (let p of route.points) {
		var screenCoords = realCoordToScreen(p.x, p.y);
		if (i > 0) {
			ctx.strokeStyle = (i == 1 ? "#00A000" : "#0060A0");
			ctx.beginPath();
			ctx.moveTo(lx, ly);
			ctx.lineTo(screenCoords.x, screenCoords.y);
			ctx.stroke(); 
		}
		
		ly = screenCoords.y;
		lx = screenCoords.x;
		i++;
	}

	i = 0;
	for (let p of route.points) {        
		var screenCoords = realCoordToScreen(p.x, p.y);            
		if (i == 0) {
			ctx.fillStyle = "#888";
		} else if (i == 1) {
			ctx.fillStyle = "#0C0";
		} else {
			ctx.fillStyle = "#06C";
		}
		ctx.beginPath();
		ctx.arc(screenCoords.x, screenCoords.y, 3, 0, 2 * Math.PI);
		ctx.fill();
		ly = screenCoords.y;
		lx = screenCoords.x;
		i++;
	}

	var boatScreenCoords = realCoordToScreen(x, y);      
	ctx.save();
	ctx.translate(boatScreenCoords.x, boatScreenCoords.y);
	ctx.rotate((-angle + 360) * Math.PI / 180);

	//@ts-ignore
	ctx.drawImage(boatImage, -boatPoint.x, -boatPoint.y, boatPoint.w, boatPoint.h);
	ctx.fillStyle = "#fff";
	ctx.beginPath();
	ctx.arc(0, 0, 3, 0, 2 * Math.PI);
	ctx.fill();

	ctx.strokeStyle = "#888";
	ctx.beginPath();
	ctx.moveTo(-100, 0);
	ctx.lineTo(100, 0);
	ctx.stroke(); 

	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(-(boatPoint.x - boatPoint.rudder.x), -(boatPoint.y - boatPoint.rudder.y));

	var rudderDegrees = 0;
	if (boat.rudder.pos >= 0) {
		rudderDegrees = (100 / boat.rudder.max * boat.rudder.pos) * 0.45;
	} else {
		rudderDegrees = -(100 / boat.rudder.min * boat.rudder.pos) * 0.45;
	}

	var c = angleToCoords(rudderDegrees, 16);
	ctx.lineTo(-(boatPoint.x - boatPoint.rudder.x) - c.x, -(boatPoint.y - boatPoint.rudder.y) - c.y);
	ctx.stroke(); 
	ctx.lineWidth = 1;

	ctx.restore();

	
}

function showViewDialog() {
	var window = createModalWindow("View", undefined, undefined, closeModalWindow);
	createElement("div", { parent: window, text: "Scroll to object", class: "settings-group" });
	{
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Scroll Screen To Boat", class: "settings-label" });
		createElement("div", { parent: area, text: "View", class: "settings-button button", onclick: scrollToBoat });
	}
	{
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Scroll Screen To Route", class: "settings-label" });
		createElement("div", { parent: area, text: "View", class: "settings-button button", onclick: scrollToRoute });
	}
}

createCanvas();
addEventListener("resize", createCanvas);
addSidebarButton("View...", showViewDialog);