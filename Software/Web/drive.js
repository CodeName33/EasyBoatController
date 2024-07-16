var accelDriveStarted = false;
var firstDriveMotion = true;
var lastMotionAngle = 0;

function switchMotionDrive() {
    if (!accelDriveStarted) {
        if (engineStarted) {
            showFatalError("Error", "You must stop Route Moving first");
            return;
        }

        if (!bluetooth.active && !settings.emulation.enabled) {
            showFatalError("Error", "Bluetooth is not connected and emulation mode disabled. Connect bluetooth first.");
            return;
        }
    }

    accelDriveStarted = !accelDriveStarted;
    switchClass(accelDriveSidebar, "green", !accelDriveStarted);
    switchClass(accelDriveSidebar, "red", accelDriveStarted);
    accelDriveSidebar.innerText = (accelDriveStarted ? "Stop Accel Drive" : "Start Accel Drive");
	if (accelDriveStarted) {
		firstDriveMotion = true;
	}
}

function accelDriveOnTime() {
    if (accelDriveStarted) {
        if (sensors.motion.active) {
			if (firstDriveMotion || Math.abs(lastMotionAngle - sensors.motion.angle) > settings.accelDrive.minAngleToMove) {
				var percent = sensors.motion.angle / 70 * 100;
				setRudderTargetPercent(-percent);
				firstDriveMotion = false;
				lastMotionAngle = sensors.motion.angle;
			}
        }
    }
}


var accelDriveSidebar = addSidebarButton("Start Accel Drive", switchMotionDrive);
switchClass(accelDriveSidebar, "green", true);
switchClass(accelDriveSidebar, "disabled", true);