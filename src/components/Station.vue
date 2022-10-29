<template>
  <h2>Stationsdaten</h2>
  <p>
    Quelle: {{ url }}, <a href="https://data.hub.zamg.ac.at/">ZAMG Data Hub</a>,
    <a href="https://opendefinition.org/licenses/cc-by/">CC BY</a>
  </p>

  <div class="input-group mb-3">
    <span class="input-group-text">Station</span>
    <input type="text" class="form-control" v-model="stations" />
  </div>

  <div class="input-group mb-3">
    <span class="input-group-text">Parameter</span>
    <input type="text" class="form-control" v-model="parameters" />
  </div>

  <div class="input-group mb-3">
    <span class="input-group-text">Zeitbereich</span>
    <input type="date" class="form-control" v-model="params.start" />
    <span class="input-group-text">…</span>
    <input type="date" class="form-control" v-model="params.end" />
  </div>

  <div class="mb-3">
    <button class="btn btn-primary me-2">
      Graph aktualisieren (automatisch)
    </button>
    <a :href="url.replace(/geojson/, 'csv')" class="btn btn-success me-2">
      CSV-Download
    </a>
  </div>

  <div v-if="error">{{ error }}</div>
  <div v-else-if="isFetching" class="mt-5 d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <TimeseriesChart v-else-if="data" :data="data" />
</template>

<script setup lang="ts">
import { refDebounced, useFetch, useUrlSearchParams } from "@vueuse/core";
import { formatISO, startOfTomorrow, startOfYesterday } from "date-fns";
import { computed } from "vue";
import { API, StationGeoJSONSerializer } from "./openapi";
import TimeseriesChart from "./TimeseriesChart.vue";

const params = useUrlSearchParams("history");
params.start ||= formatISO(startOfYesterday(), { representation: "date" });
params.end ||= formatISO(startOfTomorrow(), { representation: "date" });

const stations = computed({
  get: () =>
    Array.isArray(params.station) ? params.station.join() : params.station,
  set: (v) => (params.station = Array.isArray(v) ? v.join() : v),
});
const parameters = computed({
  get: () =>
    Array.isArray(params.parameter)
      ? params.parameter.join()
      : params.parameter,
  set: (v) => (params.parameter = Array.isArray(v) ? v.join() : v),
});

const url = computed(
  () =>
    API +
    "/station/historical/tawes-v1-10min?" +
    new URLSearchParams({
      station_ids: stations.value,
      parameters: parameters.value,
      output_format: "geojson",
      start: params.start + "T00:00",
      end: params.end + "T00:00",
    })
);
const { isFetching, error, data } = useFetch(
  refDebounced(
    computed(() => "https://corsproxy.io/?" + encodeURIComponent(url.value)),
    400
  ),
  { refetch: true }
).json<StationGeoJSONSerializer>();
</script>
