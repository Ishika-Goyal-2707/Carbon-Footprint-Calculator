function toggleTheme() {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  function calculateFootprint() {
    document.getElementById('loading').style.display = 'block';  // Show spinner
    document.getElementById('result').style.display = 'none';    // Hide result

    setTimeout(() => {
      // Perform all calculations, show results, and hide the spinner
      document.getElementById('loading').style.display = 'none';
      document.getElementById('result').style.display = 'block';
      document.getElementById('footprintChart').style.display = 'block';

      document.getElementById('saveReport').style.display = 'block'; // Show Save button
    }, 1000);  // Simulate delay

    const miles = Number(document.getElementById('miles').value) || 0;
    const electricity = Number(document.getElementById('electricity').value) || 0;
    const ac = Number(document.getElementById('ac').value) || 0;
    const meat = Number(document.getElementById('meat').value) || 0;
    const diet = document.getElementById('diet').value;

    const transportCO2 = miles * 0.404 * 52;
    const electricityCO2 = electricity * 12 * 0.417;
    const acCO2 = ac * 12 * 1.2;
    const meatCO2 = meat * 52 * 7;
    let foodCO2 = 0;
    if (diet === 'vegan') foodCO2 = 1200;
    else if (diet === 'vegetarian') foodCO2 = 1500;
    else if (diet === 'average') foodCO2 = 2500;
    else if (diet === 'high-meat') foodCO2 = 3300;

    const totalCO2 = transportCO2 + electricityCO2 + acCO2 + meatCO2 + foodCO2;

    let impact = "";
    if (totalCO2 < 4000) impact = "🌱 Low";
    else if (totalCO2 < 12000) impact = "⚡ Medium";
    else impact = "🔥 High";

    let tips = "<ul>";
    const maxCategory = Math.max(transportCO2, electricityCO2, acCO2, meatCO2, foodCO2);
    if (maxCategory === transportCO2) {
      tips += "<li><span class='highlight'>Transport is your biggest contributor.</span> Try biking or carpooling.</li>";
    } else if (maxCategory === electricityCO2) {
      tips += "<li><span class='highlight'>Electricity use is high.</span> Switch to LEDs, unplug devices, and conserve energy.</li>";
    } else if (maxCategory === acCO2) {
      tips += "<li><span class='highlight'>AC usage is high.</span> Improve insulation and use fans when possible.</li>";
    } else if (maxCategory === meatCO2 || maxCategory === foodCO2) {
      tips += "<li><span class='highlight'>Food choices contribute heavily.</span> Incorporate more plant-based meals.</li>";
    }
    tips += "</ul>";

    document.getElementById('result').innerHTML = `
      <h3>📊 Your Annual Carbon Footprint:</h3>
      <p>🚗 Transport: ${transportCO2.toFixed(0)} kg CO₂</p>
      <p>⚡ Electricity: ${electricityCO2.toFixed(0)} kg CO₂</p>
      <p>❄️ AC Usage: ${acCO2.toFixed(0)} kg CO₂</p>
      <p>🍖 Meat Consumption: ${meatCO2.toFixed(0)} kg CO₂</p>
      <p>🥗 Food (diet choice): ${foodCO2} kg CO₂</p>
      <h3>Total: <strong>${totalCO2.toFixed(0)} kg CO₂ / year</strong></h3>
      <h3>Impact Level: <strong>${impact}</strong></h3>
      <h4>🔄 Tips to Reduce:</h4>
      ${tips}
    `;

    const canvas = document.getElementById('footprintChart');
canvas.style.display = 'block';

// Wait for canvas to be rendered in DOM
requestAnimationFrame(() => {
  const ctx = document.getElementById('footprintChart').getContext('2d');
new Chart(ctx, {
type: 'bar',
data: {
  labels: ['Transport', 'Electricity', 'AC Usage', 'Meat', 'Food'],
  datasets: [{
    label: 'kg CO₂ per Year',
    data: [transportCO2, electricityCO2, acCO2, meatCO2, foodCO2],
    backgroundColor: ['#4CAF50', '#03A9F4', '#FFC107', '#FF5722', '#9C27B0'],
    borderColor: ['#388E3C', '#F57C00', '#D32F2F'],
    borderWidth: 1
  }]
},
options: {
  responsive: true,
  animation: {
    duration: 1000,
    easing: 'easeOutBounce'
  },
  scales: {
    y: { beginAtZero: true }
  }
}
});

});
  }

  async function saveAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const result = document.getElementById('result');
    const chart = document.getElementById('footprintChart');

    const resultCanvas = await html2canvas(result);
    const resultImgData = resultCanvas.toDataURL('image/png');

    const chartCanvas = await html2canvas(chart);
    const chartImgData = chartCanvas.toDataURL('image/png');

    // Page 1: Title and User Data
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Header
    doc.setFillColor(0, 150, 136); // Teal color
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('🌍 Carbon Footprint Report', pageWidth / 2, 12, { align: 'center' });

    // Date
    const dateTime = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(200);
    doc.text(`Generated: ${dateTime}`, margin, 28);

    // User Info
    const name = document.getElementById('userName').value || "Anonymous";
    const location = document.getElementById('userLocation').value || "Unknown";

    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`👤 Name: ${name}`, margin, 38);
    doc.text(`📍 Location: ${location}`, margin, 46);

    // Section Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('📊 Your Carbon Footprint Summary', margin, 58);

    // Draw a light border box around result
    doc.setDrawColor(100);
    doc.rect(margin, 60, pageWidth - 2 * margin, 110);
    doc.addImage(resultImgData, 'PNG', margin + 5, 65, pageWidth - 2 * margin - 10, 100);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Page 1', pageWidth - margin, 290, { align: 'right' });

    // Page 2: Chart
    doc.addPage();

    // Header
    doc.setFillColor(76, 175, 80); // Green color
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255);
    doc.text('📈 Emissions Breakdown Chart', pageWidth / 2, 12, { align: 'center' });

    // Insert chart
    doc.setDrawColor(150);
    doc.rect(margin, 30, pageWidth - 2 * margin, 130);
    doc.addImage(chartImgData, 'PNG', margin + 5, 35, pageWidth - 2 * margin - 10, 120);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Page 2', pageWidth - margin, 290, { align: 'right' });

    doc.save('carbon-footprint-report.pdf');
  }