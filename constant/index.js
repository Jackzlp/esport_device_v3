// 语言
export const LANGUAGES = [
    {
        title: 'English',
        locale: 'en-US'
    },
    {
        title: '日本語',
        locale: 'ja-JP'
    },
    {
        title: 'Deutsch',
        locale: 'de-DE'
    },
    // {
    //     title: '简体中文',
    //     locale: 'zh-CN'
    // },
    {
        title: 'Español',
        locale: 'es-ES'
    },
    {
        title: 'Français',
        locale: 'fr-FR'
    },
    {
        title: 'Italiano',
        locale: 'it-IT'
    }
]

// 登陆态的key
export const TOKEN_KEY = 'appToken'

// 用户信息的key
export const USERINFO_KEY = 'userInfo'

// 当前app独有的key
export const STORAGE_KEY = 'eSports_Storage';

//跳转帖子详情的key 
export const GOTODETAIL_KEY = "GotoPostDetail"
export const PUBLISHOREDITPOST = "PublishOrEditPost"


// locale的key
export const LOCALE_KEY = 'locale'
export const DEFAULT_LOCALE = 'en-US'
export const DEFAULT_LOCALE_EN = 'English'
export const FIRST_TIME_LAUNCH_KEY = 'first_time_launch_key' // 第一次启动的key

// 根据后端给的，匹配当前使用的locale
export const getCurrentLocaleKey = locale => {
    const keys = {
        'en-US': 'English',
        'ja-JP': 'Japanese',
        'de-DE': 'German',
        'fr-FR': 'French',
        'it-IT': 'Italian',
        'es-ES': 'Spanish'
    }

    return keys[locale] || ''
}