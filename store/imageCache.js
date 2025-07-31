/*
 * @description 获取文件的缓存路径，如果文件未缓存，则直接返回网络路径，并下载缓存
 * @method getImageCache
 * @param {String} filePath 完整的图片下载路径，如果没有从缓存中获取到，则用这个路径去下载
 * @param {String} fileMd5 文件md5，必须唯一
 * @return {Object} promise对象
 */

import {
	setStorageSync,
	getStorageSync,
	clearStorageSync
} from '@/utils';

async function getImageCache(filePath, fileMd5) {
	// console.log(filePath)
	// 图片缓存key值
	let storageKey = 'IMAGE_CACHE_INFO_' + filePath
	// 首先获取本地存储的数据，查询是否有对应文件路径，如果有缓存内容，直接返回
	// console.log(storageKey)
	const cacheFileInfo = getStorageSync(storageKey)
	if (cacheFileInfo) {
		// console.log("已缓存为：" + cacheFileInfo)
		// clearStorageSync(storageKey)

		try {
			let result = await isImageLoadable(cacheFileInfo)
			// console.log(result)
			if (result) {
				return cacheFileInfo
			} else {
				clearStorageSync(storageKey)
				return filePath
			}

		} catch (error) {
			return filePath
		}

	} else {
		// console.log("未缓存,进行下载保存")
		// 如果没有，执行下载，并存储起来后
		uni.downloadFile({
			url: filePath,
			success: (res) => {
				if (res.statusCode === 200) {
					// console.log('下载成功');
					// 再进行本地保存
					uni.saveFile({
						tempFilePath: res.tempFilePath,
						success: function(res2) {
							// console.log(res2.savedFilePath)
							setStorageSync(storageKey, res2.savedFilePath, 3600 * 24 * 15)
							// uni.setStorageSync(storageKey, res2.savedFilePath)
							return res2.savedFilePath
						},
						fail: function(res2) {
							return filePath
						}
					})
				} else {
					// console.log('下载临时文件失败')
					// console.log(res)
					return filePath
				}
			},
			fail: (res) => {
				// console.log(res)
				return filePath
			}
		})
	}
}


function isImageLoadable(src) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src: src,
			success: (res) => {
				resolve(true); // 图片加载成功
			},
			fail: (err) => {
				resolve(false); // 图片加载失败
			}
		});
	});
}

function isImageFile(filename) {
	// 定义常见的图片后缀
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

	// 获取文件名的后缀
	const extension = filename.split('.').pop().toLowerCase();
	console.log(extension)
	// 判断后缀是否在图片后缀数组中
	return imageExtensions.includes(`.${extension}`);
}

function saveImageCache(filePath, fileMd5) {

	let storageKey = 'IMAGE_CACHE_INFO_' + fileMd5
	uni.downloadFile({
		url: filePath,
		success: (res) => {

			if (res.statusCode === 200 || res.statusCode == 404) {
				// console.log('下载成功');

				// 再进行本地保存
				uni.saveFile({
					tempFilePath: res.tempFilePath,
					success: function(res2) {
						// clearStorageSync(storageKey)
						// console.log(storageKey)
						// console.log(res2.savedFilePath)
						setStorageSync(storageKey, res2.savedFilePath, 3600 * 24 * 15)
					},
					fail: function(res3) {
						// console.log(res3)
					}
				})
			} else {
				console.log('下载临时文件失败')
				console.log(filePath)
			}
		},
		fail: (res) => {
			// console.log(res)
			// return filePath
		}
	})
}
export {
	getImageCache,
	saveImageCache
}