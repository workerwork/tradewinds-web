/**
 * 图片加载优化工具函数
 */

// 图片预加载
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

// 检查图片是否已加载
export const isImageLoaded = (img: HTMLImageElement): boolean => {
    return img.complete && img.naturalHeight !== 0
}

// 获取图片的主要颜色（用于生成占位背景）
export const getImageDominantColor = async (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'

        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error('Failed to get canvas context'))
                return
            }

            canvas.width = 1
            canvas.height = 1

            ctx.drawImage(img, 0, 0, 1, 1)
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
            resolve(`rgb(${r}, ${g}, ${b})`)
        }

        img.onerror = reject
        img.src = src
    })
}

// 压缩图片
export const compressImage = async (
    file: File,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = (e) => {
            const img = new Image()
            img.src = e.target?.result as string

            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // 计算缩放比例
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height
                    height = maxHeight
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Failed to compress image'))
                        }
                    },
                    'image/jpeg',
                    quality
                )
            }

            img.onerror = reject
        }

        reader.onerror = reject
    })
} 