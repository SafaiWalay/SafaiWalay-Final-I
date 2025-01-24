import { motion } from 'framer-motion';
import { useChat } from '@/lib/store';
import ChatPanel from './ChatPanel';

export default function Mascot() {
  const { isOpen, setIsOpen } = useChat();

  return (
    <>
      <motion.div
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          {/* Character Container */}
          <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
            {/* Character Body */}
            <div className="relative w-20 h-20">
              {/* Head */}
              <motion.div
                className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#FFB6C1] rounded-full"
                animate={{
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Eyes */}
                <motion.div
                  className="absolute top-4 left-2 w-2 h-2 bg-blue-900 rounded-full"
                  animate={{
                    scale: [1, 0.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
                <motion.div
                  className="absolute top-4 right-2 w-2 h-2 bg-blue-900 rounded-full"
                  animate={{
                    scale: [1, 0.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
                {/* Smile */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-2 border-b-2 border-blue-900 rounded-full" />
                {/* Cap */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-4 bg-blue-500 rounded-t-full" />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-blue-500 rounded-full" />
              </motion.div>

              {/* Body/Uniform */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-blue-500 rounded-t-lg" />
              
              {/* Arms */}
              <motion.div
                className="absolute bottom-6 left-0 w-6 h-2 bg-[#FFB6C1] origin-right"
                animate={{
                  rotate: [-20, 20, -20],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-6 right-0 w-6 h-2 bg-[#FFB6C1] origin-left"
                animate={{
                  rotate: [20, -20, 20],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Cleaning Tool */}
              <motion.div
                className="absolute -right-4 bottom-4 w-8 h-1 bg-gray-300 rotate-45"
                animate={{
                  rotate: [45, 60, 45],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute top-0 right-0 w-3 h-4 bg-blue-200 rounded-sm" />
              </motion.div>
            </div>
          </div>

          {/* Cleaning Sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-200 rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, (i % 2 === 0 ? 20 : -20)],
                y: [0, -20],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
              style={{
                top: '50%',
                left: '50%',
              }}
            />
          ))}
        </motion.div>
      </motion.div>
      <ChatPanel />
    </>
  );
}