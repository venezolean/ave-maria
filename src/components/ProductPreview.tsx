import { Package, TrendingUp, PieChart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const indicators = [
  {
    icon: Package,
    label: 'Inventario',
    position: 'top-1/4 left-8',
    delay: 0,
  },
  {
    icon: TrendingUp,
    label: 'Ventas',
    position: 'top-1/2 right-8',
    delay: 300,
  },
  {
    icon: PieChart,
    label: 'Reportes',
    position: 'bottom-1/4 left-1/3',
    delay: 600,
  },
];

export default function ProductPreview() {
  const [visibleIndicators, setVisibleIndicators] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          indicators.forEach((_, index) => {
            setTimeout(() => {
              setVisibleIndicators((prev) => [...prev, index]);
            }, indicators[index].delay);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-6xl mx-auto">
        <div className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 blur-3xl"></div>

          <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 w-full p-8">
                  <div className="col-span-2 space-y-4">
                    <div className="h-12 bg-blue-500/10 rounded-lg animate-pulse"></div>
                    <div className="h-32 bg-gray-700/30 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-emerald-500/10 rounded-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="h-24 bg-blue-500/10 rounded-lg animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-20 bg-gray-700/30 rounded-lg"></div>
                    <div className="h-20 bg-gray-700/30 rounded-lg"></div>
                    <div className="h-20 bg-gray-700/30 rounded-lg"></div>
                  </div>
                </div>
              </div>

              {indicators.map((indicator, index) => {
                const Icon = indicator.icon;
                return (
                  <div
                    key={index}
                    className={`absolute ${indicator.position} transition-all duration-700 ${
                      visibleIndicators.includes(index)
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-50'
                    }`}
                  >
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all"></div>
                      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-blue-500/50 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                        <Icon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{indicator.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
