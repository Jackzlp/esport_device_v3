import dayjs from 'dayjs'


// 0，官方信息， 1，评论， 2，回复。 3 点赞帖子，4，点赞评论，5，分享，6，被blocked
export const messageStatusMap = {
	3: {
		icon: '/static/images/likes.png',
		textKey: 'likes'
	},
	4: {
		icon: '/static/images/likes.png',
		textKey: 'likes'
	},
	5: {
		icon: '/static/images/share.png',
		textKey: 'share'

	},
	6: {
		icon: '/static/images/baned.png',
		textKey: 'baned'
	},

	7: {
		icon: '/static/images/shake.png',
		textKey: 'followed'
	},
	0: {
		textKey: 'official'
	}
}