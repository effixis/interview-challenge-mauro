// react
import { useState, useEffect } from 'react';

// utils
import { Firebase } from '../utils/types';
import { importGoogleMapAPI } from '../utils/Firebase';

function useGoogleMaps(
  elementID: string,
  onChange?: (place: Firebase.GoogleMapPlace | null) => void,
) {
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    importGoogleMapAPI(() => {

      const element = document.getElementById(elementID) as HTMLInputElement | null;

      if (!element || isSetup || typeof google === "undefined") {
        return;
      }

      setIsSetup(true);

      const center = { lat: 46.519962, lng: 6.633597 };
      // Create a bounding box with sides ~50km away from the center point
      const defaultBounds = {
        north: center.lat + 0.5,
        south: center.lat - 0.5,
        east: center.lng + 0.5,
        west: center.lng - 0.5,
      };

      const options = {
        bounds: defaultBounds,
        componentRestrictions: { country: "ch" },
        fields: ["address_components", "geometry", "place_id"],
        strictBounds: false,
        types: ["address"],
      };

      const autocomplete = new google.maps.places.Autocomplete(element, options);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.address_components) {

          if (onChange) {
            onChange(null);
          }
          return;
        }

        const data = place.address_components;

        const routeItem = data.find(v => v.types.indexOf("route") != -1);
        const route = routeItem ? routeItem.long_name : "";

        const streetNumberItem = data.find(v => v.types.indexOf("street_number") != -1);
        const streetNumber = streetNumberItem ? " " + streetNumberItem.long_name : "";

        const townItem = data.find(v => v.types.indexOf("locality") != -1);
        const town = townItem ? townItem.long_name : "";

        const cantonItem = data.find(v => v.types.indexOf("administrative_area_level_1") != -1);
        const canton = cantonItem ? cantonItem.short_name : "";

        const postcodeItem = data.find(v => v.types.indexOf("postal_code") != -1);
        const postcode = postcodeItem ? Number(postcodeItem.short_name) : 0;

        let lat: number | null = null;
        let lng: number | null = null;
        if (place.geometry.location) {
          lat = place.geometry.location.lat();
          lng = place.geometry.location.lng();
        }

        // TODO handle no placeID case
        if (!place.place_id) {
          return;
        }

        if (onChange) {
          onChange({
            placeID: place.place_id ?? "",
            address: route + streetNumber,
            town: town,
            canton: canton,
            postcode: postcode,
            lat: lat,
            lng: lng,
          });
        }
      });
    });
  });
}

export default useGoogleMaps;