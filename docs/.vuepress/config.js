module.exports = {
	title: 'Jayzau',
	description: '好劲!',
	themeConfig: {
		nav: [
			{ text: '首页', link: '/' },
			{ text: '博客', items: [
					{ text: '笔记', link: '/blogs/notes/' },
					{ text: '转载', link: '/blogs/reprint/' },
					{ text: 'Go', link: '/blogs/go/' }
				]
			},
			{ text: 'GitHub', link: 'https://github.com/jayzau' }
		],
		sidebar: 'auto',
		markdown: {
			extractHeaders: [ 'h2', 'h3' ]
		}
	}
}
