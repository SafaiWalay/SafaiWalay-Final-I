import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { requestWithdrawal } from '@/lib/supabase';

interface EarningsCardProps {
  balance: number;
  history: any[];
  onWithdraw: () => void;
}

export default function EarningsCard({ balance, history, onWithdraw }: EarningsCardProps) {
  const { toast } = useToast();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      await requestWithdrawal(balance);
      onWithdraw();
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing || balance <= 0}
            >
              <IndianRupee className="mr-2 h-4 w-4" />
              {isWithdrawing ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Recent Earnings</h4>
            <div className="space-y-2">
              {history.slice(0, 5).map((entry: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-2 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{entry.service}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-medium">₹{entry.amount}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}