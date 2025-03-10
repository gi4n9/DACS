document.addEventListener('DOMContentLoaded', function() {
  // All filter sections are collapsed by default
  
  // Add click event to toggle chevron direction
  const cardHeaders = document.querySelectorAll('.card-header[data-bs-toggle="collapse"]');
  cardHeaders.forEach(header => {
      header.addEventListener('click', function() {
          const icon = this.querySelector('i');
          if (icon.classList.contains('fa-chevron-down')) {
              if (this.getAttribute('aria-expanded') === 'true') {
                  icon.classList.remove('fa-chevron-down');
                  icon.classList.add('fa-chevron-up');
              } else {
                  icon.classList.remove('fa-chevron-up');
                  icon.classList.add('fa-chevron-down');
              }
          }
      });
  });
});