$(document).ready(function() {
    // Smooth scrolling
    $('a[href^="#"]').on('click', function(event) {
      var target = $(this.getAttribute('href'));
      if( target.length ) {
        event.preventDefault();
        $('html, body').stop().animate({
          scrollTop: target.offset().top
        }, 1000);
      }
    });
  
    // Change navbar color on scroll
    $(window).scroll(function() {
      if ($(window).scrollTop() > 50) {
        $('.navbar').addClass('bg-primary');
      } else {
        $('.navbar').removeClass('bg-primary');
      }
    });
  });
  