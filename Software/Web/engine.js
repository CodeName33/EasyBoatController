var boat = { 
    inited: false, 
    x: 600, 
    y: 350,
    angleX: 600,
    angleY: 350,
    a: 0, 
    rudder: { 
        pos: 0, 
        min: -70, 
        max: 70, 
        target: 0
    },
    emulated: {
        time: null,
        x: 0,
        y: 0,
        a: 0,
    },
};
var route = {
	name: "New Route",
	points: []
};
var engineStarted = false;

function engineOnTime() {
	if (sensors.orientation.active) {
		reportStatus("orientation", "Compass", Math.floor(sensors.orientation.degrees));
	}
	
    if (sensors.gps.active) {
        reportStatus("gpsLat", "Latitude", sensors.gps.latitude, false);
        reportStatus("gpsLon", "Longitude", sensors.gps.longitude, false);
        reportStatus("gpsSpeed", "Speed", Math.floor(sensors.gps.detectedSpeed) + " km/h", false);

        if (!boat.inited 
            || boat.x != sensors.gps.lastest.longitude || boat.y != sensors.gps.lastest.latitude
            || boat.angleX != sensors.gps.longitude || boat.angleY != sensors.gps.latitude
        ) {
            
            if (boat.angleX != sensors.gps.longitude || boat.angleY != sensors.gps.latitude) {
                boat.a = coordsToAngle(boat.angleX, boat.angleY, sensors.gps.longitude, sensors.gps.latitude);
                boat.realA = boat.a;
                boat.angleX = sensors.gps.longitude;
                boat.angleY = sensors.gps.latitude;
            }
            boat.x = sensors.gps.lastest.longitude;
            boat.y = sensors.gps.lastest.latitude;

            if (!boat.inited) {
                scrollToBoat();
                boat.inited = true;
            }
        }

        if (boat.inited && settings.gps.useCompassBetweenGpsSteps && sensors.gps.orientationActive 
            && sensors.orientation.degrees != sensors.gps.orientation) {
                var diff = compareAngles(sensors.orientation.degrees, sensors.gps.orientation);
                boat.a = (boat.realA + diff) % 360;
        }
    } else {
        reportStatus("gpsLat", "Latitude", "N/A", true);
        reportStatus("gpsLon", "Longitude", "N/A", true);
        reportStatus("gpsSpeed", "Speed", "N/A", true);
    }

    if (sensors.motion.active) {
        reportStatus("motionAngle", "Phone Angle", sensors.motion.angle + "°", false);
    } else {
        reportStatus("motionAngle", "Phone Angle", "N/A", true);
    }

    if (bluetooth.active) {
        reportStatus("btActive", "Bluetooth Connected", "Yes", false);
        if (boat.rudder.target != bluetooth.send.pos) {
			if (!calibrationActive) {
            	sendBluetoothData({ T: boat.rudder.target * (settings.calibrate.invertedMove ? -1 : 1)  });
			}
        }
        if (boat.rudder.pos != bluetooth.received.pos) {
            boat.rudder.pos = bluetooth.received.pos;
        }
    } else {
        reportStatus("btActive", "Bluetooth Connected", "No", true);
    }

    correctCourse();
}

function setRudderTargetPercent(value, dontCompensate) {
    var max = (typeof dontCompensate === 'undefined' || !dontCompensate ? correctBySpeed(settings.course.maximumRudderPositionPercent) : settings.course.maximumRudderPositionPercent);
	var oldTarget = boat.rudder.target;
	if (value == 0) {
		boat.rudder.target = 0;
		//reportStatus("rudderPercent", "Rudder Position", "0%");
	} if (value > 0) {
		if (value > max) {
			value = max;
		}
		boat.rudder.target = Math.floor(boat.rudder.max / 100 * value);
		//reportStatus("rudderPercent", "Rudder Position", Math.floor(value) + "%");
	} else if (value < 0) {
		value = -value;
		if (value > max) {
			value = max;
		}
		boat.rudder.target = Math.floor(boat.rudder.min / 100 * value);
		//reportStatus("rudderPercent", "Rudder Position", -Math.floor(value) + "%");
	}
	if (oldTarget != boat.rudder.target) {
		sendBluetoothData({ T: Math.floor(boat.rudder.target) * (settings.calibrate.invertedMove ? -1 : 1) });
	}
}

function updateRudderPersentStatus() {
	if (boat.rudder.pos < 0) {
		reportStatus("rudderPercent", "Rudder Position", -Math.floor(100.0 / boat.rudder.min * boat.rudder.pos) + "%" );
	} else if (boat.rudder.pos > 0) {
		reportStatus("rudderPercent", "Rudder Position", Math.floor(100.0 / boat.rudder.max * boat.rudder.pos) + "%" );
	} else {
		reportStatus("rudderPercent", "Rudder Position", "0%");
	}
}

function getRouteDistance(r) {
    var length = 0;
    for (var i = 1; i < r.points.length; i++) {
        length += calculateDistance(r.points[i - 1].y, r.points[i - 1].x, r.points[i].y, r.points[i].x);
    }
    return length;
}

function getTotalDistance() {
    var length = 0;
    for (var i = 1; i < route.points.length; i++) {
        if (i == 1) {
            length += calculateDistance(boat.y, boat.x, route.points[i].y, route.points[i].x);
        } else {
            length += calculateDistance(route.points[i - 1].y, route.points[i - 1].x, route.points[i].y, route.points[i].x);
        }
    }
    return length;
}

function correctBySpeed(value) {
    if (sensors.gps.detectedSpeed != 0 && settings.course.speedCompensationForSlowRudder.enabled) {
        var v = settings.course.speedCompensationForSlowRudder.compensateAfterSpeedKmh / sensors.gps.detectedSpeed;
        if (v > 1.0) {
            v = 1.0;
        } else if (v < settings.course.speedCompensationForSlowRudder.compensateMinQ) {
            v = settings.course.speedCompensationForSlowRudder.compensateMinQ;
        }
        return value * v;
    }
    return value;
}

function humanizeLeft(hours) {
    var text = "";
    if (hours > 24) {
        text += " " + Math.floor(hours / 24) + " d";
        hours = hours % 24;
    }
    if (Math.floor(hours) > 0) {
        text += " " + Math.floor(hours) + " h";
        hours -= Math.floor(hours);
    }

    if (hours > 0) {
        text += " " + Math.floor(60 * hours) + " m";
    }

    if (text.length == 0) {
        return "N/A";
    }
    return text.trim();
}

function correctCourse() {
	reportStatus("boatAngle", "Boat Angle", angleToHumanize(boat.a));
	updateRudderPersentStatus();
	//var status = "Boat Angle: " + Math.floor(boat.a);
	if (route.points.length > 1) {
		var angle = coordsToAngle(boat.x, boat.y, route.points[1].x, route.points[1].y);
		reportStatus("courseAngle", "Course Angle", angleToHumanize(angle));
		var diff = compareAngles(angle, boat.a) * 3;

		var distance = calculateDistance(boat.y, boat.x, route.points[1].y, route.points[1].x);

        reportStatus("pointsLeft", "Points Left", route.points.length - 1);
		reportStatus("distance", "Distance to point", Math.floor(distance) + "m");

		var distanceToRoute = calculateSignedDistanceToLine(boat.y, boat.x, route.points[0].y, route.points[0].x, route.points[1].y, route.points[1].x);
		if (isNaN(distanceToRoute)) {
			distanceToRoute = 0.0;
		}

        const angles = calculateTriangleAngles(boat.y, boat.x, route.points[0].y, route.points[0].x, route.points[1].y, route.points[1].x);

        //document.getElementById("debug").innerHTML = "A: " + angles.angleA + "<BR>B: " + angles.angleB + "<BR>C: " + angles.angleC;

		reportStatus("distanceToRoute", "Distance to line", Math.floor(distanceToRoute) + "m");

        var d = getTotalDistance();
        reportStatus("distanceTotal", "Total Distance", Math.floor(d) + "m");

        var km = d / 1000.0;
        var hoursLeft = (sensors.gps.detectedSpeed == 0 ? 0 : km / sensors.gps.detectedSpeed);

        reportStatus("timeLeft", "Time Left", humanizeLeft(hoursLeft));

        var addDiff = 0;
        if (settings.course.keepBoatNearLines) {
            var pointsAngle = coordsToAngle(route.points[0].x, route.points[0].y, route.points[1].x, route.points[1].y);
            //console.log(Math.floor(pointsAngle) + " " + Math.floor(boat.a) + " " + Math.floor(compareAngles(pointsAngle, boat.a)));
            addDiff = (/*distance < distanceToRoute * 2 ||*/ Math.abs(compareAngles(pointsAngle, boat.a)) > 60 ? 0 : distanceToRoute * settings.course.keepBoatNearLineQ);
            if (Math.abs(addDiff) > settings.course.keepBoatNearLineMaxPercent) {
                addDiff = settings.course.keepBoatNearLineMaxPercent * (Math.abs(addDiff) / addDiff);
            }
        }



        if (engineStarted) {
		    setRudderTargetPercent(diff + addDiff, Math.abs(diff) > 80);
            if (
                (!settings.course.takingPointsNotNecessary && distance < settings.course.points.distanceToPointToBeDone)
                ||
                (settings.course.takingPointsNotNecessary && angles.angleC >= settings.course.speedCompensationForSlowRudder.angleToPointDontCompensateAfter)
            ) {
                route.points.shift();
            } 
        }
		
	} else {
        reportStatus("courseAngle", "Course Angle", "N/A");
        reportStatus("pointsLeft", "Points Left", "0");
        reportStatus("distance", "Distance to point", "N/A");
        reportStatus("distanceToRoute", "Distance to line", "N/A");
        reportStatus("distanceTotal", "Total Distance", "N/A");
        reportStatus("timeLeft", "Time Left", "N/A");
    }
}

function switchMove() {
	if (!engineStarted) {
		if (route.points.length == 0) {
			showFatalError("Error", "There is no route to start");
			return;
		}

        if (!bluetooth.active && !settings.emulation.enabled) {
            showFatalError("Error", "Bluetooth is not connected and emulation mode disabled. Connect bluetooth first.");
            return;
        }
	}

    engineStarted = !engineStarted;
    switchClass(buttonStartStop, "green", !engineStarted);
    switchClass(buttonStartStop, "red", engineStarted);
    buttonStartStop.innerText = (engineStarted ? "Stop Navigation" : "Start Navigation");
}

var buttonStartStop = addSidebarButton("Start Navigation", switchMove);
switchClass(buttonStartStop, "green", true);
switchClass(buttonStartStop, "disabled", true);