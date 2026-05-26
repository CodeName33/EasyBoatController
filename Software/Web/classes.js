/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} GPSData
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} altitude
 * @property {number} speed
 * @property {number} orientation
 */


/**
 * @typedef {Object} Sensors
 * @property {GPSSensors} gps
 * @property {MotionSensors} motion
 * @property {OrientationSensors} orientation
 */

/**
 * @typedef {Object} GPSSensors
 * @property {GPSSensorsData} data
 * @property {GPSSensorsData} lastest
 * @property {boolean} active
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} altitude
 * @property {number} speed
 * @property {boolean} orientationActive
 * @property {number} orientation
 * @property {number} detectedSpeed
 */

/**
 * @typedef {Object} CollectedRoute
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} compass
 * @property {number} time
 */

/**
 * @typedef {Object} GPSSensorsData
 * @property {number} latitude
 * @property {number} longitude
 */


/**
 * @typedef {Object} MotionSensors
 * @property {boolean} active
 * @property {number} accelerationIncludingGravityX
 * @property {number} accelerationIncludingGravityY
 * @property {number} accelerationIncludingGravityZ
 * @property {number} rotationRateA
 * @property {number} rotationRateB
 * @property {number} rotationRateG
 * @property {number} angle
 */

/**
 * @typedef {Object} OrientationSensors
 * @property {boolean} active
 * @property {number} degrees
 */

/**
 * @typedef {Object} Settings
 * @property {SettingsCourse} course
 * @property {SettingsGPS} gps,
 * @property {SettingsCalibrate} calibrate,
 * @property {SettingsEmulation} emulation,
 * @property {SettingsAccelDrive} accelDrive,
 */

/**
 * @typedef {Object} SettingsCourse
 * @property {number} maximumRudderPositionPercent
 * @property {boolean} keepBoatNearLines
 * @property {boolean} takingPointsNotNecessary
 * @property {number} keepBoatNearLineQ
 * @property {number} keepBoatNearLineMaxPercent
 * @property {number} keepBoatNearLineMaxAngleToLine
 * @property {SettingsCoursePoints} points
 * @property {SettingsCourseRudderCompensation} speedCompensationForSlowRudder
 */

/**
 * @typedef {Object} SettingsCoursePoints
 * @property {number} distanceToPointToBeDone
 */

/**
 * @typedef {Object} SettingsCourseRudderCompensation
 * @property {boolean} enabled
 * @property {number} compensateAfterSpeedKmh
 * @property {number} compensateMinQ
 * @property {number} angleToPointDontCompensateAfter
 */

/**
 * @typedef {Object} SettingsGPS
 * @property {boolean} useCompassBetweenGpsSteps
 * @property {number} metersToMove
 * @property {number} pointsToGroup
 */

/**
 * @typedef {Object} SettingsCalibrate
 * @property {number} maxSteps
 * @property {number} autoCalibrationCenter
 * @property {number} defaultSideMax
 * @property {boolean} invertedMove
 * @property {boolean} invertedCalibration
 */

/**
 * @typedef {Object} SettingsEmulation
 * @property {boolean} enabled
 * @property {boolean} debug
 * @property {boolean} pointOnDoubleClick
 * @property {SettingsEmulationWind} wind
 * @property {SettingsEmulationOffsets} offsets
 * @property {SettingsEmulationBoat} boat
 */

/**
 * @typedef {Object} SettingsAccelDrive
 * @property {number} minAngleToMove
 */

/**
 * @typedef {Object} SettingsEmulationWind
 * @property {number} angle
 * @property {number} force
 */

/**
 * @typedef {Object} SettingsEmulationOffsets
 * @property {number} rudderRotate
 */

/**
 * @typedef {Object} SettingsEmulationBoat
 * @property {number} speed
 * @property {number} rudderSpeed
 * @property {number} delaySeconds
 */


/**
 * @typedef {Object} Boat
 * @property {boolean} inited
 * @property {number} x
 * @property {number} y
 * @property {number} realA
 * @property {number} angleX
 * @property {number} angleY
 * @property {number} a
 * @property {BoatRudder} rudder
 * @property {BoatEmulated} emulated
 */

/**
 * @typedef {Object} BoatRudder
 * @property {number} pos
 * @property {number} min
 * @property {number} max
 * @property {number} target
 */

/**
 * @typedef {Object} BoatEmulated
 * @property {Date | null} time
 * @property {number} x
 * @property {number} y
 * @property {number} a
 */

/**
 * @typedef {Object} Bluetooth
 * @property {boolean} active
 * @property {BluetoothSend} send
 * @property {BluetoothReceive} received
 * @property {BluetoothInfo} info
 */

/**
 * @typedef {Object} BluetoothSend
 * @property {number} pos
 * @property {boolean} busy
 * @property {*} data
 */

/**
 * @typedef {Object} BluetoothReceive
 * @property {number} pos
 * @property {Date} time
 */

/**
 * @typedef {Object} BluetoothInfo
 * @property {string} deviceName
 * @property {string} bleService
 * @property {string} controlCharacteristic
 * @property {string} statusCharacteristic
 * @property {number} timeoutSeconds
 */
