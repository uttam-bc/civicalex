// Dashboard JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard components
  initializeDashboard();
  initializeCalendar();
  initializeCaseManagement();
  initializePetitionModule();
  initializeDocumentManagement();
});

function initializeDashboard() {
  // Update stats periodically
  updateQuickStats();
  
  // Set up event listeners for dashboard actions
  const createPetitionBtn = document.querySelector('a[href="/dashboard/add-petition"]');
  const addCaseBtn = document.querySelector('a[href="/dashboard/add-case"]');
  const uploadDocsBtn = document.querySelector('a[href="/dashboard/upload-document"]');
  
  if (createPetitionBtn) {
    createPetitionBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('add-petition-form').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  if (addCaseBtn) {
    addCaseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('add-case-form').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  if (uploadDocsBtn) {
    uploadDocsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('upload-document-form').scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function updateQuickStats() {
  // Simulate updating stats (in real app, this would be an API call)
  setTimeout(() => {
    // This would be replaced with actual API calls to update stats
    console.log('Stats updated');
  }, 30000); // Update every 30 seconds
}

function initializeCalendar() {
  // Calendar functionality placeholder
  const calendarPlaceholder = document.querySelector('.calendar-placeholder');
  if (calendarPlaceholder) {
    calendarPlaceholder.innerHTML = `
      <h4>Upcoming Hearings</h4>
      <ul id="upcoming-hearings">
        <!-- Hearings will be loaded here -->
      </ul>
      <button id="add-reminder-btn">Add Reminder</button>
    `;
    
    // Load upcoming hearings
    loadUpcomingHearings();
    
    // Add reminder functionality
    document.getElementById('add-reminder-btn').addEventListener('click', addReminder);
  }
}

function loadUpcomingHearings() {
  // Simulate loading upcoming hearings
  const hearingsList = document.getElementById('upcoming-hearings');
  if (hearingsList) {
    hearingsList.innerHTML = `
      <li>
        <strong>Case #2023/CR/1234</strong> - Criminal Matter
        <br>Date: ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        <br>Court: Sessions Court
      </li>
      <li>
        <strong>Petition #2023/CIV/5678</strong> - Civil Writ
        <br>Date: ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        <br>Court: High Court
      </li>
    `;
  }
}

function addReminder() {
  // Simulate adding a reminder
  alert('Reminder functionality would be implemented here');
}

function initializeCaseManagement() {
  // Case management functionality
  const caseForm = document.getElementById('add-case-form');
  if (caseForm) {
    caseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitCaseForm();
    });
  }
  
  // Load existing cases
  loadCases();
}

function submitCaseForm() {
  const formData = new FormData(document.getElementById('add-case-form'));
  const caseData = Object.fromEntries(formData.entries());
  
  // Validate form data
  if (!caseData.title || !caseData.type || !caseData.court || !caseData.caseNumber) {
    alert('Please fill in all required fields');
    return;
  }
  
  // In a real app, this would send data to the server
  console.log('Submitting case:', caseData);
  
  // Show success message
  alert('Case added successfully!');
  
  // Reset form
  document.getElementById('add-case-form').reset();
}

function loadCases() {
  // Simulate loading cases from the server
  console.log('Loading cases...');
}

function initializePetitionModule() {
  // Petition module functionality
  const petitionForm = document.getElementById('add-petition-form');
  if (petitionForm) {
    petitionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitPetitionForm();
    });
  }
  
  // Load existing petitions
  loadPetitions();
}

function submitPetitionForm() {
  const formData = new FormData(document.getElementById('add-petition-form'));
  const petitionData = Object.fromEntries(formData.entries());
  
  // Validate form data
  if (!petitionData.title || !petitionData.description || !petitionData.type) {
    alert('Please fill in all required fields');
    return;
  }
  
  // In a real app, this would send data to the server
  console.log('Submitting petition:', petitionData);
  
  // Show success message
  alert('Petition added successfully!');
  
  // Reset form
  document.getElementById('add-petition-form').reset();
}

function loadPetitions() {
  // Simulate loading petitions from the server
  console.log('Loading petitions...');
}

function initializeDocumentManagement() {
  // Document management functionality
  const documentForm = document.getElementById('upload-document-form');
  if (documentForm) {
    documentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitDocumentForm();
    });
  }
  
  // File upload validation
  const fileInput = document.querySelector('input[type="file"][name="document"]');
  if (fileInput) {
    fileInput.addEventListener('change', validateFileUpload);
  }
}

function submitDocumentForm() {
  const formData = new FormData(document.getElementById('upload-document-form'));
  
  // Check if file is selected
  if (!formData.get('document')) {
    alert('Please select a document to upload');
    return;
  }
  
  // In a real app, this would send data to the server
  console.log('Uploading document...');
  
  // Show success message
  alert('Document uploaded successfully!');
  
  // Reset form
  document.getElementById('upload-document-form').reset();
}

function validateFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      e.target.value = '';
      return;
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'image/jpeg', 'image/png', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, DOC, DOCX, JPG, PNG, and TXT files are allowed');
      e.target.value = '';
      return;
    }
    
    console.log('File validated:', file.name, file.size, file.type);
  }
}

// Function to update case status
function updateCaseStatus(caseId, newStatus) {
  // In a real app, this would update the status on the server
  console.log(`Updating case ${caseId} to status: ${newStatus}`);
  
  // Update UI
  const statusElement = document.querySelector(`[data-case-id="${caseId}"] .status`);
  if (statusElement) {
    statusElement.textContent = newStatus;
    statusElement.className = `status status-${newStatus.toLowerCase()}`;
  }
}

// Function to track petition progress
function trackPetitionProgress(petitionId) {
  // In a real app, this would fetch the latest status from the server
  console.log(`Tracking petition ${petitionId}`);
  
  // Simulate fetching progress
  setTimeout(() => {
    alert(`Petition ${petitionId} is currently in 'Submitted' status. Next action: Awaiting court review.`);
  }, 500);
}

// Function to view document
function viewDocument(docId) {
  // In a real app, this would open the document
  console.log(`Viewing document ${docId}`);
  window.open(`/uploads/document_${docId}.pdf`, '_blank');
}

// Function to download document
function downloadDocument(docId) {
  // In a real app, this would trigger the download
  console.log(`Downloading document ${docId}`);
  window.location.href = `/uploads/document_${docId}.pdf`;
}

// Function to delete document
function deleteDocument(docId) {
  if (confirm('Are you sure you want to delete this document?')) {
    // In a real app, this would delete the document from the server
    console.log(`Deleting document ${docId}`);
    
    // Remove from UI
    const docElement = document.querySelector(`[data-doc-id="${docId}"]`);
    if (docElement) {
      docElement.remove();
    }
  }
}

// Function to filter cases
function filterCases(filterType) {
  console.log(`Filtering cases by: ${filterType}`);
  
  // In a real app, this would filter the case list
  const allCases = document.querySelectorAll('.case-item');
  
  allCases.forEach(caseItem => {
    if (filterType === 'all') {
      caseItem.style.display = 'block';
    } else {
      if (caseItem.dataset.status === filterType) {
        caseItem.style.display = 'block';
      } else {
        caseItem.style.display = 'none';
      }
    }
  });
}

// Function to search cases
function searchCases(query) {
  console.log(`Searching for: ${query}`);
  
  // In a real app, this would search the case list
  const allCases = document.querySelectorAll('.case-item');
  
  allCases.forEach(caseItem => {
    const caseTitle = caseItem.querySelector('.case-title').textContent.toLowerCase();
    const caseNumber = caseItem.querySelector('.case-number').textContent.toLowerCase();
    
    if (caseTitle.includes(query.toLowerCase()) || caseNumber.includes(query.toLowerCase())) {
      caseItem.style.display = 'block';
    } else {
      caseItem.style.display = 'none';
    }
  });
}

// Function to sort cases
function sortCases(sortBy) {
  console.log(`Sorting cases by: ${sortBy}`);
  
  // In a real app, this would sort the case list
  // This is a placeholder implementation
}

// Function to load more cases (pagination)
function loadMoreCases() {
  console.log('Loading more cases...');
  
  // In a real app, this would fetch more cases from the server
}

// Function to export case data
function exportCaseData(format) {
  console.log(`Exporting case data as: ${format}`);
  
  // In a real app, this would generate and download the export file
  alert(`Case data exported as ${format.toUpperCase()} file`);
}

// Function to initialize notifications
function initializeNotifications() {
  // Check for new notifications
  checkForNotifications();
  
  // Set up periodic check
  setInterval(checkForNotifications, 60000); // Check every minute
}

function checkForNotifications() {
  // In a real app, this would check for new notifications from the server
  console.log('Checking for new notifications...');
  
  // Simulate notification count
  const notificationCount = Math.floor(Math.random() * 5);
  updateNotificationBadge(notificationCount);
}

function updateNotificationBadge(count) {
  const badge = document.getElementById('notification-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Initialize notifications when page loads
initializeNotifications();