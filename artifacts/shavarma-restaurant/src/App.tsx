import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ArrowDown, ArrowRight, Check, Clock3, Instagram, MapPin, Menu as MenuIcon, Minus, Phone, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Dish = { name: string; desc: string; price: string; tag?: string; image?: string };

const dishes: Record<string, Dish[]> = {
  wraps: [
    { name: 'The Shavarma', desc: 'Spit-roasted chicken, toum, pickles, herbs, warm pita', price: '$14', tag: 'house favorite', image: '/images/shawarma-hero.jpg' },
    { name: 'Firebird', desc: 'Chicken, smoky harissa, charred peppers, cooling labneh', price: '$15', tag: 'has a kick', image: '/images/shawarma-hero.jpg' },
    { name: 'Golden Hour', desc: 'Crispy chicken, saffron aioli, sumac onions, fries inside', price: '$16', image: '/images/shawarma-hero.jpg' },
  ],
  plates: [
    { name: 'The Big Plate', desc: 'Chicken shawarma, hummus, fattoush, rice, pickles, pita', price: '$21', tag: 'come hungry', image: '/images/mezze-spread.jpg' },
    { name: 'Green Room', desc: 'Herby falafel, avocado, cucumber, tahini, warm pita', price: '$17', image: '/images/mezze-spread.jpg' },
    { name: 'Half & Half', desc: 'Shawarma and falafel, garlic potatoes, chopped salad', price: '$19', image: '/images/mezze-spread.jpg' },
  ],
  sides: [
    { name: 'Toum Potatoes', desc: 'Crisp edges, soft middle, an unreasonable amount of garlic', price: '$8', image: '/images/mezze-spread.jpg' },
    { name: 'Hummus, Actually', desc: 'Silky chickpeas, lemon, olive oil, torn pita', price: '$9', image: '/images/mezze-spread.jpg' },
    { name: 'Pickle Plate', desc: 'Turnips, cucumbers, cabbage and whatever else we brined', price: '$6', image: '/images/mezze-spread.jpg' },
  ],
};

function Header({ onOrder }: { onOrder: () => void }) {
  const [open, setOpen] = useState(false);
  const navItems = [['menu', 'Menu'], ['story', 'Our story'], ['visit', 'Find us']];
  return (
    <header className="absolute top-0 z-30 w-full text-[#fff7e9]">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 lg:px-8">
        <a href="#top" data-testid="link-logo" className="group flex items-center gap-2">
          <span className="font-display text-[25px] font-extrabold tracking-[-.07em]">SHAVARMA</span>
          <span className="mt-1 h-2 w-2 rounded-full bg-[#f5c84b] transition-transform group-hover:scale-150" />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map(([id, label]) => <a key={id} href={`#${id}`} data-testid={`link-${id}`} className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ffe9c7]/80 transition-colors hover:text-[#f5c84b]">{label}</a>)}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={onOrder} data-testid="button-header-order" className="hidden rounded-full bg-[#f5c84b] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#3b2118] transition-transform hover:-translate-y-0.5 sm:block">Order now <ArrowRight className="ml-1 inline h-3 w-3" /></button>
          <button onClick={() => setOpen(!open)} data-testid="button-mobile-menu" className="rounded-full border border-[#fff7e9]/40 p-2 md:hidden">{open ? <X size={19} /> : <MenuIcon size={19} />}</button>
        </div>
      </div>
      {open && <nav className="mx-4 flex flex-col gap-5 rounded-2xl border border-[#fff7e9]/20 bg-[#3b2118]/95 p-6 shadow-xl md:hidden">
        {navItems.map(([id, label]) => <a onClick={() => setOpen(false)} key={id} href={`#${id}`} data-testid={`mobile-link-${id}`} className="font-display text-2xl text-[#fff7e9]">{label}</a>)}
        <button onClick={() => { setOpen(false); onOrder(); }} data-testid="button-mobile-order" className="rounded-full bg-[#f5c84b] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#3b2118]">Order now</button>
      </nav>}
    </header>
  );
}

function OrderPanel({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState([{ name: 'The Shavarma', price: 14, qty: 1 }]);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const changeQty = (index: number, amount: number) => setItems(current => current.map((item, i) => i === index ? { ...item, qty: Math.max(0, item.qty + amount) } : item).filter(item => item.qty > 0));
  return <div className="fixed inset-0 z-50 flex justify-end bg-[#3b2118]/45" onClick={onClose}>
    <aside onClick={e => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col bg-[#fff7e9] p-6 text-[#3b2118] shadow-2xl sm:p-8">
      <div className="flex items-center justify-between border-b border-[#d7c5aa] pb-5"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b55032]">Tonight's order</p><h2 className="font-display text-4xl font-extrabold tracking-[-.05em]">Make it yours.</h2></div><button onClick={onClose} data-testid="button-close-order"><X /></button></div>
      <div className="flex-1 py-7">{items.length ? items.map((item, index) => <div key={item.name} className="flex items-center justify-between border-b border-[#d7c5aa] py-5" data-testid={`order-item-${index}`}><div><p className="font-display text-xl font-bold">{item.name}</p><p className="font-mono text-xs text-[#76594c]">${item.price} each</p></div><div className="flex items-center gap-3"><button onClick={() => changeQty(index, -1)} data-testid={`button-decrease-${index}`} className="rounded-full border border-[#b55032] p-1"><Minus size={13} /></button><span className="w-3 text-center font-mono text-sm">{item.qty}</span><button onClick={() => changeQty(index, 1)} data-testid={`button-increase-${index}`} className="rounded-full border border-[#b55032] p-1"><Plus size={13} /></button></div></div>) : <div className="flex h-full items-center justify-center text-center"><p className="font-display text-2xl">Your order is taking a little nap.</p></div>}</div>
      <div className="border-t border-[#d7c5aa] pt-5"><div className="mb-5 flex justify-between font-mono text-sm"><span>Subtotal</span><span data-testid="text-order-total">${total}</span></div><a href="tel:+12125550182" onClick={onClose} data-testid="link-call-order" className="flex items-center justify-center rounded-full bg-[#b55032] px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[.14em] text-[#fff7e9] transition-colors hover:bg-[#3b2118]">Call to order · (212) 555-0182</a><p className="mt-3 text-center font-mono text-[10px] text-[#76594c]">Pickup is usually ready in 15–20 minutes.</p></div>
    </aside>
  </div>;
}

function ReservationModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3b2118]/55 p-4" onClick={onClose}><div onClick={e => e.stopPropagation()} className="relative w-full max-w-lg rounded-[2rem] bg-[#f5c84b] p-7 text-[#3b2118] shadow-2xl sm:p-10">
    <button onClick={onClose} data-testid="button-close-reservation" className="absolute right-6 top-6 rounded-full border border-[#3b2118]/30 p-1"><X size={17} /></button>
    {!sent ? <><p className="font-mono text-[10px] uppercase tracking-[.2em]">A table with your name on it</p><h2 className="mt-2 font-display text-5xl font-extrabold leading-[.9] tracking-[-.06em]">Stay for a while.</h2><form onSubmit={e => { e.preventDefault(); setSent(true); }} className="mt-8 grid gap-4"><input required data-testid="input-reservation-name" placeholder="Your name" className="rounded-xl border border-[#3b2118]/30 bg-[#fff7e9]/50 px-4 py-3 font-sans outline-none placeholder:text-[#76594c] focus:border-[#3b2118]" /><div className="grid grid-cols-2 gap-4"><input required type="date" data-testid="input-reservation-date" className="rounded-xl border border-[#3b2118]/30 bg-[#fff7e9]/50 px-4 py-3 font-mono text-xs outline-none" /><select data-testid="select-reservation-time" className="rounded-xl border border-[#3b2118]/30 bg-[#fff7e9]/50 px-4 py-3 font-mono text-xs outline-none"><option>7:00 pm</option><option>7:30 pm</option><option>8:00 pm</option><option>8:30 pm</option></select></div><select data-testid="select-reservation-party" className="rounded-xl border border-[#3b2118]/30 bg-[#fff7e9]/50 px-4 py-3 font-mono text-xs outline-none"><option>2 people</option><option>3 people</option><option>4 people</option><option>5+ people</option></select><button data-testid="button-submit-reservation" className="mt-2 rounded-full bg-[#3b2118] px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[.15em] text-[#fff7e9] transition-transform hover:-translate-y-0.5">Request a table <ArrowRight className="ml-1 inline h-3 w-3" /></button></form></> : <div className="flex min-h-[330px] flex-col items-center justify-center text-center"><div className="mb-5 rounded-full bg-[#3b2118] p-3 text-[#f5c84b]"><Check /></div><h2 className="font-display text-5xl font-extrabold leading-none">You're on the list.</h2><p className="mt-4 max-w-xs font-sans text-[#5c3729]">We'll call to confirm your table. Bring an appetite and a friend who orders fries.</p></div>}
  </div></div>;
}

function MenuSection({ onOrder }: { onOrder: () => void }) {
  const [tab, setTab] = useState('wraps');
  return <section id="menu" className="bg-[#fff7e9] px-5 py-24 lg:px-8 lg:py-32">
    <div className="mx-auto max-w-[1240px]">
      <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#b55032]">The menu / no filler</p><h2 className="mt-3 max-w-xl font-display text-6xl font-extrabold leading-[.88] tracking-[-.07em] text-[#3b2118] md:text-8xl">Good food.<br /><span className="text-[#b55032]">No small talk.</span></h2></div><p className="max-w-[270px] font-sans text-sm leading-6 text-[#76594c]">Everything gets made to order, which is why it tastes like someone cared. Because someone did.</p></div>
      <div className="mt-14 flex gap-2 border-b border-[#d7c5aa] pb-3" role="tablist">{Object.keys(dishes).map(key => <button key={key} onClick={() => setTab(key)} data-testid={`button-menu-${key}`} className={`rounded-full px-5 py-2 font-mono text-[10px] uppercase tracking-[.17em] transition-colors ${tab === key ? 'bg-[#3b2118] text-[#fff7e9]' : 'text-[#76594c] hover:bg-[#efe1c9]'}`} role="tab">{key}</button>)}</div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{dishes[tab].map((dish, index) => <article key={dish.name} className="menu-card group overflow-hidden rounded-[1.4rem] border border-[#d7c5aa] bg-[#f4e7d2]" data-testid={`card-dish-${tab}-${index}`}><div className="image-wash relative h-64 overflow-hidden bg-[#d6b795]"><img src={dish.image} alt={dish.name} className="h-full w-full object-cover" /><div className="absolute bottom-5 left-5 z-10 flex items-center gap-2"><span className="font-display text-3xl font-bold text-[#fff7e9]">{dish.price}</span>{dish.tag && <span className="rounded-full bg-[#f5c84b] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#3b2118]">{dish.tag}</span>}</div></div><div className="flex min-h-[145px] flex-col justify-between p-5"><div><h3 className="font-display text-2xl font-bold tracking-[-.04em] text-[#3b2118]">{dish.name}</h3><p className="mt-1 max-w-[230px] text-sm leading-5 text-[#76594c]">{dish.desc}</p></div><button onClick={onOrder} data-testid={`button-add-${tab}-${index}`} className="mt-4 flex items-center gap-2 self-start font-mono text-[10px] font-bold uppercase tracking-[.15em] text-[#b55032] transition-colors hover:text-[#3b2118]">Add to order <Plus size={14} /></button></div></article>)}</div>
      <div className="mt-10 text-center"><button onClick={onOrder} data-testid="button-full-menu-order" className="rounded-full border border-[#b55032] px-7 py-4 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#b55032] transition-colors hover:bg-[#b55032] hover:text-[#fff7e9]">Order pickup <ArrowRight className="ml-1 inline h-3 w-3" /></button></div>
    </div>
  </section>;
}

function Home() {
  const [orderOpen, setOrderOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  return <div id="top" className="grain overflow-hidden bg-[#fff7e9]">
    <Header onOrder={() => setOrderOpen(true)} />
    <main>
      <section className="relative min-h-[720px] overflow-hidden bg-[#3b2118] text-[#fff7e9] sm:min-h-[820px]">
        <div className="absolute inset-0 opacity-30"><img src="/images/shawarma-hero.jpg" alt="" className="h-full w-full object-cover object-center" /></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(181,80,50,.45),transparent_38%),linear-gradient(90deg,#3b2118_12%,rgba(59,33,24,.82)_48%,rgba(59,33,24,.25))]" />
        <div className="relative mx-auto flex min-h-[720px] max-w-[1240px] flex-col justify-end px-5 pb-16 pt-32 sm:min-h-[820px] sm:pb-24 lg:px-8">
          <div className="max-w-4xl"><p className="reveal font-mono text-[10px] uppercase tracking-[.25em] text-[#f5c84b]">Shawarma / sandwiches / good nights</p><h1 className="reveal reveal-delay-1 mt-5 font-display text-[clamp(4.5rem,13vw,11rem)] font-extrabold leading-[.78] tracking-[-.09em]">THE BEST<br /><span className="text-[#f5c84b]">BITE</span> OF<br />THE NIGHT.</h1><p className="reveal reveal-delay-2 mt-9 max-w-sm text-base leading-6 text-[#ffe9c7]/85 sm:text-lg">Smoky, juicy, falling-apart chicken. Bright pickles. Warm pita. Made for the walk home.</p><div className="reveal reveal-delay-3 mt-8 flex flex-wrap items-center gap-3"><button onClick={() => setOrderOpen(true)} data-testid="button-hero-order" className="rounded-full bg-[#f5c84b] px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[.15em] text-[#3b2118] transition-transform hover:-translate-y-1">Get in my hands <ArrowRight className="ml-1 inline h-3 w-3" /></button><a href="#menu" data-testid="link-hero-menu" className="rounded-full border border-[#fff7e9]/45 px-7 py-4 font-mono text-[11px] uppercase tracking-[.15em] transition-colors hover:border-[#f5c84b] hover:text-[#f5c84b]">See the menu</a></div></div>
          <div className="hero-sticker absolute right-7 top-[28%] hidden rotate-[-3deg] rounded-full bg-[#b55032] p-7 text-center text-[#fff7e9] shadow-lg sm:block lg:right-[12%]"><span className="block font-mono text-[9px] uppercase tracking-wider">open late</span><strong className="mt-1 block font-display text-4xl font-extrabold leading-none">till<br />2am</strong><span className="mt-2 block text-xs">every night</span></div>
          <a href="#story" data-testid="link-scroll-story" className="absolute bottom-7 right-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#ffe9c7]/70 transition-colors hover:text-[#f5c84b] sm:right-8"><ArrowDown size={15} /> scroll for the good stuff</a>
        </div>
      </section>
      <div className="overflow-hidden border-y border-[#3b2118] bg-[#f5c84b] py-4 text-[#3b2118]"><div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap font-display text-2xl font-bold uppercase tracking-[-.04em]"><span>smoke · spice · pickles · repeat</span><span className="text-[#b55032]">✳</span><span>smoke · spice · pickles · repeat</span><span className="text-[#b55032]">✳</span><span>smoke · spice · pickles · repeat</span><span className="text-[#b55032]">✳</span></div></div>
      <MenuSection onOrder={() => setOrderOpen(true)} />
      <section id="story" className="bg-[#dce1cf] px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24"><div className="relative order-2 lg:order-1"><div className="absolute -left-4 -top-5 h-full w-full rounded-[1.5rem] border-2 border-[#b55032]" /><img src="/images/counter-interior.jpg" alt="Inside the warm Shavarma counter" className="relative aspect-[4/5] w-full rounded-[1.5rem] object-cover" /><span className="absolute -bottom-5 -right-4 rounded-full bg-[#f5c84b] px-5 py-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#3b2118] shadow-md">since 2018 · lower east side</span></div><div className="order-1 lg:order-2"><p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#b55032]">The story / it started hungry</p><h2 className="mt-4 font-display text-6xl font-extrabold leading-[.87] tracking-[-.07em] text-[#3b2118] sm:text-8xl">From our<br /><span className="text-[#b55032]">street</span><br />to yours.</h2><p className="mt-8 max-w-md text-base leading-7 text-[#4e493a]">Shavarma began with a borrowed rotisserie, a family garlic sauce recipe, and a very simple belief: the best meals happen when everyone is standing around the counter, napkins everywhere.</p><p className="mt-4 max-w-md text-base leading-7 text-[#4e493a]">We still marinate our chicken overnight, still pickle things in-house, and still believe fries belong inside the sandwich.</p><a href="#visit" data-testid="link-story-visit" className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#b55032]">Come say hi <ArrowRight size={14} /></a></div></div></section>
      <section className="bg-[#b55032] px-5 py-20 text-[#fff7e9] lg:px-8"><div className="mx-auto max-w-[1240px]"><div className="flex flex-col justify-between gap-5 border-b border-[#fff7e9]/35 pb-7 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#f5c84b]">Why it hits different</p><h2 className="mt-3 font-display text-5xl font-extrabold leading-none tracking-[-.06em] sm:text-7xl">The little<br />obsessions.</h2></div><p className="max-w-[225px] text-sm leading-6 text-[#ffe9c7]/80">Small details. Big payoff. The stuff you taste before you can name it.</p></div><div className="grid divide-y divide-[#fff7e9]/25 sm:grid-cols-3 sm:divide-x sm:divide-y-0">{[['01', 'The overnight marinade', 'Lemon, seven spices, and enough time to let it get good.'], ['02', 'The crackly edge', 'The best pieces live right where the spit meets the flame.'], ['03', 'The garlic situation', 'Our toum is fluffy, punchy, and absolutely not optional.']].map(([number, title, copy]) => <div key={number} className="py-8 sm:px-7 sm:py-5 first:pl-0 last:pr-0"><span className="font-mono text-xs text-[#f5c84b]">{number}</span><h3 className="mt-8 font-display text-2xl font-bold">{title}</h3><p className="mt-2 max-w-[240px] text-sm leading-6 text-[#ffe9c7]/75">{copy}</p></div>)}</div></div></section>
      <section className="bg-[#fff7e9] px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-[1240px]"><div className="mb-10 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#b55032]">Words from the counter</p><h2 className="mt-3 font-display text-5xl font-extrabold leading-none tracking-[-.06em] text-[#3b2118] sm:text-7xl">Don't take<br />our word for it.</h2></div><div className="hidden items-center gap-1 text-[#b55032] sm:flex"><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /></div></div><div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]"><blockquote className="flex min-h-[280px] flex-col justify-between rounded-[1.5rem] bg-[#3b2118] p-7 text-[#fff7e9] md:p-9"><p className="font-display text-4xl font-bold leading-[.98] tracking-[-.05em]">“The kind of meal that makes you plan your next visit before you've finished the first one.”</p><footer className="font-mono text-[10px] uppercase tracking-[.16em] text-[#f5c84b]">— Maya R. · neighborhood regular</footer></blockquote><blockquote className="flex min-h-[280px] flex-col justify-between rounded-[1.5rem] bg-[#f5c84b] p-7 text-[#3b2118]"><p className="font-display text-3xl font-bold leading-none tracking-[-.04em]">“That garlic sauce should be classified as a controlled substance.”</p><footer className="font-mono text-[10px] uppercase tracking-[.16em]">— Theo · first date success</footer></blockquote><blockquote className="flex min-h-[280px] flex-col justify-between rounded-[1.5rem] border border-[#d7c5aa] bg-[#dce1cf] p-7 text-[#3b2118]"><p className="font-display text-3xl font-bold leading-none tracking-[-.04em]">“Fast, generous, zero fuss. Exactly what dinner should be.”</p><footer className="font-mono text-[10px] uppercase tracking-[.16em]">— Jules · 4th floor</footer></blockquote></div></div></section>
      <section id="visit" className="bg-[#3b2118] px-5 py-24 text-[#fff7e9] lg:px-8 lg:py-32"><div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[1.1fr_.9fr]"><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#f5c84b]">Your new regular spot</p><h2 className="mt-4 max-w-xl font-display text-7xl font-extrabold leading-[.82] tracking-[-.08em] sm:text-9xl">Meet us<br /><span className="text-[#f5c84b]">on Orchard.</span></h2><div className="mt-10 flex flex-wrap gap-3"><a href="https://maps.google.com/?q=131+Orchard+Street+New+York+NY" target="_blank" rel="noreferrer" data-testid="link-directions" className="rounded-full bg-[#f5c84b] px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[.15em] text-[#3b2118]">Get directions <ArrowRight className="ml-1 inline h-3 w-3" /></a><button onClick={() => setReservationOpen(true)} data-testid="button-reserve" className="rounded-full border border-[#fff7e9]/40 px-6 py-4 font-mono text-[10px] uppercase tracking-[.15em] transition-colors hover:border-[#f5c84b] hover:text-[#f5c84b]">Reserve a table</button></div></div><div className="grid content-start gap-8 border-t border-[#fff7e9]/30 pt-7 sm:grid-cols-2 lg:mt-20"><div><MapPin size={20} className="text-[#f5c84b]" /><p className="mt-4 font-display text-2xl font-bold">131 Orchard Street</p><p className="mt-1 text-sm text-[#ffe9c7]/65">New York, NY 10002</p></div><div><Clock3 size={20} className="text-[#f5c84b]" /><p className="mt-4 font-display text-2xl font-bold">Open late</p><p className="mt-1 text-sm leading-6 text-[#ffe9c7]/65">Sun–Thu · 11am–1am<br />Fri–Sat · 11am–2am</p></div><div><Phone size={20} className="text-[#f5c84b]" /><a href="tel:+12125550182" data-testid="link-phone" className="mt-4 block font-display text-2xl font-bold hover:text-[#f5c84b]">(212) 555-0182</a><p className="mt-1 text-sm text-[#ffe9c7]/65">Call ahead, we'll save you a seat.</p></div></div></div></section>
      <footer className="bg-[#f5c84b] px-5 py-10 text-[#3b2118] lg:px-8"><div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><a href="#top" data-testid="link-footer-logo" className="font-display text-4xl font-extrabold tracking-[-.07em]">SHAVARMA<span className="text-[#b55032]">.</span></a><p className="mt-2 max-w-[250px] text-sm">The neighborhood spot for whatever kind of night this is.</p></div><div className="flex items-center gap-5"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" data-testid="link-instagram" aria-label="Instagram" className="transition-colors hover:text-[#b55032]"><Instagram size={21} /></a><a href="mailto:hello@shavarma.nyc" data-testid="link-email" className="font-mono text-[10px] uppercase tracking-[.16em] transition-colors hover:text-[#b55032]">hello@shavarma.nyc</a></div><p className="font-mono text-[9px] uppercase tracking-[.14em]">© 2025 Shavarma NYC</p></div></footer>
    </main>
    {orderOpen && <OrderPanel onClose={() => setOrderOpen(false)} />}
    {reservationOpen && <ReservationModal onClose={() => setReservationOpen(false)} />}
  </div>;
}

function Router() {
  return <ErrorBoundary resetKey={useLocation()[0]}><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;