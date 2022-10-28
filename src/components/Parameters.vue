<template>
	<h2>Parameters</h2>
	<p>Quelle: {{ url }},
		<a href="https://data.hub.zamg.ac.at/">ZAMG Data Hub</a>,
		<a href="https://opendefinition.org/licenses/cc-by/">CC BY</a>
	</p>
	<table class="table">
		<tr>
			<th>Name</th>
			<th>Bezeichnung</th>
			<th>Einheit</th>
			<th>Beschreibung</th>
		</tr>
		<tr v-for="parameter in parameters">
			<th>{{ parameter.name }}</th>
			<td>{{ parameter.long_name }}</td>
			<td>{{ parameter.unit }}</td>
			<td>{{ parameter.desc }}</td>
		</tr>
	</table>

</template>

<script setup lang="ts">
import type { ParameterMetadataModel } from './openapi'
const url = "https://dataset.api.hub.zamg.ac.at/v1/station/current/tawes-v1-10min/metadata"
const response = await fetch(url);
const { parameters }: { parameters: ParameterMetadataModel[] } = await response.json();

</script>
