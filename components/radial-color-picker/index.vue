<template>
	<view ref="radial-color-picker" role="slider" :aria-roledescription="ariaRoledescription" :aria-label="ariaLabel"
		:aria-expanded="isPaletteIn" aria-valuemin="0" aria-valuemax="359" :aria-valuenow="angle"
		:aria-valuetext="ariaValuetext || valuetext" :aria-disabled="disabled" class="rcp"
		:class="{ dragging: isDragging, disabled: disabled }" :tabindex="disabled ? -1 : 0"
		:style="{ '--rcp-initial-angle': initialAngle }">
		<view class="rcp__palette" :class="isPaletteIn ? 'in' : 'out'" />

		<view id="rcp__rotator" ref="rotator" class="rcp__rotator" :style="{
        'pointer-events': disabled || isPressed || !isKnobIn ? 'none' : null
      }" @touchstart.stop="handleTouchStart" @touchmove.prevent="handleTouchMove" @touchend.stop="handleTouchEnd">
			<view class="rcp__knob" :class="isKnobIn ? 'in' : 'out'" @transitionend="hidePalette" />
		</view>

		<view class="rcp__ripple" :style="{ borderColor: color }" />

		<view class="rcp__shadow-inset" />

		<!-- 中间部分 -->
		<view class="rcp__well">
			<image :src="'../../pages/device/atmosphereLight/functions/color-light/images/opacity.png'" />
			<view class="value">{{ pellucidity }}%</view>
		</view>
	</view>
</template>

<script>
	const TO_DEGREES = 180 / Math.PI;
	const normalizeAngle = angle => {
		const mod = angle % 360;
		return mod < 0 ? 360 + mod : mod;
	};
	const getRotationFromCoords = ({
		x,
		y
	}, rect) => {
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		return Math.atan2(y - cy, x - cx) * TO_DEGREES;
	};
	// import { normalizeAngle, getRotationFromCoords } from './rotator'
	var colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'red']

	export default {
		name: 'ColorPicker',
		props: {
			hue: {
				type: Number,
				default: 0
			},
			saturation: {
				type: Number,
				default: 100
			},
			luminosity: {
				type: Number,
				default: 50
			},
			alpha: {
				type: Number,
				default: 1
			},
			step: {
				type: Number,
				default: 1
			},
			mouseScroll: {
				type: Boolean,
				default: false
			},
			variant: {
				type: String,
				default: 'collapsible' // collapsible | persistent
			},
			disabled: {
				type: Boolean,
				default: false
			},

			initiallyCollapsed: {
				type: Boolean,
				default: false
			},

			ariaLabel: {
				type: String,
				default: 'color picker'
			},

			ariaRoledescription: {
				type: String,
				default: 'radial slider'
			},

			ariaValuetext: {
				type: String,
				default: ''
			},

			ariaLabelColorWell: {
				type: String,
				default: 'color well'
			},

			pellucidity: {
				type: Number,
				default: 0

			},
			hasChair: {
				type: Boolean,
				default: false
			},

		},

		data() {
			return {
				el: null,
				rotator: null,
				// private API intented for testing memory leaks
				rcp: null, //  需要mouted初始化
				// state
				initialAngle: `${this.hue}deg`,
				angle: this.hue,
				isPaletteIn: !this.initiallyCollapsed,
				isKnobIn: !this.initiallyCollapsed,
				isPressed: false,
				isDragging: false,

			}
		},

		computed: {
			color() {
				return `hsla(${this.angle}, ${this.saturation}%, ${this.luminosity}%, ${this.alpha})`
			},

			valuetext() {
				if (this.hasChair) {
					colors = ['red', 'pink', 'green', 'cyan', 'blue', 'magenta', 'red']
				}
				return colors[Math.round(this.angle / 60)]
			}
		},

		watch: {
			hue(value) {
				this.angle = value
				this.initialAngle = `${value}deg`
			}
		},

		mounted() {
			// the Rorator module already has an extensive test suite
			// istanbul ignore next
		},

		methods: {
			hidePalette() {
				if (!this.isKnobIn) {
					this.isPaletteIn = false
				}
			},

			// 拖动开始
			handleTouchStart(event) {
				this.isDragging = true
				// if (event.type === 'touchstart' || event.currentTarget.id === 'rcp__rotator') {
				// 	this.isDragging = true
				// 	this.setAngleFromEvent(event);
				// }
			},

			// 移动
			handleTouchMove(event) {
				if (event.type === 'touchstart' || event.currentTarget.id === 'rcp__rotator') {
					this.isDragging = true
					this.setAngleFromEvent(event);
				}
			},

			// 设置角度
			setAngleFromEvent(event) {

				const ev = event.changedTouches ? event.changedTouches[0] : event;
				let newAngle = 0
				const query = uni.createSelectorQuery().in(this);
				query.select('#rcp__rotator').boundingClientRect(rect => {
					if (rect) {
						// 获取到 DOM 元素的位置信息 rect

						newAngle = getRotationFromCoords({
							x: ev.clientX,
							y: ev.clientY
						}, rect);

						this.$emit('change', normalizeAngle(newAngle + 90));
					}
				}).exec();
			},

			// 拖动结束
			handleTouchEnd(event) {
				// this.isDragging = false
				let that = this
				if (event.type === 'touchend' || event.currentTarget.id === 'rcp__rotator') {
					this.isDragging = false
					setTimeout(() => {
						that.setAngleFromEvent(event);
					}, 500)
				}
			}
		}
	}
</script>

<style lang="scss">
	.rcp,
	.rcp view,
	.rcp button {
		-webkit-touch-callout: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-user-select: none;
		-moz-user-select: none;
		user-select: none;
		box-sizing: border-box;
	}

	.rcp {
		display: block;
		// overflow: hidden;
		width: 280px;
		height: 280px;
		position: relative;
		transform: scale(0.798);
		transition: transform 0.15s cubic-bezier(0.68, 0, 0.47, 2);
	}

	.rcp__shadow-inset {
		box-shadow: inset 0px 1px 9px 5px rgba(227, 227, 227, 0.5);
		position: absolute;
		width: 172px;
		height: 172px;
		top: 50%;
		left: 50%;
		margin-top: -86px;
		margin-left: -86px;
		border-radius: 100%;
	}

	.rcp:focus {
		outline: 0;
	}

	.rcp:hover .rcp__knob {
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.19), 0 0 10px rgba(0, 0, 0, 0.24);
	}

	.rcp.dragging {
		/* transform: scale(1.04); */
	}

	.rcp.disabled {
		cursor: not-allowed;
		transform: scale(0.96);
	}

	.rcp.dragging .rcp__rotator {
		z-index: 1;
	}

	.rcp__palette {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background-size: 100% 100%;
		background-image: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
		-webkit-mask-image: radial-gradient(circle at 50% 50%, transparent 53.5%, black 54%);
		mask-image: radial-gradient(circle at 50% 50%, transparent 53.5%, black 54%);
		border-radius: 50%;
		overflow: hidden;
		will-change: transform, opacity;
		transition: transform 0.5s cubic-bezier(0.35, 0, 0.25, 1), opacity 0.5s cubic-bezier(0.35, 0, 0.25, 1);
	}

	.rcp__palette.in {
		/* transform: scale(1); */
		opacity: 1;
	}

	.rcp__palette.out {
		transform: scale(0);
		opacity: 1;
	}

	.disabled .rcp__palette {
		filter: contrast(0.25);
	}

	.rcp__rotator {
		width: 100%;
		height: 100%;
		position: absolute;
		transform: rotate(var(--rcp-initial-angle));
	}

	.rcp__knob {
		// box-shadow: 0 0 10px rgba(0, 0, 0, 0.12), 0 0 5px rgba(0, 0, 0, 0.16);
		border-radius: 50%;
		position: relative;
		width: 42.7px;
		height: 42.7px;
		top: -2%;
		left: 46.5%;
		background-color: #434343;
		transition: transform 0.4s cubic-bezier(0.35, 0, 0.25, 1);
		outline: 0;
		border-style: none;

		&:after {
			position: absolute;
			content: '';
			width: 35px;
			height: 35px;
			border-radius: 100%;
			left: 50%;
			top: 50%;
			margin-left: -17.5px;
			margin-top: -17.5px;
			box-shadow: inset 0px 1px 3px 0px rgba(255, 255, 255, 0.5);
		}
	}

	.rcp__knob.in {
		transform: scale(1);
	}

	.rcp__knob.out {
		transform: scale(0);
	}

	.disabled .rcp__knob {
		box-shadow: none;
		pointer-events: none;
	}

	.rcp__well {
		position: absolute;
		width: 150px;
		height: 150px;
		top: 50%;
		left: 50%;
		margin-top: -75px;
		margin-left: -75px;
		padding: 0;
		border-radius: 50%;
		outline: 0;
		cursor: pointer;

		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;

		image {
			width: 44rpx;
			height: 44rpx;
		}

		.value {
			margin-top: 10px;
			font-size: 64rpx;
			font-weight: bold;
			color: #fff
		}

		.hint {
			margin-top: 10px;
			font-size: 28rpx;
			color: #80858E;
		}
	}

	.rcp__well::-moz-focus-inner {
		border: 0;
	}

	.rcp__well:hover {
		box-shadow: 0 0 1px 1px #333;
	}

	.rcp__well:focus {
		box-shadow: 0 0 1px 2px #b2b2b2;
	}

	.rcp__well.pressed {
		animation: rcp-beat 0.4s cubic-bezier(0.35, 0, 0.25, 1) forwards;
	}

	.disabled .rcp__well {
		background-color: #bfbfbf !important;
		pointer-events: none;
	}

	.rcp__ripple {
		width: 20%;
		height: 20%;
		border-radius: 50%;
		border: #ff0000 solid 8px;
		opacity: 0;
		position: absolute;
		top: 40%;
		left: 40%;
		z-index: -1;
	}

	.rcp__ripple.rippling {
		z-index: 0;
		animation: rcp-ripple 0.5s cubic-bezier(0.35, 0, 0.25, 1) forwards;
	}

	@keyframes rcp-ripple {
		0% {
			transform: scale(1);
			opacity: 0.3;
		}

		50% {
			opacity: 0.1;
		}

		100% {
			opacity: 0;
			border-width: 0;
			transform: scale(3.8);
		}
	}

	@keyframes rcp-beat {
		0% {
			transform: scale(1);
		}

		25% {
			transform: scale(0.8);
		}

		50% {
			transform: scale(1);
		}

		100% {
			transform: scale(1);
		}
	}
</style>