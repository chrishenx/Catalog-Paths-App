<?php
class GeoTools {
	const EARTH_RADIUS = 6378100;// radius of earth in meters

	public static function distanceBetweenCoords($lat1, $lon1, $lat2, $lon2) {
		$sinLatD = sin(deg2rad($lat1 - $lat2)/2);
		$sinLonD = sin(deg2rad($lon1 - $lon2)/2);
		$cosLat1 = cos(deg2rad($lat1));
		$cosLat2 = cos(deg2rad($lat2));
		$a = pow($sinLatD,2)+$cosLat1*$cosLat2*pow($sinLonD,2);
		if ($a<0) $a = -1*$a;
		$c = 2*atan2(sqrt($a), sqrt(1-$a));
		return self::EARTH_RADIUS*$c;
	}
	
	public static function bearingBetweenCoords($lat1, $lon1, $lat2, $lon2) {
		$lat1 = deg2rad($lat1);
		$lat2 = deg2rad($lat2);
		$dLon = deg2rad($lon2-$lon1);

		$dPhi = log(tan($lat2/2+pi()/4)/tan($lat1/2+pi()/4));
		if (abs($dLon) > pi()) $dLon = $dLon>0 ? -(2*pi()-$dLon) : (2*pi()+$dLon);
		$brng = atan2($dLon, $dPhi);
		return (rad2deg($brng)+360) % 360;
	}

	public static function mirrorBearing($iBearing, $sAxis='y') {
		if (strtolower($sAxis) == 'y') {
			if ($iBearing>180) {
				$iBearing = ($iBearing - 180) * -1 + 180;
			} else if ($iBearing<180) {
				$iBearing = 360 - $iBearing;
			}		
		} else {
			if ($iBearing<=180) {
				$iBearing = 180-$iBearing;
			} else if ($iBearing>180) {
				$iBearing = (360 - $iBearing) + 180;
			}
		}
		return $iBearing;
	}

	public static function calcLatLong($lat, $long, $distance, $bearing) {
		// Funny hack for somehow this calculation always came out mirrored over the latitude.
		$bearing = self::mirrorBearing($bearing);

		$radian = 180/pi();
		$b = $bearing / $radian;
		$long = $long / $radian;
		$lat = $lat / $radian;
		$f = 1/298.257;
		$e = 0.08181922;

		$r = self::EARTH_RADIUS * (1 - $e * $e) / pow( (1 - $e*$e * pow(sin($lat),2)), 1.5);	
		$psi = $distance/$r;
		$phi = pi()/2 - $lat;
		$arccos = cos($psi) * cos($phi) + sin($psi) * sin($phi) * cos($b);
		$latA = (pi()/2 - acos($arccos)) * $radian;

		$arcsin = sin($b) * sin($psi) / sin($phi);
		$longA = ($long - asin($arcsin)) * $radian;
		return array('lon' => $longA, 'lat' => $latA);
	}
}