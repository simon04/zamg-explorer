<template>
  <h2>Stationsdaten</h2>

  <details class="mb-3 d-print-none">
    <summary>
      <span>Stationen auswählen:</span>
      <span
        v-for="s in props.stations"
        v-show="stations.includes(s.id)"
        class="badge text-bg-secondary m-1 me-0"
      >
        {{ s.name }} ({{ s.state }})
        <span class="font-monospace">{{ s.id }}</span>
      </span>
    </summary>
    <div class="card" style="max-height: 400px; overflow-x: scroll">
      <div class="card-body">
        <table class="table table-sm">
          <tbody>
            <StationRow
              v-for="station in props.stations"
              :dataset="props.dataset"
              :station="station"
            >
              <td>
                <input type="checkbox" :value="station.id" v-model="stations" />
              </td>
            </StationRow>
          </tbody>
        </table>
      </div>
    </div>
  </details>

  <details class="mb-3 d-print-none">
    <summary>Tabelle der ausgewählten Stationen anzeigen</summary>
    <div class="card">
      <div class="card-body">
        <table class="table table-sm">
          <tbody>
            <StationRow
              v-for="station in props.stations"
              v-show="stations.includes(station.id)"
              :dataset="props.dataset"
              :station="station"
            >
              <td>
                <input type="checkbox" :value="station.id" v-model="stations" />
              </td>
            </StationRow>
          </tbody>
        </table>
      </div>
    </div>
  </details>

  <details class="mb-3 d-print-none">
    <summary>
      <span>Parameter auswählen:</span>
      <span
        v-for="p in props.parameters"
        v-show="parameters.includes(p.name)"
        class="badge text-bg-secondary m-1 me-0"
      >
        <abbr :title="formatParameterStr(p)">{{ p.name }}</abbr>
      </span>
    </summary>
    <div class="card" style="max-height: 400px; overflow-x: scroll">
      <div class="card-body">
        <table class="table table-sm">
          <tbody>
            <ParameterRow
              v-for="parameter in props.parameters"
              :parameter="parameter"
            >
              <td>
                <input
                  type="checkbox"
                  :value="parameter.name"
                  v-model="parameters"
                /></td
            ></ParameterRow>
          </tbody>
        </table>
      </div>
    </div>
    <div></div>
  </details>

  <div class="input-group mb-3 d-print-none">
    <span class="input-group-text">Zeitbereich</span>
    <input type="date" class="form-control" v-model="params.start" />
    <span class="input-group-text">…</span>
    <input type="date" class="form-control" v-model="params.end" />
  </div>

  <div class="mb-3 d-print-none">
    <button class="btn btn-primary me-2">
      Graph aktualisieren (automatisch)
    </button>
    <a :href="url.replace(/geojson/, 'csv')" class="btn btn-success me-2">
      CSV-Download
    </a>
    <a :href="url" class="btn btn-success me-2">GeoJSON-Download</a>
  </div>

  <div v-if="error">{{ error }}</div>
  <div v-else-if="isFetching" class="mt-5 d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <template v-else-if="data">
    <template v-for="sp in stationParametersByUnit">
      <TimeseriesChart
        class="mt-5"
        :timestamps="timestamps"
        :station-parameters="sp"
        :stations="props.stations"
      />
    </template>
    <TimeseriesStatistics class="mt-5" :data="data" />
  </template>
  <SourceFooter :url="url" />
</template>

<script setup lang="ts">
import { refDebounced, useFetch, useUrlSearchParams } from "@vueuse/core";
import { computed } from "vue";
import {
  API,
  type ParameterMetadataModel,
  type StationGeoJSONSerializer,
  type StationMetadata,
} from "./openapi";
import ParameterRow from "./ParameterRow.vue";
import SourceFooter from "./SourceFooter.vue";
import StationRow from "./StationRow.vue";
import TimeseriesChart from "./TimeseriesChart.vue";
import TimeseriesStatistics from "./TimeseriesStatistics.vue";

const props = defineProps<{
  dataset: string;
  stations: StationMetadata[];
  parameters: ParameterMetadataModel[];
}>();

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const params = useUrlSearchParams("history");
params.parameter ||=
  props.parameters.find((p) => ["TL", "TTX", "T", "t"].includes(p.name))
    ?.name || [];
params.start ||= yesterday.toISOString().slice(0, "2006-01-02".length);
params.end ||= tomorrow.toISOString().slice(0, "2006-01-02".length);

const stations = computed({
  get: () =>
    Array.isArray(params.station)
      ? params.station
      : typeof params.station === "string"
        ? [params.station]
        : [],
  set: (v) => (params.station = Array.isArray(v) ? v : [v]),
});
const parameters = computed({
  get: () =>
    Array.isArray(params.parameter)
      ? params.parameter
      : typeof params.parameter === "string"
        ? [params.parameter]
        : [],
  set: (v) => (params.parameter = Array.isArray(v) ? v : [v]),
});

const url = computed(
  () =>
    `${API}/station/historical/${props.dataset}?` +
    new URLSearchParams({
      station_ids: stations.value.join(),
      parameters: parameters.value.join(),
      output_format: "geojson",
      start: new Date(String(params.start)).toISOString(),
      end: new Date(String(params.end)).toISOString(),
    }),
);
const { isFetching, error, data } = useFetch(
  refDebounced(
    computed(() => "https://corsproxy.io/?" + encodeURIComponent(url.value)),
    400,
  ),
  { refetch: true },
).json<StationGeoJSONSerializer>();

const timestamps = computed(
  () => data.value?.timestamps.map((t) => new Date(t).getTime() / 1000) ?? [],
);

const stationParameters = computed(
  () =>
    data.value?.features?.flatMap((station) =>
      Object.values(station.properties.parameters).map((parameter) => ({
        station: station.properties.station,
        parameter,
      })),
    ) ?? [],
);

const units = computed(() =>
  stationParameters.value
    .map(({ parameter }) => parameter.unit)
    .filter((value, index, array) => array.indexOf(value) === index),
);

const stationParametersByUnit = computed(() =>
  Object.fromEntries(
    units.value.map((unit) => [
      unit,
      stationParameters.value?.filter(
        ({ parameter }) => parameter.unit === unit,
      ),
    ]),
  ),
);

function formatParameterStr(parameter: ParameterMetadataModel) {
  const unit = parameter.unit ? `[${parameter.unit}]` : "";
  return `${parameter.name} ${unit} (${parameter.long_name})`;
}
</script>
