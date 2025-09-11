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
  contracts?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Equipment {
  id?: string
  name: string
  code: string
  category: string
  status: 'available' | 'in_use' | 'maintenance'
  location: string
  assignedTo?: string
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

export interface EquipmentMovement {
  id?: string
  equipmentId: string
  equipmentName: string
  equipmentCode: string
  employeeId: string
  employeeName: string
  employeeCode: string
  type: 'out' | 'return'
  project: string
  expectedReturnDate?: string
  actualReturnDate?: string
  observations?: string
  checklist?: {
    equipmentGoodCondition: boolean
    accessoriesIncluded: boolean
    manualPresent: boolean
    equipmentClean: boolean
    noVisibleDamage: boolean
  }
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

// Funções para Movimentações de Equipamentos
export const equipmentMovementService = {
  async getAll(): Promise<EquipmentMovement[]> {
    const q = query(collection(db, 'equipmentMovements'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EquipmentMovement))
  },

  async getByEquipmentId(equipmentId: string): Promise<EquipmentMovement[]> {
    const q = query(
      collection(db, 'equipmentMovements'), 
      where('equipmentId', '==', equipmentId)
    )
    const querySnapshot = await getDocs(q)
    const movements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EquipmentMovement))
    // Ordenar no cliente para evitar necessidade de índice composto
    return movements.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  },

  async getByEmployeeId(employeeId: string): Promise<EquipmentMovement[]> {
    const q = query(
      collection(db, 'equipmentMovements'), 
      where('employeeId', '==', employeeId)
    )
    const querySnapshot = await getDocs(q)
    const movements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EquipmentMovement))
    // Ordenar no cliente para evitar necessidade de índice composto
    return movements.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  },

  async create(movement: Omit<EquipmentMovement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, 'equipmentMovements'), {
      ...movement,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  },

  async update(id: string, movement: Partial<EquipmentMovement>): Promise<void> {
    const docRef = doc(db, 'equipmentMovements', id)
    await updateDoc(docRef, {
      ...movement,
      updatedAt: Timestamp.now()
    })
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'equipmentMovements', id)
    await deleteDoc(docRef)
  }
}
