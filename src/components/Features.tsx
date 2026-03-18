import { Zap, Package, BarChart3, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: Zap,
    title: 'Vende sin errores',
    description: 'Evita equivocaciones en caja y registra cada venta correctamente.',
  },
  {
    icon: Package,
    title: 'Nunca te quedes sin stock',
    description: 'Sabe exactamente qué productos te faltan antes de que sea tarde.',
  },
  {
    icon: BarChart3,
    title: 'Sabe cuánto ganas hoy',
    description: 'Mira tus ventas en tiempo real sin hacer cuentas.',
  },
  {
    icon: Sparkles,
    title: 'Todo en una sola pantalla',
    description: 'Sin sistemas complicados ni capacitación.',
  },
];

export default function Features() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          features.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards((prev) => [...prev, index]);
            }, index * 150);
          });
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Todo lo que necesitas para vender<br />y controlar tu negocio
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 ${
                  visibleCards.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-emerald-600/0 group-hover:from-blue-600/5 group-hover:to-emerald-600/5 rounded-2xl transition-all duration-500"></div>

                <div className="relative">
                  <div className="w-14 h-14 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-100 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
