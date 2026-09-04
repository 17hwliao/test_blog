export type BlogIndexItem = {
	slug: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	hidden?: boolean
	/** 新文章使用 `daily`、`weekly` 或 `article`；旧文章仍允许读取历史分类。 */
	category?: string
	/** 日报所属的上海日历日，格式 YYYY-MM-DD。 */
	reportDate?: string
	/** 周报所属 ISO 周，格式 YYYY-Www。 */
	week?: string
}

export type BlogConfig = {
	title?: string
	tags?: string[]
	date?: string
	summary?: string
	cover?: string
	hidden?: boolean
	category?: string
	reportDate?: string
	week?: string
}

