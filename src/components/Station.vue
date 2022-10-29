<template>
  <h2>Stationsdaten</h2>

  <div class="input-group mb-3">
    <span class="input-group-text">Station</span>
    <select multiple class="form-control" v-model="stations">
      <option v-for="s in props.stations" :value="String(s.id)">
        {{ s.name }} ({{ s.state }}) <code>{{ s.id }}</code>
      </option>
    </select>
  </div>

  <div class="input-group mb-3">
    <span class="input-group-text">Parameter</span>
    <select multiple class="form-control" v-model="parameters">
      <option v-for="p in props.parameters" :value="p.name">
        {{ p.name }} [{{ p.unit }}] ({{ p.long_name }})
      </option>
    </select>
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

  <table class="table">
    <tbody>
      <StationRow
        v-for="station in props.stations"
        v-show="stations.includes(station.id)"
        :station="station"
      />
    </tbody>
  </table>

  <div v-if="error">{{ error }}</div>
  <div v-else-if="isFetching" class="mt-5 d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <template v-else-if="data">
    <TimeseriesChart class="mt-5" :data="data" />
    <TimeseriesStatistics class="mt-5" :data="data" />
  </template>
  <SourceFooter :url="url" />
</template>

<script setup lang="ts">
import { refDebounced, useFetch, useUrlSearchParams } from "@vueuse/core";
import { formatISO, startOfTomorrow, startOfYesterday } from "date-fns";
import { computed } from "vue";
import {
  API,
  ParameterMetadataModel,
  StationGeoJSONSerializer,
  StationMetadata,
} from "./openapi";
import SourceFooter from "./SourceFooter.vue";
import StationRow from "./StationRow.vue";
import TimeseriesChart from "./TimeseriesChart.vue";
import TimeseriesStatistics from "./TimeseriesStatistics.vue";

const props = defineProps<{
  stations: StationMetadata[];
  parameters: ParameterMetadataModel[];
}>();

const params = useUrlSearchParams("history");
params.start ||= formatISO(startOfYesterday(), { representation: "date" });
params.end ||= formatISO(startOfTomorrow(), { representation: "date" });

const stations = computed({
  get: () =>
    Array.isArray(params.station) ? params.station : [params.station],
  set: (v) => (params.station = Array.isArray(v) ? v : [v]),
});
const parameters = computed({
  get: () =>
    Array.isArray(params.parameter) ? params.parameter : [params.parameter],
  set: (v) => (params.parameter = Array.isArray(v) ? v : [v]),
});

const url = computed(
  () =>
    API +
    "/station/historical/tawes-v1-10min?" +
    new URLSearchParams({
      station_ids: stations.value.join(),
      parameters: parameters.value.join(),
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
