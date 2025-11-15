import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const Pricing = () => {
  const scrollToContacto = () => {
    const contactoElement = document.getElementById("contacto");
    if (contactoElement) {
      contactoElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const benefits = [
    "Recorrido virtual 360° completo",
    "Hotspots interactivos personalizados",
    "Panel de estadísticas en tiempo real",
    "Integración con tu sitio web",
    "Soporte técnico continuo"
  ];

  return (
    <section id="planes" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Una Inversión Inteligente
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Digitaliza tu espacio con un plan transparente y una oferta irresistible.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-primary/50 shadow-[var(--shadow-strong)] hover:shadow-[0_15px_50px_-15px_hsl(var(--primary)/0.4)] transition-all duration-300 animate-fade-in">
            {/* Badge de oferta */}
            <div className="absolute top-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
              ¡OFERTA!
            </div>

            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <Sparkles size={20} />
                  <span className="font-semibold">Plan Digitaliza</span>
                </div>
                
                <div className="flex items-baseline justify-center gap-3 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-muted-foreground line-through">$1</span>
                  <span className="text-5xl md:text-6xl font-bold text-primary">$0.6</span>
                  <span className="text-2xl text-muted-foreground">por m²</span>
                </div>
                <div className="inline-block bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg font-semibold mb-2">
                  ¡OFERTA! 40% de descuento
                </div>
                <p className="text-sm text-muted-foreground mb-1">(Pago único)</p>
                
                <div className="text-xl text-foreground font-semibold mt-4">
                  + $15<span className="text-base text-muted-foreground">/mes</span> por hosting y mantenimiento
                </div>
                
                <div className="inline-block mt-4 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg font-semibold">
                  ¡Primer mes de hosting GRATIS!
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mt-1 rounded-full bg-primary/10 p-1">
                      <Check className="text-primary" size={16} />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={scrollToContacto}
                size="lg"
                className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-[var(--shadow-smooth)]"
              >
                ¡Quiero mi cotización!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
