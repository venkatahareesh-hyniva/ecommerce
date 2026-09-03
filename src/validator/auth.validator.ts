export function validateSignup(data: any) {
  const { firstName, lastName, email, phoneNumber, password } = data;

  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return "All fields are required";
  }

  const name = /^[A-Za-z ]+$/;

  if (!name.test(firstName)) {
    return "FirstName should contain only letters";
  }

  if (!name.test(lastName)) {
    return "LastName should contain only letters";
  }

  const emailvalidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailvalidation.test(email)) {
    return "Invalid email format";
  }

  const phone = /^\+[1-9]\d{7,14}$/;

  if (!phone.test(phoneNumber)) {
    return "Phone number must include a valid country code";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[@#$%&*]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return null;
}

export function validateLogin(data: any) {
  const { email, password } = data;

  if (!email || !password) {
    return "Email and Password are required";
  }

  const emailvalidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailvalidation.test(email)) {
    return "Invalid email format";
  }

  return null;
}
