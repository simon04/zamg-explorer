<template>
  <h2>Stationsdaten {{ params.station }} {{ params.parameter }}</h2>
  <p>
    Quelle: {{ url }}, <a href="https://data.hub.zamg.ac.at/">ZAMG Data Hub</a>,
    <a href="https://opendefinition.org/licenses/cc-by/">CC BY</a>
  </p>

  <div v-if="error">{{ error }}</div>
  <div v-else-if="isFetching">Loading {{ url }} ...</div>
  <TimeseriesChart v-else-if="data" :data="data" />
</template>

<script setup lang="ts">
import { useFetch, useUrlSearchParams } from "@vueuse/core";
import { computed } from "vue";
import { API, StationGeoJSONSerializer } from "./openapi";
import TimeseriesChart from "./TimeseriesChart.vue";

const params = useUrlSearchParams("history");

const url = computed(
  () =>
    API +
    "/station/historical/tawes-v1-10min?" +
    new URLSearchParams({
      station_ids: String(params.station),
      parameters: String(params.parameter),
      output_format: "geojson",
      start: "2022-10-01T00:00",
      end: "2022-11-01T00:00",
    })
);
const { isFetching, error, data } = useFetch(
  "https://corsproxy.io/?" + encodeURIComponent(url.value),
  { refetch: true }
).json<StationGeoJSONSerializer>();
</script>
