<!-- 
<template>
  <view class="container" @touchmove="handleTouchMove">
    <button
      @click="toggleBalls"
      class="control-button"
      :style="buttonStyle"
    >
      {{ isMoved ? '收回小球' : '移动小球' }}
    </button>
    <view class="balls-container" :style="containerStyle">
      <view
        v-for="(ball, index) in balls"
        :key="index"
        class="ball"
        :style="getBallStyle(ball, index)"
      ></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      balls: [
        { angle: 0, position: { x: 0, y: 0 } },
        { angle: 60, position: { x: 0, y: 0 } },
        { angle: 120, position: { x: 0, y: 0 } }
      ],
      radius: 100,
      isMoved: false,
      movingDuration: 500,
      intervalBetweenBalls: 300,
      buttonPosition: { x: 0, y: 0 },
      screenWidth: uni.getSystemInfoSync().windowWidth
    };
  },
  computed: {
    buttonStyle() {
      return {
        position: 'absolute',
        top: `${this.buttonPosition.y}px`,
        left: `${this.buttonPositionX}px`,
        zIndex: 10
      };
    },
    containerStyle() {
      return {
        position: 'absolute',
        top: `${this.buttonPosition.y - this.radius}px`,
        left: `${this.buttonPositionX - this.radius}px`,
        width: `${this.radius * 2}px`,
        height: `${this.radius * 2}px`,
        display: 'flex',
        justifyContent: this.isLeftSide ? 'flex-start' : 'flex-end',
        alignItems: 'center'
      };
    },
    buttonPositionX() {
      return this.buttonPosition.x < this.screenWidth / 2 ? this.buttonPosition.x : this.screenWidth - this.buttonPosition.x - 50; // 假设按钮宽度为50px
    },
    isLeftSide() {
      return this.buttonPosition.x < this.screenWidth / 2;
    }
  },
  methods: {
    handleTouchMove(event) {
      this.buttonPosition = {
        x: event.touches.pageX,
        y: event.touches.pageY
      };
    },
    toggleBalls() {
      this.balls.forEach((ball, index) => {
        setTimeout(() => {
          if (this.isMoved) {
            this.moveBallToCenter(index);
          } else {
            this.moveBallToAngle(index, this.isLeftSide);
          }
        }, index * this.intervalBetweenBalls);
      });
      this.isMoved = !this.isMoved;
    },
    moveBallToAngle(index, isLeft) {
      const radians = (this.balls[index].angle - (isLeft ? 90 : -90)) * (Math.PI / 180);
      const x = Math.cos(radians) * this.radius;
      const y = Math.sin(radians) * this.radius;
      this.$set(this.balls, index, {
        ...this.balls[index],
        position: { x, y }
      });
    },
    moveBallToCenter(index) {
      this.$set(this.balls, index, {
        ...this.balls[index],
        position: { x: 0, y: 0 }
      });
    },
    getBallStyle(ball, index) {
      return {
        transform: `translate(${ball.position.x}px, ${ball.position.y}px)`,
        transition: `all ${this.movingDuration}ms ease`,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transformOrigin: 'center',
        zIndex: this.isMoved ? 10 - index : 10 + index
      };
    }
  }
};
</script>

<style scoped>
.container {
  position: relative;
 /* width: 100vw;
  height: 100vh; */
  overflow: hidden;
  width: 300px;
  height: 300px;
}

.control-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #ffffff;
  border: 1px solid #000000;
  border-radius: 5px;
  cursor: pointer;
}

.balls-container {
  pointer-events: none;
}

.ball {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #3498db;
}
</style> -->


<template>
	<view class="container">
		<!--   <button @click="toggleBalls" class="control-button">
      {{ isMoved ? '收回小球' : '移动小球' }} -->
		<view v-if="!isMoved" class="my_cover" @click="close"></view>
		<uni-icons color="#fff" class="control-button" size="30" @click="toggleBalls" type="compose"></uni-icons>
		<!-- </button> -->
		<view class="balls-container" ref="container">

			<view v-for="(ball, index) in balls" :key="index" :class=" ball.active? 'selectBall':'ball'"
				:style="getBallStyle(ball)" @click="_onItemClick(index, ball)">{{$t(ball.text)}}
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		emits: ['fabClick', 'trigger'],
		props: {
			Myball: {
				type: Array,
				default: [{
						angle: 330,
						position: {
							x: 0,
							y: 0
						},
						active: false
					},
					{
						angle: 270,
						position: {
							x: 0,
							y: 0
						},
						active: false
					},
					{
						angle: 210,
						position: {
							x: 0,
							y: 0
						},
						active: false
					}
				]
			}
		},
		data() {
			return {
				balls: [],
				// balls: [
				//   { angle: 330, position: { x: 0, y: 0 } },
				//   { angle: 270, position: { x: 0, y: 0 } },
				//   { angle: 210, position: { x: 0, y: 0 } }
				// ],
				radius: 100,
				isMoved: true,
				movingDuration: 500,
				intervalBetweenBalls: 100
			};
		},
		computed: {
			// ball(){
			//  return this.Myball
			// }
		},
		methods: {

			/**
			 * 按钮点击事件
			 */
			_onItemClick(index, item) {
				if (this.isMoved) {
					return
				}
				// this.isShow = !this.isShow
				this.$emit('trigger', {
					index,
					item
				})
			},

			toggleBalls() {
				this.balls.forEach((ball, index) => {
					setTimeout(() => {
						if (this.isMoved) {
							this.moveBallToCenter(index);
						} else {
							this.moveBallToAngle(index);
						}
					}, index * this.intervalBetweenBalls);
				});
				this.isMoved = !this.isMoved;
			},
			close() {

				this.isMoved = true
				this.balls.forEach((ball, index) => {
					this.moveBallToCenter(index)
				})
			},
			moveBallToAngle(index) {
				const radians = (this.balls[index].angle - 90) * (Math.PI / 180);
				const x = Math.cos(radians) * this.radius;
				const y = Math.sin(radians) * this.radius;
				this.$set(this.balls, index, {
					...this.balls[index],
					position: {
						x,
						y
					}
				});
			},
			moveBallToCenter(index) {
				this.$set(this.balls, index, {
					...this.balls[index],
					position: {
						x: 0,
						y: 0
					}
				});
			},
			getBallStyle(ball) {
				return {
					transform: `translate(${ball.position.x - 30 }px, ${ball.position.y - 30}px)`,
					transition: `all ${this.movingDuration}ms ease`,
					position: 'absolute',
					top: '50%',
					left: '50%',
					transformOrigin: 'center'
				};
			}
		},
		mounted() {
			// 确保.balls-container的中心与按钮的中心对齐
			// const buttonRect = this.$refs.container.getBoundingClientRect();
			this.balls = this.Myball
			const containerStyle = this.$refs.container.style;
			if (containerStyle) {
				containerStyle.width = `${this.radius * 2}px`;
				containerStyle.height = `${this.radius * 2}px`;
				containerStyle.marginTop = `-${this.radius + 30}px`;
				containerStyle.marginLeft = `-${this.radius + 30}px`;
			}
		}
	};
</script>

<style scoped>
	.my_cover {
		width: 100vw;
		height: 100vh;
		position: absolute;
		left: -100vw;
		top: -80vh;
		background-color: transparent;

	}

	.container {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		/* background-color: red; */

		/* height: 100vh; */
		/* 为了演示，设置容器高度为视口高度 */
	}

	.control-button {
		/* padding: 10px 20px; */
		font-size: 16px;
		cursor: pointer;
		width: 60px;
		height: 60px;
		position: absolute;
		/* 确保按钮相对于.container定位 */
		z-index: 999;
		background-color: black;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.balls-container {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.ball {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background-color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		white-space: pre-line;
		font-size: 12px;
		color: black;
	}

	.selectBall {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background-color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		white-space: pre-line;
		font-size: 12px;
		color: #f9ae3d;
	}
</style>