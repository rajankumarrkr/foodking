/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers

  // Convert degrees to radians
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Check if customer is within delivery radius
 * @param {Number} customerLat - Customer latitude
 * @param {Number} customerLng - Customer longitude
 * @returns {Object} { isWithinRadius: boolean, distance: number }
 */
export const checkDeliveryRadius = (customerLat, customerLng) => {
  const restaurantLat = parseFloat(process.env.RESTAURANT_LAT);
  const restaurantLng = parseFloat(process.env.RESTAURANT_LNG);
  const maxRadius = parseFloat(process.env.MAX_DELIVERY_RADIUS);

  const distance = calculateDistance(
    restaurantLat,
    restaurantLng,
    customerLat,
    customerLng
  );

  return {
    isWithinRadius: distance <= maxRadius,
    distance: distance,
    maxRadius: maxRadius
  };
};
