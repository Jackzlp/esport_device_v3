<template>
  <view
    :class="['gradient-circle', small ? 'small' : ''] "
  >
    <view class="circle">
      <view :class="['outline', styleType]" />
      <view :class="['middle', styleType]" />
      <view :class="['inline', styleType]" />
      <view
        class="empty"
        :style="extraStyle"
      />
    </view>

    <!-- <button class="switch" @click="toggleSwitch">切换颜色</button> -->

    <!-- 方案2 -->
    <!-- <view class="circle-second">
      <view :class="['outline-second', styleType]" />
      <view :class="['inline-second', styleType]" />
      <view class="empty" />
    </view> -->
  </view>
</template>

<script>
export default {
    name: 'GradientCircle',

    props: {
        styleType: {
            type: String,
            default: '',
            validator: val => ['orange', '', 'red', 'blue', 'green'].includes(val)
        },

        extraStyle: {
            type: Object,
            default: () => {}
        },

        // 是否是小的
        small: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
        }
    }
}
</script>

<style lang="scss" scoped>
.gradient-circle {
//   background: #f7f7f7;
  height: 100%;
  width: 100%;
  $circleWidth: 866rpx;
  $circleHeight: 866rpx;
  $lineWidth: 64rpx;
  display: flex;
  justify-content: flex-end;
  margin-left: 75rpx;

  .circle {
    width: $circleWidth;
    height: $circleHeight;
    border-radius: 100%;
    position: relative;
    $fadeColor: rgba(255, 255, 255, 0);
    .outline {
      $outlineColor: rgb(249, 249, 249);
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      transition: all 0.5s;
      border-radius: 100%;
      background: linear-gradient(180deg, $outlineColor 10%, $fadeColor 60%);

      &.blue {
        background: linear-gradient(180deg, rgba(122, 215, 255, 0.3) 10%, $fadeColor 60%);
      }

      &.green {
        background: linear-gradient(180deg, rgba(54, 238, 85, 0.3) 10%, $fadeColor 60%);
      }

      &.orange {
        background: linear-gradient(180deg, rgba(255, 211, 115, 0.3) 10%, $fadeColor 60%);
      }

      &.red {
        background: linear-gradient(180deg, rgba(255, 98, 98, 0.3) 10%, $fadeColor 60%);
      }
    }

    .middle {
      $height: $circleHeight - $lineWidth;
      $width: $circleWidth - $lineWidth;
      position: absolute;
      transition: background 0.5s;
      width: $width;
      top: 50%;
      left: 50%;
      margin-left: calc($width / -2);
      margin-top: calc($height / -2);
      height: $height;
      border-radius: 100%;
      background: linear-gradient(180deg, #ffffff 10%, $fadeColor 63%);

      &.blue {
        background: linear-gradient(180deg, #7ad7ff 10%, $fadeColor 63%);
      }

      &.green {
        background: linear-gradient(180deg, #37ee54 10%, $fadeColor 63%);
      }

      &.orange {
        background: linear-gradient(180deg, #ffd272 10%, $fadeColor 63%);
      }

      &.red {
        background: linear-gradient(180deg, #ff6362 10%, $fadeColor 63%);
      }
    }

    .inline {
      $height: $circleHeight - $lineWidth * 2;
      $width: $circleWidth - $lineWidth * 2;
      transition: all 0.33s;
      position: absolute;
      width: $width;
      top: 50%;
      left: 50%;
      margin-left: calc($width / -2);
      margin-top: calc($height / -2);
      height: $height;
      color: rgb(251, 251, 251);
      border-radius: 100%;
      background: linear-gradient(180deg, #ffffff 10%, $fadeColor 65%);

      &.blue {
        background: linear-gradient(180deg, #85d9fe 10%, $fadeColor 65%);
      }

      &.green {
        background: linear-gradient(180deg, #42ee5d 10%, $fadeColor 65%);
      }

      &.orange {
        background: linear-gradient(180deg, #fed47b 10%, $fadeColor 65%);
      }

      &.red {
        background: linear-gradient(180deg, #fe6665 10%, $fadeColor 65%);
      }
    }

    .empty {
      $height: $circleHeight - $lineWidth * 3;
      $width: $circleWidth - $lineWidth * 3;
      position: absolute;
      width: $width;
      top: 50%;
      left: 50%;
      margin-left: calc($width / -2);
      margin-top: calc($height / -2);
      height: $height;
      border-radius: 100%;

      background: #f7f7f7;
    }
  }

  // 小的，别动
  $smallCircleWidth: 688rpx;
  $smallCircleHeight: 688rpx;
  $smallLineWidth: 52rpx;
  &.small {
    margin-left: 70rpx;

    .circle {
      width: $smallCircleWidth;
      height: $smallCircleHeight;
    }

    .middle {
      $height: $smallCircleHeight - $smallLineWidth;
      $width: $smallCircleWidth - $smallLineWidth;
      width: $width;
      height: $height;
      margin-left: calc($width / -2);
      margin-top: calc($height / -2);
    }

    .inline {
      $height: $smallCircleHeight - $smallLineWidth * 2;
      $width: $smallCircleWidth - $smallLineWidth * 2;
      width: $width;
      height: $height;
      margin-left: calc($width / -2);
      margin-top: calc($height / -2);
    }

    .empty {
      $height: $smallCircleHeight - $smallLineWidth * 3;
      $width: $smallCircleWidth - $smallLineWidth * 3;
      width: $width;
      height: $height;
      margin-left: calc($width / -2);
      margin-top: calc($height / -2);
    }
  }
}
</style>
