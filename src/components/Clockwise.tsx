import { Box, Typography } from "@mui/material";
import { VectorMap } from "@react-jvectormap/core";
import { worldMerc } from "@react-jvectormap/world";
import Header from "./Header";

type Marker = {
  name: string;
  latLng: [number, number];
  timezone: string;
  currentTime: string;
};

const timezones: Marker[] = [
  // UTC-12: Baker Island
  {
    name: "Baker Island",
    latLng: [0.1936, -176.4769],
    timezone: "Etc/GMT+12",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Etc/GMT+12",
    }),
  },
  // UTC-11: American Samoa
  {
    name: "Pago Pago",
    latLng: [-14.2756, -170.702],
    timezone: "Pacific/Pago_Pago",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Pacific/Pago_Pago",
    }),
  },
  // UTC-10: Hawaii
  {
    name: "Honolulu",
    latLng: [21.3069, -157.8583],
    timezone: "Pacific/Honolulu",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Pacific/Honolulu",
    }),
  },
  // UTC-9: Alaska
  {
    name: "Anchorage",
    latLng: [61.2181, -149.9003],
    timezone: "America/Anchorage",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Anchorage",
    }),
  },
  // UTC-8: Pacific Time
  {
    name: "Los Angeles",
    latLng: [34.0522, -118.2437],
    timezone: "America/Los_Angeles",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    }),
  },
  // UTC-7: Mountain Time
  {
    name: "Denver",
    latLng: [39.7392, -104.9903],
    timezone: "America/Denver",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Denver",
    }),
  },
  // UTC-6: Central Time
  {
    name: "Chicago",
    latLng: [41.8781, -87.6298],
    timezone: "America/Chicago",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
    }),
  },
  // UTC-5: Eastern Time
  {
    name: "New York",
    latLng: [40.7128, -74.006],
    timezone: "America/New_York",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    }),
  },
  // UTC-4: Atlantic Time
  {
    name: "Halifax",
    latLng: [44.6488, -63.5752],
    timezone: "America/Halifax",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Halifax",
    }),
  },
  // UTC-3: Argentina Time
  {
    name: "Buenos Aires",
    latLng: [-34.6118, -58.396],
    timezone: "America/Argentina/Buenos_Aires",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
    }),
  },
  // UTC-2: South Georgia Time
  {
    name: "South Georgia",
    latLng: [-54.2766, -36.5078],
    timezone: "Atlantic/South_Georgia",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Atlantic/South_Georgia",
    }),
  },
  // UTC-1: Azores Time
  {
    name: "Azores",
    latLng: [37.7412, -25.6756],
    timezone: "Atlantic/Azores",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Atlantic/Azores",
    }),
  },
  // UTC+0: Greenwich Mean Time
  {
    name: "London",
    latLng: [51.5072, -0.1276],
    timezone: "Europe/London",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Europe/London",
    }),
  },
  // UTC+1: Central European Time
  {
    name: "Berlin",
    latLng: [52.52, 13.405],
    timezone: "Europe/Berlin",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Europe/Berlin",
    }),
  },
  // UTC+2: Eastern European Time
  {
    name: "Cairo",
    latLng: [30.0444, 31.2357],
    timezone: "Africa/Cairo",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
    }),
  },
  // UTC+3: Moscow Time
  {
    name: "Moscow",
    latLng: [55.7558, 37.6173],
    timezone: "Europe/Moscow",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Europe/Moscow",
    }),
  },
  // UTC+4: Gulf Standard Time
  {
    name: "Dubai",
    latLng: [25.276987, 55.296249],
    timezone: "Asia/Dubai",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dubai",
    }),
  },
  // UTC+5: Pakistan Standard Time
  {
    name: "Karachi",
    latLng: [24.8607, 67.0011],
    timezone: "Asia/Karachi",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    }),
  },
  // UTC+5:30: India Standard Time
  {
    name: "Mumbai",
    latLng: [19.076, 72.8777],
    timezone: "Asia/Kolkata",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  },
  // UTC+6: Bangladesh Standard Time
  {
    name: "Dhaka",
    latLng: [23.8103, 90.4125],
    timezone: "Asia/Dhaka",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    }),
  },
  // UTC+7: Indochina Time
  {
    name: "Bangkok",
    latLng: [13.7563, 100.5018],
    timezone: "Asia/Bangkok",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    }),
  },
  // UTC+8: China Standard Time
  {
    name: "Beijing",
    latLng: [39.9042, 116.4074],
    timezone: "Asia/Shanghai",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Shanghai",
    }),
  },
  // UTC+9: Japan Standard Time
  {
    name: "Tokyo",
    latLng: [35.6762, 139.6503],
    timezone: "Asia/Tokyo",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Tokyo",
    }),
  },
  // UTC+10: Australian Eastern Standard Time
  {
    name: "Sydney",
    latLng: [-33.8688, 151.2093],
    timezone: "Australia/Sydney",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Australia/Sydney",
    }),
  },
  // UTC+11: Solomon Islands Time
  {
    name: "Solomon Islands",
    latLng: [-9.6457, 160.1562],
    timezone: "Pacific/Guadalcanal",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Pacific/Guadalcanal",
    }),
  },
  // UTC+12: Fiji Time
  {
    name: "Suva",
    latLng: [-18.1248, 178.4501],
    timezone: "Pacific/Fiji",
    currentTime: new Date().toLocaleString("en-US", {
      timeZone: "Pacific/Fiji",
    }),
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
        <Box sx={{ height: "800px", width: "100%", p: 4, m: 4 }}>
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
            selectedMarkers={[1]}
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
            onMarkerTipShow={(event, tooltip, index) => {
              const marker = timezones[Number(index)];
              if (marker) {
                // Calculate current time dynamically
                const currentTime = new Date().toLocaleString("en-US", {
                  timeZone: marker.timezone,
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                });

                const content = `
                  <div style="padding: 8px; font-family: Arial, sans-serif; min-width: 200px;">
                    <div style="font-weight: bold; color: #e91e63; font-size: 14px; margin-bottom: 4px;">
                      ${marker.name}
                    </div>
                    <div style="color: #666; font-size: 12px; margin-bottom: 4px;">
                      ${marker.timezone}
                    </div>
                    <div style="color: #FFF; font-weight: 500; font-size: 13px;">
                      ${currentTime}
                    </div>
                  </div>
                `;
                tooltip.html(content);
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Clockwise;
