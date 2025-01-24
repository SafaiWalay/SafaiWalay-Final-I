import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Car, Sun, Droplets, Home, Warehouse, Sprout } from 'lucide-react';

export default function Services() {
  const services = [
    {
      id: 'patio-parking',
      title: 'Patio & Parking Cleaning',
      price: '₹999',
      description: 'Professional cleaning for patios and parking areas',
      icon: Home,
      color: 'bg-blue-500',
      features: [
        'Deep cleaning of surfaces',
        'Oil stain removal',
        'Pressure washing',
        'Sanitization',
        'Eco-friendly solutions',
      ],
    },
    {
      id: 'solar-panel',
      title: 'Solar Panel Cleaning',
      price: '₹600',
      description: 'Expert cleaning for optimal solar performance',
      icon: Sun,
      color: 'bg-green-500',
      features: [
        'Performance optimization',
        'Dust removal',
        'Bird dropping cleaning',
        'Efficiency check',
        'Safety inspection',
      ],
    },
    {
      id: 'carpet-cleaning',
      title: 'Carpet Cleaning',
      price: '₹500',
      description: 'Deep carpet cleaning and maintenance',
      icon: Sprout,
      color: 'bg-orange-500',
      features: [
        'Deep stain removal',
        'Dust extraction',
        'Deodorization',
        'Fabric protection',
        'Quick drying',
      ],
    },
    {
      id: 'terrace-roof',
      title: 'Terrace & Roof Cleaning',
      price: '₹1299',
      description: 'Complete terrace and roof cleaning solutions',
      icon: Warehouse,
      color: 'bg-blue-600',
      features: [
        'Waterproofing check',
        'Debris removal',
        'Drain cleaning',
        'Surface treatment',
        'Preventive maintenance',
      ],
    },
    {
      id: 'water-tank',
      title: 'Water Tank Cleaning',
      price: '₹1000',
      description: 'Professional water tank cleaning services',
      icon: Droplets,
      color: 'bg-yellow-500',
      features: [
        'Complete emptying',
        'Sludge removal',
        'Wall scrubbing',
        'Sanitization',
        'Quality check',
      ],
    },
    {
      id: 'car-wash',
      title: 'Car Wash',
      price: '₹499',
      description: 'Premium car washing and detailing',
      icon: Car,
      color: 'bg-orange-600',
      features: [
        'Exterior washing',
        'Interior cleaning',
        'Waxing',
        'Tire dressing',
        'Dashboard polishing',
      ],
    },
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-blue-900 to-blue-800">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4 text-white">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Professional cleaning solutions for every need
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all duration-300">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 ${service.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} />
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${service.color} text-white`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-6">{service.price}</div>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <svg
                          className={`h-5 w-5 ${service.color} text-white rounded-full`}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-900 hover:bg-blue-800" asChild>
                    <Link to={`/book/${service.id}`}>Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}