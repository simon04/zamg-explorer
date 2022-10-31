<template>
  <div class="position-relative">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watchEffect } from "vue";

import Chart from "chart.js/auto";
import type { ChartConfiguration, ChartDataset } from "chart.js";
import "chartjs-adapter-date-fns";
import { deAT } from "date-fns/locale";
import cloneDeep from "lodash/cloneDeep";
import {ChartJsPluginRangeSelect} from "./chartjs-plugin-range-select";
Chart.register(new ChartJsPluginRangeSelect());

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
    label:
      `${station.properties.station}: ${parameter.name} ` +
      (parameter.unit ? `[${parameter.unit}]` : ""),
    data: props.data?.timestamps.map((timestamp, i) => ({
      x: new Date(timestamp).getTime(),
      y: parameter?.data[i] ?? NaN,
      station: station.properties.station,
      parameter: (({ key, unit, name }) => ({ key, unit, name }))(parameter),
      index: i,
      timestamp
    })),
  };
}

const config: ChartConfiguration = reactive<ChartConfiguration>({
  type: "line",
  data: {
    datasets: props.data?.features
      ?.flatMap((station) =>
        Object.keys(station.properties.parameters).map((key) => ({
          station,
			    parameter: { ...station.properties.parameters[key], key }
        }))
      )
      .map(({ station, parameter }, i) => dataset(station, parameter, i)),
  },
  options: {
    animation: false,
    parsing: false,
    responsive: true,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
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
	  rangeSelect: {
		  onSelectionChanged: (result: Array<Array<any>>) => {
		    props.data.filteredFeatures = cloneDeep(props.data.features);
		    props.data.filteredFeatures.forEach((feature)=>{
          const {station, parameters} = feature.properties;
          for(const param in parameters){
            const key = station + "-" + param;
            const data = result[key];
            if(data) {
				      feature.filtered = true;
				      feature.from = data[0].timestamp;
				      feature.to = data[data.length - 1].timestamp;
              parameters[param].data = parameters[param].data.filter((x, i) => {
                return data.find((y) => y.index === i);
              })
            }
          }
        });
		    console.log(props.data.filteredFeatures);
		  }
	  }
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
