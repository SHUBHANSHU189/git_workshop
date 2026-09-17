const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  return response.json();
};

const getQueryParams = (params) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Train APIs
export const fetchTrains = (filters) => fetch(`/api/trains${getQueryParams(filters)}`).then(handleResponse);
export const searchTrains = (query) => fetch(`/api/trains/search?q=${encodeURIComponent(query)}`).then(handleResponse);
export const fetchTrainDetails = (id) => fetch(`/api/trains/${id}`).then(handleResponse);
export const fetchTrainLive = (id) => fetch(`/api/trains/${id}/live`).then(handleResponse);
export const fetchTrainETA = (id) => fetch(`/api/trains/${id}/eta`).then(handleResponse);
export const fetchTrainStats = () => fetch(`/api/trains/stats/overview`).then(handleResponse);

// Block APIs
export const fetchBlocks = (filters) => fetch(`/api/blocks${getQueryParams(filters)}`).then(handleResponse);
export const optimizeBlocks = (dateRange) => 
  fetch('/api/blocks/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dateRange)
  }).then(handleResponse);
export const approveBlock = (id, approved) => 
  fetch(`/api/blocks/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved })
  }).then(handleResponse);
export const fetchBlockCalendar = (view) => fetch(`/api/blocks/calendar?view=${view}`).then(handleResponse);
export const whatIfAnalysis = (scenario) => 
  fetch('/api/blocks/what-if', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario)
  }).then(handleResponse);
export const fetchConflicts = () => fetch(`/api/blocks/conflicts`).then(handleResponse);

// Defect APIs
export const fetchDefects = (filters) => fetch(`/api/defects${getQueryParams(filters)}`).then(handleResponse);
export const createDefect = (data) => 
  fetch('/api/defects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse);
export const fetchDefectStats = () => fetch(`/api/defects/stats`).then(handleResponse);

// Analytics APIs
export const fetchDashboard = () => fetch(`/api/analytics/dashboard`).then(handleResponse);
export const fetchCIS = () => fetch(`/api/analytics/cis`).then(handleResponse);
export const fetchCorridorAnalytics = () => fetch(`/api/analytics/corridors`).then(handleResponse);
export const fetchDepartmentAnalytics = () => fetch(`/api/analytics/departments`).then(handleResponse);
export const fetchRiskSummary = () => fetch(`/api/analytics/risk-summary`).then(handleResponse);
export const fetchTrends = () => fetch(`/api/analytics/trends`).then(handleResponse);
