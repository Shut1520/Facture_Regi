import { z } from 'zod'

const zod = z

export const clientSchema = zod.object({
  full_name: zod.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: zod.string().optional().default(''),
  quarter: zod.string().optional().default(''),
  reference: zod.string().optional().default(''),
  phone: zod
    .string()
    .optional()
    .default('')
    .refine((val) => !val || /^\d{8,15}$/.test(val), 'Numéro de téléphone invalide'),
})

export const invoiceItemSchema = zod.object({
  truck_capacity: zod.coerce.number().min(0, 'Capacité invalide').optional().default(0),
  trips_count: zod.coerce.number().int().min(1, 'Minimum 1 course').default(1),
  quantity: zod.coerce.number().min(0.01, 'La quantité doit être supérieure à 0'),
  designation: zod.string().min(1, 'La désignation est requise'),
  unit_price: zod.coerce.number().min(0.01, 'Le prix unitaire doit être supérieur à 0'),
})

export const invoiceSchema = zod.object({
  invoice_number: zod.string().min(1, 'Le numéro de facture est requis'),
  issue_date: zod.string().min(1, 'La date est requise'),
  issue_location: zod.string().optional().default('KINSHASA'),
  client_id: zod.coerce.number().int().positive('Sélectionnez un client'),
  tax_rate: zod.coerce.number().min(0).max(100).default(16),
})
