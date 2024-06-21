<template>
  <div ref="chartRef"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import type {
  GeoJSONFeatureParameter,
  StationGeoJSONFeature,
  StationMetadata,
} from "./openapi";
import { formatNumber } from "../util/formatters";
import { useElementSize } from "@vueuse/core";

const props = defineProps<{
  stations: StationMetadata[];
  stationParameters: {
    station: StationGeoJSONFeature;
    parameter: GeoJSONFeatureParameter;
  }[];
  timestamps: number[];
}>();
// https://colorbrewer2.org/?type=qualitative&scheme=Set1&n=7
const colors = [
  "#e41a1c",
  "#377eb8",
  "#4daf4a",
  "#984ea3",
  "#ff7f00",
  "#ffff33",
  "#a65628",
];

function cssVar(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

const chartRef = ref<HTMLDivElement | null>(null);

const { width } = useElementSize(chartRef);

onMounted(() => {
  const config: uPlot.Options = {
    width: 1200,
    height: 600,
    cursor: { sync: { key: "Uy1ru6de9eisha7EireiV5pooM8chaic" } },
    axes: [
      {
        space: 80,
        values: "{YYYY}-{MM}-{DD}\n{HH}:{mm}",
        stroke: () => cssVar("--bs-body-color"),
        ticks: {
          stroke: () => cssVar("--bs-body-color"),
          width: +cssVar("--bs-border-width"),
        },
        grid: {
          stroke: () => cssVar("--bs-body-color"),
          width: +cssVar("--bs-border-width"),
        },
      },
      {
        stroke: () => cssVar("--bs-body-color"),
        ticks: {
          stroke: () => cssVar("--bs-body-color"),
          width: +cssVar("--bs-border-width"),
        },
        grid: {
          stroke: () => cssVar("--bs-body-color"),
          width: +cssVar("--bs-border-width"),
        },
        label: props.stationParameters
          .map(({ parameter }) => parameter.name)
          .filter((value, index, array) => array.indexOf(value) === index)
          .join(", "),
        values: (_, values) =>
          values.map((v) =>
            formatNumber(v, props.stationParameters[0].parameter.unit),
          ),
      },
    ],
    series: [
      {
        label: "Datum/Uhrzeit",
        value: "{YYYY}-{MM}-{DD} {HH}:{mm}",
      },
      ...props.stationParameters.map(
        ({ station, parameter }, index): uPlot.Series => {
          const stationName =
            props.stations.find((s) => s.id === station.properties.station)
              ?.name || station.properties.station;
          return {
            label: `${stationName}: ${parameter.name} `,
            value: (_, v) => formatNumber(v, parameter.unit),
            stroke: colors[index % colors.length],
          };
        },
      ),
    ],
  };
  const data: uPlot.AlignedData = [
    props.timestamps,
    ...props.stationParameters.map(({ parameter }) => parameter.data),
  ];
  const chart = new uPlot(config, data, chartRef.value!);
  onUnmounted(() => chart.destroy());

  watch(width, (w) => chart.setSize({ width: w, height: 600 }), {
    immediate: true,
  });
});
</script>

<style>
.u-value {
  min-width: 4rem;
}
</style>
