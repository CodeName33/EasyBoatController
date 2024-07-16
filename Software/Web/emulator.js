function emulatorMoveBoat() {
	var a, x, y;

	if (settings.emulation.boat.delaySeconds > 0) {
		if (boat.emulated.time == null) {
			boat.emulated.a = boat.a;
			boat.emulated.x = boat.x;
			boat.emulated.y = boat.y;
			boat.emulated.time = new Date();
		}
		a = boat.emulated.a;
		x = boat.emulated.x;
		y = boat.emulated.y;

		
	} else {
		a = boat.a;
		x = boat.x;
		y = boat.y;
	}

	if (settings.emulation.offsets.rudderRotate != 0) {
		a = ((a + settings.emulation.offsets.rudderRotate + 360)) % 360;
	}

	var windX = 0;
	var windY = 0;
	if (settings.emulation.wind.force > 0) {
		var wc = angleToCoords(humanAngle(settings.emulation.wind.angle), settings.emulation.wind.force);
		windX = wc.x;
		windY = wc.y;
	}

	if (windX != 0) {
		x = x + windX;
	}

	if (windY != 0) {
		y = y + windY;
	}
	
	if (boat.rudder.pos != 0) {
		var rspeed = (24 * 0.00001) / settings.emulation.boat.speed;

		var rudderDegrees = 0;
		if (boat.rudder.pos >= 0) {
			rudderDegrees = (100 / boat.rudder.max * boat.rudder.pos) * 0.45;
		} else {
			rudderDegrees = -(100 / boat.rudder.min * boat.rudder.pos) * 0.45;
		}

		a = ((a + rudderDegrees / rspeed) + 360) % 360;
	}

	var c = angleToCoords(a, settings.emulation.boat.speed);
	x += c.x;
	y += c.y;

	if (settings.emulation.boat.delaySeconds > 0) {
		boat.emulated.a = a;
		boat.emulated.x = x;
		boat.emulated.y = y;
		if  ((new Date().getTime() - boat.emulated.time.getTime()) / 1000 > settings.emulation.boat.delaySeconds ) {
			boat.a = boat.emulated.a;
			boat.x = boat.emulated.x;
			boat.y = boat.emulated.y;
			boat.emulated.time = new Date();
		}

		if (settings.gps.useCompassBetweenGpsSteps) {
			boat.a = boat.emulated.a;
		}
	} else {
		boat.a = a;
		boat.x = x;
		boat.y = y;
	}
}

function emulatorOnTime() {
	if (engineStarted) {
		emulatorProcessRudder();
	}
	correctCourse();
	if (engineStarted) {
		emulatorMoveBoat();
	}

	if (sensors.gps.detectedSpeed != 0) {
		reportStatus("gpsSpeed", "Speed", Math.floor(sensors.gps.detectedSpeed) + " km/h", false);
	} else {
		reportStatus("gpsSpeed", "Speed", "N/A", false);
	}

	if (bluetooth.active) {
        reportStatus("btActive", "Bluetooth Connected", "Yes", false);
        if (boat.rudder.target != bluetooth.send.pos) {
			if (!calibrationActive) {
            	sendBluetoothData({ T: boat.rudder.target * (settings.calibrate.invertedMove ? -1 : 1) });
			}
        }
        if (boat.rudder.pos != bluetooth.received.pos) {
            boat.rudder.pos = bluetooth.received.pos;
        }
    } else {
        reportStatus("btActive", "Bluetooth Connected", "No", true);
    }
}

function emulatorProcessRudder() {
	if (boat.rudder.target != boat.rudder.pos) {
		if (boat.rudder.target > boat.rudder.pos) {
			boat.rudder.pos += settings.emulation.boat.rudderSpeed;
			if (boat.rudder.pos > boat.rudder.target) {
				boat.rudder.pos = boat.rudder.target;
			}
		} else {
			boat.rudder.pos -= settings.emulation.boat.rudderSpeed;
			if (boat.rudder.pos < boat.rudder.target) {
				boat.rudder.pos = boat.rudder.target;
			}
		}
	}
}



function emulatePoints() {
	route.name = "Sample Route";
	route.points = [
{ x: 29.88094963906533, y: 61.163136307897666 },
{ x: 29.894441803673168, y: 61.1626936864355 },
{ x: 29.90832921145194, y: 61.161105405199756 },
{ x: 29.91790487554778, y: 61.159022291832066 },
{ x: 29.928881856340574, y: 61.159169850235926 },
{ x: 29.934316449940933, y: 61.157199454454876 },
{ x: 29.94108948064287, y: 61.15746420644064 },
{ x: 29.949254845242418, y: 61.15543293744912 },
{ x: 29.960492327216055, y: 61.152468264606284 },
{ x: 29.963375805804016, y: 61.14758875113132 },
{ x: 29.976355950849502, y: 61.144918590271494 },
{ x: 29.986659221691838, y: 61.142096222761296 },
{ x: 29.998453637224518, y: 61.139790377770574 },
{ x: 30.011442765069347, y: 61.13603813335129 },
{ x: 30.014622676035508, y: 61.129036222345256 },
{ x: 30.024494772509552, y: 61.12075093355191 },
{ x: 30.03569632328583, y: 61.11532760342566 },
	];
	scrollToRoute();
}