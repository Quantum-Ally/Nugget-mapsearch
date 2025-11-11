'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  coordinates?: [number, number];
  markers?: Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    description?: string;
  }>;
  onMarkerClick?: (id: string) => void;
  zoom?: number;
}

export function MapboxMap({
  coordinates = [-0.1278, 51.5074],
  markers = [],
  onMarkerClick,
  zoom = 11
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoid2lzZXJuIiwiYSI6ImNsczBwcmtoMzAyYTYya21raHBtYXFkdWkifQ.92tySIKG-TSBatGA3--0Wg';
    if (!token || token.includes('example')) {
      console.error('Mapbox token not configured. Please add a valid token to .env');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();

      markers.forEach((markerData) => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '32px';
        el.style.height = '44px';
        el.style.cursor = 'pointer';
        el.style.backgroundImage = 'url(/nugget_map_marker.svg)';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';

        const marker = new mapboxgl.Marker(el)
          .setLngLat(markerData.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(
                `<div class="p-2">
                  <h3 class="font-bold text-sm">${markerData.title}</h3>
                  ${markerData.description ? `<p class="text-xs text-gray-600 mt-1">${markerData.description}</p>` : ''}
                </div>`
              )
          )
          .addTo(map.current!);

        if (onMarkerClick) {
          el.addEventListener('click', () => onMarkerClick(markerData.id));
        }

        markersRef.current.push(marker);
        bounds.extend(markerData.coordinates);
      });

      if (markers.length > 1) {
        if (coordinates) {
          map.current.flyTo({
            center: coordinates,
            zoom: 10.5,
            essential: true,
            duration: 2000,
            easing: (t) => t * (2 - t)
          });
          setTimeout(() => {
            if (map.current) {
              map.current.fitBounds(bounds, { padding: 100, maxZoom: 11, duration: 2000 });
            }
          }, 1000);
        } else {
          map.current.fitBounds(bounds, { padding: 100, maxZoom: 11, duration: 1500 });
        }
      } else if (markers.length === 1) {
        map.current.flyTo({
          center: coordinates || markers[0].coordinates,
          zoom: 13,
          duration: 1500,
          easing: (t) => t * (2 - t)
        });
      }
    } else if (coordinates) {
      map.current.flyTo({
        center: coordinates,
        zoom: zoom,
        duration: 1500,
        easing: (t) => t * (2 - t)
      });
    }
  }, [markers, mapLoaded, onMarkerClick, coordinates]);

  useEffect(() => {
    if (!map.current || !mapLoaded || markers.length > 0 || !coordinates) return;

    const currentCenter = map.current.getCenter();
    const [lng, lat] = coordinates;

    if (Math.abs(currentCenter.lng - lng) > 0.001 || Math.abs(currentCenter.lat - lat) > 0.001) {
      map.current.flyTo({
        center: coordinates,
        zoom: zoom,
        duration: 1500,
        easing: (t) => t * (2 - t)
      });
    }
  }, [coordinates, zoom, mapLoaded, markers.length]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
  );
}
