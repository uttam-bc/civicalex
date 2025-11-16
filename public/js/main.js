// Main JavaScript functionality for CivicaLex

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all main components
  initializeNavigation();
  initializeHomeFeatures();
  initializeAuthForms();
  initializeLawPages();
  initializeActPages();
  initializeServicePages();
  initializeResponsiveMenu();
});

function initializeNavigation() {
  // Smooth scrolling for anchor links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add active class to current page in navigation
  setActiveNavLink();
}

function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initializeHomeFeatures() {
  // Initialize chatbot on home page
  initializeHomeChatbot();
  
  // Initialize feature grid animations
  initializeFeatureAnimations();
}

function initializeHomeChatbot() {
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');
  
  if (chatInput && sendBtn && chatMessages) {
    sendBtn.addEventListener('click', processHomeChatMessage);
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        processHomeChatMessage();
      }
    });
  }
  
  // Auto-scroll to bottom of chat
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function processHomeChatMessage() {
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  
  const message = chatInput.value.trim();
  if (!message) return;
  
  // Add user message
  addMessageToChat(chatMessages, message, 'user');
  chatInput.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message bot-message typing-indicator';
  typingIndicator.innerHTML = '<p>Typing...</p>';
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Simulate AI processing delay
  setTimeout(() => {
    // Remove typing indicator
    typingIndicator.remove();
    
    // Generate response based on message
    const response = generateChatResponse(message);
    addMessageToChat(chatMessages, response, 'bot');
  }, 1500);
}

function addMessageToChat(chatContainer, message, sender) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  messageElement.textContent = message; 
  messageElement.innerHTML = DOMPurify.sanitize(`<p>${message}</p>`);
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function generateChatResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm the CivicaLex legal assistant. How can I help you with legal information today?";
  } else if (lowerMessage.includes('right') || lowerMessage.includes('rights')) {
    return "Indian citizens have fundamental rights under the Constitution including right to equality, freedom of speech, right to life, and right to constitutional remedies. For detailed information, please register and access our comprehensive legal resources.";
  } else if (lowerMessage.includes('petition') || lowerMessage.includes('file')) {
    return "You can file various types of petitions through our platform including civil writs, criminal petitions, public interest petitions, and administrative requests. Please register to access the petition filing module.";
  } else if (lowerMessage.includes('case') || lowerMessage.includes('court')) {
    return "Our platform allows you to track your cases, manage documents, and receive updates on court hearings. After registration, you can access the case management dashboard.";
  } else if (lowerMessage.includes('act') || lowerMessage.includes('law')) {
    return "CivicaLex provides access to Central and State Acts. You can browse through our comprehensive database of Indian laws and legal acts after registration.";
  } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return "CivicaLex offers legal awareness, legal aid, litigation support, and legal research services. Register to access these services and our legal experts.";
  } else {
    return "Thank you for your query. For specific legal advice, please register with CivicaLex to access our comprehensive legal resources and expert assistance. You can also browse our law sections for general information.";
  }
}

function initializeFeatureAnimations() {
  // Add hover effects to feature boxes
  const featureBoxes = document.querySelectorAll('.feature-box');
  featureBoxes.forEach(box => {
    box.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    
    box.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

function initializeAuthForms() {
  // Add form validation to auth forms
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', validateLoginForm);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', validateRegisterForm);
  }
  
  // Password visibility toggle
  initializePasswordVisibilityToggle();
}

function validateLoginForm(e) {
  const email = document.querySelector('#login-form #email');
  const password = document.querySelector('#login-form #password');
  
  let isValid = true;
  
  // Validate email
  if (!email.value || !isValidEmail(email.value)) {
    showError(email, 'Please enter a valid email address');
    isValid = false;
  } else {
    hideError(email);
  }
  
  // Validate password
  if (!password.value || password.value.length < 6) {
    showError(password, 'Password must be at least 6 characters');
    isValid = false;
  } else {
    hideError(password);
  }
  
  if (!isValid) {
    e.preventDefault();
  }
}

function validateRegisterForm(e) {
  const name = document.querySelector('#register-form #name');
  const email = document.querySelector('#register-form #email');
  const password = document.querySelector('#register-form #password');
  const confirmPassword = document.querySelector('#register-form #confirm-password');
  
  let isValid = true;
  
  // Validate name
  if (!name.value || name.value.trim().length < 2) {
    showError(name, 'Name must be at least 2 characters');
    isValid = false;
  } else {
    hideError(name);
  }
  
  // Validate email
  if (!email.value || !isValidEmail(email.value)) {
    showError(email, 'Please enter a valid email address');
    isValid = false;
  } else {
    hideError(email);
  }
  
  // Validate password
  if (!password.value || password.value.length < 6) {
    showError(password, 'Password must be at least 6 characters');
    isValid = false;
  } else {
    hideError(password);
  }
  
  // Validate confirm password
  if (password.value !== confirmPassword.value) {
    showError(confirmPassword, 'Passwords do not match');
    isValid = false;
  } else {
    hideError(confirmPassword);
  }
  
  if (!isValid) {
    e.preventDefault();
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showError(input, message) {
  // Remove existing error
  hideError(input);
  
  // Create error element
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message-inline';
  errorElement.textContent = message;
  
  // Insert after input
  input.parentNode.insertBefore(errorElement, input.nextSibling);
  
  // Add error class to input
  input.classList.add('error');
}

function hideError(input) {
  // Remove error message
  const existingError = input.parentNode.querySelector('.error-message-inline');
  if (existingError) {
    existingError.remove();
  }
  
  // Remove error class
  input.classList.remove('error');
}

function initializePasswordVisibilityToggle() {
  const toggleButtons = document.querySelectorAll('.password-toggle');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        this.textContent = 'Hide';
      } else {
        input.type = 'password';
        this.textContent = 'Show';
      }
    });
  });
}

function initializeLawPages() {
  // Initialize law page specific functionality
  const lawChatInputs = document.querySelectorAll('.law-chat-input');
  lawChatInputs.forEach(input => {
    const sendBtn = input.nextElementSibling;
    if (sendBtn && sendBtn.tagName === 'BUTTON') {
      sendBtn.addEventListener('click', function() {
        processLawChatMessage(input);
      });
      
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          processLawChatMessage(input);
        }
      });
    }
  });
}

function processLawChatMessage(inputElement) {
  const message = inputElement.value.trim();
  if (!message) return;
  
  const chatContainer = inputElement.closest('.chatbot-container');
  const messagesContainer = chatContainer.querySelector('.chat-messages');
  
  // Add user message
  addMessageToChat(messagesContainer, message, 'user');
  inputElement.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message bot-message typing-indicator';
  typingIndicator.innerHTML = '<p>Processing...</p>';
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Generate response after delay
  setTimeout(() => {
    typingIndicator.remove();
    const response = generateLawChatResponse(message);
    addMessageToChat(messagesContainer, response, 'bot');
  }, 1000);
}

function generateLawChatResponse(userMessage) {
  const currentPath = window.location.pathname;
  const lowerMessage = userMessage.toLowerCase();
  
  if (currentPath.includes('/law/constitutional')) {
    if (lowerMessage.includes('fundamental') || lowerMessage.includes('right')) {
      return "The Constitution of India guarantees six fundamental rights: Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies.";
    } else if (lowerMessage.includes('article') || lowerMessage.includes('constitution')) {
      return "The Indian Constitution contains 448 articles divided into 25 parts. Key articles include Article 14 (equality), Article 19 (freedom), and Article 21 (right to life).";
    } else {
      return "For constitutional law matters, you can file writ petitions under Articles 32 and 226 of the Constitution. Our platform provides templates and guidance for constitutional petitions.";
    }
  } else if (currentPath.includes('/law/company')) {
    if (lowerMessage.includes('incorporation') || lowerMessage.includes('register')) {
      return "Company incorporation in India is governed by the Companies Act, 2013. You need to file Form INC-29 with the Ministry of Corporate Affairs to incorporate a company.";
    } else if (lowerMessage.includes('nclt') || lowerMessage.includes('tribunal')) {
      return "The National Company Law Tribunal (NCLT) handles company-related matters including winding up, merger, and other corporate disputes.";
    } else {
      return "Company law covers incorporation, management, compliance, and winding up of companies. Our platform provides guidance on company law procedures and compliance requirements.";
    }
  } else {
    return "This is a general legal information system. For specific legal advice on this area of law, please consult with a qualified legal professional or use our legal aid services after registration.";
  }
}

function initializeActPages() {
  // Initialize act page functionality
  const actRows = document.querySelectorAll('.act-table tbody tr');
  actRows.forEach(row => {
    row.addEventListener('click', function() {
      const actId = this.querySelector('a').getAttribute('href').split('/').pop();
      viewActDetails(actId);
    });
  });
  
  // Initialize act search functionality
  initializeActSearch();
}

function viewActDetails(actId) {
  // In a real app, this would fetch and display detailed act information
  alert(`Detailed information for Act ID: ${actId} would be displayed here`);
}

function initializeActSearch() {
  const searchInput = document.querySelector('.act-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const actRows = document.querySelectorAll('.act-table tbody tr');
      
      actRows.forEach(row => {
        const actName = row.cells[1].textContent.toLowerCase();
        const actYear = row.cells[2].textContent.toLowerCase();
        
        if (actName.includes(searchTerm) || actYear.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

function initializeServicePages() {
  // Initialize service page functionality
  const serviceCards = document.querySelectorAll('.awareness-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', function() {
      const serviceTitle = this.querySelector('h4').textContent;
      showServiceDetails(serviceTitle);
    });
  });
}

function showServiceDetails(serviceTitle) {
  // In a real app, this would show detailed service information
  alert(`Detailed information for ${serviceTitle} service would be displayed here`);
}

function initializeResponsiveMenu() {
  // Create mobile menu toggle button
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    
    navbar.querySelector('.container').appendChild(menuToggle);
    
    menuToggle.addEventListener('click', function() {
      const navMenu = document.querySelector('.nav-menu ul');
      navMenu.classList.toggle('active');
    });
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    const navMenu = document.querySelector('.nav-menu ul');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove('active');
    }
  });
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Smooth scroll to element
function smoothScrollTo(element) {
  element.scrollIntoView({
    behavior: 'smooth'
  });
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show loading spinner
function showLoading(element) {
  element.innerHTML = '<div class="loading-spinner">Loading...</div>';
}

// Hide loading spinner
function hideLoading(element) {
  element.innerHTML = '';
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Format large numbers with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Initialize tooltips
function initializeTooltips() {
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(tooltip => {
    tooltip.addEventListener('mouseenter', function() {
      const tooltipText = this.getAttribute('data-tooltip');
      const tooltipElement = document.createElement('div');
      tooltipElement.className = 'tooltip';
      tooltipElement.textContent = tooltipText;
      
      this.appendChild(tooltipElement);
    });
    
    tooltip.addEventListener('mouseleave', function() {
      const existingTooltip = this.querySelector('.tooltip');
      if (existingTooltip) {
        existingTooltip.remove();
      }
    });
  });
}

// Initialize all tooltips
initializeTooltips();

// Handle form submissions with AJAX
function handleFormSubmission(form, action, successCallback, errorCallback) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    
    fetch(action, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (successCallback) successCallback(data);
      } else {
        if (errorCallback) errorCallback(data);
      }
    })
    .catch(error => {
      console.error('Form submission error:', error);
      if (errorCallback) errorCallback({ error: 'Network error' });
    });
  });
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Additional initialization can go here
  console.log('CivicaLex main script loaded successfully');
});