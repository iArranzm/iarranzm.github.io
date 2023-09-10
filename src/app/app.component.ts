import { Component, HostListener, OnInit } from '@angular/core'
import { faker } from '@faker-js/faker'
import { ChartConfig } from './radar-chart/radar-chart.interface'

interface career {
	start: string
	end: string
	title: string
	desc: string
	color: string
}
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	private DEGREES: number = 360
	private MAX_SAT: number = 70
	scrolledDown: boolean = false
	isDark: boolean = true

	careersList: career[] = [
		{
			start: 'January 2023',
			end: 'Currently',
			title: 'Front-end Chapter Lead @ Orange Bank Spain',
			desc: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut, ipsam eum minima voluptatum totam expeditadolores eaque ab ullam, asperiores aperiam necessitatibus! Cum enim amet eaque ea labore eum consequatur.',
			color: this.getColor(),
		},
		{
			start: 'January 2023',
			end: 'Currently',
			title: 'Front-end Chapter Lead @ Orange Bank Spain',
			desc: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit.',
			color: this.getColor(),
		},
		{
			start: 'January 2023',
			end: 'Currently',
			title: 'Front-end Chapter Lead @ Orange Bank Spain',
			desc: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut, ipsam eum minima voluptatum totam expeditadolores eaque ab ullam, asperiores aperiam necessitatibus! Cum enim amet eaque ea labore eum consequatur.',
			color: this.getColor(),
		},
		{
			start: 'January 2023',
			end: 'Currently',
			title: 'Front-end Chapter Lead @ Orange Bank Spain',
			desc: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut, ipsam eum minima voluptatum totam expeditadolores eaque ab ullam, asperiores aperiam necessitatibus! ',
			color: this.getColor(),
		},
	]

	skillArray = [
		[
			faker.helpers.multiple(
				() => {
					return {
						axis: faker.word.noun(),
						value: faker.number.int({ min: 1, max: 5 }),
					}
				},
				{ count: 20 }
			),
		],
		[
			faker.helpers.multiple(
				() => {
					return {
						axis: faker.word.noun(),
						value: faker.number.int({ min: 1, max: 5 }),
					}
				},
				{ count: 7 }
			),
		],
		[
			faker.helpers.multiple(
				() => {
					return {
						axis: faker.word.noun(),
						value: faker.number.int({ min: 1, max: 5 }),
					}
				},
				{ count: 5 }
			),
		],
		[
			faker.helpers.multiple(
				() => {
					return {
						axis: faker.word.noun(),
						value: faker.number.int({ min: 1, max: 5 }),
					}
				},
				{ count: 2 }
			),
		],
	]

	radarChartOptions = {
		w: 800,
		h: 800,
		margin: { top: 100, right: 100, bottom: 100, left: 100 },
		maxValue: 0.5,
		levels: 5,
		roundStrokes: false,
		grid: {
			showValueLabel: false,
			showAxisLabel: true,
		},
	}

	@HostListener('window:scroll', ['$event'])
	onWindowScroll() {
		this.scrolledDown = document.documentElement.scrollTop > 100 || document.body.scrollTop > 100
	}

	ngOnInit(): void {
		this.checkTheme()
	}

	checkTheme(): void {
		const theme =
			localStorage.getItem('theme') ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		this.setTheme(theme)
	}

	setTheme(theme: string): void {
		const body = document.body

		body.classList.remove('dark', 'light')

		body.classList.add(theme)

		this.isDark = theme === 'dark'
		localStorage.setItem('theme', theme)
		this.updateChartOptions()
	}

	updateChartOptions(): void {
		const chartColors = {
			circleFillColor: getComputedStyle(document.body).getPropertyValue('--borderColor'),
			axisLabelColor: getComputedStyle(document.body).getPropertyValue('--textColor'),
			circleStrokeColor: getComputedStyle(document.body).getPropertyValue('--borderColor'),
			axisStrokeColor: getComputedStyle(document.body).getPropertyValue('--borderColor'),
			showValueLabel: false,
			showAxisLabel: true,
		}
		// Object.assign(this.radarChartOptions, chartColors)
		this.radarChartOptions = { ...this.radarChartOptions, grid: { ...chartColors } }
		console.log('this.radarChartOptions: ', this.radarChartOptions.grid)
	}
	getColor(): string {
		const hue = Math.floor(Math.random() * this.DEGREES)
		const sat = Math.random() * this.MAX_SAT

		return `hsl(${hue}deg, ${sat}%, 50%)`
	}

	scrollTo(target: string): void {
		document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}
}
