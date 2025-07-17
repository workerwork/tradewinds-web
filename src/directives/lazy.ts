import type { DirectiveBinding } from 'vue'

const lazyLoad = {
    mounted(el: HTMLImageElement, binding: DirectiveBinding) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.src = binding.value
                        observer.unobserve(el)
                    }
                })
            },
            {
                rootMargin: '50px',
                threshold: 0.01
            }
        )
        observer.observe(el)
    }
}

export default lazyLoad 