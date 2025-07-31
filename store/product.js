import {
	defineStore
} from 'pinia'

export const useProductStore = defineStore('product', {
	state: () => ({
		products: [],
		featuredProducts: [],
		categories: []
	}),
	actions: {
		async fetchProducts() {
			// 模拟API请求
			uni.showLoading({
				title: '加载中...'
			})

			setTimeout(() => {
				this.products = [{
						id: 1,
						name: '商品1',
						price: 99.9,
						image: '/static/product1.jpg'
					},
					{
						id: 2,
						name: '商品2',
						price: 199.9,
						image: '/static/product2.jpg'
					},
					{
						id: 3,
						name: '商品3',
						price: 299.9,
						image: '/static/product3.jpg'
					}
				]
				this.featuredProducts = this.products.slice(0, 2)
				uni.hideLoading()
			}, 1000)
		},

		getProductById(id) {
			return this.products.find(p => p.id === id)
		}
	}
})