<template>
  <div v-if="response && response.headers" class="mb-5">
    Datenstand:
    {{ formatDateTime(new Date(response.headers.get("Last-Modified") || "")) }}
  </div>
  <div
    v-for="{ metadata, station, parameter, timestamps } of hydro"
    class="mb-5"
  >
    <h2>
      {{ metadata.name }}
      <small>
        <a :href="web + metadata.id" target="_blank" ref="external noopener">
          {{ metadata.id }}
        </a>
      </small>
    </h2>
    <TimeseriesChart
      :stations="[metadata]"
      :stationParameters="[{ station, parameter }]"
      :timestamps="timestamps"
      :height="250"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { useFetch } from "@vueuse/core";
import TimeseriesChart from "./TimeseriesChart.vue";
import type { StationMetadata, GeoJSONFeatureParameter } from "./openapi";
import { formatDateTime } from "../util/formatters";

const web = "https://hydro.tirol.gv.at/#/Wasserstand?station=";
const url =
  "https://corsproxy.io/?" +
  encodeURI(
    "https://hydro.tirol.gv.at/ogd/OGD_W.csv?" + Math.floor(Date.now() / 60_000)
  );
const { data, response } = useFetch(url).arrayBuffer();

const hydro = computed(() => {
  if (!data.value) return;
  const result: Record<
    string,
    {
      metadata: StationMetadata;
      station: string;
      parameter: GeoJSONFeatureParameter;
      timestamps: number[];
    }
  > = {};
  const decoder = new TextDecoder("iso-8859-1");
  const lines = decoder.decode(data.value).split("\n");
  const header = lines[0].trim().split(";") as (
    | "Stationsname"
    | "Stationsnummer"
    | "Gewässer"
    | "Parameter"
    | "Zeitstempel in ISO8601"
    | "Wert"
    | "Einheit"
    | "Seehöhe"
    | "Rechtswert"
    | "Hochwert"
    | "EPSG-Code"
  )[];
  lines?.slice(1).forEach((line) => {
    const cells = line.trim().split(";");
    const river = cells[header.indexOf("Gewässer")];
    if (river !== "Inn") return;
    const value: StationMetadata = {
      name: cells[header.indexOf("Stationsname")],
      id: cells[header.indexOf("Stationsnummer")],
      altitude: +cells[header.indexOf("Seehöhe")],
    } as StationMetadata;
    const station = value.id!;
    const parameter = {
      data: [],
      name: cells[header.indexOf("Parameter")],
      unit: cells[header.indexOf("Einheit")],
    } as GeoJSONFeatureParameter;
    result[station] ??= { metadata: value, station, parameter, timestamps: [] };
    result[station].timestamps.push(
      Date.parse(cells[header.indexOf("Zeitstempel in ISO8601")]) / 1000
    );
    const v = +(cells[header.indexOf("Wert")] || "").replace(",", ".");
    result[station].parameter.data.push(v === -777 ? NaN : v);
  });
  return Object.values(result).sort((h1, h2) =>
    h1.station.localeCompare(h2.station)
  );
});
//
</script>
