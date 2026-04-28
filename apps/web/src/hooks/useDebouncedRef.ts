import { customRef } from 'vue'

/**
 * 通用防抖 ref hooks
 * @param initialValue 初始值
 * @param delay 防抖延迟（毫秒）
 * @param callback 每次值变化且防抖后触发的回调
 */
export function useDebouncedRef<T>(
	initialValue: T,
	delay = 500,
	callback?: (value: T) => void
): any {
	let timer: ReturnType<typeof setTimeout> | null = null
	let value = initialValue
	return customRef<T>((track, trigger) => ({
		get() {
			track()
			return value
		},
		set(newValue: T) {
			value = newValue
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => {
				callback?.(value)
				trigger()
			}, delay)
		},
	}))
}
