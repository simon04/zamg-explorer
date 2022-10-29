<template>
  <h2>Stationen</h2>
  <p>
    Quelle: {{ url }}, <a href="https://data.hub.zamg.ac.at/">ZAMG Data Hub</a>,
    <a href="https://opendefinition.org/licenses/cc-by/">CC BY</a>
  </p>
  <table class="table">
    <tr v-for="station in stations">
      <td class="font-monospace">{{ station.id }}</td>
      <th>
        <a :href="data(station)">{{ station.name }}</a>
      </th>
      <td>{{ station.state }}</td>
      <td class="text-end">{{ station.altitude }}&thinsp;m&thinsp;ü.A.</td>
      <td><a :href="osm(station)">osm</a> <a :href="geo(station)">geo:</a></td>
      <td class="font-monospace">
        {{ station.valid_from.slice(0, "2006-01-02".length) }}
      </td>
      <td class="font-monospace">
        {{ station.valid_to.slice(0, "2006-01-02".length) }}
      </td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import { API, StationMetadata } from "./openapi";
const url = API + "/station/current/tawes-v1-10min/metadata";
const response = await fetch(url);
const { stations }: { stations: StationMetadata[] } = await response.json();
stations.sort((s1, s2) => s1.name.localeCompare(s2.name));

function data(station: StationMetadata) {
  return `/station/?station=${station.id}&parameter=TL&parameter=RR`;
}
function geo(station: StationMetadata) {
  return `geo:${station.lon},${station.lat},${station.altitude}`;
}
function osm(station: StationMetadata) {
  return `https://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.lon}`;
}
</script>
