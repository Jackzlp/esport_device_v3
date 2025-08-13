const COMMON_SCENES = [{
		background: 'linear-gradient(137deg, #FF5656 0%, #FFAC3B 14%, #FFE532 30%, #84FF4D 43%, #59FFC4 58%, #419BFF 76%, #FF5FFF 87%, #FF6262 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(313deg, #FF1E1E 0%, #FFDFCF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(322deg, #1E90FF 0%, #CFE8FF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(322deg, #16CD51 0%, #B2FFAF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(313deg, #FFDE1E 0%, #FFEFCF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(322deg, #431EFF 0%, #CFD6FF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(313deg, #99FF39 0%, #D1FFCF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(322deg, #EDEDED 0%, #FFFFFF 100%);',
		key: ''
	}
]


const COMMON_SCENES2 = [{
		background: 'linear-gradient(137deg, #FF5656 0%, #FFAC3B 14%, #FFE532 30%, #84FF4D 43%, #59FFC4 58%, #419BFF 76%, #FF5FFF 87%, #FF6262 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(313deg, #FF1E1E 0%, #FFDFCF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(322deg, #1E90FF 0%, #CFE8FF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(322deg, #16CD51 0%, #B2FFAF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(313deg, #FFFF00 0%, #FFFF00 100%);',
		key: 'Five'
	},
	{
		background: 'linear-gradient(322deg, #431EFF 0%, #CFD6FF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(313deg, #99FF39 0%, #D1FFCF 100%);',
		key: ''
	},
	{
		background: 'linear-gradient(322deg, #EDEDED 0%, #FFFFFF 100%);',
		key: ''
	}
]


export function PRESET_SCENES_NEW(key) {
	if (!key || key === '') {
		return PRESET_SCENES
	}else if(key == "color_type"){
		return  PRESET_SCENES_Type
	}else if(key == "lcolor_type"){
		return PRESET_SCENES_lType
	}else if(key == "Five"){
		return  PRESET_SCENES_Five
	}else if(key === 'normal'){
		return PRESET_SCENES_NORMAL
	} else  {
		return PRESET_SCENES_KEY
	}
}

const PRESET_SCENES_NORMAL = [
	{
			mode: 'gradientColor',
			title: 'atmosphereLightPage.sceneFunctions.gradientColor',
			scenes: [
				...COMMON_SCENES2.slice(0, COMMON_SCENES.length - 2),
				// {
				
				// 	background: 'linear-gradient(140deg, #227700 0%, #227700 100%);',
				// 	key: 'normal'
				// },
			
				{
				
	
					background: 'linear-gradient(140deg, #FF0000 0%, #00FF00 100%);',
					key: 'normal'
				},
				{
					background: 'linear-gradient(140deg, #FF0000 0%, #0000FF 100%);',
					key: 'normal'
				},
				{
					background: 'linear-gradient(140deg, #00FF00 0%, #0000FF 100%);',
					key: 'normal'
				}
			],
	
		},
	
		{
			mode: 'strobeMode',
			title: 'atmosphereLightPage.sceneFunctions.strobeMode',
			scenes: COMMON_SCENES.slice(0, COMMON_SCENES.length - 2)
		},
		{
			title: 'atmosphereLightPage.sceneFunctions.jumpMode',
			mode: 'jumpMode',
			scenes: COMMON_SCENES.slice(0, 1)
		}
]


const PRESET_SCENES_Five = [{
		mode: 'gradientColor',
		title: 'atmosphereLightPage.sceneFunctions.gradientColor',
		scenes: [
			...COMMON_SCENES2.slice(0, COMMON_SCENES.length - 2),
			{
			
				background: 'linear-gradient(140deg, #227700 0%, #227700 100%);',
				key: 'Five'
			},
		
			{
			

				background: 'linear-gradient(140deg, #FF0000 0%, #00FF00 100%);',
				key: 'Five'
			},
			{
				background: 'linear-gradient(140deg, #FF0000 0%, #0000FF 100%);',
				key: 'Five'
			},
			{
				background: 'linear-gradient(140deg, #00FF00 0%, #0000FF 100%);',
				key: 'Five'
			}
		],

	},

	{
		mode: 'strobeMode',
		title: 'atmosphereLightPage.sceneFunctions.strobeMode',
		scenes: COMMON_SCENES.slice(0, COMMON_SCENES.length - 2)
	},
	{
		title: 'atmosphereLightPage.sceneFunctions.jumpMode',
		mode: 'jumpMode',
		scenes: COMMON_SCENES.slice(0, 1)
	}
]

const PRESET_SCENES_lType = [{
		mode: 'gradientColor',
		title: 'atmosphereLightPage.sceneFunctions.gradientColor',
		scenes: [
			...COMMON_SCENES.slice(0, COMMON_SCENES.length - 2),
			{
			
				background: 'linear-gradient(140deg, #007F80 0%, #007F80 100%);',
				key: 'lcolor_type'
			},
			{

				background: 'linear-gradient(140deg, #FF0000 0%, #00FF00 100%);',
				key: 'lcolor_type'
			},
			{
				background: 'linear-gradient(140deg, #FF0000 0%, #0000FF 100%);',
				key: 'lcolor_type'
			},
			{
				background: 'linear-gradient(140deg, #00FF00 0%, #0000FF 100%);',
				key: 'lcolor_type'
			}
		],
	},

	{
		mode: 'strobeMode',
		title: 'atmosphereLightPage.sceneFunctions.strobeMode',
		scenes: COMMON_SCENES.slice(0, COMMON_SCENES.length - 2)
	},
	{
		title: 'atmosphereLightPage.sceneFunctions.jumpMode',
		mode: 'jumpMode',
		scenes: COMMON_SCENES.slice(0, 1)
	}
]


const PRESET_SCENES_Type = [{
		mode: 'gradientColor',
		title: 'atmosphereLightPage.sceneFunctions.gradientColor',
		scenes: [
			...COMMON_SCENES.slice(0, COMMON_SCENES.length - 3),
			{
			
				background: 'linear-gradient(140deg, #FF00D0 0%, #FF00D0 100%);',
				key: 'color_type'
			},
			{

				background: 'linear-gradient(140deg, #05FaFF 0%, #05FaFF 100%);',
				key: 'color_type'
			},
			{
				background: 'linear-gradient(140deg, #808080 0%, #808080 100%);',
				key: 'color_type'
			},
			{
				background: 'linear-gradient(140deg, #FC0301 0%, #16CD51 100%);',
				key: 'color_type'
			}
		],

	},

	{
		mode: 'strobeMode',
		title: 'atmosphereLightPage.sceneFunctions.strobeMode',
		scenes:[
			...COMMON_SCENES.slice(0, COMMON_SCENES.length - 3),
			{
				background: 'linear-gradient(140deg, #FF00D0 0%, #FF00D0 100%);',
				key: 'color_type'
			}
			
		]
		 
		 
	},
	{
		title: 'atmosphereLightPage.sceneFunctions.jumpMode',
		mode: 'jumpMode',
		scenes: COMMON_SCENES.slice(0, 1)
	}
]


const PRESET_SCENES_KEY = [{
		mode: 'gradientColor',
		title: 'atmosphereLightPage.sceneFunctions.gradientColor',
		scenes: [
			...COMMON_SCENES.slice(0, COMMON_SCENES.length - 2),
			{

				background: 'linear-gradient(140deg, #00e4ff 0%, #00e4ff 100%);',
				key: '_other'
			},
			{
				background: 'linear-gradient(140deg, #00ffbb 0%, #00ffbb 100%);',
				key: '_other'
			},
			{
				background: 'linear-gradient(140deg, #94F59D 0%, #5AADFF 100%);',
				key: ''
			}
		],

	},

	{
		mode: 'strobeMode',
		title: 'atmosphereLightPage.sceneFunctions.strobeMode',
		scenes: COMMON_SCENES.slice(0, COMMON_SCENES.length - 2)
	},
	{
		title: 'atmosphereLightPage.sceneFunctions.jumpMode',
		mode: 'jumpMode',
		scenes: COMMON_SCENES.slice(0, 1)
	}
]


const PRESET_SCENES = [{
		mode: 'gradientColor',
		title: 'atmosphereLightPage.sceneFunctions.gradientColor',
		scenes: [
			...COMMON_SCENES.slice(0, COMMON_SCENES.length - 2),
			{
			
				background: 'linear-gradient(140deg, #FF1E1E 0%, #A6FF5A 100%);',
				key: ''
			},
			{

				background: 'linear-gradient(140deg, #FF1E1E 0%, #A6FF5A 100%);',
				key: ''
			},
			{
				background: 'linear-gradient(140deg, #FF1E1E 0%, #5AADFF 100%);',
				key: ''
			},
			{
				background: 'linear-gradient(140deg, #94F59D 0%, #5AADFF 100%);',
				key: ''
			}
		],

	},

	{
		mode: 'strobeMode',
		title: 'atmosphereLightPage.sceneFunctions.strobeMode',
		scenes: COMMON_SCENES.slice(0, COMMON_SCENES.length - 2)
	},
	{
		title: 'atmosphereLightPage.sceneFunctions.jumpMode',
		mode: 'jumpMode',
		scenes: COMMON_SCENES.slice(0, 1)
	}
]