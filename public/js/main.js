'use strict';

// Remove preload class once page is fully loaded

window.addEventListener('load', function () {
  Array.from(document.getElementsByTagName('body')).forEach(function (el) {
    el.classList.remove('preload');
  });
});

$(function () {

  $('[data-toggle="tooltip"]').tooltip()

})

// Add class to navigation when scrolling down

document.addEventListener('scroll', function () {
  const header = document.querySelector('.header-main');
  if (window.scrollY >= 20) {
    header.classList.add('fade-in');
  } else {
    header.classList.remove('fade-in');
  }
});

// Add class when mobile navigation icon is clicked

Array.from(document.getElementsByClassName('nav-toggle')).forEach(function (el) {
  el.addEventListener('click', function () {
    Array.from(document.getElementsByTagName('body')).forEach(function (el) {
      el.classList.toggle('no-scroll');
    });
    Array.from(document.getElementsByClassName('header-main')).forEach(function (el) {
      el.classList.toggle('active');
    });
  });
});

// Prevent background from scrolling on mobile when navigation is toggled

document.addEventListener('touchmove', function (evt) {
  evt.preventDefault();
});

// auto close alerts 
$(document).ready(function () {
  // show the alert
  setTimeout(function () {
    $(".alert").alert('close');
  }, 2000);
});


// copy to clipboard
let copyTextareaBtn = document.querySelector('#textareacopybtn');
copyTextareaBtn.addEventListener('click', function (event) {
  console.log('here');
  var copyTextarea = document.querySelector('#userEmail');
  copyTextarea.focus();
  copyTextarea.select();
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }
});