import { Box, Typography } from "@mui/material";
import { VectorMap } from "@react-jvectormap/core";
import { worldMerc } from "@react-jvectormap/world";
import Header from "./Header";

type TimezoneData = {
  [countryCode: string]: {
    timezone: string;
    currentTime: string;
  };
};

type Marker = {
  name: string;
  latLng: [number, number];
  timezone: string;
  currentTime: string;
};

const timezones: Marker[] = [
  {
    name: "New York",
    latLng: [40.7128, -74.006],
    timezone: "America/New_York",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    }),
  },
  {
    name: "Chicago",
    latLng: [41.8781, -87.6298],
    timezone: "America/Chicago",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
    }),
  },
  {
    name: "Denver",
    latLng: [39.7392, -104.9903],
    timezone: "America/Denver",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Denver",
    }),
  },
  {
    name: "Los Angeles",
    latLng: [34.0522, -118.2437],
    timezone: "America/Los_Angeles",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    }),
  },
  {
    name: "Anchorage",
    latLng: [61.2181, -149.9003],
    timezone: "America/Anchorage",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Anchorage",
    }),
  },
  {
    name: "Honolulu",
    latLng: [21.3069, -157.8583],
    timezone: "Pacific/Honolulu",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Pacific/Honolulu",
    }),
  },
  {
    name: "Pago Pago (American Samoa)",
    latLng: [-14.2756, -170.702],
    timezone: "Pacific/Pago_Pago",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Pacific/Pago_Pago",
    }),
  },
  {
    name: "Hagatna (Guam)",
    latLng: [13.4443, 144.7937],
    timezone: "Pacific/Guam",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Pacific/Guam",
    }),
  },
  {
    name: "San Juan (Puerto Rico)",
    latLng: [18.4655, -66.1057],
    timezone: "America/Puerto_Rico",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Puerto_Rico",
    }),
  },
  {
    name: "St. Thomas (US Virgin Islands)",
    latLng: [18.3419, -64.9307],
    timezone: "America/St_Thomas",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/St_Thomas",
    }),
  },
  {
    name: "London",
    latLng: [51.5072, -0.1276],
    timezone: "Europe/London",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Europe/London",
    }),
  },
  {
    name: "Berlin",
    latLng: [52.52, 13.405],
    timezone: "Europe/Berlin",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Europe/Berlin",
    }),
  },
  {
    name: "Tokyo",
    latLng: [35.6762, 139.6503],
    timezone: "Asia/Tokyo",
    currentTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  },
  {
    name: "Sydney",
    latLng: [-33.8688, 151.2093],
    timezone: "Australia/Sydney",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Australia/Sydney",
    }),
  },
  {
    name: "Kolkata",
    latLng: [22.5726, 88.3639],
    timezone: "Asia/Kolkata",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  },
  {
    name: "Dubai",
    latLng: [25.276987, 55.296249],
    timezone: "Asia/Dubai",
    currentTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }),
  },
];
const Clockwise = () => {
  return (
    <Box>
      <Header />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Clockwise - World Time Zones
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Explore time zones around the world to better manage your global
          schedule.
        </Typography>
        <Box sx={{ height: "500px", width: "100%" }}>
          <VectorMap
            map={worldMerc}
            backgroundColor="transparent"
            style={{
              marginTop: "-1.5rem",
            }}
            regionStyle={{
              initial: {
                fill: "#e4e4e4",
                fillOpacity: 0.9,
                stroke: "none",
                strokeWidth: 0,
                strokeOpacity: 0,
              },
              hover: {
                fillOpacity: 0.8,
                cursor: "pointer",
              },
            }}
            selectedMarkers={[1, 3]}
            markers={timezones}
            markerStyle={{
              initial: {
                fill: "#e91e63",
                stroke: "#ffffff",
                "stroke-width": 5,
                "stroke-opacity": 0.5,
                r: 7,
              },
              hover: {
                fill: "E91E63",
                stroke: "#ffffff",
                "stroke-width": 5,
                "stroke-opacity": 0.5,
              },
              selected: {
                fill: "E91E63",
                stroke: "#ffffff",
                "stroke-width": 5,
                "stroke-opacity": 0.5,
              },
            }}
            onRegionTipShow={() => false}
            onMarkerTipShow={() => false}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Clockwise;
