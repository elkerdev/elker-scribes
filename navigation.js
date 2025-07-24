// Elker Scribe In-Page Navigation
// Dynamically generates a table of contents based on document headings

(function() {
  'use strict';

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    generateNavigation();
  });

  function generateNavigation() {
    const container = document.querySelector('.container-narrow');
    if (!container) return;

    // Find all headings
    const title = document.querySelector('h1.scribe-title');
    const sections = document.querySelectorAll('h3.scribe-section');
    
    // If no sections, check for steps (flat structure)
    const steps = document.querySelectorAll('.scribe-step');
    
    // Don't create navigation for very short guides
    if (sections.length < 2 && steps.length < 5) return;

    // Create navigation container
    const nav = document.createElement('nav');
    nav.className = 'scribe-navigation';
    nav.innerHTML = '<h2 class="nav-title">Contents</h2>';

    const navList = document.createElement('ul');
    navList.className = 'nav-list';

    // Generate IDs and create navigation items
    if (sections.length > 0) {
      // Sectioned structure
      sections.forEach((section, index) => {
        const text = section.textContent.trim();
        const id = generateId(text, index);
        section.id = id;

        const navItem = createNavItem(text, id);
        navList.appendChild(navItem);
      });
    } else if (steps.length > 0) {
      // Flat structure - group steps into logical sections
      let currentSection = null;
      let stepGroups = [];
      
      steps.forEach((step, index) => {
        const stepText = step.querySelector('.scribe-step-text');
        if (!stepText) return;
        
        const text = stepText.textContent.trim();
        const stepNumber = index + 1;
        
        // Create navigation entries for every 5 steps or at natural breaks
        if (index % 5 === 0 || isNaturalBreak(text)) {
          const sectionTitle = `Steps ${stepNumber}-${Math.min(stepNumber + 4, steps.length)}`;
          const id = `section-${Math.floor(index / 5) + 1}`;
          
          // Add ID to the first step of this group
          step.id = id;
          
          const navItem = createNavItem(sectionTitle, id);
          navList.appendChild(navItem);
        }
      });
    }

    // Only add navigation if we have items
    if (navList.children.length > 0) {
      nav.appendChild(navList);
      
      // Insert navigation after title but before content
      const scribeContainer = container.querySelector('.scribe-container');
      container.insertBefore(nav, scribeContainer);

      // Add smooth scrolling behavior
      addSmoothScrolling();
      
      // Add active state tracking
      trackActiveSection();
    }
  }

  function generateId(text, index) {
    // Convert text to URL-friendly ID
    let id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .trim();
    
    // Ensure uniqueness
    if (document.getElementById(id)) {
      id = `${id}-${index}`;
    }
    
    return id || `section-${index}`;
  }

  function createNavItem(text, targetId) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    
    const a = document.createElement('a');
    a.href = `#${targetId}`;
    a.className = 'nav-link';
    a.textContent = text;
    
    li.appendChild(a);
    return li;
  }

  function isNaturalBreak(text) {
    // Detect natural section breaks in flat guides
    const breakIndicators = [
      'navigate to',
      'click on',
      'now you',
      'next,',
      'finally',
      'submit',
      'complete'
    ];
    
    const lowerText = text.toLowerCase();
    return breakIndicators.some(indicator => lowerText.includes(indicator));
  }

  function addSmoothScrolling() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          // Calculate offset for fixed header if any
          const offset = 20;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without jumping
          history.pushState(null, null, `#${targetId}`);
        }
      });
    });
  }

  function trackActiveSection() {
    const sections = document.querySelectorAll('[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveSection() {
      let currentSection = null;
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 100) {
          currentSection = section.id;
        }
      });
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href').substring(1);
        if (href === currentSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
    
    // Update on scroll with debouncing
    let scrollTimer;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateActiveSection, 50);
    });
    
    // Initial update
    updateActiveSection();
  }
})();