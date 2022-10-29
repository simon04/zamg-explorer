<template>
  <canvas ref="chartRef"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watchEffect } from "vue";

import Chart from "chart.js/auto";
import type { ChartConfiguration, ChartDataset } from "chart.js";
import "chartjs-adapter-date-fns";
import { deAT } from "date-fns/locale";

import type {
  StationGeoJSONSerializer,
  GeoJSONFeatureParameter,
  StationGeoJSONFeature,
} from "./openapi";

const props = defineProps<{
  data: StationGeoJSONSerializer;
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

function dataset(
  station: StationGeoJSONFeature,
  parameter: GeoJSONFeatureParameter,
  index: number
): ChartDataset {
  return {
    borderColor: colors[index % colors.length],
    borderWidth: 1,
    backgroundColor: "transparent",
    radius: 0,
    label: `${station.properties.station}: ${parameter.name} [${parameter.unit}]`,
    data: props.data?.timestamps.map((timestamp, i) => ({
      x: new Date(timestamp).getTime(),
      y: parameter?.data[i] ?? NaN,
    })),
  };
}

const config: ChartConfiguration = reactive<ChartConfiguration>({
  type: "line",
  data: {
    datasets: props.data?.features
      ?.flatMap((station) =>
        Object.values(station.properties.parameters).map((parameter) => ({
          station,
          parameter,
        }))
      )
      .map(({ station, parameter }, i) => dataset(station, parameter, i)),
  },
  options: {
    animation: false,
    parsing: false,
    responsive: true,
    interaction: { mode: "nearest" },
    scales: {
      x: {
        type: "time",
        title: { text: "Datum/Uhrzeit" },
        adapters: { date: { locale: deAT } },
        time: {
          isoWeekday: true,
          displayFormats: {
            datetime: "yyyy-MM-dd HH:mm:ss",
            millisecond: "HH:mm:ss.SSS",
            second: "HH:mm:ss",
            minute: "HH:mm",
            hour: "HH\u2070\u2070",
            day: "d. MMM",
            week: "PP",
            month: "MMM yyyy",
            quarter: "qqq yyyy",
            year: "yyyy",
          },
        },
        ticks: {
          maxRotation: 0,
          major: { enabled: true },
          font(context) {
            return (context?.tick?.major && { weight: "bold" }) || undefined;
          },
        },
      },
      y: {},
    },
  },
});

const chartRef = ref<HTMLCanvasElement | null>(null);
onMounted(() => {
  const ctx = chartRef.value!.getContext("2d")!;
  const chart = new Chart(ctx, config);
  chart.resize(1200, 600);
  watchEffect(() => {
    chart.data = config.data;
    chart.options.scales = config.options?.scales;
    chart.update();
  });
  onUnmounted(() => chart.destroy());
});
</script>
