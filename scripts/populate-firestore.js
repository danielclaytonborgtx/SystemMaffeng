const admin = require('firebase-admin');

// Arquivo de credenciais do Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const employees = [
  {
    name: "João Silva",
    email: "joao.silva@maffeng.com",
    position: "Operador de Máquinas",
    department: "Construção",
    status: "active",
    hireDate: "2023-01-15",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: "Maria Santos",
    email: "maria.santos@maffeng.com",
    position: "Engenheira Civil",
    department: "Engenharia",
    status: "active",
    hireDate: "2022-08-10",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: "Carlos Oliveira",
    email: "carlos.oliveira@maffeng.com",
    position: "Soldador",
    department: "Construção",
    status: "vacation",
    hireDate: "2023-03-20",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: "Ana Costa",
    email: "ana.costa@maffeng.com",
    position: "Supervisora",
    department: "Supervisão",
    status: "active",
    hireDate: "2021-11-05",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

const equipment = [
  {
    name: "Furadeira Bosch GSB 550",
    category: "Ferramenta Elétrica",
    status: "available",
    location: "Almoxarifado A",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: "Martelo Pneumático Makita",
    category: "Ferramenta Pneumática",
    status: "in_use",
    location: "Obra Central",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: "Serra Circular Dewalt",
    category: "Ferramenta Elétrica",
    status: "maintenance",
    location: "Oficina",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

const vehicles = [
  {
    plate: "ABC-1234",
    model: "Volvo FH 540",
    brand: "Volvo",
    year: 2022,
    currentKm: 45000,
    maintenanceKm: 50000,
    status: "active",
    fuelType: "Diesel",
    lastMaintenance: admin.firestore.Timestamp.fromDate(new Date("2024-02-15")),
    nextMaintenance: admin.firestore.Timestamp.fromDate(new Date("2024-04-15")),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    plate: "XYZ-5678",
    model: "Caterpillar 320D",
    brand: "Caterpillar",
    year: 2021,
    currentKm: 2800,
    maintenanceKm: 3000,
    status: "maintenance",
    fuelType: "Diesel",
    lastMaintenance: admin.firestore.Timestamp.fromDate(new Date("2024-03-01")),
    nextMaintenance: admin.firestore.Timestamp.fromDate(new Date("2024-06-01")),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function populateFirestore() {
  console.log("Populating Firestore with sample data...");

  try {
    // Add Employees
    for (const emp of employees) {
      await db.collection('employees').add(emp);
    }
    console.log("✅ Employees added.");

    // Add Equipment
    for (const eq of equipment) {
      await db.collection('equipment').add(eq);
    }
    console.log("✅ Equipment added.");

    // Add Vehicles
    for (const veh of vehicles) {
      await db.collection('vehicles').add(veh);
    }
    console.log("✅ Vehicles added.");

    console.log("🎉 Firestore population complete!");
  } catch (error) {
    console.error("❌ Error populating Firestore:", error);
  }
}

populateFirestore().catch(console.error);
