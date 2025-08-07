import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Fix leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ForecastItem {
  region_id: string;
  forecast_value: number;
}

// Forecast data
const forecastData = {
  july_2024: [
    { region_id: "GAL", forecast_value: 18500 },
    { region_id: "CAT", forecast_value: 45200 },
    { region_id: "AND", forecast_value: 51300 },
    { region_id: "MAD", forecast_value: 24000 },
    { region_id: "VAL", forecast_value: 32800 },
    { region_id: "PVA", forecast_value: 16200 }
  ]
};

// GeoJSON data with Spanish regions
const regionsGeoJSON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { region_id: "GAL", name: "Galicia" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-9.2954, 42.1593], [-8.9845, 42.5781], [-8.1408, 43.6911],
          [-7.5717, 43.5394], [-7.0269, 43.3036], [-6.2361, 42.9911],
          [-6.1343, 42.3594], [-6.8688, 42.0345], [-7.4423, 41.8289],
          [-8.0114, 41.7902], [-8.2907, 42.2821], [-9.2954, 42.1593]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { region_id: "CAT", name: "Cataluña" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [0.1629, 42.3594], [3.3228, 42.4323], [3.3228, 41.3819],
          [2.0524, 41.3819], [1.7731, 41.1246], [0.7902, 40.8674],
          [0.1629, 41.1246], [0.1629, 42.3594]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { region_id: "AND", name: "Andalucía" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-7.4423, 36.9823], [-2.2803, 36.9823], [-1.2976, 37.7554],
          [-0.6701, 38.6156], [-1.6529, 38.6156], [-3.2618, 38.0016],
          [-4.5322, 37.7554], [-5.6586, 37.2411], [-6.4494, 37.3383],
          [-7.4423, 36.9823]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { region_id: "MAD", name: "Madrid" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-4.5322, 40.6103], [-3.1665, 40.6103], [-3.1665, 39.9018],
          [-3.9573, 39.9018], [-4.5322, 40.3187], [-4.5322, 40.6103]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { region_id: "VAL", name: "Valencia" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-1.2976, 40.6103], [0.1629, 40.6103], [0.8537, 39.7501],
          [0.1629, 38.9770], [-0.6701, 38.6156], [-1.2976, 39.2641],
          [-1.2976, 40.6103]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { region_id: "PVA", name: "País Vasco" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-3.2618, 43.5394], [-1.6529, 43.5394], [-1.6529, 42.9911],
          [-2.7883, 42.9911], [-3.2618, 43.1428], [-3.2618, 43.5394]
        ]]
      }
    }
  ]
};

const TourismMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Color function based on forecast values
  const getColor = (value: number): string => {
    if (value > 50000) return '#800026';
    if (value > 40000) return '#BD0026';
    if (value > 30000) return '#E31A1C';
    if (value > 20000) return '#FC4E2A';
    if (value > 10000) return '#FD8D3C';
    return '#FFEDA0';
  };

  // Style function for GeoJSON features
  const styleFeature = (feature: any) => {
    const regionId = feature.properties?.region_id;
    const forecastItem = forecastData.july_2024.find(
      (item: ForecastItem) => item.region_id === regionId
    );
    
    const forecastValue = forecastItem?.forecast_value || 0;
    const fillColor = getColor(forecastValue);

    return {
      fillColor,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  // Event handlers for features
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const properties = feature.properties;
    const regionId = properties?.region_id;
    const regionName = properties?.name;
    
    const forecastItem = forecastData.july_2024.find(
      (item: ForecastItem) => item.region_id === regionId
    );
    
    const forecastValue = forecastItem?.forecast_value || 0;
    
    // Bind popup
    layer.bindPopup(`
      <div style="padding: 12px;">
        <strong style="font-size: 14px;">${regionName}</strong><br/>
        <span style="font-size: 12px; color: #666;">Pronóstico: ${forecastValue.toLocaleString()}</span>
      </div>
    `);

    // Add hover effects
    layer.on({
      mouseover: function (e) {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.8
        });
      },
      mouseout: function (e) {
        geoJsonLayerRef.current?.resetStyle(e.target);
      }
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    console.log('Initializing map...');

    // Initialize map
    mapInstance.current = L.map(mapRef.current, {
      center: [40.416775, -3.703790],
      zoom: 6,
      scrollWheelZoom: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    console.log('Map initialized, adding GeoJSON...');

    // Add GeoJSON layer
    geoJsonLayerRef.current = L.geoJSON(regionsGeoJSON, {
      style: styleFeature,
      onEachFeature: onEachFeature
    }).addTo(mapInstance.current);

    console.log('GeoJSON added successfully');

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Legend component
  const Legend = () => {
    const legendItems = [
      { color: '#800026', label: '> 50,000', min: 50000 },
      { color: '#BD0026', label: '40,000 - 50,000', min: 40000 },
      { color: '#E31A1C', label: '30,000 - 40,000', min: 30000 },
      { color: '#FC4E2A', label: '20,000 - 30,000', min: 20000 },
      { color: '#FD8D3C', label: '10,000 - 20,000', min: 10000 },
      { color: '#FFEDA0', label: '< 10,000', min: 0 }
    ];

    return (
      <Card className="absolute bottom-6 left-6 z-[1000] bg-card/95 backdrop-blur-sm border-map-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Pronóstico de Turismo</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-map-border"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="relative h-[90vh] w-full bg-map-background border border-map-border rounded-lg overflow-hidden shadow-lg">
      <div 
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      />
      <Legend />
    </div>
  );
};

export default TourismMap;