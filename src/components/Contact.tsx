import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Linkedin, Instagram, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import configData from "@/data/config.json";

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.telefono) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.telefono.length > 13) {
      toast.error("El número telefónico no puede tener más de 13 dígitos");
      return;
    }

    try {
      const mailEndpoint = import.meta.env.VITE_MAIL_API_URL || '/api/send-mail';

      const response = await fetch(mailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'form',
          name: formData.nombre,
          email: formData.email,
          phone: formData.telefono,
          message: formData.mensaje,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("¡Mensaje enviado! Nos pondremos en contacto pronto.");
        setFormData({ nombre: "", email: "", telefono: "", mensaje: "" });
      } else {
        throw new Error(data.message || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending form:', error);
      toast.error("Hubo un problema al enviar el mensaje. Intenta nuevamente más tarde.");
    }
  };

  const handleScheduleCall = () => {
    window.open(configData.redes.whatsapp, "_blank");
  };

  return (
    <section id="contacto" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contáctanos
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Estamos listos para crear tu recorrido virtual profesional
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-card p-8 rounded-2xl border-2 border-border shadow-[var(--shadow-smooth)] animate-fade-in"
          >
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Nombre *
              </label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="border-2 focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Correo electrónico *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border-2 focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Número telefónico (máximo 13 dígitos) *
              </label>
              <Input
                id="telefono"
                type="tel"
                maxLength={13}
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, "") })
                }
                className="border-2 focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="mensaje"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Mensaje
              </label>
              <Textarea
                id="mensaje"
                value={formData.mensaje}
                onChange={(e) =>
                  setFormData({ ...formData, mensaje: e.target.value })
                }
                className="border-2 focus:border-primary min-h-32"
                placeholder="Cuéntanos sobre tu proyecto..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-smooth)]"
              >
                Enviar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleScheduleCall}
                className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Phone className="mr-2 h-4 w-4" />
                Agendar una llamada
              </Button>
            </div>
          </form>

          {/* Redes sociales */}
          <div className="mt-12 text-center animate-fade-in [animation-delay:200ms]">
            <p className="text-muted-foreground mb-6">Síguenos en:</p>
            <div className="flex justify-center gap-6">
              <a
                href={configData.redes.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
              >
                <Linkedin size={24} />
              </a>
              <a
                href={configData.redes.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
              >
                <Instagram size={24} />
              </a>
              <a
                href={configData.redes.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
              >
                <Phone size={24} />
              </a>
              <a
                href={configData.redes.email}
                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
