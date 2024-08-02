"use strict";

const name = document.querySelector(".name");
const lastname = document.querySelector(".last-name");
const email = document.querySelector(".email");
const sub = document.querySelector(".sub");
const nameClass = document.querySelector(".name_class");
const lastnameClass = document.querySelector(".lastname_class");
const emailClass = document.querySelector(".email_class");
let counter = 1;

function isEmail(email) {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
}

function haveNumbers(nameValue){
  for(let i = 0; i < nameValue.length; i++){
    // console.log(nameValue[i]);
    if(isFinite(nameValue[i])){
      counter = 0;
      return true;        
    }
    else {
      counter = 1;
    }
  }
}

sub.addEventListener("click", function (e) {
  // e.preventDefault();

  if(name.value.length === 0 || haveNumbers(name.value.trim())){
    nameClass.innerHTML = "Incorrect first name";
    counter = 0;
    return false;
  }
  else{
    counter = 1;
    nameClass.innerHTML = "";
  }

  if (lastname.value.length === 0 || haveNumbers(lastname.value.trim())) {
    lastnameClass.innerHTML = "Incorrect last name";
    counter = 0;
    return false;
  }
  else{
    counter = 1;
    lastnameClass.innerHTML = "";
  }

  if (email.value.length === 0 || !isEmail(email.value.trim() || email.value.trim().slice(-4) === '.com')) {
    // console.log('object');
    emailClass.innerHTML = "Enter your Email ID";
    counter = 0;
    return false;
  }
  else{
    emailClass.innerHTML = "";
  }

  e.preventDefault();
  name.value = "";
  lastname.value = "";
  email.value = "";
  alert("We will contact you soon !");
  
});
