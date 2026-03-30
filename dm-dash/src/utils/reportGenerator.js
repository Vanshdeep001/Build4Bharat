import { fetchOverview, fetchDistrictDashboard } from '../api';

export const generateAndDownloadReport = async (selectedDistrict) => {
  try {
    let reportText = "";
    
    if (!selectedDistrict || selectedDistrict === "Uttarakhand") {
      const res = await fetchOverview();
      if (!res) throw new Error("No data returned from API.");

      reportText += `STATE OVERVIEW REPORT: Uttarakhand\n`;
      reportText += `Generated At: ${new Date().toLocaleString()}\n\n`;
      
      const st = res.state_totals || {};
      reportText += `===================================\n`;
      reportText += `HIGH-LEVEL METRICS\n`;
      reportText += `===================================\n`;
      reportText += `Total Funds Released (Lakhs): ${((st.total_fund_released || 0) / 100000).toFixed(2)}\n`;
      reportText += `Total Funds Utilized (Lakhs): ${((st.total_fund_utilised || 0) / 100000).toFixed(2)}\n`;
      reportText += `Utilization Percentage: ${st.fund_utilisation_pct || 0}%\n`;
      reportText += `Total Verified Submissions: ${st.total_submissions || 0}\n`;
      reportText += `Open Critical Anomalies: ${st.open_anomalies || 0}\n`;
      reportText += `Average Dispute Rate: ${st.dispute_rate_pct || 0}%\n\n`;
      
      reportText += `===================================\n`;
      reportText += `DISTRICT BREAKDOWN\n`;
      reportText += `===================================\n`;
      reportText += `District Name,Submissions,Anomalies,Utilization (%),Dispute Rate (%)\n`;
      
      if (res.districts && Array.isArray(res.districts)) {
        res.districts.forEach(d => {
          reportText += `${d.district_name},${d.total_submissions},${d.open_anomalies},${d.fund_utilisation_pct},${d.dispute_rate_pct}\n`;
        });
      }
      
    } else {
      const districtId = selectedDistrict.toLowerCase().replace(/\s+/g, '_');
      const res = await fetchDistrictDashboard(districtId);
      if (!res) throw new Error("No data returned from API.");

      reportText += `DISTRICT OVERVIEW REPORT: ${selectedDistrict}\n`;
      reportText += `Generated At: ${new Date().toLocaleString()}\n\n`;
      
      reportText += `===================================\n`;
      reportText += `HIGH-LEVEL METRICS\n`;
      reportText += `===================================\n`;
      reportText += `Total Submissions: ${res.total_submissions || 0}\n`;
      reportText += `Total Active Farmers: ${res.total_farmers || 0}\n`;
      reportText += `Open Critical Anomalies: ${res.open_anomalies || 0}\n`;
      reportText += `Fund Utilization: ${res.fund_utilisation_pct || 0}%\n`;
      reportText += `Average Physical Progress: ${res.avg_physical_progress_pct || 0}%\n`;
      reportText += `Dispute Rate: ${res.dispute_rate_pct || 0}%\n\n`;
      
      reportText += `===================================\n`;
      reportText += `BLOCK-LEVEL SUMMARY\n`;
      reportText += `===================================\n`;
      reportText += `Block Name,Status,Open Anomalies,Fund Utilisation (%),Average Progress (%)\n`;
      
      if (res.block_summary && Array.isArray(res.block_summary)) {
        res.block_summary.forEach(b => {
          reportText += `${b.block_name},${b.status.toUpperCase()},${b.anomaly_count},${b.fund_utilisation_pct || 0},${b.avg_progress_pct || 0}\n`;
        });
      }
      
      if (res.recent_anomalies && Array.isArray(res.recent_anomalies) && res.recent_anomalies.length > 0) {
        reportText += `\n===================================\n`;
        reportText += `RECENT AI ANOMALIES\n`;
        reportText += `===================================\n`;
        reportText += `Anomaly Type,Risk Score,Status,Created At\n`;
        res.recent_anomalies.forEach(a => {
          const dateStr = a.created_at ? new Date(a.created_at).toLocaleString() : 'N/A';
          reportText += `${a.anomaly_type},${a.anomaly_score},${a.status},"${dateStr}"\n`;
        });
      }
    }
    
    // Create blob and trigger download
    const blob = new Blob([reportText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Simple sanitization for filename
    const safeName = (selectedDistrict || 'Uttarakhand').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("download", `PMDDKY_Report_${safeName}_${new Date().getTime()}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (err) {
    console.error("Error generating report:", err);
    return false;
  }
};
