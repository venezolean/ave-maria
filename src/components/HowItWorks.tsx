import { MousePointer, Search, Rocket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    icon: MousePointer,
    title: 'Crea un producto',
    description: 'Deja a la IA organizar datos',
  },
  {
    icon: Search,
    title: 'Tócalo para vender',
    description: 'Descubre lo facil que puedes ser',
  },
  {
    icon: Rocket,
    title: 'Mira cuánto vendiste hoy',
    description: 'Listo para usar de inmediato',
  },
];

export default function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          steps.forEach((_, index) => {
            setTimeout(() => {
              setVisibleSteps((prev) => [...prev, index]);
            }, index * 200);
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent"></div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Empieza en segundos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-y-1/2"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`relative transition-all duration-700 ${
                  visibleSteps.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/50 rounded-full flex items-center justify-center mx-auto">
                      <Icon className="w-9 h-9 text-blue-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {step.title}
                  </h3>

                  <p className="text-gray-400">
                    {step.description}
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
