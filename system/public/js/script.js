$(function () {
  'use strict';

  $('#navbarToggler').on('click', function() {
    $('#navbarMenu').toggleClass('show');
    $('body').toggleClass('navbar-open');
  });

  window.addEventListener('scroll', function() {
    var body = document.querySelector('body');
    if (window.pageYOffset > 1) {
        body.classList.add('scrolling-up');
    } else {
        body.classList.remove('scrolling-up');
    }
  });

  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  $('[data-toggle="tooltip"]').tooltip()
});