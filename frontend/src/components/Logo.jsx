import logoImg from '../assets/logo_croust.png'

export default function Logo({ variant = 'dark', size = 'md' }) {
  const sizes = {
    sm: { img: 'h-9', text: 'text-lg', sub: 'text-[10px]' },
    md: { img: 'h-12', text: 'text-xl', sub: 'text-xs' },
    lg: { img: 'h-fit', text: 'text-2xl', sub: 'text-sm' },
  }
  const s = sizes[size] || sizes.md

  const textColor = variant === 'light' ? 'text-white' : 'text-accent-dark'
  const subColor = variant === 'light' ? 'text-primary-200' : 'text-accent-slate'

  return (
    <div className="flex items-center gap-3">
      <img src={logoImg} alt="CROUS-T" className={`${s.img} object-cover shrink-0`} />
    </div>
  )
}
