import { motion } from 'motion/react'
import { useWriteStore } from '../../stores/write-store'
import { TagInput } from '../ui/tag-input'
import { Select } from '@/components/select'
import { formatDateOnly, formatIsoWeek } from '../../stores/write-store'

type MetaSectionProps = {
	delay?: number
}

export function MetaSection({ delay = 0 }: MetaSectionProps) {
	const { form, updateForm } = useWriteStore()
	const categoryOptions = [
		{ value: 'article', label: '普通文章' },
		{ value: 'daily', label: '日报' },
		{ value: 'weekly', label: '周报' }
	]

	const updateCategory = (category: 'daily' | 'weekly' | 'article') => {
		if (category === 'daily') {
			updateForm({ category, reportDate: form.reportDate || formatDateOnly(), week: undefined })
			return
		}
		if (category === 'weekly') {
			updateForm({ category, week: form.week || formatIsoWeek(), reportDate: undefined })
			return
		}
		updateForm({ category, reportDate: undefined, week: undefined })
	}

	return (
		<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className='card relative'>
			<h2 className='text-sm'>元信息</h2>

			<div className='mt-3 space-y-2'>
				<textarea
					placeholder='为这篇文章写一段简短摘要'
					rows={2}
					className='bg-card block w-full resize-none rounded-xl border p-3 text-sm'
					value={form.summary}
					onChange={e => updateForm({ summary: e.target.value })}
				/>

				<TagInput tags={form.tags} onChange={tags => updateForm({ tags })} />
				<Select
					className='w-full text-sm'
					value={form.category}
					onChange={value => updateCategory(value as 'daily' | 'weekly' | 'article')}
					options={categoryOptions}
				/>
				{form.category === 'daily' && (
					<label className='block text-xs text-gray-600'>
						日报归属日期
						<input
							type='date'
							required
							className='bg-card mt-1 w-full rounded-lg border px-3 py-2 text-sm'
							value={form.reportDate || ''}
							onChange={e => updateForm({ reportDate: e.target.value })}
						/>
						<span className='mt-1 block text-[11px] text-gray-500'>可选择过去日期补写；Election 按此日期汇总，不按发布时间判断。</span>
					</label>
				)}
				{form.category === 'weekly' && (
					<label className='block text-xs text-gray-600'>
						周报周次
						<input
							type='week'
							required
							className='bg-card mt-1 w-full rounded-lg border px-3 py-2 text-sm'
							value={form.week || ''}
							onChange={e => updateForm({ week: e.target.value })}
						/>
						<span className='mt-1 block text-[11px] text-gray-500'>使用 ISO 周编号，例如 2026-W36。</span>
					</label>
				)}
				<input
					type='datetime-local'
					placeholder='日期'
					className='bg-card w-full rounded-lg border px-3 py-2 text-sm'
					value={form.date}
					onChange={e => {
						updateForm({ date: e.target.value })
					}}
				/>

				<div className='flex items-center gap-2'>
					<input
						type='checkbox'
						id='hidden-check'
						checked={form.hidden || false}
						onChange={e => updateForm({ hidden: e.target.checked })}
						className='h-4 w-4 rounded border-gray-300'
					/>
					<label htmlFor='hidden-check' className='cursor-pointer text-sm text-gray-600 select-none'>
						隐藏此文章（仅管理员可见）
					</label>
				</div>
			</div>
		</motion.div>
	)
}
