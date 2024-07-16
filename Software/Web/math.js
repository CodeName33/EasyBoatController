function distancePointToLine(x1, y1, x2, y2, px, py) {
    // Calculate the numerator of the distance formula
    const numerator = ((x2 - x1) * (y1 - py) - (x1 - px) * (y2 - y1));
    
    // Calculate the denominator of the distance formula
    const denominator = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    
    // Calculate and return the distance
    return numerator / denominator;
}

function calculateAngles(legA, legB) {
    const angleARadians = Math.atan(legA / legB);
    const angleA = angleARadians * (180 / Math.PI); // Convert radians to degrees

    const angleBRadians = Math.atan(legB / legA);
    const angleB = angleBRadians * (180 / Math.PI); // Convert radians to degrees

    return { angleA: angleA, angleB: angleB };
}

function calculateLegs(hypotenuse, angleA, angleB) {
    if (angleA + angleB !== 90) {
        throw new Error("The sum of the angles A and B must be 90 degrees for a right triangle.");
    }

    const angleARadians = angleA * (Math.PI / 180);
    const angleBRadians = angleB * (Math.PI / 180);

    const legA = hypotenuse * Math.sin(angleARadians);
    const legB = hypotenuse * Math.cos(angleARadians);

    return { legA: legA, legB: legB };
}

function angleToCoords(a, length) {
    if (a < 0) {
        a = (a + 360) % 360;
    }
    var angle = a % 90;
    var secondAngle = 90 - angle;
    var lengths = calculateLegs(length, angle, secondAngle);
    switch (Math.floor(a / 90)) {
        case 0:
            return { x: lengths.legB, y: lengths.legA };
        case 1:
            return { x: -lengths.legA, y: lengths.legB };
        case 2:
            return { x: -lengths.legB, y: -lengths.legA };
        case 3:
            return { x: lengths.legA, y: -lengths.legB };
    }
}

function coordsToAngle(x1, y1, x2, y2) {
    var legA = x1 - x2;
    var legB = y1 - y2;
    var angles = calculateAngles(legA, legB);
    angle = angles.angleB;
    if (y2 < y1 && x2 >= x1) {
        angle = 270 - angles.angleA;
    } else if (y2 >= y1 && x2 < x1) {
        angle = 90 - angles.angleA;
    } else if (y2 < y1 && x2 < x1) {
        angle = 270 - angles.angleA;
    }
    return angle;
}

function compareAngles(a1, a2) {
	var diff = a1 - a2;
	if (diff > 180) {
		return a1 - (a2 + 360);
	} else if (diff < -180) {
		return (a1 + 360) - a2;
	}
	return diff;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRadians = degrees => degrees * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    
    return distance;
}

function radians_to_degrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in meters
}

function calculateSignedDistanceToLine(latP, lonP, latA, lonA, latB, lonB) {
    const R = 6371000; // Radius of the Earth in meters

    // Convert to Cartesian coordinates for all points (P, A, B)
    const toCartesian = (lat, lon) => {
        const latRad = toRadians(lat);
        const lonRad = toRadians(lon);
        return {
            x: R * Math.cos(latRad) * Math.cos(lonRad),
            y: R * Math.cos(latRad) * Math.sin(lonRad),
            z: R * Math.sin(latRad)
        };
    };

    const P = toCartesian(latP, lonP);
    const A = toCartesian(latA, lonA);
    const B = toCartesian(latB, lonB);

    // Direction vector from A to B
    const AB = {
        x: B.x - A.x,
        y: B.y - A.y,
        z: B.z - A.z
    };

    // Vector from A to P
    const AP = {
        x: P.x - A.x,
        y: P.y - A.y,
        z: P.z - A.z
    };

    // Cross-product AB x AP
    const ABxAP = {
        x: AB.y * AP.z - AB.z * AP.y,
        y: AB.z * AP.x - AB.x * AP.z,
        z: AB.x * AP.y - AB.y * AP.x
    };

    // Magnitude of AB cross AP vector (area of parallelogram formed by AB and AP)
    const distance = Math.sqrt(ABxAP.x * ABxAP.x + ABxAP.y * ABxAP.y + ABxAP.z * ABxAP.z) / Math.sqrt(AB.x * AB.x + AB.y * AB.y + AB.z * AB.z);

    // Sign function to determine the side of the point P wrt the line AB
    const sign = Math.sign(AB.x * AP.y - AB.y * AP.x + AB.y * AP.z - AB.z * AP.y + AB.z * AP.x - AB.x * AP.z);

    return distance * sign * -1;
}

function angleToHumanize(value) {
	//return Math.floor(((180 - (value + 90) + 360) % 360)) + "°";
	return Math.floor(((180 - (value + 90) + 360) % 360)) + "°";
	//return Math.floor(value);
}

function humanAngle(value) {
    value = parseInt(value);
    return Math.floor(((180 - (value + 90) + 360) % 360));
}


function calculateTriangleAngles(x1, y1, x2, y2, x3, y3) {
    // Calculate the lengths of the sides using the distance formula
    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    const a = distance(x2, y2, x3, y3); // Length of side opposite to vertex A
    const b = distance(x1, y1, x3, y3); // Length of side opposite to vertex B
    const c = distance(x1, y1, x2, y2); // Length of side opposite to vertex C

    // Using the Law of Cosines to find the angles
    function calculateAngle(opposite, side1, side2) {
        return Math.acos((side1**2 + side2**2 - opposite**2) / (2 * side1 * side2)) * (180 / Math.PI);
    }

    const angleA = calculateAngle(a, b, c);
    const angleB = calculateAngle(b, a, c);
    const angleC = calculateAngle(c, a, b);

    return {
        angleA,
        angleB,
        angleC
    };
}
