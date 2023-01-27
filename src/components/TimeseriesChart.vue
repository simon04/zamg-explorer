<template>
  <div ref="chartRef"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import type { StationGeoJSONSerializer, StationMetadata } from "./openapi";
import { formatNumber } from "../util/formatters";

const props = defineProps<{
  stations: StationMetadata[];
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

const chartRef = ref<HTMLDivElement | null>(null);
onMounted(() => {
  const stationParameters = props.data?.features?.flatMap((station) =>
    Object.values(station.properties.parameters).map((parameter) => ({
      station,
      parameter,
    }))
  );
  const config: uPlot.Options = {
    width: 1200,
    height: 600,
    axes: [
      {
        space: 80,
        values: "{YYYY}-{MM}-{DD}\n{HH}:{mm}",
      },
    ],
    series: [
      {
        label: "Datum/Uhrzeit",
        value: "{YYYY}-{MM}-{DD} {HH}:{mm}",
      },
      ...stationParameters.map(
        ({ station, parameter }, index): uPlot.Series => {
          const stationName =
            props.stations.find((s) => s.id === station.properties.station)
              ?.name || station.properties.station;
          return {
            label: `${stationName}: ${parameter.name} `,
            value: (_, v) => formatNumber(v, parameter.unit),
            stroke: colors[index % colors.length],
          };
        }
      ),
    ],
  };
  const data: uPlot.AlignedData = [
    props.data?.timestamps.map((t) => new Date(t).getTime() / 1000),
    ...stationParameters.map(({ parameter }) => parameter.data),
  ];
  const chart = new uPlot(config, data, chartRef.value!);
  console.table(chart.axes[0].values);
  onUnmounted(() => chart.destroy());
});
</script>

<style>
.u-value {
  min-width: 4rem;
}
</style>
