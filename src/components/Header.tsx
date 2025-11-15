import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo_rv2.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="RV2 Logo" className="h-12 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("inicio")}
              className={`hover:text-primary transition-colors font-medium ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("servicios")}
              className={`hover:text-primary transition-colors font-medium ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => scrollToSection("proyectos")}
              className={`hover:text-primary transition-colors font-medium ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Proyectos
            </button>
            <button
              onClick={() => scrollToSection("preguntas")}
              className={`hover:text-primary transition-colors font-medium ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Acerca de
            </button>
            <Button
              onClick={() => scrollToSection("contacto")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg transition-all duration-300"
            >
              Contacto
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 hover:text-primary transition-colors ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in bg-background/95 backdrop-blur-md rounded-lg p-4 shadow-lg border border-border">
            <button
              onClick={() => scrollToSection("inicio")}
              className="text-foreground hover:text-primary transition-colors font-medium text-left py-2"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("servicios")}
              className="text-foreground hover:text-primary transition-colors font-medium text-left py-2"
            >
              Servicios
            </button>
            <button
              onClick={() => scrollToSection("proyectos")}
              className="text-foreground hover:text-primary transition-colors font-medium text-left py-2"
            >
              Proyectos
            </button>
            <button
              onClick={() => scrollToSection("preguntas")}
              className="text-foreground hover:text-primary transition-colors font-medium text-left py-2"
            >
              Acerca de
            </button>
            <Button
              onClick={() => scrollToSection("contacto")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg transition-all duration-300 w-full"
            >
              Contacto
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
