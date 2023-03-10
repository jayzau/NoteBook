module.exports = {
	title: 'Jayzau',
	port: 8081,
	description: '好劲!',
	themeConfig: {
		nav: [
			{ text: '首页', link: '/' },
			{ text: '博客', items: [
					{ text: '笔记', link: '/blogs/notes/' },
					{ text: 'Python', link: '/blogs/python/' },
					{ text: 'JavaScript', link: '/blogs/javascript/' },
					{ text: 'PHP', link: '/blogs/php/' },
					{ text: 'Go', link: '/blogs/go/' },
				]
			},
			{ text: 'GitHub', link: 'https://github.com/jayzau' }
		],
		sidebar: 'auto',
		markdown: {
			extractHeaders: [ 'h2', 'h3' ]
		},
		lastUpdated: '上一次编辑于'
	}
}
