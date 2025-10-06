// Block: Mina användare
function UserListBlock({ users, selectedId, setSelectedId, onEdit }) {
	const selectedUser = users.find(u => u.id === selectedId);
	return (
		<div className="user-list-block">
			<h2 className="admin-ui-block-title">Mina användare</h2>
			<select className="form-select mb-2" value={selectedId} onChange={e => setSelectedId(Number(e.target.value))}>
				{users.map(u => (
					<option key={u.id} value={u.id}>{u.name}</option>
				))}
			</select>
			<div className="mb-3">
				<div><strong>Namn:</strong> {selectedUser.name}</div>
				<div><strong>E-post:</strong> {selectedUser.email}</div>
				<div><strong>Telefon:</strong> {selectedUser.phone}</div>
			</div>
					<div className="d-flex gap-2 justify-content-center">
						<button className="btn btn-success" onClick={() => onEdit(selectedUser)}>Redigera</button>
						<button className="btn btn-danger">Ta bort</button>
					</div>
		</div>
	);
}

// Block: Lägg till patient/slutanvändare
function AddPatientBlock() {
	const [name, setName] = useState("");
	const [patientModules, setPatientModules] = useState([]);
	const [helperModules, setHelperModules] = useState([]);
	const modules = ["Påminnelser", "Matförslag", "Statistik", "Specialkost"];

	function handleCheckbox(mod, who) {
		if (who === "patient") {
			setPatientModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
		} else {
			setHelperModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
		}
	}

	return (
		<form className="add-patient-block">
			<h2 className="admin-ui-block-title">Lägg till patient/slutanvändare</h2>
			<div>
				<label htmlFor="patient-name">Namn</label>
				<input id="patient-name" type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
			</div>
			<div className="mt-3">
				<div className="fw-bold mb-1">Patient/slutanvändare har tillgång till:</div>
				{modules.map(mod => (
					<div key={mod} className="form-check">
						<input type="checkbox" className="form-check-input" id={`patient-${mod}`} checked={patientModules.includes(mod)} onChange={() => handleCheckbox(mod, "patient")} />
						<label className="form-check-label" htmlFor={`patient-${mod}`}>{mod}</label>
					</div>
				))}
			</div>
			<div className="mt-3">
				<div className="fw-bold mb-1">Jag har tillgång till:</div>
				{modules.map(mod => (
					<div key={mod} className="form-check">
						<input type="checkbox" className="form-check-input" id={`helper-${mod}`} checked={helperModules.includes(mod)} onChange={() => handleCheckbox(mod, "helper")} />
						<label className="form-check-label" htmlFor={`helper-${mod}`}>{mod}</label>
					</div>
				))}
			</div>
			<button type="submit" className="btn btn-primary w-100 mt-3">Lägg till</button>
		</form>
	);
}

import React, { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import homeIcon from "./images/home.png";
import "./AdminUI.css";


function AddUserForm({ editUser, onSave, onCancel }) {
	const [name, setName] = useState(editUser ? editUser.name : "");
	const [email, setEmail] = useState(editUser ? editUser.email : "");
	const [phone, setPhone] = useState(editUser ? editUser.phone : "");
	const [errors, setErrors] = useState({});

	React.useEffect(() => {
		if (editUser) {
			setName(editUser.name || "");
			setEmail(editUser.email || "");
			setPhone(editUser.phone || "");
		} else {
			setName("");
			setEmail("");
			setPhone("");
		}
	}, [editUser]);

	function validateEmail(email) {
		return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
	}
	function handleSubmit(e) {
		e.preventDefault();
		const newErrors = {};
		if (name.trim().length < 3) newErrors.name = "Minst tre tecken";
		if (!validateEmail(email)) newErrors.email = "Ogiltig e-postadress";
		setErrors(newErrors);
		if (Object.keys(newErrors).length === 0) {
			if (editUser) {
				// Spara ändringar
				onSave && onSave({ ...editUser, name, email, phone });
			} else {
				alert("Inbjudan skickad!");
			}
			setName(""); setEmail(""); setPhone("");
		}
	}
	return (
		<form className="add-user-block" onSubmit={handleSubmit} noValidate>
			<h2 className="admin-ui-block-title">{editUser ? "Redigera användare" : "Lägg till användare"}</h2>
			<div>
				<label htmlFor="adduser-name">Namn</label>
				<input id="adduser-name" type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
				{errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
			</div>
			<div>
				<label htmlFor="adduser-email">Epost</label>
				<input id="adduser-email" type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
				{errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
			</div>
			<div>
				<label htmlFor="adduser-phone">Telefon</label>
				<input id="adduser-phone" type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
				{errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
			</div>
					{editUser ? (
						<div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "center" }}>
							<button type="submit" className="btn btn-primary" style={{ minWidth: "120px" }}>Spara</button>
							<button type="button" className="btn btn-secondary" style={{ minWidth: "120px" }} onClick={onCancel}>Avbryt</button>
						</div>
					) : (
						<button type="submit" className="btn btn-primary w-100" style={{ marginTop: "1rem" }}>Skicka inbjudan</button>
					)}
		</form>
	);
}

const AdminUI = () => {
	const { user } = useAuth();
	// Mockade användare
	const [users, setUsers] = useState([
		{ id: 1, name: "Anna Andersson", email: "anna.andersson@example.com", phone: "070-1234567" },
		{ id: 2, name: "Bertil Berg", email: "bertil.berg@example.com", phone: "073-9876543" },
		{ id: 3, name: "Cecilia Carlsson", email: "cecilia.carlsson@example.com", phone: "076-5554321" }
	]);
	const [selectedId, setSelectedId] = useState(1);
	const [editUser, setEditUser] = useState(null);
	// Inaktivera användarlistan vid redigering
	const isEditing = !!editUser;

	// Spara ändringar
	function handleSave(updatedUser) {
		setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
		setEditUser(null);
	}
	// Avbryt redigering
	function handleCancel() {
		setEditUser(null);
	}

	return (
		<div className="admin-ui-container">
			<h1 className="admin-ui-title">Admin UI</h1>
			{user && (
				<div className="admin-ui-badge">
					<span className="badge bg-primary">
						{user.displayName} <span style={{ fontWeight: 400, marginLeft: 6 }}>({user.userType})</span>
					</span>
				</div>
			)}
			{/* Admin-meny: Lägg till användare */}
			{user && user.userType === "ADMIN" && (
				<div className="adminui-flex-container">
					<div className="adminui-flex-item">
						<AddUserForm editUser={editUser} onSave={handleSave} onCancel={handleCancel} />
						<div style={isEditing ? { pointerEvents: "none", opacity: 0.5 } : {}}>
							<UserListBlock users={users} selectedId={selectedId} setSelectedId={setSelectedId} onEdit={setEditUser} />
						</div>
					</div>
				</div>
			)}
			<div className="row mt-5">
				<div className="col-12 d-flex justify-content-center">
					<a href="/">
						<img
							src={homeIcon}
							alt="Tillbaka till startsidan"
							style={{ width: "80px", cursor: "pointer" }}
						/>
					</a>
				</div>
			</div>
		</div>
	);
};

export default AdminUI;
