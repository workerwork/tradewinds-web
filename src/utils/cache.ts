import { useStorage } from '@vueuse/core';

interface CacheOptions {
    expire?: number; // 过期时间（毫秒）
    prefix?: string; // 缓存键前缀
}

interface CacheSetOptions {
    expire?: number; // 过期时间（毫秒）
    tag?: string;   // 缓存标签
}

interface CacheData<T> {
    value: T;
    expire?: number;
    tag?: string;
}

class CacheService {
    private prefix: string;
    private tagKey: string;

    constructor(options: CacheOptions = {}) {
        this.prefix = options.prefix || 'aiman_cache_';
        this.tagKey = `${this.prefix}tags`;
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    private getTagMap(): Record<string, string[]> {
        const storage = useStorage<Record<string, string[]>>(this.tagKey, {});
        return storage.value || {};
    }

    private setTagMap(tagMap: Record<string, string[]>): void {
        const storage = useStorage(this.tagKey, {});
        storage.value = tagMap;
    }

    private addKeyToTag(key: string, tag: string): void {
        const tagMap = this.getTagMap();
        if (!tagMap[tag]) {
            tagMap[tag] = [];
        }
        if (!tagMap[tag].includes(key)) {
            tagMap[tag].push(key);
            this.setTagMap(tagMap);
        }
    }

    private removeKeyFromTags(key: string): void {
        const tagMap = this.getTagMap();
        for (const tag in tagMap) {
            tagMap[tag] = tagMap[tag].filter(k => k !== key);
            if (tagMap[tag].length === 0) {
                delete tagMap[tag];
            }
        }
        this.setTagMap(tagMap);
    }

    /**
     * 设置缓存
     * @param key 缓存键
     * @param value 缓存值
     * @param options 缓存选项（过期时间和标签）
     */
    set<T>(key: string, value: T, options: CacheSetOptions = {}): void {
        const data: CacheData<T> = {
            value,
            expire: options.expire ? Date.now() + options.expire : undefined,
            tag: options.tag
        };

        const storage = useStorage(this.getKey(key), data);
        storage.value = data;

        if (options.tag) {
            this.addKeyToTag(key, options.tag);
        }
    }

    /**
     * 获取缓存
     * @param key 缓存键
     * @returns 缓存值
     */
    get<T>(key: string): T | null {
        const storage = useStorage<CacheData<T>>(this.getKey(key), null);
        const data = storage.value;

        if (!data) return null;

        // 检查是否过期
        if (data.expire && Date.now() > data.expire) {
            this.remove(key);
            return null;
        }

        return data.value;
    }

    /**
     * 移除缓存
     * @param key 缓存键
     */
    remove(key: string): void {
        this.removeKeyFromTags(key);
        const storage = useStorage(this.getKey(key), null);
        storage.value = null;
    }

    /**
     * 清空所有缓存
     */
    clear(): void {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        }
        // 清空标签映射
        this.setTagMap({});
    }

    /**
     * 根据标签清除缓存
     * @param tag 缓存标签
     */
    clearByTag(tag: string): void {
        const tagMap = this.getTagMap();
        const keys = tagMap[tag] || [];
        keys.forEach(key => {
            this.remove(key);
        });
        delete tagMap[tag];
        this.setTagMap(tagMap);
    }

    /**
     * 获取缓存，如果不存在则通过回调函数获取并缓存
     * @param key 缓存键
     * @param callback 回调函数
     * @param options 缓存选项（过期时间和标签）
     * @returns 缓存值
     */
    async getOrSet<T>(
        key: string,
        callback: () => Promise<T>,
        options: CacheSetOptions = {}
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) return cached;

        const value = await callback();
        this.set(key, value, options);
        return value;
    }
}

// 创建默认实例
export const cache = new CacheService();

// 导出类以便创建自定义实例
export { CacheService }; 