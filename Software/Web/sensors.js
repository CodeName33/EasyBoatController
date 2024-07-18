var gpsWatchId = 0;
var sensors = {
	gps: {
		data: {
			latitude: 0,
			longitude: 0,
		},
		lastest: {
			latitude: 0,
			longitude: 0,
		},
		active: false,
		latitude: 0,
		longitude: 0,
		altitude: 0,
		speed: 0,
		orientationActive: false,
		orientation: 0,
		detectedSpeed: 0,
	},
	motion: {
		active: false,
		accelerationIncludingGravityX: 0,
		accelerationIncludingGravityY: 0,
		accelerationIncludingGravityZ: 0,
		rotationRateA: 0,
		rotationRateB: 0,
		rotationRateG: 0,
		angle: 0,
	},
	orientation: {
		active: false,
		degrees: 0,
	}
};

var detectSpeedData = {
	y: 0,
	x: 0,
	time: null,
};

var gpsOptions = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0,
};

var gpsHistory = [];
var gpsAccuracy = 8;

function gpsSuccess(pos) {
	const crd = pos.coords;

	if (playingInProgress && !("debugInPlay" in pos)) {
		return;
	}

	var latitude = crd.latitude == null ? 0 : crd.latitude;
	var longitude = crd.longitude == null ? 0 : crd.longitude;

	sensors.gps.lastest.latitude = latitude;
	sensors.gps.lastest.longitude = longitude;

	gpsHistory.push( {
		latitude: latitude,
		longitude: longitude,
		altitude: crd.altitude,
		speed: crd.speed == null ? 0 : crd.speed,
		orientation: sensors.orientation.degrees,
	});
	console.log("GPS Result " + new Date());
	//document.getElementById("debug").innerText = "GPS Result " + new Date().getTime();
	if (gpsHistory.length > settings.gps.pointsToGroup) {
		var crdAvg = {
			latitude: 0,
			longitude: 0,
			altitude: 0,
			speed: 0,
			orientation: 0,
		};
		for (let c of gpsHistory) {
			crdAvg.altitude += c.altitude;
			crdAvg.latitude += c.latitude;
			crdAvg.longitude += c.longitude;
			crdAvg.speed += c.speed;
		}
		crdAvg.altitude /= gpsHistory.length;
		crdAvg.latitude /= gpsHistory.length;
		crdAvg.longitude /= gpsHistory.length;
		crdAvg.speed /= gpsHistory.length;
		crdAvg.orientation = gpsHistory[0].orientation;
		//gpsHistory[Math.floor(gpsHistory.length / 2)].orientation;
		gpsHistory.shift();

		if (!sensors.gps.active) {
			sensors.gps.data.latitude = parseFloat(crdAvg.latitude.toFixed(gpsAccuracy));
			sensors.gps.data.longitude = parseFloat(crdAvg.longitude.toFixed(gpsAccuracy));

			sensors.gps.latitude = parseFloat(crdAvg.latitude.toFixed(gpsAccuracy));
			sensors.gps.longitude = parseFloat(crdAvg.longitude.toFixed(gpsAccuracy));
			sensors.gps.altitude = parseFloat(crdAvg.altitude.toFixed(gpsAccuracy));
			sensors.gps.speed = crdAvg.speed == null ? 0 : crd.speed;

			if (sensors.orientation.active) {
				sensors.gps.orientation = crdAvg.orientation;
				sensors.gps.orientationActive = true;
			}
		} else {
			var distance = calculateDistance(sensors.gps.data.latitude, sensors.gps.data.longitude, parseFloat(crdAvg.latitude.toFixed(gpsAccuracy)), parseFloat(crdAvg.longitude.toFixed(gpsAccuracy)));
			if (distance >= settings.gps.metersToMove) {
				sensors.gps.latitude = parseFloat(crdAvg.latitude.toFixed(gpsAccuracy));
				sensors.gps.longitude = parseFloat(crdAvg.longitude.toFixed(gpsAccuracy));
				sensors.gps.altitude = parseFloat(crdAvg.altitude.toFixed(gpsAccuracy));
				sensors.gps.speed = crdAvg.speed == null ? 0 : crd.speed;

				if (sensors.orientation.active) {
					sensors.gps.orientation = crdAvg.orientation;
					sensors.gps.orientationActive = true;
				}

				sensors.gps.data.latitude = sensors.gps.latitude;
				sensors.gps.data.longitude = sensors.gps.longitude;
			}
		}

		sensors.gps.active = true;
		console.log("GPS In " + new Date());
	}

	
	//navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError, gpsOptions);
	
}

function gpsError(err) {
	console.log("GPS Error " + err.code + " " + err.message);
	//navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError, gpsOptions);
}

function onMotion(event) {
	sensors.motion.active = true;
	sensors.motion.accelerationIncludingGravityX = event.accelerationIncludingGravity.x;
	sensors.motion.accelerationIncludingGravityY = event.accelerationIncludingGravity.y;
	sensors.motion.accelerationIncludingGravityZ = event.accelerationIncludingGravity.z;

	sensors.motion.rotationRateA = event.rotationRate.alpha;
	sensors.motion.rotationRateB = event.rotationRate.beta;
	sensors.motion.rotationRateG = event.rotationRate.gamma;

	var ax = sensors.motion.accelerationIncludingGravityX;
	var ay = sensors.motion.accelerationIncludingGravityY;
	var az = sensors.motion.accelerationIncludingGravityZ;

	if(az > 9.90) {
		az = 9.90;
	}

	var maxy = 9.81;
	if(ay > maxy) {
		ay = maxy;
	} else if(ay < -maxy) {
		ay = -maxy;
	}

	var angle =(radians_to_degrees(Math.acos(-ay/maxy)) - 90).toFixed(0);
	sensors.motion.angle = angle;
}

function onOrientation(e) {
	var compass = (e.alpha + e.beta * e.gamma / 90);
	//document.getElementById("debug").innerHTML = Math.floor(compass) + "<br>" + Math.floor(e.alpha);

	sensors.orientation.degrees = (compass + 360) % 360;
	sensors.orientation.active = true;
}

function sensorsOnTime() {
	if (detectSpeedData.time == null || (new Date().getTime() - detectSpeedData.time.getTime()) > 5000) {
		//if (sensors.gps.active) {
			if (detectSpeedData.time != null) {
				var time = (new Date().getTime() - detectSpeedData.time.getTime()) / 1000.0;
				var distance = calculateDistance(detectSpeedData.y, detectSpeedData.x, boat.y, boat.x);
				var ms = distance / time;
				var kmh = ms / 1000 * 3600;
				console.log("speed: " + kmh + " " + settings.course.speedCompensationForSlowRudder.compensateAfterSpeedKmh / kmh);
				if (kmh < 1000) {
					sensors.gps.detectedSpeed = kmh;
				}
			}
			detectSpeedData.y = boat.y;
			detectSpeedData.x = boat.x;
			detectSpeedData.time = new Date();
		//}
	}
}

if(window.DeviceMotionEvent){
	window.addEventListener("devicemotion", onMotion, false);
}

window.addEventListener("deviceorientationabsolute", onOrientation, true);

try {
	gpsWatchId = navigator.geolocation.watchPosition(gpsSuccess, gpsError, gpsOptions);
	//navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError, gpsOptions);
} catch (error) {
	showFatalError(error);
}