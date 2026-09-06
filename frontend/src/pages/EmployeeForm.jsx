/**
 * EmployeeForm.jsx
 * Module 2 - Add Employee / Edit Employee (one shared component).
 *
 * If the URL has an :id param (e.g. /employees/3/edit) we're editing:
 * we load the existing employee first and PUT the changes.
 * Otherwise we're adding: we POST a new employee.
 *
 * Flow (Add):   form submit -> validateEmployeeForm() -> POST /api/employees
 *               -> Flask validates again -> INSERT INTO employees -> MySQL
 * Flow (Edit):  form submit -> validateEmployeeForm() -> PUT /api/employees/<id>
 *               -> Flask validates again -> UPDATE employees -> MySQL
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { validateEmployeeForm } from "../utils/validators";
import { createEmployee, getEmployee, updateEmployee } from "../services/employeeService";
import LoadingSpinner from "../components/LoadingSpinner";

const DEPARTMENTS = ["IT", "HR", "Finance", "Sales", "Operations"];

const emptyForm = {
  employee_name: "",
  email: "",
  mobile_number: "",
  department: "",
  designation: "",
  status: "Active",
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    getEmployee(id)
      .then((employee) => setForm(employee))
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateEmployeeForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateEmployee(id, form);
      } else {
        await createEmployee(form);
      }
      navigate("/employees");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading employee" />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{isEditMode ? "Edit Employee" : "Add Employee"}</h2>
          <p>{isEditMode ? "Update this employee's information." : "Fill in the details to add a new employee."}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="employee_name">Employee Name</label>
              <input
                id="employee_name"
                type="text"
                value={form.employee_name}
                onChange={(e) => handleChange("employee_name", e.target.value)}
                className={errors.employee_name ? "input-error" : ""}
              />
              {errors.employee_name && <span className="field-error">{errors.employee_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="mobile_number">Mobile Number</label>
              <input
                id="mobile_number"
                type="text"
                placeholder="10-15 digits"
                value={form.mobile_number}
                onChange={(e) => handleChange("mobile_number", e.target.value)}
                className={errors.mobile_number ? "input-error" : ""}
              />
              {errors.mobile_number && <span className="field-error">{errors.mobile_number}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                list="department-options"
                type="text"
                value={form.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className={errors.department ? "input-error" : ""}
              />
              <datalist id="department-options">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
              {errors.department && <span className="field-error">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="designation">Designation</label>
              <input
                id="designation"
                type="text"
                value={form.designation}
                onChange={(e) => handleChange("designation", e.target.value)}
                className={errors.designation ? "input-error" : ""}
              />
              {errors.designation && <span className="field-error">{errors.designation}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="table-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Employee"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/employees")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
