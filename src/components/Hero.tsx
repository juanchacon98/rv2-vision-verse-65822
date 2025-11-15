import { Button } from "@/components/ui/button";
import { Play, MessageCircle, ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const scrollToContacto = () => {
    const element = document.getElementById("contacto");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTours = () => {
    const toursElement = document.getElementById("tours");
    if (toursElement) {
      toursElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
  };

  const whatsappNumber = "584127833206";
  const message = encodeURIComponent("¡Hola! Me interesa obtener más información sobre los recorridos virtuales 360°");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Virtual Tour Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-32 z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
            Recorridos Virtuales 360°{" "}
            <span className="text-primary">en Venezuela</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto drop-shadow-lg">
            Convierte tu espacio físico en una experiencia digital inmersiva
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-xl text-lg px-8 py-6 group"
            >
              <a href="https://rv2ven.com/COLAB" target="_blank" rel="noopener noreferrer">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Ver Ejemplo
              </a>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50 shadow-lg hover:scale-105 transition-all duration-300 group"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Contáctanos por WhatsApp
              </a>
            </Button>
          </div>

          {/* Scroll Down Indicator */}
          <div className="pt-12 animate-fade-in">
            <button
              onClick={scrollDown}
              className="group cursor-pointer hover:scale-110 transition-all duration-300"
              aria-label="Scroll down"
            >
              <div className="relative w-8 h-12 border-2 border-primary/60 rounded-full flex justify-center pt-2 group-hover:border-primary overflow-hidden">
                <div className="w-2 h-2.5 bg-primary rounded-full animate-scroll-down" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
