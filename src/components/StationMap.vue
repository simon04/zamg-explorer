<template>
  <div class="ratio ratio-16x9 mb-4">
    <div ref="mapRef" class="map"></div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, onMounted, ref } from "vue";
import type { StationMetadata } from "./openapi";
import {
  CircleMarker,
  Control,
  Map,
  TileLayer,
  type LatLngBoundsLiteral,
  type TileLayerOptions,
} from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps<{
  dataset: string;
  stations: StationMetadata[];
}>();

const mapRef = ref(null) as Ref<HTMLElement | null>;

onMounted(() => {
  setupMap();
});

function setupMap() {
  const map = new Map(mapRef.value!, { attributionControl: false }).fitWorld();
  new Control.Scale({ metric: true, imperial: false }).addTo(map);
  new Control.Attribution({ prefix: false }).addTo(map);
  new Control.Layers({
    "basemap.at": basemap(),
    "basemap.at Gelände": basemap("bmapgelaende", "grau", "jpeg"),
    "basemap.at Grau": basemap("bmapgrau"),
    "basemap.at Orthofoto": basemap("bmaporthofoto30cm", "normal", "jpeg"),
    OpenStreetMap: osm().addTo(map),
  }).addTo(map);
  const latlngs = props.stations.map((station) =>
    new CircleMarker(
      { lat: station.lat, lng: station.lon },
      { color: "#702065", fillColor: "#702065", radius: 8 },
    )
      .bindTooltip(`${station.name} (${station.altitude}&thinsp;m&thinsp;ü.A.)`)
      .on("click", () => {
        window.location.href = `/${props.dataset}/station/?station=${station.id}`;
      })
      .addTo(map)
      .getLatLng(),
  );
  map.fitBounds(latlngs as unknown as LatLngBoundsLiteral);
}

function basemap(variant = "geolandbasemap", type = "normal", format = "png") {
  return new TileLayer(
    "https://maps.wien.gv.at/basemap/{variant}/{type}/google3857/{z}/{y}/{x}.{format}",
    {
      maxZoom: 24,
      maxNativeZoom: 19,
      attribution:
        'Datenquelle: <a href="https://www.basemap.at">basemap.at</a>',
      bounds: [
        [46.35877, 8.782379],
        [49.037872, 17.189532],
      ],
      variant,
      type,
      format,
    } as TileLayerOptions & { variant: string; type: string; format: string },
  );
}

function osm() {
  return new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 24,
    maxNativeZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
}
</script>
