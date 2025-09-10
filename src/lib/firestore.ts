import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// Tipos para os dados
export interface Employee {
  id?: string
  name: string
  code: string
  email?: string
  position: string
  department: string
  status: 'active' | 'vacation' | 'away' | 'inactive'
  phone?: string
  hireDate?: string
  address?: string
  cpf?: string
  rg?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Equipment {
  id?: string
  name: string
  code: string
  category: string
  status: 'available' | 'in_use' | 'maintenance' | 'retired'
  location: string
  value?: number
  description?: string
  purchaseDate?: string
  supplier?: string
  invoiceNumber?: string
  lastMaintenance?: Timestamp
  nextMaintenance?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Vehicle {
  id?: string
  plate: string
  model: string
  brand: string
  year: number
  currentKm?: number
  maintenanceKm?: number
  status: 'active' | 'maintenance' | 'retired'
  fuelType?: string
  chassisNumber?: string
  renavam?: string
  color?: string
  engineCapacity?: string
  assignedTo?: string
  purchaseDate?: string
  purchaseValue?: number
  insuranceExpiry?: string
  licenseExpiry?: string
  observations?: string
  lastMaintenance?: Timestamp
  nextMaintenance?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Funções para Colaboradores
export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee))
  },

  async getById(id: string): Promise<Employee | null> {
    const docRef = doc(db, 'employees', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Employee
    }
    return null
  },

  async create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, 'employees'), {
      ...employee,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  },

  async update(id: string, employee: Partial<Employee>): Promise<void> {
    const docRef = doc(db, 'employees', id)
    await updateDoc(docRef, {
      ...employee,
      updatedAt: Timestamp.now()
    })
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'employees', id)
    await deleteDoc(docRef)
  }
}

// Funções para Equipamentos
export const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    const q = query(collection(db, 'equipment'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment))
  },

  async getById(id: string): Promise<Equipment | null> {
    const docRef = doc(db, 'equipment', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Equipment
    }
    return null
  },

  async create(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, 'equipment'), {
      ...equipment,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  },

  async update(id: string, equipment: Partial<Equipment>): Promise<void> {
    const docRef = doc(db, 'equipment', id)
    await updateDoc(docRef, {
      ...equipment,
      updatedAt: Timestamp.now()
    })
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'equipment', id)
    await deleteDoc(docRef)
  }
}

// Funções para Veículos
export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle))
  },

  async getById(id: string): Promise<Vehicle | null> {
    const docRef = doc(db, 'vehicles', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Vehicle
    }
    return null
  },

  async create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, 'vehicles'), {
      ...vehicle,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  },

  async update(id: string, vehicle: Partial<Vehicle>): Promise<void> {
    const docRef = doc(db, 'vehicles', id)
    await updateDoc(docRef, {
      ...vehicle,
      updatedAt: Timestamp.now()
    })
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'vehicles', id)
    await deleteDoc(docRef)
  }
}
