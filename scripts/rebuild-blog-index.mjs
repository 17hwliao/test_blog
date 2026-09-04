#!/usr/bin/env node

/**
 * Rebuild the public article directory from public/blogs/<slug>/config.json.
 * This script deliberately does not trust a hand-maintained index.json.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve, relative, sep } from 'node:path'

const mode = process.argv.includes('--write') ? 'write' : 'check'
const root = process.cwd()
const blogsRoot = resolve(root, 'public', 'blogs')
const indexPath = resolve(blogsRoot, 'index.json')
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const WEEK_RE = /^\d{4}-W\d{2}$/
const CATEGORIES = new Set(['daily', 'weekly', 'article'])

function fail(message) {
	throw new Error(`[blog-index] ${message}`)
}

function assertSafePathSegment(value, label) {
	if (typeof value !== 'string' || value.length === 0) fail(`${label} 不能为空`)
	if (
		value === '.' ||
		value === '..' ||
		value.includes('..') ||
		value.includes('/') ||
		value.includes('\\') ||
		value.includes('?') ||
		value.includes('#') ||
		value.includes('\0') ||
		/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)
	) {
		fail(`${label} 包含不安全路径：${JSON.stringify(value)}`)
	}
}

function assertCalendarDay(value, label) {
	if (!DAY_RE.test(value)) fail(`${label} 必须是 YYYY-MM-DD`)
	const [year, month, day] = value.split('-').map(Number)
	const date = new Date(Date.UTC(year, month - 1, day))
	if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
		fail(`${label} 不是有效日历日期：${value}`)
	}
}

function isoWeeksInYear(year) {
	const dec28 = new Date(Date.UTC(year, 11, 28))
	const isoDay = dec28.getUTCDay() || 7
	dec28.setUTCDate(dec28.getUTCDate() + 4 - isoDay)
	const start = new Date(Date.UTC(dec28.getUTCFullYear(), 0, 1))
	return Math.ceil(((dec28.getTime() - start.getTime()) / 86_400_000 + 1) / 7)
}

function assertIsoWeek(value) {
	if (!WEEK_RE.test(value)) fail('week 必须是 YYYY-Www')
	const [yearText, weekText] = value.split('-W')
	const year = Number(yearText)
	const week = Number(weekText)
	if (week < 1 || week > isoWeeksInYear(year)) fail(`week 不是有效 ISO 周：${value}`)
}

function optionalString(value, label) {
	if (value === undefined) return undefined
	if (typeof value !== 'string') fail(`${label} 必须是字符串`)
	return value
}

function normalizeConfig(slug, config) {
	assertSafePathSegment(slug, '文章 slug')
	if (!config || typeof config !== 'object' || Array.isArray(config)) fail(`${slug}/config.json 必须是对象`)

	// Empty categories from old template versions are backwards-compatible normal articles.
	const category = config.category === undefined || config.category === '' ? 'article' : config.category
	if (!CATEGORIES.has(category)) fail(`${slug}/config.json 的 category 只能是 daily、weekly 或 article`)

	const title = optionalString(config.title, `${slug}.title`) || slug
	const date = optionalString(config.date, `${slug}.date`)
	if (!date || Number.isNaN(Date.parse(date))) fail(`${slug}.date 必须是可解析的发布时间`)
	if (config.tags !== undefined && (!Array.isArray(config.tags) || config.tags.some(tag => typeof tag !== 'string'))) {
		fail(`${slug}.tags 必须是字符串数组`)
	}
	if (config.hidden !== undefined && typeof config.hidden !== 'boolean') fail(`${slug}.hidden 必须是布尔值`)

	const item = {
		slug,
		title,
		tags: config.tags || [],
		date,
		summary: optionalString(config.summary, `${slug}.summary`) ?? '',
		...(optionalString(config.cover, `${slug}.cover`) ? { cover: config.cover } : {}),
		...(config.hidden === true ? { hidden: true } : { hidden: false }),
		category
	}

	if (category === 'daily') {
		if (typeof config.reportDate !== 'string') fail(`${slug} 是日报，必须填写 reportDate`)
		assertCalendarDay(config.reportDate, `${slug}.reportDate`)
		return { ...item, reportDate: config.reportDate }
	}
	if (category === 'weekly') {
		if (typeof config.week !== 'string') fail(`${slug} 是周报，必须填写 week`)
		assertIsoWeek(config.week)
		return { ...item, week: config.week }
	}
	if (config.reportDate !== undefined || config.week !== undefined) {
		fail(`${slug} 是普通文章，不能携带 reportDate 或 week`)
	}
	return item
}

async function buildIndex() {
	const children = await readdir(blogsRoot, { withFileTypes: true })
	const items = []
	for (const child of children) {
		if (!child.isDirectory()) continue
		assertSafePathSegment(child.name, '文章目录')
		const configPath = resolve(blogsRoot, child.name, 'config.json')
		const markdownPath = resolve(blogsRoot, child.name, 'index.md')
		if (!relative(blogsRoot, configPath).split(sep).includes(child.name)) fail(`文章目录越界：${child.name}`)
		try {
			await readFile(markdownPath, 'utf8')
		} catch (error) {
			if (error && error.code === 'ENOENT') fail(`${child.name} 缺少 index.md 正文文件`)
			throw error
		}
		let raw
		try {
			raw = await readFile(configPath, 'utf8')
		} catch (error) {
			if (error && error.code === 'ENOENT') continue
			throw error
		}
		let config
		try {
			config = JSON.parse(raw)
		} catch {
			fail(`${child.name}/config.json 不是有效 JSON`)
		}
		items.push(normalizeConfig(child.name, config))
	}

	return items.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

const items = await buildIndex()
const next = `${JSON.stringify(items, null, 2)}\n`
let current = ''
try {
	current = await readFile(indexPath, 'utf8')
} catch (error) {
	if (!error || error.code !== 'ENOENT') throw error
}

if (current === next) {
	console.log(`[blog-index] 已验证 ${items.length} 篇文章，索引无需更新。`)
} else if (mode === 'write') {
	await writeFile(indexPath, next, 'utf8')
	console.log(`[blog-index] 已重建 ${items.length} 篇文章的索引。`)
} else {
	fail('public/blogs/index.json 与文章配置不一致；请运行 pnpm blog:index:write')
}
