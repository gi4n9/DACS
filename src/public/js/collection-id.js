document.addEventListener('DOMContentLoaded', function() {
    // Get all filter headers
    const filterHeaders = document.querySelectorAll('.filter-header');
    
    // Add click event listeners to toggle collapse state
    filterHeaders.forEach(header => {
      header.addEventListener('click', function() {
        // Get the current expanded state
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        // Toggle the aria-expanded attribute
        this.setAttribute('aria-expanded', !isExpanded);
        
        // Find the target collapse element
        const targetId = this.getAttribute('data-bs-target');
        const targetElement = document.querySelector(targetId);
        
        // Toggle the collapse
        if (targetElement) {
          if (isExpanded) {
            targetElement.classList.remove('show');
          } else {
            targetElement.classList.add('show');
          }
        }
      });
    });
    
    // Size selection
    const sizeButtons = document.querySelectorAll('input[name="size"]');
    sizeButtons.forEach(button => {
      button.addEventListener('change', function() {
        if (this.checked) {
          // Reset all buttons to outline-secondary
          sizeButtons.forEach(btn => {
            btn.nextElementSibling.classList.remove('btn-outline-primary');
            btn.nextElementSibling.classList.add('btn-outline-secondary');
          });
          
          // Set the selected button to outline-primary
          this.nextElementSibling.classList.remove('btn-outline-secondary');
          this.nextElementSibling.classList.add('btn-outline-primary');
          
          console.log(`Size selected: ${this.id}`);
        }
      });
    });
    
    // Color selection
    const colorButtons = document.querySelectorAll('input[name="color"]');
    colorButtons.forEach(button => {
      button.addEventListener('change', function() {
        if (this.checked) {
          console.log(`Color selected: ${this.id}`);
        }
      });
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    // Add click handler for all filter headers
    document.querySelectorAll('.card-header').forEach(header => {
        header.addEventListener('click', function() {
            // Toggle the chevron icon
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-chevron-up')) {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            } else {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            }
        });
    });
});
