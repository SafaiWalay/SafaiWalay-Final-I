import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Award, Users, Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function About() {
  const stats = [
    {
      icon: Users,
      value: '1,000+',
      label: 'Happy Customers',
    },
    {
      icon: Calendar,
      value: '1+ Year',
      label: 'Experience',
    },
    {
      icon: MapPin,
      value: '20+',
      label: 'Service Areas',
    },
    {
      icon: Award,
      value: '100%',
      label: 'Satisfaction Rate',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary/10 to-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-6">Our Story</h1>
            <p className="text-xl text-muted-foreground">
              Founded in 2023, SafaiWalay has quickly become one of
              Nagpur's most trusted cleaning companies. Our journey is built on trust,
              quality, and customer satisfaction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <img
                src="/Images/Mascot.jpg"
                alt="SafaiWalay Office"
                className="rounded-lg shadow-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground">
                At SafaiWalay, our mission is to provide exceptional cleaning services that enhance
                the quality of life for our customers. We believe in creating healthy, clean
                environments while maintaining the highest standards of professionalism and
                customer service.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <span>Quality-focused approach</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>Professional, trained staff</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span>Timely, reliable service</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="text-3xl font-bold">Join Our Growing Family</h2>
            <p className="text-primary-foreground/90">
              Experience the SafaiWalay difference today
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/services">
                View Our Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}