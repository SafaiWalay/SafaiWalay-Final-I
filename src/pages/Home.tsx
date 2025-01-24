import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Star, Shield, Clock, Award, Sparkles } from 'lucide-react';

export default function Home() {
  const features = [
    'Professional & Trained Staff',
    'Eco-friendly Cleaning Products',
    '100% Satisfaction Guarantee',
    'Flexible Scheduling',
    'Insured & Bonded',
    'Same Day Service Available',
  ];

  const services = [
    {
      title: 'Home Cleaning',
      description: 'Complete home cleaning services tailored to your needs',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80',
    },
    {
      title: 'Office Cleaning',
      description: 'Professional cleaning solutions for your workspace',
      image: 'https://images.unsplash.com/photo-1613963931023-5dc59437c8a6?auto=format&fit=crop&q=80',
    },
    {
      title: 'Deep Cleaning',
      description: 'Thorough deep cleaning for a spotless environment',
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80',
    },
  ];

  const whyChooseUs = [
    {
      icon: Shield,
      title: 'Trusted & Reliable',
      description: 'Our cleaners are background-checked and professionally trained',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book our services at your convenience, 7 days a week',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: '100% satisfaction guarantee with every service',
    },
    {
      icon: Sparkles,
      title: 'Eco-Friendly',
      description: 'We use environmentally safe cleaning products',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background pt-20 pb-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Professional Cleaning Services
                <br />
                for Your Home & Office
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Experience the difference with our professional cleaning services.
                We make your space sparkle!
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link to="/services">
                    Book Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <img
                src="/Images/Mascot.jpg"
                alt="SafaiWalay Mascot"
                className="rounded-lg shadow-2xl w-full max-w-md mx-auto"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
                <p className="text-lg font-bold">Trusted by 1000+ customers</p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose SafaiWalay?</h2>
            <p className="text-muted-foreground">Experience the best in professional cleaning services</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background p-6 rounded-lg shadow-sm"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4 p-4 rounded-lg bg-background shadow-sm"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground">
              Choose from our range of professional cleaning services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm opacity-90">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="text-3xl font-bold">Ready to Experience the Best Cleaning Service?</h2>
            <p className="text-primary-foreground/90">
              Book your cleaning service today and enjoy a spotless environment
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/services">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}