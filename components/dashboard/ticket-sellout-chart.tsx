"use client"

import { useTranslation } from "@/i18n/context"

interface TicketSelloutData {
  name: string
  quantitySold: number
  quantityTotal: number
}

interface TicketSelloutChartProps {
  data: TicketSelloutData[]
}

export default function TicketSelloutChart({ data }: TicketSelloutChartProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {data.map((ticket) => {
        const percentage = ticket.quantityTotal > 0
          ? Math.round((ticket.quantitySold / ticket.quantityTotal) * 100)
          : 0;

        let barColor = "bg-green-500";
        let textColor = "text-green-700";
        if (percentage >= 90) {
          barColor = "bg-red-500";
          textColor = "text-red-700";
        } else if (percentage >= 60) {
          barColor = "bg-yellow-500";
          textColor = "text-yellow-700";
        }

        return (
          <div key={ticket.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{ticket.name}</span>
              <span className={textColor}>
                {ticket.quantitySold}/{ticket.quantityTotal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {percentage >= 100
                ? t('events.sold_out')
                : `${100 - percentage}% ${t('events.remaining').toLowerCase()}`
              }
            </p>
          </div>
        );
      })}
    </div>
  );
}
