import {Chart, ChartSize, PluginServiceGlobalRegistration, PluginServiceRegistrationOptions} from "chart.js/auto";

interface ChartJsPluginRangeSelectExtendedOptions {
	rangeSelect?: RangeSelectOptions;
}

interface RangeSelectOptions {
	onSelectionChanged?: (filteredDataSets: Array<Array<any>>) => void;
	fillColor?: string | CanvasGradient | CanvasPattern;
	cursorColor?: string | CanvasGradient | CanvasPattern;
	cursorWidth?: number;
	state?: RangeSelectState;
}

interface RangeSelectState {
	canvas: HTMLCanvasElement;
}

interface ActiveSelection {
	x: number;
	w: number;
}

interface CanvasCreation {
	canvas: HTMLCanvasElement;
	resetSelection: () => void;
}

export class ChartJsPluginRangeSelect implements PluginServiceRegistrationOptions, PluginServiceGlobalRegistration {
	public id = 'rangeSelect';

	beforeInit(chartInstance: Chart, options?: any) {
		const opts = (chartInstance.config.options as ChartJsPluginRangeSelectExtendedOptions);
		if (opts.rangeSelect) {
			const canvas = this.createOverlayCanvas(chartInstance);
			chartInstance.canvas.parentElement.prepend(canvas.canvas);

			const closeBtn = document.createElement('button');
			closeBtn.className = 'btn-close position-absolute';
			closeBtn.type = 'button';
			closeBtn.style.top = '0';
			closeBtn.style.right = '0';
			closeBtn.style.visibility = 'hidden';
			closeBtn.addEventListener('click',canvas.resetSelection);
			chartInstance.canvas.parentElement.prepend(closeBtn);

			opts.rangeSelect = Object.assign({}, opts.rangeSelect, {state: {canvas: canvas.canvas, closeBtn}});
		}
	}

	resize(chartInstance: Chart, newChartSize: ChartSize, options?: any) {
		const rangeSelectOptions = (chartInstance.config.options as ChartJsPluginRangeSelectExtendedOptions).rangeSelect;
		if (rangeSelectOptions) {
			rangeSelectOptions.state.canvas.width = newChartSize.size.width;
			rangeSelectOptions.state.canvas.height = newChartSize.size.height;
		}
	}

	destroy(chartInstance: Chart) {
		const rangeSelectOptions = (chartInstance.config.options as ChartJsPluginRangeSelectExtendedOptions).rangeSelect;
		if (rangeSelectOptions) {
			rangeSelectOptions.state.canvas.remove();
			rangeSelectOptions.state.closeBtn.remove();
			delete rangeSelectOptions.state;
		}
	}

	private createOverlayCanvas(chart: Chart): CanvasCreation {
		const rangeSelectOptions = (chart.config.options as ChartJsPluginRangeSelectExtendedOptions).rangeSelect;
		const overlay = this.createOverlayHtmlCanvasElement(chart);
		const ctx = overlay.getContext('2d');

		let selection: ActiveSelection = {x: 0, w: 0};
		let isDragging = false;
		let isSelected = false;

		chart.canvas.addEventListener('pointerdown', evt => {
			const rangeSelectOptions = (chart.config.options as ChartJsPluginRangeSelectExtendedOptions).rangeSelect;
			const rect = chart.canvas.getBoundingClientRect();
			selection.x = this.getXInChartArea(evt.clientX - rect.left, chart);
			isDragging = true;
			isSelected = false;
			rangeSelectOptions.state.closeBtn.style.visibility = 'hidden';
			ctx.clearRect(0, 0, overlay.width, overlay.height);
		});

		document.body.addEventListener('pointerleave', evt => {
			if (!isDragging && !isSelected) {
				ctx.clearRect(0, 0, overlay.width, overlay.height);
			}
		});

		document.body.addEventListener('pointermove', evt => {
			if(isSelected){
				return;
			}

			ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);

			const chartContentRect = chart.canvas.getBoundingClientRect();
			const currentX = this.getXInChartArea(evt.clientX - chartContentRect.left, chart);
			if (isDragging) {
				selection.w = currentX - selection.x;
				ctx.fillStyle = rangeSelectOptions.fillColor || '#00000044';
				ctx.fillRect(selection.x, chart.chartArea.top, selection.w, chart.chartArea.bottom - chart.chartArea.top);
			} else {
				const cursorWidth = rangeSelectOptions.cursorWidth || 1;
				ctx.fillStyle = rangeSelectOptions.cursorColor || '#00000088';
				ctx.fillRect(currentX, chart.chartArea.top, cursorWidth, chart.chartArea.bottom - chart.chartArea.top);
			}
		});

		document.body.addEventListener('pointerup', evt => {
			const rangeSelectOptions = (chart.config.options as ChartJsPluginRangeSelectExtendedOptions).rangeSelect;
			const onSelectionChanged = rangeSelectOptions.onSelectionChanged;
			if (onSelectionChanged) {
				onSelectionChanged(this.getDataSetDataInSelection(selection, chart));
			}
			// selection = {w: 0, x: 0};
			isDragging = false;
			isSelected = true;
			rangeSelectOptions.state.closeBtn.style.visibility = 'visible'
			// ctx.clearRect(0, 0, overlay.width, overlay.height);
		});

		const resetSelection = ()=>{
			const rangeSelectOptions = (chart.config.options as ChartJsPluginRangeSelectExtendedOptions).rangeSelect;
			isSelected = false;
			rangeSelectOptions.state.closeBtn.style.visibility = 'hidden';
			selection = {w: 0, x: 0};
			ctx.clearRect(0, 0, overlay.width, overlay.height);
		};

		return {
			canvas: overlay,
			resetSelection
		};
	}

	private createOverlayHtmlCanvasElement(chartInstance: Chart): HTMLCanvasElement {
		const overlay = document.createElement('canvas');
		overlay.style.position = 'absolute';
		overlay.style.pointerEvents = 'none';
		overlay.width = chartInstance.canvas.width;
		overlay.height = chartInstance.canvas.height;
		return overlay;
	}

	private getXInChartArea(val: number, chartInstance: Chart) {
		return Math.min(Math.max(val, chartInstance.chartArea.left), chartInstance.chartArea.right);
	}

	private getDataSetDataInSelection(selection: ActiveSelection, chartInstance: Chart): Array<any> {
		const result = {};
		const xMin = Math.min(selection.x, selection.x + selection.w);
		const xMax = Math.max(selection.x, selection.x + selection.w);
		for (let i = 0; i < chartInstance.data.datasets.length; i++) {
			const data = chartInstance.getDatasetMeta(i)
				.data
				.map((data, idx) => {
					if(xMin <= data.x && xMax >= data.x) {
						// JSON.parse(JSON.stringify()) is needed to convert the proxy into a object
						return JSON.parse(JSON.stringify(chartInstance.data.datasets[i].data[idx]));
					}else{
						return null;
					}
				})
				// filter "null" values out
				.filter(data => data);

			const key = data[0]?.station ? (data[0].station + "-" + data[0].parameter.key) : undefined;
			if(key) {
				result[key] = data;
			}
		}
		return result;
	}
}
