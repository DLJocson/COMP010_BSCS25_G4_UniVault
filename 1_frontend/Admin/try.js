const ctx = document.getElementById("myChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [
      "Total Customers",
      "New Accounts",
      "Verified Customers",
      "Rejected Customers",
    ],
    datasets: [
      {
        label: "Last Month",
        data: [186, 305, 237, 73],
        backgroundColor: "#004ea8",
      },
      {
        label: "This Month",
        data: [80, 200, 120, 190],
        backgroundColor: "#fcb715",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
        },
      },
    },
  },
});
