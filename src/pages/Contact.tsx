import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Office',
      content: '89569 93132',
      link: 'tel:+918956993132',
    },
    {
      icon: Phone,
      title: 'Mobile',
      content: '93093 49629',
      link: 'tel:+919309349629',
    },
    {
      icon: Phone,
      title: 'WhatsApp',
      content: '86002 75796',
      link: 'https://wa.me/918600275796',
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
          <h1 className="text-4xl font-bold mb-4 text-white">Contact Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Get in touch with us for any questions or concerns
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-full bg-blue-900/10">
                      <item.icon className="h-6 w-6 text-blue-900" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <a
                    href={item.link}
                    className="text-lg font-bold text-blue-900 hover:text-blue-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.content}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardContent className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    className="min-h-[120px]"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}