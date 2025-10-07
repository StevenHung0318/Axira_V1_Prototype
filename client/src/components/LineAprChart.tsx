import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type Plugin,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useMemo } from "react";
import { calculateAverageAPR } from "../data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineAprChartProps {
  dailyApr: number[];
  title?: string;
}

export default function LineAprChart({
  dailyApr,
  title = "7-Day Strategy APR",
}: LineAprChartProps) {
  const averageAPR = calculateAverageAPR(dailyApr);

  const chartData = useMemo<ChartData<"line">>(
    () => ({
      labels: dailyApr.map((_, index) => `Day ${index + 1}`),
      datasets: [
        {
          label: "Daily APR",
          data: dailyApr,
          borderColor: "#60a5fa",
          borderWidth: 2.8,
          fill: true,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) {
              return "rgba(96, 165, 250, 0.12)";
            }

            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, "rgba(96, 165, 250, 0)");
            gradient.addColorStop(0.55, "rgba(96, 165, 250, 0.12)");
            gradient.addColorStop(1, "rgba(37, 99, 235, 0.3)");

            return gradient;
          },
          tension: 0.65,
          pointRadius: 0,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "#93c5fd",
          pointHoverBorderColor: "#93c5fd",
          pointBorderWidth: 0,
          cubicInterpolationMode: "monotone",
          clip: 20,
        },
        {
          label: "Average APR",
          data: new Array(dailyApr.length).fill(averageAPR),
          borderColor: "rgba(148, 163, 184, 0.38)",
          borderDash: [8, 6],
          borderWidth: 1.8,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    }),
    [dailyApr, averageAPR]
  );

  const chartBackgroundPlugin = useMemo<Plugin<"line">>(
    () => ({
      id: "chartBackground",
      beforeDraw: (chart) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) {
          return;
        }

        ctx.save();
        const gradient = ctx.createLinearGradient(
          chartArea.left,
          chartArea.top,
          chartArea.left,
          chartArea.bottom
        );
        gradient.addColorStop(0, "rgba(15, 23, 42, 0.4)");
        gradient.addColorStop(1, "rgba(15, 23, 42, 0.05)");
        ctx.fillStyle = gradient;
        ctx.fillRect(
          chartArea.left,
          chartArea.top,
          chartArea.right - chartArea.left,
          chartArea.bottom - chartArea.top
        );
        ctx.restore();
      },
    }),
    []
  );

  const neonLinePlugin = useMemo<Plugin<"line">>(
    () => ({
      id: "neonLine",
      afterDatasetsDraw: (chart) => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const dataset = meta.dataset as { draw?: (ctx: CanvasRenderingContext2D) => void };

        if (!dataset || meta.hidden || typeof dataset.draw !== "function") {
          return;
        }

        ctx.save();
        ctx.shadowColor = "rgba(96, 165, 250, 0.45)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalCompositeOperation = "lighter";
        dataset.draw(ctx);
        ctx.restore();
      },
    }),
    []
  );

  const averageAprLabelPlugin = useMemo<Plugin<"line">>(
    () => ({
      id: "averageAprLabel",
      afterDatasetsDraw: (chart) => {
        const { ctx, chartArea, scales } = chart;
        const yScale = scales?.y as {
          getPixelForValue: (value: number) => number;
        } | undefined;

        if (!chartArea || !yScale) {
          return;
        }

        const centerY = yScale.getPixelForValue(averageAPR);
        if (!Number.isFinite(centerY)) {
          return;
        }

        const bubbleHeight = 32;
        const bubblePaddingX = 18;
        const bubbleY = Math.min(
          Math.max(centerY - bubbleHeight / 2, chartArea.top + 8),
          chartArea.bottom - bubbleHeight - 8
        );
        const bubbleX = chartArea.left + 20;

        const label = "Avg. APR";
        const value = `${averageAPR.toFixed(1)}%`;

        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";

        const labelWidth = ctx.measureText(label).width;
        ctx.font = "13px sans-serif";
        const valueWidth = ctx.measureText(value).width;
        const bubbleWidth =
          bubblePaddingX * 2 + labelWidth + 10 + valueWidth;

        const gradient = ctx.createLinearGradient(
          bubbleX,
          bubbleY,
          bubbleX,
          bubbleY + bubbleHeight
        );
        gradient.addColorStop(0, "rgba(15, 23, 42, 0.94)");
        gradient.addColorStop(1, "rgba(30, 41, 59, 0.9)");

        const strokeGradient = ctx.createLinearGradient(
          bubbleX,
          bubbleY,
          bubbleX + bubbleWidth,
          bubbleY
        );
        strokeGradient.addColorStop(0, "rgba(96, 165, 250, 0.85)");
        strokeGradient.addColorStop(1, "rgba(34, 211, 238, 0.8)");

        const drawRoundedRect = (
          x: number,
          y: number,
          width: number,
          height: number,
          radius: number
        ) => {
          const r = Math.min(radius, height / 2, width / 2);
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + width - r, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + r);
          ctx.lineTo(x + width, y + height - r);
          ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
          ctx.lineTo(x + r, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        };

        drawRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 14);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = strokeGradient;
        ctx.lineWidth = 1.1;
        ctx.stroke();

        const textCenterY = bubbleY + bubbleHeight / 2;
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.92)";
        ctx.fillText(label, bubbleX + bubblePaddingX, textCenterY);

        ctx.font = "13px sans-serif";
        ctx.fillStyle = "rgba(125, 211, 252, 0.98)";
        ctx.fillText(
          value,
          bubbleX + bubblePaddingX + labelWidth + 10,
          textCenterY
        );

        ctx.restore();
      },
    }),
    [averageAPR]
  );

  const chartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
          text: title,
          color: "#f1f5f9",
          font: {
            weight: 600,
            size: 14,
          },
          padding: {
            bottom: 12,
          },
          align: "start",
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderColor: "rgba(45, 212, 191, 0.45)",
          borderWidth: 1,
          displayColors: false,
          padding: 12,
          callbacks: {
            title: (items) => items[0]?.label ?? "",
            label: (item: TooltipItem<"line">) => {
              const value =
                typeof item.parsed.y === "number"
                  ? item.parsed.y.toFixed(2)
                  : item.parsed.y;
              if (item.datasetIndex === 0) {
                return `Daily APR: ${value}%`;
              }
              return `Average APR: ${value}%`;
            },
          },
        },
      },
      elements: {
        line: {
          borderCapStyle: "round",
          borderJoinStyle: "round",
        },
        point: {
          radius: 0,
          hoverRadius: 6,
          hoverBorderWidth: 2,
        },
      },
      scales: {
        x: {
          grid: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            color: "#64748b",
            padding: 8,
          },
        },
        y: {
          ticks: {
            color: "#64748b",
            padding: 8,
            callback: (value) => `${value}%`,
          },
          grid: {
            drawBorder: false,
            color: "rgba(148, 163, 184, 0.08)",
            borderDash: [4, 8],
            tickLength: 0,
          },
        },
      },
      layout: {
        padding: {
          top: 8,
          right: 12,
          left: 4,
          bottom: 0,
        },
      },
    }),
    [title]
  );

  return (
    <div className="w-full h-64" data-testid="chart-apr">
      <Line
        data={chartData}
        options={chartOptions}
        plugins={[chartBackgroundPlugin, neonLinePlugin, averageAprLabelPlugin]}
      />
    </div>
  );
}
