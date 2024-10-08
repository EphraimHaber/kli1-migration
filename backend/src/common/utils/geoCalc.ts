interface ICoords {
    lat: number;
    lng: number;
}

export const calcCrow = async (coords1: ICoords, coords2: ICoords, radius: number) => {
    const R = 6371000;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
};

// Converts numeric degrees to radians
function toRad(Value: number) {
    return (Value * Math.PI) / 180;
}
