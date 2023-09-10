import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import * as d3 from 'd3'
import { ChartConfig, ChartItem } from './radar-chart.interface'

@Component({
	selector: 'app-radar-chart',
	templateUrl: './radar-chart.component.html',
	styleUrls: ['./radar-chart.component.scss'],
})
export class RadarChartComponent implements OnChanges {
	@Input() config: Object = {}
	@Input() dataColor: Array<string> | null = null
	@Input() data: Array<Array<ChartItem>> = []

	chartSVG: any
	svgGroup: any
	axisGrid: any
	axis: any

	cfg: ChartConfig = {
		w: 600, //Width of the circle
		h: 600, //Height of the circle
		margin: { top: 50, right: 50, bottom: 50, left: 50 }, //The margins of the SVG
		levels: 3, //How many levels or inner circles should there be drawn
		maxValue: 0, //What is the value that the biggest circle will represent
		labelFactor: 1.2, //How much farther than the radius of the outer circle should the labels be placed
		wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
		opacityArea: 0.35, //The opacity of the area of the blob
		dotRadius: 4, //The size of the colored circles of each blog
		opacityCircles: 0.1, //The opacity of the circles of each blob
		strokeWidth: 2, //The width of the stroke around each blob
		roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
		color: d3.scaleOrdinal(d3.schemeCategory10), //Color function
		showTooltip: false,
		changeBlobOpacity: true,
		grid: {
			showValueLabel: false, // Show the value of each level
			showAxisLabel: true, // Show the label for the axis
			axisEdge: 1.1, // How much the axis will overcome the outmost circle. 1 means equal length as the circle
			axisWidth: 1,
		},
	}

	axisNames: Array<string> = []
	totalAxis: number = 0
	radius: number = 0
	angleSlice: number = 0
	radiusScale: any = 0

	ngOnChanges(changes: SimpleChanges): void {
		if (!!changes['config']) {
			console.log('this.config: ', this.config)
			this.updateConfig(this.config)
		}
		if (!!changes['data']) {
		}
		this.getMaxValue()
		this.setChartFns()
		this.initChart()
	}

	updateConfig(config: Object): void {
		this.cfg = { ...this.cfg, ...config }
		// TODO: Clean magic numbers
		this.cfg.w = Math.min(this.cfg.w, window.innerWidth - 10) - this.cfg.margin.left - this.cfg.margin.right
		this.cfg.h = Math.min(this.cfg.w, window.innerHeight - this.cfg.margin.top - this.cfg.margin.bottom - 20)
	}

	getMaxValue(): void {
		this.cfg.maxValue = Math.max(this.cfg.maxValue, ...this.data.flat().map((x) => x.value))
	}

	setChartFns(): void {
		this.axisNames = this.data.flat().map((x) => x.axis)
		this.totalAxis = this.axisNames.length
		this.radius = Math.min(this.cfg.w / 2, this.cfg.h / 2)
		this.angleSlice = (Math.PI * 2) / this.totalAxis
		this.radiusScale = d3.scaleLinear().range([0, this.radius]).domain([0, this.cfg.maxValue])
	}

	initChart(): void {
		if (!!this.chartSVG) {
			d3.select('div#chart').select('svg').remove()
		}

		this.chartSVG = d3
			.select('div#chart')
			.append('svg')
			.attr('width', this.cfg.w + this.cfg.margin.left + this.cfg.margin.right)
			.attr('height', this.cfg.h + this.cfg.margin.top + this.cfg.margin.bottom)
			.attr('class', 'radar-chart')

		//Append a g element
		this.svgGroup = this.chartSVG
			.append('g')
			.attr(
				'transform',
				'translate(' +
					(this.cfg.w / 2 + this.cfg.margin.left) +
					',' +
					(this.cfg.h / 2 + this.cfg.margin.top) +
					')'
			)

		//Filter for the outside glow
		let filter = this.svgGroup.append('defs').append('filter').attr('id', 'glow')
		let feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur')
		let feMerge = filter.append('feMerge')
		let feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur')
		let feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

		this.drawAxisGrid()
		this.drawAxis()
		this.drawBlobs()
		if (this.cfg.showTooltip) {
			this.setTooltip()
		}
	}

	drawAxisGrid(): void {
		this.axisGrid = this.svgGroup.append('g').attr('class', 'axisWrapper')

		this.axisGrid
			.selectAll('.levels')
			.data(d3.range(1, this.cfg.levels + 1).reverse())
			.enter()
			.append('circle')
			.attr('class', 'gridCircle')
			.attr('r', (d: number) => (this.radius / this.cfg.levels) * d)
			.style('fill', this.cfg.grid.circleFillColor || '#CDCDCD')
			.style('stroke', this.cfg.grid.circleStrokeColor || '#CDCDCD')
			.style('fill-opacity', this.cfg.opacityCircles)
			.style('filter', 'url(#glow)')

		if (this.cfg.grid.showValueLabel) {
			this.axisGrid
				.selectAll('.axisLabel')
				.data(d3.range(1, this.cfg.levels + 1).reverse())
				.enter()
				.append('text')
				.attr('class', 'axisLabel')
				.attr('x', 4)
				.attr('y', (d: number) => (-d * this.radius) / this.cfg.levels - 10)
				.attr('dy', '0.4em')
				.style('font-size', (this.cfg.grid.valueLabelSize || '0.75') + 'em')
				.attr('fill', this.cfg.grid.valueLabelColor || '#737373')
				.text((d: number) => (this.cfg.maxValue * d) / this.cfg.levels)
		}
	}

	drawAxis(): void {
		this.axis = this.axisGrid.selectAll('.axis').data(this.axisNames).enter().append('g').attr('class', 'axis')

		this.axis
			.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', (d: any, i: number) => {
				return (
					this.radiusScale(this.cfg.maxValue * (this.cfg.grid.axisEdge || 1.1)) *
					Math.cos(this.angleSlice * i - Math.PI / 2)
				)
			})
			.attr('y2', (d: any, i: number) => {
				return (
					this.radiusScale(this.cfg.maxValue * (this.cfg.grid.axisEdge || 1.1)) *
					Math.sin(this.angleSlice * i - Math.PI / 2)
				)
			})
			.attr('class', 'line')
			.style('stroke', this.cfg.grid.axisStrokeColor || '#ffffff')
			.style('stroke-width', (this.cfg.grid.axisWidth || 1) + 'px')

		//Append the labels at each axis
		if (this.cfg.grid.showAxisLabel) {
			this.axis
				.append('text')
				.attr('class', 'legend')
				.style('font-size', (this.cfg.grid.axisLabelSize || 1) + 'rem')
				.style('fill', this.cfg.grid.axisLabelColor || '#f0f0f0')
				.attr('text-anchor', 'middle')
				.attr('dy', '0.35em')
				.attr('x', (d: any, i: number) => {
					return (
						this.radiusScale(this.cfg.maxValue * this.cfg.labelFactor) *
						Math.cos(this.angleSlice * i - Math.PI / 2)
					)
				})
				.attr('y', (d: any, i: number) => {
					return (
						this.radiusScale(this.cfg.maxValue * this.cfg.labelFactor) *
						Math.sin(this.angleSlice * i - Math.PI / 2)
					)
				})
				.text((d: any) => d)
			// .call(this.wrapText, this.cfg.wrapWidth)
		}
	}

	drawBlobs(): void {
		const radarLine = d3
			.lineRadial()
			.curve(d3.curveLinearClosed)
			.radius((d: any) => this.radiusScale(d.value))
			.angle((d: any, i: number) => this.angleSlice * i)

		if (this.cfg.roundStrokes) {
			radarLine.curve(d3.curveCardinalClosed)
		}

		//Create a wrapper for the blobs
		let blobWrapper = this.svgGroup
			.selectAll('.radarWrapper')
			.data(this.data)
			.enter()
			.append('g')
			.attr('class', 'radarWrapper')

		//Append the backgrounds
		blobWrapper
			.append('path')
			.attr('class', 'radarArea')
			.attr('d', (d: any, i: any) => radarLine(d))
			.style('fill', (d: any, i: any, j: any) => this.cfg.color(j))
			.style('fill-opacity', this.cfg.opacityArea)
			// TODO: custom background opacity
			.on('mouseover', (mouseEvent: any, data: any) => {
				//Dim all blobs
				d3.selectAll('.radarArea').transition().duration(200).style('fill-opacity', 0.1)
				//Bring back the hovered over blob
				d3.select('').transition().duration(200).style('fill-opacity', 0.7)
			})
			.on('mouseout', () => {
				//Bring back all blobs
				d3.selectAll('.radarArea').transition().duration(200).style('fill-opacity', this.cfg.opacityArea)
			})

		//Create the outlines
		blobWrapper
			.append('path')
			.attr('class', 'radarStroke')
			.attr('d', (d: any, i: any) => radarLine(d))
			.style('stroke-width', this.cfg.strokeWidth + 'px')
			.style('stroke', (d: any, i: any, j: any) => this.cfg.color(j))
			.style('fill', 'none')
			.style('filter', 'url(#glow)')

		//Append the circles
		blobWrapper
			.selectAll('.radarCircle')
			.data((d: any, i: any) => d)
			.enter()
			.append('circle')
			.attr('class', 'radarCircle')
			.attr('r', this.cfg.dotRadius)
			.attr('cx', (d: { value: any }, i: number) => {
				return this.radiusScale(d.value) * Math.cos(this.angleSlice * i - Math.PI / 2)
			})
			.attr('cy', (d: { value: any }, i: number) => {
				return this.radiusScale(d.value) * Math.sin(this.angleSlice * i - Math.PI / 2)
			})
			.style('fill', (d: any, i: any, j: any) => {
				return this.cfg.color(j)
			})
			.style('fill-opacity', 0.8)
	}

	setTooltip(): void {
		let blobCircleWrapper = this.svgGroup
			.selectAll('.radarCircleWrapper')
			.data(this.data)
			.enter()
			.append('g')
			.attr('class', 'radarCircleWrapper')

		//Append a set of invisible circles on top for the mouseover pop-up
		blobCircleWrapper
			.selectAll('.radarInvisibleCircle')
			.data((d: any) => d)
			.enter()
			.append('circle')
			.attr('class', 'radarInvisibleCircle')
			.attr('r', this.cfg.dotRadius * 1.5)
			.attr('cx', (d: any, i: any) => {
				return this.radiusScale(d.value) * Math.cos(this.angleSlice * i - Math.PI / 2)
			})
			.attr('cy', (d: any, i: any) => {
				return this.radiusScale(d.value) * Math.sin(this.angleSlice * i - Math.PI / 2)
			})
			.style('fill', 'none')
			.style('pointer-events', 'all')
			.on('mouseover', (mouseEvent: any, d: any) => {
				let newX = parseFloat(d3.select(mouseEvent.target).attr('cx')) - 10
				let newY = parseFloat(d3.select(mouseEvent.target).attr('cy')) - 10

				tooltip.attr('x', newX).attr('y', newY).text(d.value).transition().duration(200).style('opacity', 1)
			})
			.on('mouseout', () => {
				tooltip.transition().duration(200).style('opacity', 0)
			})

		//Set up the small tooltip for when you hover over a circle
		let tooltip = this.svgGroup.append('text').attr('class', 'tooltip').style('opacity', 0)
	}

	wrapText(texts: any, width: any): void {
		texts.each(() => {
			let text = d3.select('text.legend'),
				words = text.text().split(/\s+/).reverse(),
				word,
				line: string[] = [],
				lineNumber = 0,
				lineHeight = 1.4, // ems
				y = text.attr('y'),
				x = text.attr('x'),
				dy = parseFloat(text.attr('dy')),
				tspan = text
					.text(null)
					.append('tspan')
					.attr('x', x)
					.attr('y', y)
					.attr('dy', dy + 'em')
			while ((word = words.pop())) {
				line.push(word)
				tspan.text(line.join(' '))
				if (tspan.node()!.getComputedTextLength() > width) {
					line.pop()
					tspan.text(line.join(' '))
					line = [word]
					tspan = text
						.append('tspan')
						.attr('x', x)
						.attr('y', y)
						.attr('dy', ++lineNumber * lineHeight + dy + 'em')
						.text(word)
				}
			}
		})
	}
}
