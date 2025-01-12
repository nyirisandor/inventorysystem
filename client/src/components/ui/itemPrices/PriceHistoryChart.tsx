import { ItemPrice } from "@/types/itemprice";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";



export function PriceHistoryChart({priceHistory} : {priceHistory : ItemPrice[]}) {

    const chartConfig : ChartConfig = {
        amount: {
            label : "HUF",
        }
    }

    return <>
        <ChartContainer config={chartConfig}>
            <AreaChart
                data={priceHistory}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value : Date) => value.toDateString()}
                />
                <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                />

                <Area
                dataKey="amount"
                type="natural"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.1}
                stroke="hsl(var(--chart-2))"
                stackId="a"
                />


            </AreaChart>
        </ChartContainer>
    </>
}