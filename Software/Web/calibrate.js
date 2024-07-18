var autoCalibrationStep = 0;
var calibrationWindow = null;
var calibrationActive = false;

function calibrationMoveToZero() {
    boat.rudder.target = 0;
    sendBluetoothData({ T: boat.rudder.target  });
    calibrationUpdateCurrent();
}

function calibrationSetZero() {
    boat.rudder.pos = 0;
    boat.rudder.target = 0;
    sendBluetoothData({ Z: boat.rudder.pos });
    calibrationUpdateCurrent();
}

function calibrationMoveLeft() {
    boat.rudder.target--;
    sendBluetoothData({ T: boat.rudder.target  });
    calibrationUpdateCurrent();
}

function calibrationMoveRight() {
    boat.rudder.target++;
    sendBluetoothData({ T: boat.rudder.target });
    calibrationUpdateCurrent();
}

function calibrationUpdateCurrent() {
    setInnerText("calibration_current", autoCalibrationStep == 0 ? boat.rudder.target : boat.rudder.pos + " / " + boat.rudder.target);
    setInnerText("calibration_left", boat.rudder.min);
    setInnerText("calibration_right", boat.rudder.max);
}

function calibrationSetMaxLeft() {
    boat.rudder.min = boat.rudder.target;
    sendBluetoothData({ L: boat.rudder.target });
    calibrationUpdateCurrent();
}

function calibrationSetMaxRight() {
    boat.rudder.max = boat.rudder.target;
    sendBluetoothData({ R: boat.rudder.target });
    calibrationUpdateCurrent();
}

function calibrationMoveTo() {
	var value = parseInt(document.getElementById("calibrate_moveTo").value);
	boat.rudder.target = value;
	sendBluetoothData({ T: value });
    calibrationUpdateCurrent();
}

function calibrationSetLock() {
	sendBluetoothData({ E: 1 });
}

function calibrationSetUnlock() {
	sendBluetoothData({ E: 0 });
}

function calibrationAuto() {
    calibrationWindow = createModalWindow("Auto Calibration", undefined, closeModalWindow, undefined);
    calibrationWindow.innerText = "Wait until calibration ended";

	boat.rudder.pos = 0;
	boat.rudder.target = settings.calibrate.maxSteps;
	sendBluetoothData({ Z: boat.rudder.pos, T: boat.rudder.target });
	calibrationUpdateCurrent();
	autoCalibrationStep = 1;
}

function calibrationChangeMinMaxCut() {
	if (boat.rudder.max > 10 && boat.rudder.min < -10) {
		boat.rudder.max -= 10;
		boat.rudder.min += 10;
		calibrationUpdateCurrent();
	}
}

function calibrationChangeMinMaxExtend() {
	if (boat.rudder.max < settings.calibrate.defaultSideMax && boat.rudder.min > -settings.calibrate.defaultSideMax) {
		boat.rudder.max += 10;
		boat.rudder.min -= 10;
		calibrationUpdateCurrent();
	}
}

function closeCalibrationDialog() {
	closeModalWindow();
	calibrationActive = false;
}

function showCalibrationDialog() {
    var window = createModalWindow("Calibration", closeCalibrationDialog, undefined, closeCalibrationDialog);
	calibrationActive = true;
    
    createElement("div", { parent: window, text: "Information", class: "settings-group" });
    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Current Position", class: "settings-label" });
		createElement("div", { parent: area, id: "calibration_current", class: "settings-view" });
	}

    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Maximum left", class: "settings-label" });
		createElement("div", { parent: area, id: "calibration_left", text: boat.rudder.min, class: "settings-view" });
	}

    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Maximum right", class: "settings-label" });
		createElement("div", { parent: area, id: "calibration_right", text: boat.rudder.max, class: "settings-view" });
	}

	createElement("div", { parent: window, text: "Auto Calibrate", class: "settings-group" });
    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Run auto zero calibration", class: "settings-label" });
		createElement("div", { parent: area, text: "Run", class: "settings-button button", onclick: calibrationAuto });
	}

    createElement("div", { parent: window, text: "Moving", class: "settings-group" });
    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
        createElement("div", { parent: area, text: "Free Moving", class: "settings-label" });
		createElement("div", { parent: area, text: "-", class: "settings-button button", onclick: calibrationMoveLeft });
        createElement("div", { parent: area, text: "+", class: "settings-button button", onclick: calibrationMoveRight });
	}
	{
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
        createElement("div", { parent: area, text: "Move To", class: "settings-label" });
		createElement("input", { parent: area, value: "0", id: "calibrate_moveTo", class: "settings-edit-mini" });
        createElement("div", { parent: area, text: "Move", class: "settings-button button", onclick: calibrationMoveTo });
	}
	{
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
        createElement("div", { parent: area, text: "Lock Motor", class: "settings-label" });
		createElement("div", { parent: area, text: "Lock", class: "settings-button button", onclick: calibrationSetLock });
        createElement("div", { parent: area, text: "Unlock", class: "settings-button button", onclick: calibrationSetUnlock });
	}
	{
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Move To Zero", class: "settings-label" });
		createElement("div", { parent: area, text: "Zero", class: "settings-button button", onclick: calibrationMoveToZero });
	}

    createElement("div", { parent: window, text: "Setting values", class: "settings-group" });
    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Set Zero", class: "settings-label" });
		createElement("div", { parent: area, text: "Zero", class: "settings-button button", onclick: calibrationSetZero });
	}
    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
        createElement("div", { parent: area, text: "Store Maximum", class: "settings-label" });
		createElement("div", { parent: area, text: "Min", class: "settings-button button", onclick: calibrationSetMaxLeft });
        createElement("div", { parent: area, text: "Max", class: "settings-button button", onclick: calibrationSetMaxRight });
	}
	{
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
        createElement("div", { parent: area, text: "Cut/Extend Min/Max", class: "settings-label" });
		createElement("div", { parent: area, text: "-10", class: "settings-button button", onclick: calibrationChangeMinMaxCut });
        createElement("div", { parent: area, text: "+10", class: "settings-button button", onclick: calibrationChangeMinMaxExtend });
	}
    calibrationUpdateCurrent();
}

function continueAutoCalibtate() {
	if (autoCalibrationStep == 1) {
		if (boat.rudder.pos == boat.rudder.target) {
			autoCalibrationStep = 2;
			boat.rudder.target = settings.calibrate.autoCalibrationCenter;
			sendBluetoothData({ T: boat.rudder.target });
			boat.rudder.min = -settings.calibrate.defaultSideMax;
			boat.rudder.max = settings.calibrate.defaultSideMax;
		}
	} else if (autoCalibrationStep == 2) {
		if (boat.rudder.pos == boat.rudder.target) {
			calibrationSetZero();
            if (calibrationWindow != null && !calibrationWindow.windowClosed) {
                closeModalWindow();
            }
			autoCalibrationStep = 0;
		}
	}

}

function calibrationOnTime() {
	if (autoCalibrationStep > 0) {
		if (boat.rudder.target != bluetooth.send.pos) {
            sendBluetoothData({ T: boat.rudder.target });
        }

        if (calibrationWindow.windowClosed) {
            autoCalibrationStep = 0;
        } else {
		    continueAutoCalibtate();
		    calibrationUpdateCurrent();
        }
	}
}











addSidebarButton("Calibration...", showCalibrationDialog);