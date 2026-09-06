/**
 * validators.js
 * -------------
 * Frontend validation rules. These mirror backend/utils/validators.py
 * so the user sees an error immediately instead of waiting for a
 * round-trip to the server. The backend still re-validates everything
 * itself -- frontend validation is only for a fast, friendly UX.
 */

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MOBILE_REGEX = /^\d{10,15}$/;

export function isValidEmail(email) {
  return !!email && EMAIL_REGEX.test(email);
}

export function isValidMobile(mobile) {
  return !!mobile && MOBILE_REGEX.test(mobile);
}

/**
 * Validates the Add/Edit Employee form.
 * Returns an object keyed by field name -> error message.
 * An empty object means the form is valid.
 */
export function validateEmployeeForm(values) {
  const errors = {};

  if (!values.employee_name?.trim()) errors.employee_name = "Employee name is required.";
  if (!values.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.mobile_number?.trim()) {
    errors.mobile_number = "Mobile number is required.";
  } else if (!isValidMobile(values.mobile_number)) {
    errors.mobile_number = "Mobile number must be 10-15 digits.";
  }

  if (!values.department?.trim()) errors.department = "Department is required.";
  if (!values.designation?.trim()) errors.designation = "Designation is required.";

  return errors;
}

/**
 * Validates the Mark Attendance form.
 */
export function validateAttendanceForm(values) {
  const errors = {};

  if (!values.employee_id) errors.employee_id = "Please select an employee.";
  if (!values.attendance_date) errors.attendance_date = "Date is required.";
  if (!values.attendance_status) errors.attendance_status = "Status is required.";

  if (
    values.check_in_time &&
    values.check_out_time &&
    values.check_out_time <= values.check_in_time
  ) {
    errors.check_out_time = "Check-out time must be after check-in time.";
  }

  return errors;
}
