<template>
  <table class="table">
    <caption>
      Statistiken
    </caption>
    <thead>
      <th>Station</th>
      <th>Parameter</th>
      <th class="text-end">Min</th>
      <th class="text-end">⌀</th>
      <th class="text-end">Max</th>
      <th class="text-end">Summe</th>
    </thead>
    <tbody>
      <tr v-for="sp in stationsParameters">
        <th>{{ sp.station }}</th>
        <th>{{ sp.parameter.name }}</th>
        <td class="text-end">
          {{ statistics("min", sp.parameter) }}
        </td>
        <td class="text-end">
          {{ statistics("mean", sp.parameter) }}
        </td>
        <td class="text-end">
          {{ statistics("max", sp.parameter) }}
        </td>
        <td class="text-end">
          {{ statistics("sum", sp.parameter) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { max, min, mean, sum } from "lodash";

import type {
  GeoJSONFeatureParameter,
  StationGeoJSONSerializer,
} from "./openapi";

const props = defineProps<{
  data: StationGeoJSONSerializer;
}>();

// 900 sec
const timestampDistanceSeconds = computed(
  () =>
    (Date.parse(props.data.timestamps[1]) -
      Date.parse(props.data.timestamps[0])) /
    1000
);

type Mode = "min" | "mean" | "max" | "sum";

function statistics(
  mode: Mode,
  parameter: GeoJSONFeatureParameter,
  digits = 1
): string {
  let value = { min, mean, max, sum }[mode](parameter.data);
  let unit = parameter.unit;
  if (typeof value !== "number") return "–";
  if (mode === "sum" && unit === "W/m²") {
    value = (value * (timestampDistanceSeconds.value / 3600)) / 1000;
    unit = "kWh/m²";
  } else if (mode === "sum" && unit === "sec") {
    value = value / 3600;
    unit = "h";
  } else if (mode === "sum" && unit !== "mm") {
    return "";
  }
  const timestamp =
    mode === "min" || mode === "max"
      ? props.data.timestamps[parameter.data.indexOf(value)]
      : "";
  return (
    value.toLocaleString("de-AT", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }) +
    "\u2009" +
    unit +
    (timestamp ? ` (${timestamp.replace(":00+00:00", " UTC")})` : "")
  );
}

const stationsParameters = computed(() =>
  props.data?.features
    ?.flatMap((station) =>
      Object.values(station.properties.parameters).map((parameter) => ({
        station: station.properties.station,
        parameter,
      }))
    )
    .sort((sp1, sp2) => sp1.parameter.name.localeCompare(sp2.parameter.name))
);
</script>
