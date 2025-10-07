// Enkel modal-komponent
function InfoModal({ show, name }) {
	if (!show) return null;
	return (
		<div style={{
			position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
			background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
		}}>
			<div style={{ background: '#fff', padding: '2rem 2.5rem', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', fontSize: '1.2rem', minWidth: 220, textAlign: 'center' }}>
				<span style={{ fontWeight: 500 }}>{name}</span> har lagts till din lista
			</div>
		</div>
	);
}
// Block: Mina patienter/slutanvändare för resident
function ResidentPatientListBlock({ patients, setPatients, onEditPatient }) {
	const [selectedId, setSelectedId] = React.useState(patients[0]?.id || null);
	React.useEffect(() => {
		if (!patients.find(p => p.id === selectedId) && patients.length > 0) {
			setSelectedId(patients[0].id);
		}
	}, [patients, selectedId]);
	const selectedPatient = patients.find(p => p.id === selectedId) || {};

	function handleEdit() {
		if (selectedPatient && selectedPatient.id) {
			onEditPatient(selectedPatient);
		}
	}
	function handleRemove() {
		setPatients(patients.filter(p => p.id !== selectedId));
	}
	function handleOpenApp() {
		alert(`Öppna applikation för ${selectedPatient.name}`);
	}

	return (
		<div className="user-list-block">
			<h2 className="admin-ui-block-title">Mina patienter/slutanvändare</h2>
			<select className="form-select mb-2" value={selectedId || ''} onChange={e => setSelectedId(Number(e.target.value))}>
				{patients.map(p => (
					<option key={p.id} value={p.id}>{p.name}</option>
				))}
			</select>
			<div className="mb-3">
				<div><strong>Namn:</strong> {selectedPatient.name}</div>
			</div>
			<div className="d-flex gap-2 justify-content-center">
				<button className="btn btn-success" onClick={handleEdit} disabled={!selectedPatient.name}>Redigera</button>
				<button className="btn btn-danger" onClick={handleRemove} disabled={!selectedPatient.name}>Ta bort</button>
				<button className="btn btn-primary" onClick={handleOpenApp} disabled={!selectedPatient.name}>Öppna applikation</button>
			</div>
		</div>
	);
}
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

function AddPatientBlock({ onAddPatient, patients }) {
	const modules = ["Lägg påminnelser", "Matförslag", "Statistik", "Specialkost"];
	const extraModules = ["Se påminnelser"];
	const defaultHelperModules = [...modules, ...extraModules];
	const [name, setName] = useState("");
	const [patientModules, setPatientModules] = useState([]);
	const [helperModules, setHelperModules] = useState([...defaultHelperModules]);

	function handleCheckbox(mod, who) {
		if (who === "patient") {
			setPatientModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
		} else {
			setHelperModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		const trimmed = name.trim();
		if (trimmed.length < 3) {
			alert("Namnet måste vara minst 3 tecken långt.");
			return;
		}
		if (patients && patients.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
			alert("Namnet finns redan i listan.");
			return;
		}
		onAddPatient(trimmed);
		setName("");
		setPatientModules([]);
		setHelperModules([...defaultHelperModules]);
	}

	return (
		<form className="add-patient-block" onSubmit={handleSubmit}>
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
				{extraModules.map(mod => (
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
				{extraModules.map(mod => (
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
	// ...existing code for AddUserForm...
}

function AdminUI() {
	const { user } = useAuth();
	// Mockade användare
	const [users, setUsers] = useState([
		{ id: 1, name: "Anna Andersson", email: "anna.andersson@example.com", phone: "070-1234567" },
		{ id: 2, name: "Bertil Berg", email: "bertil.berg@example.com", phone: "073-9876543" },
		{ id: 3, name: "Cecilia Carlsson", email: "cecilia.carlsson@example.com", phone: "076-5554321" }
	]);
	const [selectedId, setSelectedId] = useState(1);
	const [editUser, setEditUser] = useState(null);
	// Patientlistan för resident
	const modules = ["Lägg påminnelser", "Matförslag", "Statistik", "Specialkost"];
	const extraModules = ["Se påminnelser"];
	const defaultHelperModules = [...modules, ...extraModules];
	const [patients, setPatients] = useState([
		{ id: 1, name: "Elsa Eriksson", helperModules: [...defaultHelperModules] },
		{ id: 2, name: "Gustav Gran", helperModules: [...defaultHelperModules] },
		{ id: 3, name: "Mona Månsson", helperModules: [...defaultHelperModules] }
	]);
	// Modal state
	const [showModal, setShowModal] = useState(false);
	const [modalName, setModalName] = useState("");

	// Lägg till patient i listan
	function handleAddPatient(name) {
		setPatients(prev => ([...prev, { id: Date.now(), name: name, helperModules: [...defaultHelperModules] }]));
		setModalName(name);
		setShowModal(true);
		setTimeout(() => setShowModal(false), 2000);
	}

	function handleEditPatient(patient) {
		// Placeholder for future edit logic
	}

	function handleSave(updatedUser) {
		setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
		setEditUser(null);
	}
	function handleCancel() {
		setEditUser(null);
	}

	return (
		<div className="admin-ui-container">
			<InfoModal show={showModal} name={modalName} />
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
						<div style={!!editUser ? { pointerEvents: "none", opacity: 0.5 } : {}}>
							<UserListBlock users={users} selectedId={selectedId} setSelectedId={setSelectedId} onEdit={setEditUser} />
						</div>
					</div>
					<div className="adminui-flex-item">
						<AddPatientBlock
							onAddPatient={handleAddPatient}
							patients={patients}
						/>
					</div>
					<div className="adminui-flex-item">
						<ResidentPatientListBlock
							patients={patients}
							setPatients={setPatients}
							onEditPatient={handleEditPatient}
						/>
					</div>
				</div>
			)}
			{user && user.userType === "RESIDENT" && (
				<div className="adminui-flex-container adminui-flex-column">
					<div className="adminui-flex-item adminui-flex-wide">
						<AddPatientBlock
							onAddPatient={handleAddPatient}
							patients={patients}
						/>
					</div>
					<div className="adminui-flex-item adminui-flex-wide">
						<ResidentPatientListBlock
							patients={patients}
							setPatients={setPatients}
							onEditPatient={handleEditPatient}
						/>
					</div>
				</div>
			)}
			<div className="adminui-home-row">
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
}

export default AdminUI;
