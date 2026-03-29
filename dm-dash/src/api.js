/**
 * Central API module for DM Dashboard.
 * Connects to the PMDDKY backend public endpoints.
 */

const API_BASE = 'http://localhost:8000/api/public/dashboard';

async function fetchJSON(path) {
  const url = `${API_BASE}${path}`;
  try {
    console.log(`[DM-API] Fetching: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[DM-API] HTTP ${res.status} from ${url}`);
      return null;
    }
    const data = await res.json();
    console.log(`[DM-API] Success: ${url}`, data);
    return data;
  } catch (err) {
    console.error(`[DM-API] Fetch failed: ${url}`, err.message);
    return null;
  }
}

const BDO_API_BASE = 'http://localhost:8000/api/bdo';

async function fetchBDOJSON(path) {
  const url = `${BDO_API_BASE}${path}`;
  try {
    console.log(`[BDO-API] Fetching: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[BDO-API] HTTP ${res.status} from ${url}`);
      return null;
    }
    const data = await res.json();
    console.log(`[BDO-API] Success: ${url}`, data);
    return data;
  } catch (err) {
    console.error(`[BDO-API] Fetch failed: ${url}`, err.message);
    return null;
  }
}

export async function fetchOverview() {
  return fetchJSON('/overview');
}

export async function fetchDistrictDashboard(districtId) {
  return fetchJSON(`/district/${districtId}`);
}

export async function fetchAnomalies() {
  return fetchJSON('/anomalies');
}

export async function fetchAnomaliesByDistrict(districtId) {
  return fetchJSON(`/anomalies/district/${districtId}`);
}

export async function fetchBlocks() {
  return fetchJSON('/blocks');
}

export async function fetchRecentSubmissions() {
  return fetchJSON('/submissions/recent');
}

export async function fetchFundSummary() {
  return fetchJSON('/fund-summary');
}

export async function fetchVerificationsSummary() {
  return fetchJSON('/verifications/summary');
}

export async function fetchAdvanceAnalytics() {
  return fetchJSON('/advance-analytics');
}

// -------------------------
// BDO Dashboard Endpoints
// (Using fallbacks for mock data since backend might not have these yet)
// -------------------------

export async function fetchBDOOverview(blockId) {
  const data = await fetchBDOJSON(`/overview?block_id=${blockId}`);
  if (data) return data;
  
  // Mock fallback
  return {
    metrics: { totalScheduled: 124, completed: 89, pending: 30, missed: 5 },
    today: { activeAgents: 12, scheduled: 34, completed: 21, pending: 13 },
    pieData: [{ name: 'Completed', value: 89 }, { name: 'Pending', value: 30 }, { name: 'Missed', value: 5 }],
    trendData: []
  };
}

export async function fetchBDOAgents(blockId) {
  const data = await fetchBDOJSON(`/agents?block_id=${blockId}`);
  if (data) return data;
  return [];
}

export async function fetchBDOVisits(blockId) {
  const data = await fetchBDOJSON(`/visits?block_id=${blockId}`);
  if (data) return data;
  return [];
}

export async function fetchBDOGrievances(blockId) {
  const data = await fetchBDOJSON(`/grievances?block_id=${blockId}`);
  if (data) return data;
  return [];
}

export async function fetchBDOTodaySummary(blockId) {
  const data = await fetchBDOJSON(`/today?block_id=${blockId}`);
  if (data) return data;
  
  return {
    stats: { assigned: 0, completed: 0, pending: 0 },
    activeAgents: []
  };
}

export async function assignBDOAgent(agentData) {
  const url = `${BDO_API_BASE}/agents`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData)
    });
    if (!res.ok) {
      console.error(`[BDO-API] Failed to assign agent: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[BDO-API] Error assigning agent:`, err);
    return null;
  }
}

export async function assignFarmerToAgent(agentId, farmerData) {
  const url = `${BDO_API_BASE}/agents/${agentId}/farmers`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerData)
    });
    if (!res.ok) {
      console.error(`[BDO-API] Failed to assign farmer: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[BDO-API] Error assigning farmer:`, err);
    return null;
  }
}

export async function getBlockData(blockId) {
  return fetchBDOJSON(`/block-data?block_id=${blockId}`);
}

export async function explainAnomaly(anomalyType, agent, details) {
  const url = `${BDO_API_BASE}/explain-anomaly`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anomaly_type: anomalyType, agent, details })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`[BDO-API] Error explaining anomaly:`, err);
    return null;
  }
}

export async function reassignFarmer(farmerId, newAgentId) {
  const url = `${BDO_API_BASE}/farmers/${farmerId}/reassign`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_agent_id: newAgentId })
    });
    if (!res.ok) {
      console.error(`[BDO-API] Failed to reassign farmer: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[BDO-API] Error reassiging farmer:`, err);
    return null;
  }
}

// -------------------------
// DM Administrative Actions
// -------------------------

export async function freezeBlock(blockId, reason = '') {
  const url = `${API_BASE}/blocks/freeze`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_id: blockId, reason })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`[DM-API] Error freezing block:`, err);
    return null;
  }
}

export async function unfreezeBlock(blockId) {
  const url = `${API_BASE}/blocks/unfreeze`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_id: blockId, reason: '' })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`[DM-API] Error unfreezing block:`, err);
    return null;
  }
}

export async function fetchBlockFrozenStatus(blockId) {
  return fetchJSON(`/blocks/${blockId}/status`);
}
