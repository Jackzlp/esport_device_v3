import dayjs from 'dayjs'

export const orderStatusMap = {
	0: {
		icon: '/static/images/order/shipment.png',
		activeIcon: '/static/images/order/shipment-active.png',
		listIcon: '/static/images/order/shipment-list-icon.png',
		textKey: 'order.pending_shipment'
	},
	1: {
		icon: '/static/images/order/receipt.png',
		activeIcon: '/static/images/order/receipt-active.png',
		listIcon: '/static/images/order/receipt-list-icon.png',
		textKey: 'order.pending_receipt'
	},
	2: {
		icon: '/static/images/order/completed.png',
		activeIcon: '/static/images/order/completed-active.png',
		listIcon: '/static/images/order/completed-list-icon.png',
		textKey: 'order.order_completed'
	}
}


export const orderList = [{
		name: 'Advanced competitive',
		cover: '/static/images/defaultIcon.jpg',
		nickName: 'Mary',
		status: 0, // 0 shipment receipt，2 completed
		date: dayjs().format('YYYY.MM.DD')
	},
	{
		name: 'Advanced competitive',
		cover: '/static/images/defaultIcon.jpg',
		nickName: 'Mary',
		status: 1, // 0 shipment receipt，2 completed
		date: dayjs().format('YYYY.MM.DD')
	},
	{
		name: 'Advanced competitive',
		cover: '/static/images/defaultIcon.jpg',
		nickName: 'Mary',
		status: 2, // 0 shipment receipt，2 completed
		date: dayjs().format('YYYY.MM.DD')
	}
]