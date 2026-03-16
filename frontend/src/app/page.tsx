import Link from 'next/link';
import { ArrowRight, Star, Clock, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary-500/30 text-primary-400 text-sm font-medium mb-4 animate-slide-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          Next-Gen Recipe Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Cook, Share, & <br className="hidden md:block" />
          <span className="text-gradient">Inspire The World</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-[var(--color-text-muted)] leading-relaxed">
          Join a thriving community of culinary enthusiasts. Discover mouth-watering recipes, save your favorites, and share your own masterpieces.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/register" className="btn-primary text-lg px-8 flex items-center gap-2 group">
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/recipes" className="btn-secondary text-lg px-8">
            Explore Menu
          </Link>
        </div>
      </section>

      {/* Featured Section (Placeholder) */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <p className="text-[var(--color-text-muted)] mt-2">Discover what the community is loving today.</p>
          </div>
          <Link href="/recipes" className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 group">
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Skeleton placeholders before dynamic fetching is implemented */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="recipe-card group block">
              <div className="aspect-[4/3] bg-[var(--color-surface)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div className="skeleton w-full h-full absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 z-20 badge">
                  Pro Chef
                </div>
              </div>
              <div className="p-5 space-y-4 relative z-20">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold leading-tight group-hover:text-primary-400 transition-colors line-clamp-2">
                    Loading Recipe...
                  </h3>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                    <span>-.--</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>-- mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>-</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
