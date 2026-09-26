/* ============================================================
   Admin Dashboard
   Page-specific script for admin/index.html:
   - Today's Jalali date badge (via window.JalaliDate)
   - ApexCharts sales chart (Persian months, Tomans)

   Depends on:
   - window.ApexCharts (loaded globally before this module)
   - src/js/jalali-date.js (loaded with `defer`)
   ============================================================ */
(function () {
  "use strict";

  /* ============================================
     Today's Jalali Date Badge
     ============================================ */
  const dateBadge = document.querySelector("#admin-today-date");
  if (dateBadge && window.JalaliDate) {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    dateBadge.textContent = window.JalaliDate.format(today, "long");
  }

  /* ============================================
     Sales Chart (last 6 Persian months)
     ============================================ */
  const chartEl = document.querySelector("#sales-chart");
  if (chartEl && window.ApexCharts) {
    const options = {
      series: [
        {
          name: "فروش (تومان)",
          data: [120000000, 98000000, 145000000, 112000000, 168000000, 452000000],
        },
      ],
      chart: {
        type: "area",
        height: 250,
        parentHeightOffset: 0,
        fontFamily: "Vazirmatn, sans-serif",
        foreColor: "#555555",
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ["#ff5a1f"],
      stroke: { curve: "smooth", width: 2.5 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.28,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: "#e8e8e8",
        strokeDashArray: 4,
        padding: {
          right: 8,
          left: 8,
          bottom: 8,
        },
      },
      xaxis: {
        categories: [
          "فروردین",
          "اردیبهشت",
          "خرداد",
          "تیر",
          "مرداد",
          "شهریور",
        ],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          offsetY: 5,
          style: {
            fontSize: "11px",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return (value / 1000000).toLocaleString("fa-IR", {
              maximumFractionDigits: 0,
            }) + " م";
          },
          style: { fontSize: "11px", fontWeight: 500 },
        },
      },
      tooltip: {
        y: {
          formatter: function (value) {
            return value.toLocaleString("fa-IR") + " تومان";
          },
        },
      },
    };

    const chart = new ApexCharts(chartEl, options);
    chart.render();
  }
})();
