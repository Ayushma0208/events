// Global variables
let apiKey = localStorage.getItem('apiKey') || '';
// Use the backend server URL (different from frontend URL)
let baseUrl = 'http://localhost:5000'; // Backend server URL
let updateInterval;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Set API key if stored
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
    }
    
    // Set default dates
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('metricFrom').value = lastWeek.toISOString().split('T')[0];
    document.getElementById('metricTo').value = today.toISOString().split('T')[0];
    document.getElementById('funnelStartDate').value = lastWeek.toISOString().split('T')[0];
    document.getElementById('funnelEndDate').value = today.toISOString().split('T')[0];
    
    // Start live updates
    startLiveUpdates();
});

// API Key Management
function setApiKey() {
    const keyInput = document.getElementById('apiKey');
    apiKey = keyInput.value.trim();
    
    if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
        showMessage('API key set successfully!', 'success');
        // Refresh stats immediately
        updateLiveStats();
    } else {
        showMessage('Please enter a valid API key', 'error');
    }
}

// Live Updates
function startLiveUpdates() {
    // Update stats every 30 seconds
    updateInterval = setInterval(updateLiveStats, 30000);
    
    // Initial update
    updateLiveStats();
}

function updateLiveStats() {
    if (!apiKey) return;
    
    console.log('🔄 Updating live stats...');
    console.log('📡 API Key:', apiKey ? 'Set' : 'Not set');
    console.log('🌐 Base URL:', baseUrl);
    
    // Get event metrics for today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const url = `${baseUrl}/api/metrics?event=&interval=daily&from=${todayStr}&to=${todayStr}`;
    console.log('📊 Fetching metrics from:', url);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        console.log('📥 Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📊 Metrics data:', data);
        const todayEvents = data.buckets?.[0]?.count || 0;
        updateStat('eventsToday', todayEvents);
    })
    .catch(error => {
        console.error('❌ Error fetching today events:', error);
        console.error('🔍 Error details:', error.message);
    });
    
    // Get total events (last 30 days)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    fetch(`${baseUrl}/api/metrics?event=&interval=daily&from=${thirtyDaysAgoStr}&to=${todayStr}`, {
        method: 'GET',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const totalEvents = data.buckets?.reduce((sum, bucket) => sum + bucket.count, 0) || 0;
        updateStat('totalEvents', totalEvents);
    })
    .catch(error => {
        console.error('Error fetching total events:', error);
    });
}

function updateStat(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value.toLocaleString();
        element.parentElement.parentElement.classList.add('stat-updated');
        setTimeout(() => {
            element.parentElement.parentElement.classList.remove('stat-updated');
        }, 500);
    }
}

// Event Ingestion
async function ingestEvents() {
    const orgId = document.getElementById('orgId').value.trim();
    const projectId = document.getElementById('projectId').value.trim();
    const eventDataText = document.getElementById('eventData').value.trim();
    
    if (!orgId || !projectId || !eventDataText) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (!apiKey) {
        showMessage('Please set your API key first', 'error');
        return;
    }
    
    try {
        const events = JSON.parse(eventDataText);
        
        // Add orgId and projectId to each event if not present
        const processedEvents = events.map(event => ({
            ...event,
            orgId: event.orgId || orgId,
            projectId: event.projectId || projectId
        }));
        
        console.log('📤 Ingesting events:', processedEvents);
        console.log('🌐 Sending to:', `${baseUrl}/api/events`);
        
        const response = await fetch(`${baseUrl}/api/events`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(processedEvents)
        });
        
        console.log('📥 Response status:', response.status);
        
        const result = await response.json();
        console.log('📥 Response data:', result);
        
        if (response.ok) {
            showMessage(`Successfully ingested ${processedEvents.length} events!`, 'success');
            // Clear the form
            document.getElementById('eventData').value = '';
            // Update live stats
            setTimeout(updateLiveStats, 1000);
        } else {
            showMessage(`Error: ${result.error || 'Failed to ingest events'}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error ingesting events:', error);
        showMessage(`Error: ${error.message}`, 'error');
    }
}

// Event Metrics
async function getEventMetrics() {
    const eventName = document.getElementById('metricEvent').value.trim();
    const interval = document.getElementById('metricInterval').value;
    const fromDate = document.getElementById('metricFrom').value;
    const toDate = document.getElementById('metricTo').value;
    
    if (!apiKey) {
        showMessage('Please set your API key first', 'error');
        return;
    }
    
    const resultArea = document.getElementById('metricsResult');
    resultArea.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const params = new URLSearchParams({
            interval: interval,
            from: fromDate,
            to: toDate
        });
        
        if (eventName) {
            params.append('event', eventName);
        }
        
        const response = await fetch(`${baseUrl}/api/metrics?${params}`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const formattedData = formatMetricsData(data);
            resultArea.innerHTML = formattedData;
        } else {
            resultArea.innerHTML = `<div class="message error">Error: ${data.error || 'Failed to fetch metrics'}</div>`;
        }
    } catch (error) {
        resultArea.innerHTML = `<div class="message error">Error: ${error.message}</div>`;
    }
}

function formatMetricsData(data) {
    let html = '<h4>Event Metrics Results</h4>';
    html += `<p><strong>Event:</strong> ${data.event || 'All events'}</p>`;
    html += `<p><strong>Interval:</strong> ${data.interval}</p>`;
    html += '<h5>Data:</h5>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Date</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Count</th></tr>';
    
    data.buckets.forEach(bucket => {
        html += `<tr><td style="padding: 8px; border-bottom: 1px solid #f1f1f1;">${bucket.date}</td><td style="padding: 8px; border-bottom: 1px solid #f1f1f1;">${bucket.count}</td></tr>`;
    });
    
    html += '</table>';
    return html;
}

// Funnel Analysis
async function computeFunnel() {
    const stepsText = document.getElementById('funnelSteps').value.trim();
    const startDate = document.getElementById('funnelStartDate').value;
    const endDate = document.getElementById('funnelEndDate').value;
    
    if (!stepsText || !startDate || !endDate) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (!apiKey) {
        showMessage('Please set your API key first', 'error');
        return;
    }
    
    const resultArea = document.getElementById('funnelResult');
    resultArea.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const steps = stepsText.split(',').map(step => step.trim()).filter(step => step);
        
        const response = await fetch(`${baseUrl}/api/funnels`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                steps: steps,
                startDate: startDate,
                endDate: endDate
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const formattedData = formatFunnelData(data);
            resultArea.innerHTML = formattedData;
        } else {
            resultArea.innerHTML = `<div class="message error">Error: ${data.error || 'Failed to compute funnel'}</div>`;
        }
    } catch (error) {
        resultArea.innerHTML = `<div class="message error">Error: ${error.message}</div>`;
    }
}

function formatFunnelData(data) {
    let html = '<h4>Funnel Analysis Results</h4>';
    html += '<div style="margin: 20px 0;">';
    
    data.funnel.forEach((step, index) => {
        const conversionRate = index > 0 ? 
            ((step.users / data.funnel[index - 1].users) * 100).toFixed(1) : 100;
        
        html += '<div style="margin: 10px 0; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #667eea;">';
        html += `<h5 style="margin: 0 0 5px 0;">Step ${index + 1}: ${step.step}</h5>`;
        html += `<p style="margin: 0; font-size: 18px; font-weight: bold; color: #667eea;">${step.users} users</p>`;
        if (index > 0) {
            html += `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Conversion: ${conversionRate}%</p>`;
        }
        html += '</div>';
    });
    
    html += '</div>';
    return html;
}

// User Journey
async function getUserJourney() {
    const userId = document.getElementById('userId').value.trim();
    
    if (!userId) {
        showMessage('Please enter a user ID', 'error');
        return;
    }
    
    if (!apiKey) {
        showMessage('Please set your API key first', 'error');
        return;
    }
    
    const resultArea = document.getElementById('journeyResult');
    resultArea.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const response = await fetch(`${baseUrl}/api/users/${userId}/journey`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const formattedData = formatJourneyData(data);
            resultArea.innerHTML = formattedData;
        } else {
            resultArea.innerHTML = `<div class="message error">Error: ${data.error || 'Failed to fetch user journey'}</div>`;
        }
    } catch (error) {
        resultArea.innerHTML = `<div class="message error">Error: ${error.message}</div>`;
    }
}

function formatJourneyData(data) {
    let html = '<h4>User Journey</h4>';
    html += `<p><strong>User ID:</strong> ${data.userId}</p>`;
    html += `<p><strong>Total Events:</strong> ${data.events.length}</p>`;
    
    if (data.events.length > 0) {
        html += '<div style="margin: 20px 0;">';
        html += '<h5>Event Timeline:</h5>';
        html += '<div style="max-height: 200px; overflow-y: auto;">';
        
        data.events.forEach((event, index) => {
            const date = new Date(event.timestamp).toLocaleString();
            html += '<div style="margin: 8px 0; padding: 10px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #48bb78;">';
            html += `<div style="font-weight: bold; color: #2d3748;">${event.eventName}</div>`;
            html += `<div style="font-size: 12px; color: #666;">${date}</div>`;
            html += '</div>';
        });
        
        html += '</div></div>';
    } else {
        html += '<p style="color: #666; font-style: italic;">No events found for this user.</p>';
    }
    
    return html;
}

// Retention Analysis
async function getRetention() {
    const cohortEvent = document.getElementById('cohortEvent').value.trim();
    const days = document.getElementById('retentionDays').value;
    
    if (!cohortEvent) {
        showMessage('Please enter a cohort event', 'error');
        return;
    }
    
    if (!apiKey) {
        showMessage('Please set your API key first', 'error');
        return;
    }
    
    const resultArea = document.getElementById('retentionResult');
    resultArea.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const params = new URLSearchParams({
            cohort: cohortEvent,
            days: days
        });
        
        const response = await fetch(`${baseUrl}/api/retention?${params}`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const formattedData = formatRetentionData(data);
            resultArea.innerHTML = formattedData;
        } else {
            resultArea.innerHTML = `<div class="message error">Error: ${data.error || 'Failed to fetch retention data'}</div>`;
        }
    } catch (error) {
        resultArea.innerHTML = `<div class="message error">Error: ${error.message}</div>`;
    }
}

function formatRetentionData(data) {
    let html = '<h4>Retention Analysis</h4>';
    html += `<p><strong>Cohort Event:</strong> ${data.cohortEvent}</p>`;
    html += `<p><strong>Analysis Period:</strong> ${data.retention.length} days</p>`;
    
    if (data.retention.length > 0) {
        html += '<div style="margin: 20px 0;">';
        html += '<h5>Daily Retention:</h5>';
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Day</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Active Users</th></tr>';
        
        data.retention.forEach(day => {
            html += `<tr><td style="padding: 8px; border-bottom: 1px solid #f1f1f1;">Day ${day.day}</td><td style="padding: 8px; border-bottom: 1px solid #f1f1f1;">${day.users}</td></tr>`;
        });
        
        html += '</table></div>';
    } else {
        html += '<p style="color: #666; font-style: italic;">No retention data available.</p>';
    }
    
    return html;
}

// Utility Functions
function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Sample event data for testing
function loadSampleEventData() {
    const sampleData = [
        {
            "userId": "user123",
            "eventName": "page_view",
            "properties": {
                "page": "/home",
                "referrer": "google.com"
            },
            "orgId": "org123",
            "projectId": "proj123"
        },
        {
            "userId": "user123",
            "eventName": "button_click",
            "properties": {
                "button": "signup",
                "page": "/home"
            },
            "orgId": "org123",
            "projectId": "proj123"
        },
        {
            "userId": "user456",
            "eventName": "signup",
            "properties": {
                "method": "email",
                "source": "homepage"
            },
            "orgId": "org123",
            "projectId": "proj123"
        }
    ];
    
    document.getElementById('orgId').value = 'org123';
    document.getElementById('projectId').value = 'proj123';
    document.getElementById('eventData').value = JSON.stringify(sampleData, null, 2);
}

// Add sample data button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add a button to load sample data
    const eventIngestionSection = document.querySelector('.section');
    if (eventIngestionSection) {
        const sampleButton = document.createElement('button');
        sampleButton.textContent = 'Load Sample Data';
        sampleButton.className = 'btn btn-primary';
        sampleButton.style.marginTop = '10px';
        sampleButton.onclick = loadSampleEventData;
        
        const card = eventIngestionSection.querySelector('.card');
        if (card) {
            card.appendChild(sampleButton);
        }
    }
}); 