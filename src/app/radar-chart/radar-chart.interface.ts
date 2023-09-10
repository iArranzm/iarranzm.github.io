export interface ChartItem {
	axis: string
	value: number
}

export interface ChartConfig {
	w: number //Width of the circle
	h: number //Height of the circle
	margin: { top: number; bottom: number; left: number; right: number } //The margins of the SVG
	levels: number //How many levels or inner circles should there be drawn
	maxValue: number //What is the value that the biggest circle will represent
	labelFactor: number //How much farther than the radius of the outer circle should the labels be placed
	wrapWidth: number //The number of pixels after which a label needs to be given a new line
	opacityArea: number //The opacity of the area of the blob
	dotRadius: number //The size of the colored circles of each blog
	opacityCircles: number //The opacity of the circles of each blob
	strokeWidth: number //The width of the stroke around each blob
	roundStrokes: boolean //If true the area and stroke will follow a round path (cardinal-closed)
	color: Function //Color function
	showTooltip: boolean // Show tooltip on mouseover
	changeBlobOpacity: boolean // Change blob opacity on hover
	grid: {
		// Config related to radar axis
		showValueLabel: boolean // Show the value of each level
		valueLabelColor?: string // Color hex for label value of each level
		valueLabelSize?: number // Font size for label value of each level
		showAxisLabel: boolean // Show the label for the axis
		axisLabelColor?: string // Color hex for axis label
		axisLabelSize?: number // Font size for axis label
		axisEdge?: number // How much the axis will overcome the outmost circle. 1 means equal length as the circle
		axisWidth?: number // Width for the axis line
		axisStrokeColor?: string // Color hex for axis lines
		circleFillColor?: string // Fill color for
		circleStrokeColor?: string
	}
}
