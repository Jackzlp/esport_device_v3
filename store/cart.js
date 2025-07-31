import {
	defineStore
} from 'pinia'
import {
	useUserStore
} from './user'

export const useCartStore = defineStore('cart', {
	state: () => ({
		items: [],
		total: 0
	}),
	actions: {
		addItem(product) {
			const userStore = useUserStore()

			if (!userStore.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return false
			}

			const existing = this.items.find(item => item.id === product.id)

			if (existing) {
				existing.quantity += 1
			} else {
				this.items.push({
					...product,
					quantity: 1
				})
			}

			this.calculateTotal()
			uni.showToast({
				title: '已添加到购物车'
			})
			return true
		},

		removeItem(id) {
			this.items = this.items.filter(item => item.id !== id)
			this.calculateTotal()
		},

		clearCart() {
			this.items = []
			this.total = 0
		},

		calculateTotal() {
			this.total = this.items.reduce((sum, item) =>
				sum + (item.price * item.quantity), 0)
		}
	},
	getters: {
		itemCount: state => state.items.length
	}
})